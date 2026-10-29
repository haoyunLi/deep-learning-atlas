import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createLoader } from "./lib/load-ts.mjs";
const load = createLoader();
const { lessons } = load("src/data/lessons.ts");
const { completeLabCatalog } = load("src/data/completeLabCatalog.ts");
const { animationCatalog, legacyAnimationIds, handCalculationLessonIds } = load(
  "src/data/animationCatalog.ts",
);
const { linkedLabForLesson } = load("src/data/linkedLabs.ts");
const groups = {
  ml: load("src/data/completeLabs/ml.ts").mlCompleteLabs,
  cv: load("src/data/completeLabs/cv.ts").cvCompleteLabs,
  rl: load("src/data/completeLabs/rl.ts").rlCompleteLabs,
};
const pairs = Object.entries(groups).flatMap(([group, labs]) =>
  Object.entries(labs).map(([id, lab]) => ({ id, lab, group })),
);
const { CompleteLabPlayer } = load("src/components/CompleteLessonLab.tsx");
const { default: CompleteLabChart, displayNumber } = load(
  "src/components/CompleteLabChart.tsx",
);
const ids = new Set(lessons.map((l) => l.id));
assert.equal(
  pairs.length,
  170,
  "All 170 audited course gaps must have authored calculations",
);
assert.equal(
  new Set(pairs.map((p) => p.id)).size,
  pairs.length,
  "No duplicate lab IDs",
);
assert.deepEqual(
  Object.keys(completeLabCatalog).sort(),
  pairs.map((p) => p.id).sort(),
  "Catalogue and implementation agree",
);
let calculations = 0,
  charts = 0,
  ssr = 0;
