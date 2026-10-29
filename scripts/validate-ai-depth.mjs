import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const require = createRequire(import.meta.url),
  cache = new Map();
function load(input) {
  let file = resolve(input);
  if (extname(file) === ".css") return {};
  if (!extname(file)) file = [file + ".ts", file + ".tsx"].find(existsSync);
  assert.ok(file, `Missing ${input}`);
  if (cache.has(file)) return cache.get(file).exports;
  const m = { exports: {} };
  cache.set(file, m);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  new vm.Script(`(function(require,module,exports){${code}\n})`, {
    filename: file,
  }).runInThisContext()(
    (p) => (p.startsWith(".") ? load(resolve(dirname(file), p)) : require(p)),
    m,
    m.exports,
  );
  return m.exports;
}
const {
  hmmExperiment,
  kalmanExperiment,
  assignmentExperiment,
  geometryExperiment,
  mctsExperiment,
  beamExperiment,
} = load("src/components/depthLabMath.ts");
let count = 0;
const near = (a, b, tol = 1e-9) => {
  assert.ok(Number.isFinite(a) && Math.abs(a - b) < tol, `${a} != ${b}`);
  count++;
};
// Independent enumeration of every hidden path, not the Forward recurrence.
function hmmOracle(obs, stay, acc) {
  const paths = [];
  for (let mask = 0; mask < 2 ** obs.length; mask++) {
    const path = obs.map((_, i) => (mask >> i) & 1);
    let p = 0.5;
    for (let t = 0; t < obs.length; t++) {
      p *= path[t] === obs[t] ? acc : 1 - acc;
      if (t) p *= path[t] === path[t - 1] ? stay : 1 - stay;
    }
    paths.push({ path, p });
  }
  return { paths, evidence: paths.reduce((s, x) => s + x.p, 0) };
}
for (const stay of [0.5, 0.8, 0.95])
  for (const acc of [0.55, 0.8, 0.95])
    for (const observations of [
      [1, 0, 1, 1, 0],
      [1, 1, 1, 0, 0],
      [0, 1, 0, 1, 0],
    ]) {
      const r = hmmExperiment(stay, acc, observations),
        oracle = hmmOracle(observations, stay, acc);
      near(r.likelihood, oracle.evidence);
      near(
        r.frames.at(-1).bestJoint,
        Math.max(...oracle.paths.map((x) => x.p)),
      );
      for (let t = 0; t < 5; t++) {
        const prefix = hmmOracle(observations.slice(0, t + 1), stay, acc);
        near(
          r.frames[t].filtered[1],
          prefix.paths
            .filter((x) => x.path[t] === 1)
            .reduce((s, x) => s + x.p, 0) / prefix.evidence,
        );
        near(
          r.smoothed[t][1],
          oracle.paths
            .filter((x) => x.path[t] === 1)
            .reduce((s, x) => s + x.p, 0) / oracle.evidence,
        );
        near(
          r.frames[t].filtered.reduce((a, b) => a + b),
          1,
        );
      }
    }
for (const q of [0, 0.2, 2])
  for (const R of [0.1, 1, 4])
    for (const shock of [0, 3, 5]) {
      const { frames } = kalmanExperiment(q, R, shock);
      let m = 0,
        P = 1;
      for (let t = 0; t < 6; t++) {
        const a = frames[t],
          prior = m + (t ? 1 : 0),
          variance = P + q;
        const posterior = 1 / (1 / variance + 1 / R);
        near(a.variance, posterior);
        near(a.mean, posterior * (prior / variance + a.measurement / R));
        assert.ok(a.K > 0 && a.K < 1);
        assert.ok(a.variance < a.predictedVariance);
        m = a.mean;
        P = a.variance;
      }
    }
const permutations = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];
for (let k = 0; k <= 20; k++) {
  const r = assignmentExperiment(k / 20),
    oracle = Math.min(
      ...permutations.map((p) => p.reduce((s, j, i) => s + r.cost[i][j], 0)),
    );
  near(r.bestCost, oracle);
  near(r.dual, oracle);
  assert.ok(r.greedyCost >= oracle - 1e-9);
  assert.equal(r.best.length, 3);
  for (const frame of r.frames) {
    assert.equal(
      new Set(frame.matching.map((x) => x[0])).size,
      frame.matching.length,
    );
    assert.equal(
      new Set(frame.matching.map((x) => x[1])).size,
      frame.matching.length,
    );
    assert.ok(frame.reduced.flat().every((x) => x >= -1e-9));
  }
}
near(assignmentExperiment(0).bestCost, 0.41);
near(assignmentExperiment(0).greedyCost, 1.1);
near(assignmentExperiment(1).bestCost, 0.3);
for (let w = 160; w <= 480; w += 32)
  for (let h = 160; h <= 480; h += 32)
    for (const letterbox of [false, true])
      for (const flip of [false, true]) {
        const r = geometryExperiment(w, h, letterbox, flip);
        r.recovered.forEach((v, i) => near(v, r.source[i]));
        const area = (b) => (b[2] - b[0]) * (b[3] - b[1]);
        near(area(r.output), area(r.source) * r.sx * r.sy);
        assert.ok(
          r.output[0] >= -1e-9 &&
            r.output[2] <= w + 1e-9 &&
            r.output[1] >= -1e-9 &&
            r.output[3] <= h + 1e-9,
        );
        if (letterbox) near(r.sx, r.sy);
      }
