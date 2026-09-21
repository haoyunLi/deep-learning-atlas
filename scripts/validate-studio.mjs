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

const { codeLabs, codeLabMetrics } = load("src/studio/codeLabs.ts");
assert.equal(codeLabs.length, 5, "five code labs");
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
  assert.ok(
    metrics.params > 0 && metrics.flops > 0 && metrics.activationBytes > 0,
    `${lab.lessonId}: finite resource estimates`,
  );
}

const { defaultArenaConfig, generateArenaData, runArena } = load(
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
assert.ok(
  revealed.results.every(
    (result) => result.test && Number.isFinite(result.test.logLoss),
  ),
  "explicit reveal evaluates test",
);
for (const result of revealed.results) {
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

const { studioProjects } = load("src/studio/projects.ts");
const { lessons } = load("src/data/lessons.ts");
const lessonIds = new Set(lessons.map((lesson) => lesson.id));
assert.equal(studioProjects.length, 7, "seven end-to-end projects");
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
for (const [path, query, title] of [
  ["/studio", "", "从看懂，到会做。"],
  ["/studio/code", "lesson=attention", "Attention：从公式到可靠实现"],
  ["/studio/shapes", "", "让每一条轴都有名字。"],
  ["/studio/arena", "", "同一数据，同一切分，同一预算。"],
  ["/studio/projects", "project=grounded-rag", "一个模型，不等于一个项目。"],
]) {
  const html = renderToStaticMarkup(
    React.createElement(StudioPage, { path, query }),
  );
  assert.ok(html.includes(title), `${path}: server renders route title`);
  assert.ok(html.includes("学习工作台"), `${path}: shared tool navigation`);
}

console.log(
  `Validated Studio: ${codeLabs.length} code labs, ${shapeDefinitions.length} shape debuggers, ${locked.results.length} trained arena models, ${studioProjects.length} projects, ${lessons.length} linked lessons, and five SSR routes.`,
);
