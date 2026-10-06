import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const cache = new Map();
function load(input) {
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
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: file,
  }).outputText;
  const localRequire = (path) =>
    path.startsWith(".") ? load(resolve(dirname(file), path)) : require(path);
  new vm.Script(`(function(require,module,exports){${code}\n})`, {
    filename: file,
  }).runInThisContext()(localRequire, module, module.exports);
  return module.exports;
}

const { shapeDefinitions, firstShapeError } = load("src/studio/shapeMath.ts");
assert.equal(shapeDefinitions.length, 5, "five shape debuggers");
for (const definition of shapeDefinitions) {
  assert.ok(
    !firstShapeError(definition, definition.defaults),
    `${definition.id}: defaults are valid`,
  );
  const broken = definition.makeError(definition.defaults);
  assert.ok(
    firstShapeError(definition, broken),
    `${definition.id}: deliberate error is visible`,
  );
  assert.ok(
    !firstShapeError(definition, definition.repair(broken)),
    `${definition.id}: repair restores contract`,
  );
  const stages = definition.stages(definition.defaults);
  assert.ok(stages.length >= 4, `${definition.id}: full pipeline`);
  assert.equal(
    new Set(stages.map((stage) => stage.id)).size,
    stages.length,
    `${definition.id}: unique stages`,
  );
}
const attention = shapeDefinitions.find((item) => item.id === "attention");
assert.match(
  firstShapeError(attention, { ...attention.defaults, Dh: 7 }),
  /D 必须等于 H × Dh/,
);

const { codeLabs, codeLabMetrics, validateCodeLabDimensions } = load("src/studio/codeLabs.ts");
assert.equal(codeLabs.length, 6, "six code labs");
for (const lab of codeLabs) {
  assert.ok(lab.steps.length >= 4, `${lab.lessonId}: stepwise lab`);
  for (const mode of ["scratch", "pytorch", "production"]) {
    const lines = lab.variants[mode].code.split("\n").length;
    assert.ok(lines >= 5, `${lab.lessonId}/${mode}: substantive code`);
    for (const step of lab.steps) {
      const range = step.lines[mode];
      assert.ok(
        range[0] >= 1 && range[1] >= range[0] && range[0] <= lines,
        `${lab.lessonId}/${mode}/${step.id}: line range`,
      );
    }
  }
  const metrics = codeLabMetrics(lab, lab.dimensions);
  assert.deepEqual(validateCodeLabDimensions(lab, lab.dimensions), [], `${lab.lessonId}: valid default dimensions`);
  for (const value of [0, -1, 1.5, NaN, Infinity, 2049]) {
    const invalid = { ...lab.dimensions, B: value };
    assert.ok(validateCodeLabDimensions(lab, invalid).length, `${lab.lessonId}: rejects B=${value}`);
    assert.equal(codeLabMetrics(lab, invalid).params, null, "invalid input produces no estimate");
  }
  assert.ok(validateCodeLabDimensions(lab, { ...lab.dimensions, bytes: 3 }).length, "unsupported element width rejected");
  assert.ok(validateCodeLabDimensions(lab, { ...lab.dimensions, T: 513 }).length, "out-of-range T rejected");
  if (lab.lessonId === "attention") {
    assert.equal(metrics.params, 16384);
    assert.equal(metrics.flops, 270336);
    assert.equal(metrics.activationBytes, 9216);
    assert.ok(validateCodeLabDimensions(lab, { ...lab.dimensions, D: 65 }).length, "attention requires whole head widths");
  } else {
    assert.equal(metrics.flops, null, "incomplete architecture has no FLOPs claim");
    assert.equal(metrics.activationBytes, null, "incomplete architecture has no memory claim");
    assert.equal(metrics.params, lab.lessonId === "meta-learning-maml" ? lab.dimensions.D : null);
  }
}