for (const c of [0, 0.5, 1, 2])
  for (const budget of [2, 6, 16])
    for (const prob of [0, 0.5, 1]) {
      const r = mctsExperiment(c, budget, prob);
      assert.deepEqual(r, mctsExperiment(c, budget, prob));
      assert.equal(r.frames.length, 1 + 4 * budget);
      near(r.stats.S.n, budget);
      near(r.stats.S.w, r.stats.A.w + r.stats.B.w);
      near(r.stats.S.n, r.stats.A.n + r.stats.B.n);
      assert.ok(["A", "B"].includes(r.recommendation));
      for (let i = 4; i < r.frames.length; i += 4) {
        const before = r.frames[i - 1],
          after = r.frames[i];
        assert.equal(after.phase, "Backup");
        for (const [id, stat] of Object.entries(after.stats)) {
          near(stat.n - before.stats[id].n, after.path.includes(id) ? 1 : 0);
          near(
            stat.w - before.stats[id].w,
            after.path.includes(id) ? after.reward : 0,
          );
        }
      }
    }
near(beamExperiment(1).best.p, 0.306);
near(beamExperiment(2).best.p, 0.36);
assert.equal(beamExperiment(2).best.text, "By");
near(beamExperiment(2, 0.6, true).best.p, 0.6);
for (let b = 1; b <= 4; b++)
  for (const p of [0.1, 0.3, 0.6, 0.9])
    for (const mask of [true, false]) {
      const r = beamExperiment(b, p, mask);
      near(
        r.all.reduce((s, x) => s + x.p, 0),
        1,
      );
      assert.ok(r.best.p <= r.oracle.p + 1e-12);
      if (b >= 2) near(r.best.p, r.oracle.p);
      if (mask) assert.ok(r.all.every((x) => x.text.endsWith("y")));
      assert.ok(r.kept.length <= b);
    }
const { lessons } = load("src/data/lessons.ts"),
  ids = new Set(lessons.map((x) => x.id)),
  Lab = load("src/components/AIDepthLab.tsx").default;
for (const lab of ["hmm", "kalman", "assignment", "geometry", "mcts", "beam"]) {
  const html = renderToStaticMarkup(
    React.createElement(Lab, { query: "lab=" + lab }),
  );
  assert.ok(!/NaN|Infinity|undefined/.test(html), lab);
  assert.ok((html.match(/<svg\b/g) || []).length >= 1);
  assert.equal((html.match(/type="radio"/g) || []).length, 2);
  assert.ok(html.includes("播放推演"));
  assert.ok(html.includes('disabled=""'));
  for (const [, id] of html.matchAll(/href="#\/lesson\/([^"?]+)/g))
    assert.ok(ids.has(id), `${lab}: unknown lesson ${id}`);
}
for (const raw of ["", "missing", "toString", "__proto__"])
  assert.ok(
    renderToStaticMarkup(
      React.createElement(Lab, { query: "lab=" + raw }),
    ).includes("HMM："),
  );
const { linkedLabs, linkedLabForLesson } = load("src/data/linkedLabs.ts");
assert.equal(linkedLabs.length, 17);
const linkedIds = new Set();
for (const lab of linkedLabs) {
  assert.ok(/^#\/(ai-depth|ai-labs|bio-algorithms)\?lab=/.test(lab.href));
  for (const id of lab.lessons) {
    assert.ok(ids.has(id), id);
    assert.ok(!linkedIds.has(id), `Duplicate experiment mapping ${id}`);
    linkedIds.add(id);
    assert.equal(linkedLabForLesson(id).href, lab.href);
  }
}
const Directory = load("src/components/AnimationDirectory.tsx").default,
  html = renderToStaticMarkup(React.createElement(Directory));
for (const lab of linkedLabs)
  assert.ok(html.includes(`href="${lab.href}"`), lab.id);
console.log(
  `Validated AI depth: ${count} numerical assertions, exhaustive HMM/path and assignment oracles, Kalman precision fusion, geometry round trips, seeded four-phase MCTS, beam/grammar distributions, 6 SSR experiments and 17 discoverable linked labs.`,
);
