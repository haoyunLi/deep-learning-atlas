import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const cache = new Map();
function loadTs(input) {
  let file = resolve(input);
  if (extname(file) === ".css") return {};
  if (!extname(file)) file = [file + ".ts", file + ".tsx"].find(existsSync);
  assert.ok(file, `Cannot resolve ${input}`);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: file,
  }).outputText;
  const localRequire = (path) =>
    path.startsWith(".") ? loadTs(resolve(dirname(file), path)) : require(path);
  new vm.Script(`(function(require,module,exports){${code}\n})`, {
    filename: file,
  }).runInThisContext()(localRequire, module, module.exports);
  return module.exports;
}
let checks = 0;
function close(actual, expected, message, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${message}: ${actual} != ${expected}`,
  );
  checks++;
}
const math = loadTs("src/components/sandboxMath.ts");
const {
  calculateKNN,
  calculateEM,
  calculateAttention,
  calculatePPO,
  calculateCohort,
  calculateMetaLearning,
} = math;

close(calculateKNN(1, 1, 1).ranked[0].distance, 0, "A1 exact match");
assert.equal(calculateKNN(1, 1, 1).winner, "A");
assert.equal(calculateKNN(5, 4.5, 1).winner, "B");
for (const x of [0, 1, 2.8, 6])
  for (const y of [0, 2.5, 6])
    for (const k of [1, 3, 5, 7]) {
      const result = calculateKNN(x, y, k);
      close(result.votes.A + result.votes.B, k, "votes total k");
      result.ranked.forEach((r, i) => {
        close(r.distance, Math.hypot(r.x - x, r.y - y), "Euclidean distance");
        if (i) assert.ok(r.distance >= result.ranked[i - 1].distance);
      });
      assert.equal(result.selected.length, k);
    }

close(
  math.gaussianDensity(0, 0, 1),
  1 / Math.sqrt(2 * Math.PI),
  "standard normal density",
);
for (const m1 of [-4, -1, 1])
  for (const m2 of [1, 2, 6])
    for (const sigma of [0.5, 1.2, 2.5])
      for (const t of [0, 1, 4, 8]) {
        const em = calculateEM([m1, m2], sigma, t);
        assert.ok(
          em.afterLL >= em.beforeLL - 1e-9,
          "Mean-only EM never decreases log likelihood",
        );
        assert.ok(
          [...em.means, ...em.nextMeans, em.beforeLL, em.afterLL].every(
            Number.isFinite,
          ),
        );
        for (const row of em.rows) {
          close(row.r1 + row.r2, 1, "responsibilities sum to one");
          close(
            row.r1,
            row.density1 / (row.density1 + row.density2),
            "responsibility matches weighted density ratio",
          );
          close(row.weighted1, row.r1 * row.x, "weighted contribution");
        }
        close(em.mass[0] + em.mass[1], 6, "effective sample masses");
        em.nextMeans.forEach((mean, i) =>
          close(mean, em.sums[i] / em.mass[i], "M-step weighted mean"),
        );
        const nextIteration = calculateEM([m1, m2], sigma, t + 1);
        em.nextMeans.forEach((mean, i) =>
          close(
            mean,
            nextIteration.means[i],
            "iteration feeds back updated means",
          ),
        );
      }
const symmetric = calculateEM([1, 1], 1.2, 0);
close(
  symmetric.nextMeans[0],
  1.5,
  "symmetric initialization keeps both means at sample mean",
);
close(
  symmetric.nextMeans[1],
  1.5,
  "symmetric initialization cannot separate clusters",
);

for (const q1 of [-2, 0, 2])
  for (const q2 of [-2, 0.5, 2])
    for (const temperature of [0.25, 1, 2])
      for (const scaled of [false, true])
        for (const causal of [false, true]) {
          const attention = calculateAttention(
            q1,
            q2,
            temperature,
            scaled,
            causal,
          );
          close(
            attention.rows.reduce((sum, row) => sum + row.weight, 0),
            1,
            "attention row sums to one",
          );
          attention.rows.forEach((row, index) => {
            assert.ok(Number.isFinite(row.weight) && row.weight >= 0);
            if (causal && index === 2)
              close(row.weight, 0, "masked future token contributes zero");
          });
          for (let i = 0; i < 2; i++)
            close(
              attention.output[i],
              attention.rows.reduce(
                (sum, row) => sum + row.weight * row.value[i],
                0,
              ),
              "output is weighted V",
            );
        }
const attentionManual = calculateAttention(1, 0, 1, false, true);
close(
  attentionManual.rows[0].weight,
  Math.E / (Math.E + 1),
  "manual two-token softmax",
);
close(
  attentionManual.output[0],
  (2 * Math.E) / (Math.E + 1),
  "manual attention output first coordinate",
);
close(
  calculateAttention(0, 0, 1, true, false).output[1],
  5 / 3,
  "uniform attention mean value",
);

close(
  calculatePPO(1.5, 0.2, 2).objective,
  2.4,
  "positive advantage right plateau",
);
close(calculatePPO(1.5, 0.2, 2).gradient, 0, "positive plateau derivative");
close(
  calculatePPO(0.5, 0.2, -2).objective,
  -1.6,
  "negative advantage left plateau",
);
close(calculatePPO(0.5, 0.2, -2).gradient, 0, "negative plateau derivative");
close(
  calculatePPO(1.5, 0.2, -2).objective,
  -3,
  "negative advantage does not clip harmful right move",
);
close(
  calculatePPO(1.5, 0.2, -2).gradient,
  -2,
  "negative advantage harmful direction remains active",
);
close(
  calculatePPO(0.5, 0.2, 2).objective,
  1,
  "positive advantage harmful left direction remains active",
);
assert.equal(
  calculatePPO(1.2, 0.2, 2).gradient,
  null,
  "exact positive kink is not differentiable",
);
assert.equal(
  calculatePPO(0.8, 0.2, -2).gradient,
  null,
  "exact negative kink is not differentiable",
);
for (const epsilon of [0.05, 0.2, 0.4])
  for (const advantage of [-3, -1, 0, 1, 3])
    for (let i = 0; i <= 40; i++) {
      const ratio = 0.2 + i * 0.05;
      const ppo = calculatePPO(ratio, epsilon, advantage);
      if (!ppo.kink) {
        const h = 1e-6;
        const finiteDifference =
          (calculatePPO(ratio + h, epsilon, advantage).objective -
            calculatePPO(ratio - h, epsilon, advantage).objective) /
          (2 * h);
        close(
          ppo.gradient,
          finiteDifference,
          "PPO gradient agrees with finite differences",
          1e-7,
        );
      }
      assert.ok(ppo.newProbability > 0 && ppo.newProbability < 1);
      assert.ok(ppo.nextRatio * 0.4 > 0 && ppo.nextRatio * 0.4 < 1);
    }

const unsafe = calculateCohort(30, 30, 7, 120, "row");
assert.deepEqual(
  unsafe.overlappingPatients,
  ["A"],
  "row split shares patient A",
);
assert.deepEqual(
  unsafe.futureTrain.map((r) => r.id),
  ["C1", "F1"],
  "future training information is identified",
);
assert.equal(
  unsafe.rows.find((r) => r.id === "G1").label,
  null,
  "short follow-up is unknown, not negative",
);
assert.equal(
  unsafe.rows.find((r) => r.id === "B1").label,
  0,
  "day 45 is outside 30-day window",
);
assert.equal(
  calculateCohort(30, 60, 7, 120, "row").rows.find((r) => r.id === "B1").label,
  1,
  "day 45 is inside 60-day window",
);
close(
  calculateCohort(30, 30, -1, 120, "row").leakedCount,
  2,
  "late reported past events still leak",
);
for (const lookback of [15, 30, 90])
  for (const horizon of [7, 30, 60])
    for (const split of [90, 120, 160]) {
      const cohort = calculateCohort(
        lookback,
        horizon,
        14,
        split,
        "group-time",
      );
      assert.equal(
        cohort.overlappingPatients.length,
        0,
        "safe split has no overlapping patients",
      );
      assert.equal(
        cohort.futureTrain.length,
        0,
        "safe training labels finish before deployment",
      );
      assert.equal(
        cohort.pastTest.length,
        0,
        "safe test patients are evaluated in future",
      );
      cohort.rows.forEach((r) => {
        r.safe.forEach((f) =>
          assert.ok(
            f.day < 0 && f.available <= 0,
            "safe feature was available at prediction",
          ),
        );
        if (r.split === "train" || r.split === "test")
          assert.ok(
            r.eligible && r.observed,
            "only eligible observed rows enter model data",
          );
      });
      checks += 3;
    }

for (const alpha of [0.05, 0.2, 0.45])
  for (const shots of [1, 2, 5])
    for (const innerSteps of [1, 2, 4]) {
      const meta = calculateMetaLearning(alpha, shots, innerSteps);
      assert.equal(meta.tasks.length, 2);
      close(
        meta.queryLoss,
        meta.tasks.reduce((sum, task) => sum + task.queryLoss, 0) / 2,
        "meta query loss is task average",
      );
      meta.tasks.forEach((task) => {
        assert.equal(task.trace.length, innerSteps + 1);
        close(task.trace[0], meta.theta, "inner loop starts from shared theta");
        for (let step = 1; step < task.trace.length; step++) {
          const previous = task.trace[step - 1];
          close(
            task.trace[step],
            previous - alpha * 2 * (previous - task.supportEstimate),
            "inner update follows support gradient",
          );
        }
        close(
          task.queryLoss,
          (task.adapted - task.target) ** 2,
          "query remains tied to true task target",
        );
        close(
          task.exactGradient,
          task.fomamlGradient * (1 - 2 * alpha) ** innerSteps,
          "MAML gradient keeps inner Jacobian",
        );
      });
      assert.ok(
        [
          meta.queryLoss,
          meta.exactGradient,
          meta.fomamlGradient,
          meta.reptileDirection,
          meta.nextTheta,
        ].every(Number.isFinite),
      );
      checks += 2;
    }

const { HandCalculationSandbox, handCalculationLessonIds } = loadTs(
  "src/components/HandCalculationSandbox.tsx",
);
for (const lessonId of handCalculationLessonIds) {
  const html = renderToStaticMarkup(
    React.createElement(HandCalculationSandbox, { lessonId }),
  );
  assert.equal(
    (html.match(/aria-current="step"/g) || []).length,
    1,
    `${lessonId}: one active step`,
  );
  assert.ok(
    html.includes("手算沙盒") && html.includes("重置参数"),
    `${lessonId}: frame and controls`,
  );
  assert.ok(
    html.includes('type="range"'),
    `${lessonId}: adjustable numeric parameter`,
  );
  assert.ok(
    !/NaN|Infinity/.test(html),
    `${lessonId}: finite rendered initial values`,
  );
}
assert.equal(
  renderToStaticMarkup(
    React.createElement(HandCalculationSandbox, { lessonId: "unrelated" }),
  ),
  "",
  "unrelated lessons do not get placeholder sandboxes",
);
console.log(
  `Validated ${handCalculationLessonIds.length} authored hand-calculation sandboxes: ${checks} numerical checks, EM convergence, PPO finite-difference gradients, cohort leakage invariants, meta-gradient recurrences, and accessible server renders.`,
);
