import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Load the same pure teaching calculations and SVG components shipped by Vite.
// No browser, generated fixture values, or extra build dependency is required.
const require = createRequire(import.meta.url);
const cache = new Map();
function loadTs(input) {
  let file = resolve(input);
  if (extname(file) === ".css") return {};
  if (!extname(file))
    file = [file + ".ts", file + ".tsx", file + "/index.ts"].find(existsSync);
  assert.ok(file, `Cannot resolve ${input}`);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
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
  new vm.Script(`(function(require,module,exports){${compiled}\n})`, {
    filename: file,
  }).runInThisContext()(localRequire, module, module.exports);
  return module.exports;
}
const close = (actual, expected, message) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-8,
    `${message}: ${actual} != ${expected}`,
  );
const { lessons } = loadTs("src/data/lessons.ts");
const { parameterLabs, legacyAnimationIds, mechanismCount } = loadTs(
  "src/components/labs/index.ts",
);
const { courseAnimationSteps, default: CourseWalkthrough } = loadTs(
  "src/components/CourseWalkthrough.tsx",
);
const ids = new Set(lessons.map((l) => l.id));
const groups = [
  ["foundationsClassical", "foundationsClassicalLabs"],
  ["visionSequence", "visionSequenceLabs"],
  ["reinforcementRepresentation", "reinforcementRepresentationLabs"],
  ["generativeData", "generativeDataLabs"],
].map(([file, name]) => loadTs(`src/components/labs/${file}.tsx`)[name]);
const groupKeys = groups.flatMap(Object.keys);
assert.equal(
  groupKeys.length,
  new Set(groupKeys).size,
  "Duplicated algorithm lab IDs",
);
assert.ok(
  groupKeys.length >= 36,
  "At least 36 distinct parameter labs required",
);
assert.equal(mechanismCount, groupKeys.length + legacyAnimationIds.length);
for (const id of [...groupKeys, ...legacyAnimationIds])
  assert.ok(ids.has(id), `Unknown lesson ${id}`);

let svgRenders = 0,
  flowRenders = 0;
for (const lesson of lessons) {
  const steps = courseAnimationSteps(lesson);
  assert.equal(steps.length, lesson.mechanicsSteps.length);
  steps.forEach((s, step) => {
    assert.ok(s.title && s.explanation, `${lesson.id}: missing step`);
    const html = renderToStaticMarkup(
      React.createElement(CourseWalkthrough, { lesson, step }),
    );
    assert.equal(
      (html.match(/aria-current="step"/g) || []).length,
      1,
      `${lesson.id}: active step`,
    );
    flowRenders++;
  });
}
for (const [id, lab] of Object.entries(parameterLabs)) {
  const p = lab.parameter;
  assert.ok(
    lab.title && lab.englishTitle && lab.note && p.hint,
    `${id}: metadata`,
  );
  assert.equal(lab.steps.length, 4, `${id}: four meaningful steps`);
  assert.ok(
    p.min < p.max && p.initial >= p.min && p.initial <= p.max && p.step > 0,
    `${id}: range`,
  );
  // Every slider stop matters: discrete windows, exact kinks, and rank changes
  // are missed by checking only minimum / initial / maximum values.
  const values = new Set([
    p.initial,
    p.max,
    ...Array.from(
      { length: Math.floor((p.max - p.min) / p.step + 1e-8) + 1 },
      (_, index) => Number((p.min + index * p.step).toFixed(8)),
    ),
  ]);
  for (const value of values)
    for (let step = 0; step < lab.steps.length; step++) {
      assert.ok(
        lab.steps[step].title && lab.steps[step].explanation,
        `${id}: step ${step}`,
      );
      const html = renderToStaticMarkup(
        React.createElement(lab.render, { value, step }),
      );
      assert.ok(html.includes('role="img"'), `${id}: accessible SVG`);
      assert.match(
        html,
        /role="region" aria-label="[^"]+"/,
        `${id}: named keyboard-accessible scrolling region`,
      );
      assert.ok(
        !/NaN|Infinity/.test(html),
        `${id}: finite geometry at ${value}/${step}`,
      );
      assert.ok(
        !/\b(?:width|height|r)="-\d/.test(html),
        `${id}: nonnegative sizes`,
      );
      svgRenders++;
    }
  const render = (value) =>
    renderToStaticMarkup(React.createElement(lab.render, { value, step: 3 }));
  assert.notEqual(
    render(p.min),
    render(p.max),
    `${id}: slider must affect output`,
  );
}

for (const file of [
  "AttentionAnimation",
  "PPOAnimation",
  "DiffusionAnimation",
]) {
  const { default: Visualization } = loadTs(`src/components/${file}.tsx`);
  for (const step of [0, 1, 2, 3, -1, 4, Number.NaN]) {
    const html = renderToStaticMarkup(
      React.createElement(Visualization, { step }),
    );
    assert.ok(html.includes('role="img"'), `${file}: accessible SVG`);
    assert.match(
      html,
      /role="region" aria-label="[^"]+"/,
      `${file}: named scrolling region`,
    );
    assert.ok(!/NaN|undefined/.test(html), `${file}: valid step state`);
  }
}