const { defaultArenaConfig, generateArenaData, runArena, arenaModelSettings } = load(
  "src/studio/arenaMath.ts",
);
const rawA = generateArenaData(defaultArenaConfig);
const rawB = generateArenaData(defaultArenaConfig);
assert.deepEqual(rawA, rawB, "arena data is deterministic");
assert.equal(rawA.train.length, defaultArenaConfig.trainSize);
assert.equal(rawA.validation.length, 120);
assert.equal(rawA.test.length, 160);
const locked = runArena(defaultArenaConfig, false);
assert.equal(locked.results.length, 5, "five actual algorithms run");
assert.ok(
  locked.results.every((result) => result.test === undefined),
  "test metrics stay locked",
);
assert.ok(
  locked.points.every((point) => point.split !== "test"),
  "test points stay hidden",
);
const revealed = runArena(defaultArenaConfig, true);
const settings = arenaModelSettings(defaultArenaConfig);
assert.equal(settings.logistic.value, 120);
assert.equal(settings.knn.value, 9);
assert.equal(settings.forest.value, 30);
assert.equal(settings.boosting.value, 20);
assert.equal(settings.mlp.value, 150);
assert.ok(
  revealed.results.every(
    (result) => result.test && Number.isFinite(result.test.logLoss),
  ),
  "explicit reveal evaluates test",
);
for (const result of revealed.results) {
  assert.equal(result.curve.at(-1).step, settings[result.id].value, `${result.id}: disclosed setting matches actual final step/k/tree count`);
  assert.equal(
    result.boundary.length,
    625,
    `${result.id}: decision surface grid`,
  );
  assert.ok(
    result.boundary.every(
      (point) =>
        Number.isFinite(point.probability) &&
        point.probability >= 0 &&
        point.probability <= 1,
    ),
    `${result.id}: finite probabilities`,
  );
  assert.ok(
    result.validation.balancedAccuracy >= 0 &&
      result.validation.balancedAccuracy <= 1,
    `${result.id}: valid balanced accuracy`,
  );
}

const { arenaDataKey, parseArenaExposures } = load("src/studio/arenaEvidence.ts");
const exposure = { dataKey: arenaDataKey(defaultArenaConfig), model: "knn", reason: "validation evidence", budget: 10, revealedAt: 1234 };
const history = parseArenaExposures(JSON.stringify([exposure]));
assert.equal(history[0].dataKey, arenaDataKey({ ...defaultArenaConfig, budget: 20 }), "retraining settings cannot erase data exposure");
assert.notEqual(history[0].dataKey, arenaDataKey({ ...defaultArenaConfig, seed: 43 }), "new generated dataset has its own identity");
for (const raw of [null, "{", "null", "{}", '[{"dataKey":"bad"}]']) assert.deepEqual(parseArenaExposures(raw), [], "malformed exposure storage recovers");
assert.deepEqual(parseArenaExposures(JSON.stringify([...history, {...exposure, budget: 20}])), [...history, {...exposure, budget: 20}], "old exposure persists when another setting is revealed");

const { studioProjects } = load("src/studio/projects.ts");
const { lessons } = load("src/data/lessons.ts");
const lessonIds = new Set(lessons.map((lesson) => lesson.id));
assert.equal(studioProjects.length, 8, "eight end-to-end projects");
for (const project of studioProjects) {
  assert.equal(
    project.stages.length,
    8,
    `${project.id}: eight delivery stages`,
  );
  assert.equal(
    new Set(project.stages.map((stage) => stage.id)).size,
    8,
    `${project.id}: unique stage IDs`,
  );
  project.stages.forEach((stage) => {
    assert.ok(
      stage.question &&
        stage.action &&
        stage.evidence &&
        stage.pass &&
        stage.failure,
      `${project.id}/${stage.id}: complete evidence contract`,
    );
  });
  project.relatedLessons.forEach((id) =>
    assert.ok(lessonIds.has(id), `${project.id}: related lesson ${id}`),
  );
}

const { parseStudioState } = load("src/studio/studioState.ts");
for (const raw of [null, "", "{", "null", "[]", "42"]) {
  const state = parseStudioState(raw);
  assert.deepEqual(state.diagnostic, {}, "corrupt diagnostic recovers");
  assert.deepEqual(
    state.projectStages,
    {},
    "corrupt project progress recovers",
  );
}
const recovered = parseStudioState(
  JSON.stringify({
    diagnostic: { goal: "code" },
    mastery: { vision: 2, invalid: 9 },
    projectStages: { "readmission-risk": ["audit", "unknown"] },
  }),
);
assert.equal(recovered.diagnostic.goal, "code");
assert.equal(recovered.mastery.vision, 2);
assert.equal(recovered.mastery.invalid, undefined);
assert.deepEqual(recovered.projectStages["readmission-risk"], ["audit"]);