function finite(x, where) {
  assert.ok(Number.isFinite(x), `${where}: non-finite ${x}`);
}
function metrics(ms, where) {
  assert.ok(ms.length >= 1, where);
  assert.equal(
    new Set(ms.map((m) => m.label)).size,
    ms.length,
    `${where}: unique labels`,
  );
  ms.forEach((m) => {
    assert.ok(m.label, where);
    finite(m.value, where);
  });
}
function chart(c, where) {
  assert.ok(["bars", "line", "matrix"].includes(c.kind), where);
  if (c.kind === "bars") {
    assert.equal(c.labels.length, c.values.length, where);
    assert.ok(c.labels.length > 0, where);
    assert.equal(
      new Set(c.labels).size,
      c.labels.length,
      `${where}: unique bar labels`,
    );
    c.values.forEach((v) => finite(v, where));
  }
  if (c.kind === "line") {
    assert.ok(c.x.length >= 1, where);
    assert.equal(c.x.length, c.y.length, where);
    assert.ok(c.xLabel && c.yLabel, where);
    c.x.concat(c.y).forEach((v) => finite(v, where));
  }
  if (c.kind === "matrix") {
    assert.ok(c.rows.length && c.columns.length, where);
    assert.equal(c.values.length, c.rows.length, where);
    c.values.forEach((row) => {
      assert.equal(row.length, c.columns.length, where);
      row.forEach((v) => finite(v, where));
    });
  }
}
for (const { id, lab, group } of pairs) {
  assert.ok(ids.has(id), id);
  assert.equal(completeLabCatalog[id].group, group, id);
  assert.equal(
    completeLabCatalog[id].hint,
    lab.question,
    `${id}: regenerate catalogue question`,
  );
  assert.equal(
    completeLabCatalog[id].label,
    lab.controls.map((c) => c.label).join(" / "),
    `${id}: regenerate catalogue controls`,
  );
  for (const key of ["question", "input", "boundary"])
    assert.ok(lab[key].length >= 12, `${id}: ${key}`);
  assert.ok(
    lab.source.label && new URL(lab.source.url).protocol === "https:",
    `${id}: source`,
  );
  assert.ok(
    lab.usage.length >= 2 &&
      lab.tuning.length >= 2 &&
      lab.troubleshooting.length >= 2,
    `${id}: operating guidance`,
  );
  for (const t of lab.troubleshooting)
    assert.ok(
      t.symptom && t.check && t.action,
      `${id}: actionable troubleshooting`,
    );
  assert.ok(
    lab.controls.length >= 1 && lab.controls.length <= 3,
    `${id}: bounded controls`,
  );
  assert.equal(
    new Set(lab.controls.map((c) => c.id)).size,
    lab.controls.length,
    id,
  );
  const initial = Object.fromEntries(
    lab.controls.map((c) => [c.id, c.initial]),
  );
  const fixtures = [initial];
  for (const c of lab.controls) {
    assert.ok(
      c.label &&
        c.hint &&
        c.min < c.max &&
        c.step > 0 &&
        c.initial >= c.min &&
        c.initial <= c.max,
      `${id}: ${c.id} range`,
    );
    assert.ok(
      Math.abs(
        (c.initial - c.min) / c.step - Math.round((c.initial - c.min) / c.step),
      ) < 1e-6,
      `${id}: default is a reachable slider tick`,
    );
    const ticks = Math.floor((c.max - c.min) / c.step + 1e-7);
    assert.ok(ticks <= 1000, `${id}: keep teaching controls bounded`);
    for (let j = 0; j <= ticks; j++)
      fixtures.push({
        ...initial,
        [c.id]: Number((c.min + j * c.step).toPrecision(12)),
      });
    fixtures.push({ ...initial, [c.id]: c.max });
  }
  // Joint extrema catch interactions which one-at-a-time sweeps cannot expose.
  const corners = (index, values) => {
    if (index === lab.controls.length) {
      fixtures.push(values);
      return;
    }
    const c = lab.controls[index];
    for (const v of [c.min, c.initial, c.max])
      corners(index + 1, { ...values, [c.id]: v });
  };
  corners(0, {});
  const base = lab.calculate(initial),
    signatures = new Set();
  for (const params of fixtures) {
    const r = lab.calculate(params);
    calculations++;
    assert.equal(r.stages.length, 4, `${id}: four intermediate stages`);
    metrics(r.outcomes, `${id} outcomes`);
    signatures.add(JSON.stringify(r.outcomes));
    r.stages.forEach((s, i) => {
      assert.ok(s.title && s.explanation && s.formula, `${id} stage${i}`);
      metrics(s.metrics, `${id} stage${i}`);
      chart(s.chart, `${id} stage${i}`);
      if (
        params === initial ||
        Object.values(params).some((v, j) => v === lab.controls[j]?.max)
      ) {
        const html = renderToStaticMarkup(
          React.createElement(CompleteLabChart, {
            chart: s.chart,
            baseline: base.stages[i].chart,
            label: id,
          }),
        );
        charts++;
        assert.ok(
          html.includes("<svg") && html.includes('role="img"'),
          `${id}: chart semantics`,
        );
        assert.ok(
          !/(?:x|y|cx|cy|width|height|d)="[^"]*(?:NaN|Infinity|undefined)/.test(
            html,
          ),
          `${id}: finite chart`,
        );
      }
    });
  }
  assert.ok(
    signatures.size > 1,
    `${id}: at least one outcome must respond to parameters`,
  );
  const html = renderToStaticMarkup(
    React.createElement(CompleteLabPlayer, { lab, lessonId: id }),
  );
  ssr++;
  assert.equal(
    (html.match(/type="range"/g) || []).length,
    lab.controls.length,
    id,
  );
  assert.ok(
    html.includes("固定当前参数为对照") &&
      html.includes("下载本次数值") &&
      html.includes("先检查") &&
      html.includes("再处理"),
    id,
  );
  assert.ok(
    !/(?:x|y|cx|cy|width|height|d)="[^"]*(?:NaN|Infinity|undefined)/.test(html),
    `${id}: valid initial output`,
  );
}
const missing = lessons.filter(
  (l) =>
    !completeLabCatalog[l.id] &&
    !animationCatalog[l.id] &&
    !linkedLabForLesson(l.id) &&
    !legacyAnimationIds.includes(l.id) &&
    !handCalculationLessonIds.includes(l.id),
);
assert.equal(
  missing.length,
  0,
  `Uncovered courses: ${missing.map((l) => l.id).join(",")}`,
);
// Deliberately exercise signed values, zeros, differing labels and constant domains.
assert.equal(displayNumber(0), "0");
assert.equal(
  displayNumber(1e-12),
  "1.000e-12",
  "Do not hide small nonzero statistics or gradients",
);
for (const c of [
  {
    kind: "bars",
    labels: ["negative", "zero", "positive"],
    values: [-2, 0, 3],
    unit: "value",
  },
  { kind: "line", x: [0, 0], y: [0, 0], xLabel: "constant", yLabel: "zero" },
  {
    kind: "matrix",
    rows: ["r"],
    columns: ["a", "b"],
    values: [[-1, 0]],
    unit: "weight",
  },
]) {
  const html = renderToStaticMarkup(
    React.createElement(CompleteLabChart, {
      chart: c,
      baseline: c,
      label: "edge fixture",
    }),
  );
  assert.ok(!/NaN|Infinity/.test(html));
}
console.log(
  `Validated complete coverage: ${pairs.length} newly authored labs, ${calculations} calculations across every slider tick and joint extrema, ${charts} comparison-chart renders, ${ssr} accessible player renders; ${lessons.length} courses have mechanism interaction/animation, zero text-only gaps under the audited definition.`,
);
