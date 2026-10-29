import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const code = ts.transpileModule(
  readFileSync("src/components/bioAlgorithmMath.ts", "utf8"),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  },
).outputText;
const module = { exports: {} };
vm.runInNewContext(code, { module, exports: module.exports });
const {
  countMixtureEM,
  assignmentPlanning,
  gaeExperiment,
  gcnExperiment,
  gatExperiment,
  contrastiveExperiment,
} = module.exports;
let checks = 0;
function near(actual, expected, message, tolerance = 1e-9) {
  assert.ok(
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${message}: ${actual} != ${expected}`,
  );
  checks++;
}
const total = (values) => values.reduce((a, b) => a + b, 0);
function probability(value, message) {
  assert.ok(
    Number.isFinite(value) && value >= 0 && value <= 1 + 1e-12,
    message,
  );
  checks++;
}

// The first EM update has an independently hand-calculated rational fixture.
const em = countMixtureEM(5, true, false, 1);
[0.39, 0.41, 0.2].forEach((p, g) =>
  near(em.history[0].probabilities[g], p, "Initial multinomial probability"),
);
const knownResponsibilities = [
  [32 / 39, 4 / 39, 3 / 39],
  [6 / 41, 32 / 41, 3 / 41],
  [0.1, 0.2, 0.7],
];
knownResponsibilities.forEach((row, g) =>
  row.forEach((r, k) =>
    near(em.history[0].responsibilities[g][k], r, "E-step hand calculation"),
  ),
);
const knownMstep = [
  ((8 * 32) / 39 + (3 * 6) / 41 + 0.5) / 16,
  ((8 * 4) / 39 + (3 * 32) / 41 + 1) / 16,
  ((8 * 3) / 39 + (3 * 3) / 41 + 3.5) / 16,
];
knownMstep.forEach((weight, k) =>
  near(em.history[1].weights[k], weight, "M-step hand calculation"),
);
near(
  em.history[0].logLikelihood,
  Math.log(0.39 ** 8 * 0.41 ** 3 * 0.2 ** 5),
  "Observed log likelihood omits only a constant multinomial coefficient",
);
for (let ambient = 0; ambient <= 20; ambient++) {
  for (const includeAmbient of [false, true]) {
    for (const zeroStart of [false, true]) {
      for (const iterations of [0, 1, 2, 7, 15]) {
        const result = countMixtureEM(
          ambient,
          includeAmbient,
          zeroStart,
          iterations,
        );
        const n = 11 + ambient;
        assert.equal(result.history.length, iterations + 1);
        for (const [step, state] of result.history.entries()) {
          assert.equal(state.weights.length, includeAmbient ? 3 : 2);
          near(total(state.weights), 1, "Mixture weights conserve mass");
          near(total(state.probabilities), 1, "Gene probabilities normalize");
          near(
            total(state.expected),
            n,
            "Expected total preserves molecule count",
          );
          near(
            total(state.allocated.flat()),
            n,
            "Allocated total preserves molecule count",
          );
          state.weights.forEach((w) => probability(w, "Finite mixture weight"));
          state.probabilities.forEach((p) =>
            probability(p, "Finite gene probability"),
          );
          state.responsibilities.forEach((row, g) => {
            near(total(row), 1, "Responsibilities normalize per gene");
            near(
              total(state.allocated[g]),
              result.counts[g],
              "Every observed molecule is allocated once",
            );
            row.forEach((r) =>
              probability(
                r,
                "Finite responsibility, including genes with zero counts",
              ),
            );
          });
          if (step)
            assert.ok(
              state.logLikelihood >=
                result.history[step - 1].logLikelihood - 1e-9,
              "Exact M-step cannot decrease observed log likelihood",
            );
          if (includeAmbient && zeroStart) {
            near(
              state.weights[2],
              0,
              "Zero mixing weight is an absorbing initialization",
            );
            state.allocated.forEach((row) =>
              near(row[2], 0, "A zero-weight component receives no molecules"),
            );
          }
        }
      }
    }
  }
}

// A four-path exhaustive problem is small enough to establish the exact optimum.
const planning = assignmentPlanning(1, 1);
for (const [id, value] of Object.entries({
  AA: 0.75,
  AB: 1,
  BA: 1.65,
  BB: -0.1,
})) {
  near(
    planning.paths.find((p) => p.id === id).value,
    value,
    `Return for ${id}`,
  );
}
assert.equal(planning.optimal.id, "BA");
assert.equal(planning.greedy.id, "AB");
assert.equal(
  assignmentPlanning(1, 0).optimal.id,
  "AA",
  "Without a collision cost, proxy reward favors reusing A",
);
for (const gamma of [0, 0.2, 0.5, 0.99, 1]) {
  for (const penalty of [0, 0.2, 0.75, 1, 2]) {
    const result = assignmentPlanning(gamma, penalty, "BA");
    const anotherReference = assignmentPlanning(gamma, penalty, "AB");
    assert.equal(new Set(result.paths.map((p) => p.id)).size, 4);
    near(
      result.optimal.value,
      Math.max(...result.paths.map((p) => p.value)),
      "Planning selects a globally optimal return",
    );
    assert.equal(
      anotherReference.optimal.id,
      result.optimal.id,
      "Independent evaluation labels do not select the policy",
    );
    assert.equal(
      anotherReference.greedy.id,
      result.greedy.id,
      "Independent evaluation labels do not alter the baseline",
    );
    result.paths.forEach((path, i) => {
      near(
        path.value,
        path.rewards[0] + gamma * path.rewards[1],
        "Discounted two-step return",
      );
      near(
        path.value,
        anotherReference.paths[i].value,
        "Evaluation-reference invariance of reward",
      );
      probability(path.accuracy, "Reference agreement is bounded");
      near(
        path.accuracy + anotherReference.paths[i].accuracy,
        1,
        "Opposite reference labels change only evaluation",
      );
      if (gamma === 0)
        near(
          path.value,
          path.id[0] === "A" ? 0.9 : 0.8,
          "Gamma zero removes all second-step reward",
        );
    });
  }
}

// Lambda endpoints and the telescoping Monte Carlo target catch terminal-mask errors.
for (const gamma of [0.5, 0.75, 0.99, 1]) {
  for (const truncated of [false, true]) {
    const td = gaeExperiment(gamma, 0, truncated);
    td.advantages.forEach((a, i) =>
      near(a, td.deltas[i], "Lambda zero is one-step TD residual"),
    );
    const mc = gaeExperiment(gamma, 1, truncated);
    const bootstrap = truncated ? 0.7 : 0;
    [
      gamma ** 2 + gamma ** 3 * bootstrap,
      gamma + gamma ** 2 * bootstrap,
      1 + gamma * bootstrap,
    ].forEach((target, i) =>
      near(
        mc.targets[i],
        target,
        "Lambda one is a bootstrapped Monte Carlo return",
      ),
    );
    for (const lambda of [0, 0.25, 0.95, 1]) {
      const result = gaeExperiment(gamma, lambda, truncated);
      result.advantages.forEach((a, i) => {
        const expanded = total(
          result.deltas
            .slice(i)
            .map((delta, k) => (gamma * lambda) ** k * delta),
        );
        near(
          a,
          expanded,
          "Backward recurrence equals the explicit finite GAE sum",
        );
        near(
          result.targets[i],
          a + result.values[i],
          "Value target adds the baseline back once",
        );
      });
      const terminal = gaeExperiment(gamma, lambda, false);
      const cutoff = gaeExperiment(gamma, lambda, true);
      cutoff.advantages.forEach((a, i) =>
        near(
          a - terminal.advantages[i],
          0.7 * gamma ** (3 - i) * lambda ** (2 - i),
          "Truncation bootstraps but terminal does not",
        ),
      );
    }
  }
}
gaeExperiment(1, 1, false).targets.forEach((target) =>
  near(target, 1, "Undiscounted terminal return is one at each step"),
);

// Symmetric degree normalization is not a row-stochastic neighbor mean.
const gcn = gcnExperiment(1, 1, 1);
[2, 3, 3, 3, 3, 2].forEach((d, i) =>
  near(gcn.degrees[i], d, "Known weighted path degrees"),
);
near(gcn.normalized[0][0], 0.5, "Endpoint self-loop normalization");
near(
  gcn.normalized[0][1],
  1 / Math.sqrt(6),
  "Endpoint-to-interior normalization",
);
near(gcn.normalized[2][3], 1 / 3, "Bridge normalization");
[0.5 + 1 / Math.sqrt(6), 2 / 3 + 1 / Math.sqrt(6), 2 / 3, 1 / 3, 0, 0].forEach(
  (value, i) => near(gcn.history[1][i], value, "One exact GCN propagation"),
);
assert.ok(
  Math.abs(total(gcn.normalized[0]) - 1) > 0.05,
  "A GCN row must not be forcibly normalized to one",
);
for (const bridge of [0, 0.1, 0.5, 1]) {
  for (const selfLoop of [0, 0.25, 1, 2]) {
    const result = gcnExperiment(bridge, selfLoop, 8);
    assert.equal(result.history.length, 9);
    result.normalized.forEach((row, i) => {
      row.forEach((value, j) => {
        near(
          value,
          result.normalized[j][i],
          "Undirected normalization remains symmetric",
        );
        assert.ok(value >= 0 && Number.isFinite(value));
      });
      near(
        total(row.map((weight, j) => weight * Math.sqrt(result.degrees[j]))),
        Math.sqrt(result.degrees[i]),
        "S preserves the sqrt-degree eigenvector, not the all-ones vector",
      );
    });
    result.history.slice(1).forEach((h, l) =>
      h.forEach((value, i) => {
        near(
          value,
          total(
            result.normalized[i].map(
              (weight, j) => weight * result.history[l][j],
            ),
          ),
          "Repeated propagation uses the previous layer simultaneously",
        );
        if (bridge === 0 && i >= 3)
          near(value, 0, "A disconnected domain receives no signal");
        if (i > 2 + l + 1)
          near(value, 0, "Signal cannot travel beyond the layer's hop count");
      }),
    );
  }
}
assert.equal(
  gcnExperiment(1, 1, 0).history.length,
  1,
  "Zero layers returns the unpropagated features",
);

for (const temperature of [0.2, 0.3, 0.7, 1, 2]) {
  let previousBoundaryMass = -1;
  for (let distractors = 0; distractors <= 4; distractors++) {
    const result = gatExperiment(temperature, distractors);
    assert.equal(result.weights.length, 2 + distractors);
    near(
      total(result.weights),
      1,
      "GAT weights normalize over exactly the existing edges",
    );
    result.weights.forEach((weight, i) => {
      probability(weight, "Finite GAT weight");
      near(
        result.messages[i],
        weight * result.features[i],
        "Each message is weighted exactly once",
      );
    });
    near(
      total(result.messages),
      result.output,
      "All edge contributions sum to the output",
    );
    assert.ok(
      result.output >= Math.min(...result.features) &&
        result.output <= Math.max(...result.features),
      "A scalar attention aggregation lies in the feature convex hull",
    );
    near(
      result.weights[1] / result.weights[0],
      Math.exp(1 / temperature),
      "Softmax pairwise odds follow the logit difference",
    );
    assert.ok(
      result.boundaryMass >= previousBoundaryMass,
      "Adding high-logit boundary edges increases their total mass",
    );
    previousBoundaryMass = result.boundaryMass;
    if (!distractors)
      near(
        result.boundaryMass,
        0,
        "No boundary edges means no boundary contribution",
      );
    if (distractors > 1)
      result.weights
        .slice(3)
        .forEach((weight) =>
          near(
            weight,
            result.weights[2],
            "Equal boundary logits have equal per-edge weight",
          ),
        );
    assert.ok(
      result.entropy >= 0 &&
        result.entropy <= Math.log(2 + distractors) + 1e-12,
    );
  }
}
assert.ok(
  gatExperiment(0.2, 1).boundaryMass > gatExperiment(2, 1).boundaryMass,
  "A lower temperature amplifies a wrongly high boundary logit",
);

// Independent loss implementation lets finite differences check gradients of every similarity.
function directInfoNCE(similarities, temperature) {
  return Math.log(
    total(
      similarities.map((s) => Math.exp((s - similarities[0]) / temperature)),
    ),
  );
}
for (const temperature of [0.05, 0.1, 0.2, 0.5, 1]) {
  for (const falseNegative of [false, true]) {
    const result = contrastiveExperiment(temperature, falseNegative);
    near(
      total(result.probabilities),
      1,
      "Contrastive probabilities normalize at temperature extremes",
    );
    result.probabilities.forEach((p) =>
      probability(p, "Finite contrastive probability"),
    );
    near(
      result.loss,
      directInfoNCE(result.similarities, temperature),
      "Stable loss equals direct InfoNCE",
    );
    near(
      result.loss,
      -Math.log(result.probabilities[0]),
      "The positive index defines the cross-entropy target",
    );
    near(
      total(result.gradients),
      0,
      "Similarity gradients are invariant to a common logit shift",
    );
    assert.ok(
      result.gradients[0] < 0,
      "Gradient descent raises positive similarity",
    );
    result.gradients
      .slice(1)
      .forEach((g) =>
        assert.ok(
          g > 0,
          "Gradient descent lowers every labeled negative similarity",
        ),
      );
    result.similarities.forEach((_similarity, i) => {
      const plus = [...result.similarities],
        minus = [...result.similarities],
        epsilon = 1e-5;
      plus[i] += epsilon;
      minus[i] -= epsilon;
      const numerical =
        (directInfoNCE(plus, temperature) - directInfoNCE(minus, temperature)) /
        (2 * epsilon);
      near(
        result.gradients[i],
        numerical,
        "InfoNCE gradient matches central finite differences",
        1e-7,
      );
    });
  }
  const withFalse = contrastiveExperiment(temperature, true);
  const withoutFalse = contrastiveExperiment(temperature, false);
  assert.ok(
    withFalse.loss > withoutFalse.loss,
    "A high-similarity false negative increases loss",
  );
  assert.ok(
    withFalse.probabilities[0] < withoutFalse.probabilities[0],
    "False negatives compete with the intended positive",
  );
  assert.ok(
    withFalse.gradients[3] > withFalse.gradients[1],
    "The biological false negative receives a stronger repulsive gradient",
  );
}

// Render each authored experiment without browser globals. This also verifies that
// sequence playback accesses window/document only after mounting in the browser.
const require = createRequire(import.meta.url);
const componentCache = new Map();
function loadComponent(input) {
  let file = resolve(input);
  if (extname(file) === ".css") return {};
  if (!extname(file))
    file = [file + ".ts", file + ".tsx", file + "/index.ts"].find(existsSync);
  assert.ok(file, `Cannot resolve ${input}`);
  if (componentCache.has(file)) return componentCache.get(file).exports;
  const loaded = { exports: {} };
  componentCache.set(file, loaded);
  const source = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (path) =>
    path.startsWith(".")
      ? loadComponent(resolve(dirname(file), path))
      : require(path);
  new vm.Script(`(function(require,module,exports){${source}\n})`, {
    filename: file,
  }).runInThisContext()(localRequire, loaded, loaded.exports);
  return loaded.exports;
}
const BioAlgorithmLab = loadComponent(
  "src/components/BioAlgorithmLab.tsx",
).default;
const lessonIds = new Set(
  loadComponent("src/data/lessons.ts").lessons.map((lesson) => lesson.id),
);
const expectedHeadings = {
  em: "EM 把 molecules",
  planning: "Assignment 有全局约束",
  gae: "最后一步结束了",
  gcn: "一条跨边界 edge",
  gat: "Attention 很高",
  contrastive: "同一 biological state",
};
for (const [kind, heading] of Object.entries(expectedHeadings)) {
  const html = renderToStaticMarkup(
    React.createElement(BioAlgorithmLab, { query: "lab=" + kind }),
  );
  assert.ok(
    html.includes(heading),
    `${kind}: the requested experiment renders`,
  );
  assert.ok(
    !/NaN|Infinity|undefined/.test(html),
    `${kind}: visible calculations stay finite and defined`,
  );
  assert.equal(
    (html.match(/<svg\b/g) || []).length,
    2,
    `${kind}: two mechanism figures render`,
  );
  const fieldsets = [
    ...html.matchAll(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/g),
  ];
  assert.equal(fieldsets.length, 1, `${kind}: one prediction question renders`);
  const radios = [
    ...fieldsets[0][1].matchAll(/<input\b[^>]*type="radio"[^>]*>/g),
  ];
  assert.ok(radios.length >= 2, `${kind}: the question offers a choice`);
  const names = radios.map(([input]) => input.match(/\bname="([^"]+)"/)?.[1]);
  assert.ok(
    names.every(Boolean),
    `${kind}: every radio has a native group name`,
  );
  assert.equal(
    new Set(names).size,
    1,
    `${kind}: question radios share one keyboard-navigable group`,
  );
  assert.ok(
    /<button\b[^>]*disabled=""[^>]*>检查理解<\/button>/.test(fieldsets[0][1]),
    `${kind}: answer submission starts disabled until a prediction is selected`,
  );
  const courseLinks = [...html.matchAll(/href="#\/lesson\/([^"?]+)/g)];
  assert.ok(
    courseLinks.length >= 2,
    `${kind}: practical experiments connect back to lessons`,
  );
  for (const [, id] of courseLinks)
    assert.ok(
      lessonIds.has(decodeURIComponent(id)),
      `${kind}: linked lesson ${id} exists`,
    );
}
for (const query of [
  "",
  "lab=missing",
  "lab=toString",
  "lab=__proto__",
  "lab=%E0%A4%A",
]) {
  const html = renderToStaticMarkup(
    React.createElement(BioAlgorithmLab, { query }),
  );
  assert.ok(
    html.includes(expectedHeadings.em),
    `Invalid lab query ${query} safely falls back to EM`,
  );
}

console.log(
  `PASS bio algorithms: ${checks} numeric checks; EM conservation/monotonicity/zero initialization, exhaustive planning and reference isolation, GAE terminal/truncation, exact GCN and disconnected domains, GAT edge contributions, InfoNCE finite differences; six SSR experiments with two figures, named radio groups, finite outputs, valid course links, and malformed-route recovery.`,
);