const { default: StudioPage } = load("src/components/studio/StudioPage.tsx");
const { trainingStep, forwardTraining, defaultTrainingInputs, tanhProbe, trainingLossSlice } = load("src/studio/backpropMath.ts");
for (const x of [-2, -0.5, 0, 0.75, 2]) for (const w of [-3, -0.5, 0, 0.5, 3]) for (const v of [-2, 0.25, 1]) for (const target of [-1, 0, 1]) {
  const p = { x, w, v, target, eta: 0.25 };
  const r = trainingStep(p);
  for (const [parameter, gradient] of [["w", r.wGradient], ["v", r.vGradient]]) {
    const epsilon = 1e-5;
    const numeric = (forwardTraining({ ...p, [parameter]: p[parameter] + epsilon }).loss - forwardTraining({ ...p, [parameter]: p[parameter] - epsilon }).loss) / (2 * epsilon);
    assert.ok(Math.abs(numeric - gradient) < 1e-7 * Math.max(1, Math.abs(numeric)), `${parameter}: finite-difference chain rule`);
    assert.equal(r.updated[parameter], p[parameter] - p.eta * gradient, "SGD uses old gradients simultaneously");
  }
}
const defaultStep = trainingStep(defaultTrainingInputs);
assert.ok(defaultStep.after.loss < defaultStep.before.loss);
const overshoot = trainingStep({ ...defaultTrainingInputs, eta: 2 });
assert.ok(overshoot.after.loss > overshoot.before.loss, "negative gradient direction can overshoot with a large step");
const frozen = trainingStep({ ...defaultTrainingInputs, eta: 0 });
assert.deepEqual(frozen.before, frozen.after);
const zeroError = trainingStep({ ...defaultTrainingInputs, x: 0, target: 0 });
assert.equal(zeroError.wGradient, 0); assert.equal(zeroError.vGradient, 0);
const saturated = trainingStep({ ...defaultTrainingInputs, w: 3, target: 0 });
assert.ok(saturated.activationDerivative < 0.0001 && Math.abs(saturated.wGradient) < 0.0001 && Math.abs(saturated.vGradient) > 0.9);
assert.throws(() => trainingStep({ ...defaultTrainingInputs, eta: -1 }), /nonnegative/);
assert.throws(() => trainingStep({ ...defaultTrainingInputs, x: NaN }), /finite/);
assert.equal(tanhProbe(0, 0.1).slope, 1);
assert.ok(defaultStep.wGradient < 0 && trainingStep({ ...defaultTrainingInputs, x: -2 }).wGradient > 0 && trainingStep({ ...defaultTrainingInputs, v: -1 }).wGradient > 0, "a nonnegative tanh derivative does not fix the full gradient sign");
assert.ok(Math.abs(tanhProbe(6, 0.1).slope - 0.000024576547405286) < 1e-12);
for (const z of [-6, -1, 0, 1, 6]) for (const direction of [-1, 1]) {
  const large = tanhProbe(z, direction * 0.1), small = tanhProbe(z, direction * 0.001);
  assert.ok(Math.abs(small.secant - small.slope) < Math.abs(large.secant - large.slope));
  assert.ok(Math.abs(small.secant - small.slope) < 0.001);
}
assert.throws(() => tanhProbe(1, 0), /nonzero/);
const slice = trainingLossSlice(defaultTrainingInputs);
assert.ok(Math.abs(slice.points[0].loss - 0.0284186732) < 1e-10);
assert.ok(Math.abs(slice.points[10].loss - 0.0133037315) < 1e-10);
assert.ok(Math.abs(slice.points[80].loss - 0.0422726041) < 1e-10);
assert.ok(Math.abs(slice.initialSlope + 0.0730666511) < 1e-10);
const epsilon = 1e-6;
const initialDifference = (trainingStep({ ...defaultTrainingInputs, eta: epsilon }).after.loss - defaultStep.before.loss) / epsilon;
assert.ok(Math.abs(initialDifference - slice.initialSlope) < 1e-6);
assert.deepEqual(trainingLossSlice({ ...defaultTrainingInputs, eta: 2 }), slice, "eta selects a proposed update; it does not change old parameters or direction");
assert.ok(trainingLossSlice({ ...defaultTrainingInputs, x: 0, target: 0 }).points.every(p => p.loss === 0));
for (const [path, query, title] of [
  ["/studio", "", "从看懂，到会做。"],
  ["/studio/code", "lesson=attention", "Attention：从公式到可靠实现"],
  [
    "/studio/code",
    "lesson=meta-learning-maml",
    "MAML：从 support 更新到 query meta-gradient",
  ],
  ["/studio/shapes", "", "让每一条轴都有名字。"],
  ["/studio/arena", "", "同一数据，同一切分，明确模型设置。"],
  ["/studio/projects", "project=grounded-rag", "一个模型，不等于一个项目。"],
  ["/studio/training", "", "误差怎样变成一次参数更新？"],
]) {
  const html = renderToStaticMarkup(
    React.createElement(StudioPage, { path, query }),
  );
  assert.ok(html.includes(title), `${path}: server renders route title`);
  assert.ok(html.includes("学习工作台"), `${path}: shared tool navigation`);
  if (path === "/studio/code") {
    assert.ok(html.includes("不执行 Python") && html.includes("GRADIENT · 未测试"), "estimator scope is visible");
    assert.ok(!html.includes("有限数值与梯度路径检查通过"), "unrun checks never claim success");
  }
}

console.log(
  `Validated Studio: ${codeLabs.length} code labs, ${shapeDefinitions.length} shape debuggers, ${locked.results.length} trained arena models, ${studioProjects.length} projects, ${lessons.length} linked lessons, 450 finite-difference training checks, and seven SSR routes.`,
);