const { default: AnimatedExplainer } = loadTs(
  "src/components/AnimatedExplainer.tsx",
);
for (const id of ["attention", "knn", "expectation-maximization"]) {
  const html = renderToStaticMarkup(
    React.createElement(AnimatedExplainer, {
      lesson: lessons.find((lesson) => lesson.id === id),
    }),
  );
  assert.ok(
    html.includes('aria-label="动效播放控制"'),
    `${id}: renders without browser globals`,
  );
  if (parameterLabs[id]) {
    assert.ok(
      html.includes(`aria-describedby="lab-${id}-hint"`),
      `${id}: slider hint is associated`,
    );
    assert.ok(
      html.includes(`id="lab-${id}-hint"`),
      `${id}: slider hint exists`,
    );
  }
}

const f = loadTs("src/components/labs/foundationsClassical.tsx");
close(f.toySigmoid(0), 0.5, "sigmoid midpoint");
for (const w of [-1, 0, 1, 1.5, 2]) {
  const h = 1e-5,
    finiteDifference =
      (f.toyBackprop(w + h).loss - f.toyBackprop(w - h).loss) / (2 * h);
  close(
    f.toyBackprop(w).gradient,
    finiteDifference,
    "backprop agrees with finite differences",
  );
}
close(f.toyGradientDescent(1)[1], 0, "unit-step GD reaches quadratic optimum");
assert.ok(
  Math.abs(f.toyGradientDescent(0.2)[3]) <
    Math.abs(f.toyGradientDescent(0.2)[0]),
);
for (let separation = 0.5; separation <= 5; separation += 0.1) {
  const em = f.toyEM(separation);
  assert.ok(
    em.afterLL >= em.beforeLL - 1e-10,
    "EM mean update must not reduce likelihood",
  );
  em.responsibilities.forEach((r) => assert.ok(r >= 0 && r <= 1));
}
for (const k of [1, 3, 5, 7, 9]) {
  const knn = f.toyKNN(k);
  assert.equal(knn.selected.length, k);
  assert.equal(
    knn.votes.reduce((a, b) => a + b, 0),
    k,
  );
  knn.ranked
    .slice(1)
    .forEach((p, i) => assert.ok(p.distance >= knn.ranked[i].distance));
}
const noDecay = f.toyAdamW(0),
  decay = f.toyAdamW(0.1);
noDecay.forEach((row, i) => {
  close(row.shrink, 0, "zero decay");
  close(
    row.adaptive,
    decay[i].adaptive,
    "decoupled decay keeps fixed-gradient moments",
  );
});

const { rlLabCalculations: r } = loadTs(
  "src/components/labs/reinforcementRepresentation.tsx",
);
close(r.discountedReturn(0).total, 1, "no future reward at gamma zero");
close(r.discountedReturn(1).total, 7, "undiscounted finite return");
for (const epsilon of [0, 0.1, 1])
  close(
    r.bandit(epsilon).reduce((a, b) => a + b, 0),
    1,
    "epsilon-greedy sums to one",
  );
close(r.qLearning(0).next, 1, "zero TD update");
close(r.qLearning(1).next, r.qLearning(1).target, "full TD update");
assert.ok(r.sarsa(2).target < r.sarsa(2).qTarget, "SARSA uses sampled action");
assert.ok(
  r.reinforce(0).nextProbability < 0.4 && r.reinforce(3).nextProbability > 0.4,
  "advantage sign reverses policy update",
);
close(r.sac(0).bonus, 0, "zero entropy coefficient");
assert.ok(r.sac(1).target > r.sac(0).target);
close(r.rewardModel(0).probability, 0.5, "equal reward scores");
const dpo = r.dpo(0.5);
close(
  dpo.difference,
  Math.log(0.6 / 0.2) - Math.log(0.4 / 0.3),
  "DPO subtracts reference log odds",
);
for (const t of [0.1, 0.5, 2])
  close(
    r.infoNce(t).probabilities.reduce((a, b) => a + b, 0),
    1,
    "InfoNCE normalization",
  );
assert.ok(r.infoNce(0.1).probabilities[0] > r.infoNce(2).probabilities[0]);
close(r.triplet(0.5).loss, 0, "satisfied triplet constraint");
close(r.triplet(1).loss, 0.2, "active triplet constraint");

const g = loadTs("src/components/labs/generativeData.tsx");
close(g.gaussianKL(0, 1), 0, "same Gaussian has zero KL");
for (const sigma of [0.3, 0.8, 1.6]) assert.ok(g.gaussianKL(0.8, sigma) >= 0);
for (const t of [0.05, 1, 3]) {
  const probs = g.stableSoftmax([1000, 999, -1000], t);
  close(
    probs.reduce((a, b) => a + b, 0),
    1,
    "stable softmax extreme inputs",
  );
  assert.ok(probs[0] > probs[1]);
}
close(g.ganToy(0).fakeProbability, 0.5, "GAN discriminator midpoint");
assert.ok(g.ganToy(2).generatorLoss < g.ganToy(-2).generatorLoss);

console.log(
  `Validated ${lessons.length} lesson walkthroughs (${flowRenders} step renders), ${mechanismCount} mechanism diagrams, ${groupKeys.length} parameter labs (${svgRenders} SVG renders), and numeric invariants.`,
);
