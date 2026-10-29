import assert from "node:assert/strict";
import { createLoader } from "./lib/load-ts.mjs";
const load = createLoader();
const { biologyBridgeLessons: lessons } = load("src/data/biologyBridge.ts");
const { biologyBridgeExercises: exercises } = load(
  "src/data/exercisesBiologyBridge.ts",
);
const { biologyCompleteLabs: labs, lrLabelPermutations } = load(
  "src/data/completeLabs/biology.ts",
);
const { biologyConnections, biologyChapterUrl, biologyLabUrl } = load(
  "src/data/biologyConnections.ts",
);
const { conceptPaths } = load("src/data/conceptPaths.ts");
const expectedIds = [
  "motif-pwm-scoring",
  "enhancer-gene-abc",
  "regulon-tf-activity",
  "ligand-receptor-inference",
  "perturbation-generalization",
  "variant-mixture-inference",
].sort();
const sameIds = (x) => assert.deepEqual([...x].sort(), expectedIds);
sameIds(lessons.map((l) => l.id));
sameIds(Object.keys(labs));
sameIds(Object.keys(exercises));
sameIds(Object.keys(biologyConnections));
const close = (actual, expected, note, tolerance = 1e-10) =>
  assert.ok(
    Number.isFinite(actual) &&
      Math.abs(actual - expected) <=
        tolerance * Math.max(1, Math.abs(expected)),
    `${note}: expected ${expected}, got ${actual}`,
  );
const initial = (id) =>
  Object.fromEntries(labs[id].controls.map((c) => [c.id, c.initial]));
const calc = (id, overrides = {}) =>
  labs[id].calculate({ ...initial(id), ...overrides });
const values = (r) => r.outcomes.map((x) => x.value);
let states = 0,
  charts = 0;
function checkChart(c, note) {
  if (c.kind === "bars") {
    assert.equal(c.values.length, c.labels.length, note);
    assert.equal(new Set(c.labels).size, c.labels.length, note);
    c.values.forEach((x) => assert.ok(Number.isFinite(x), note));
  } else if (c.kind === "line") {
    assert.equal(c.x.length, c.y.length, note);
    c.x.concat(c.y).forEach((x) => assert.ok(Number.isFinite(x), note));
  } else {
    assert.equal(c.rows.length, c.values.length, note);
    c.values.forEach((row) => {
      assert.equal(row.length, c.columns.length, note);
      row.forEach((x) => assert.ok(Number.isFinite(x), note));
    });
  }
  charts++;
}
for (const lesson of lessons) {
  const id = lesson.id,
    lab = labs[id];
  assert.ok(
    lesson.mechanicsSteps.length >= 6 && lesson.settings.length >= 4,
    `${id}: detailed teaching`,
  );
  assert.ok(
    lesson.source.label && new URL(lesson.source.url).protocol === "https:",
  );
  lesson.settings.forEach((s) => assert.ok(s.name && s.start && s.adjust, id));
  const qs = exercises[id];
  assert.equal(qs.length, 2, id);
  assert.deepEqual(qs.map((q) => q.kind).sort(), ["decision", "mechanism"]);
  qs.forEach((q) => {
    assert.equal(q.options.length, 4, id);
    assert.ok(
      Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < 4 &&
        q.explanation.length > 30,
      id,
    );
  });
  const cases = [initial(id)];
  for (const c of lab.controls) {
    assert.ok(
      c.min < c.max && c.initial >= c.min && c.initial <= c.max && c.step > 0,
      id,
    );
    close(
      (c.initial - c.min) / c.step,
      Math.round((c.initial - c.min) / c.step),
      `${id} reachable default`,
    );
    for (let i = 0; i <= Math.round((c.max - c.min) / c.step); i++)
      cases.push({
        ...initial(id),
        [c.id]: Number((c.min + i * c.step).toPrecision(12)),
      });
  }
  const corners = (index, v) => {
    if (index === lab.controls.length) {
      cases.push(v);
      return;
    }
    const c = lab.controls[index];
    for (const x of [c.min, c.initial, c.max])
      corners(index + 1, { ...v, [c.id]: x });
  };
  corners(0, {});
  const responses = new Set();
  for (const params of cases) {
    const r = lab.calculate(params);
    states++;
    assert.equal(r.stages.length, 4, id);
    assert.ok(r.outcomes.length > 0, id);
    r.outcomes.forEach((m) => assert.ok(Number.isFinite(m.value), id));
    responses.add(JSON.stringify(values(r)));
    r.stages.forEach((s) => {
      assert.ok(s.title && s.explanation && s.formula, id);
      assert.ok(s.metrics.length > 0, id);
      s.metrics.forEach((m) => assert.ok(Number.isFinite(m.value), id));
      checkChart(s.chart, id);
    });
  }
  assert.ok(responses.size > 1, `${id}: parameter changes a real outcome`);
  assert.ok(
    lab.usage.length >= 2 &&
      lab.tuning.length >= 2 &&
      lab.troubleshooting.length >= 2,
    id,
  );
  lab.troubleshooting.forEach((t) =>
    assert.ok(t.symptom && t.check && t.action, id),
  );
}
// Independent closed-form fixtures for every new lesson.
close(
  values(calc("motif-pwm-scoring"))[0],
  2 * Math.log2(3),
  "PWM AT ratio3 at both positions",
);
close(
  values(calc("motif-pwm-scoring"))[1],
  Math.log2(33),
  "PWM AT minus TT cancels second position",
);
close(values(calc("enhancer-gene-abc"))[0], 1 / 3, "ABC equal products");
close(
  values(calc("enhancer-gene-abc", { contact: 0.1 }))[0],
  0.4,
  "ABC unchanged numerator, changed denominator",
);
close(
  values(calc("regulon-tf-activity"))[0],
  4 / 3,
  "Signed contribution2+1+1 dividedby3",
);
close(
  values(calc("regulon-tf-activity", { target: 2 }))[0],
  1 / 3,
  "Repressive target up reduces score",
);
assert.ok(
  calc("regulon-tf-activity").stages.some((s) =>
    s.formula.includes("3−(-1.0000)"),
  ),
  "Signed negative target is parenthesized in displayed arithmetic",
);
close(
  values(calc("ligand-receptor-inference"))[0],
  3,
  "LR arithmeticmean of4and2",
);
close(
  values(calc("ligand-receptor-inference"))[1],
  1 / 20,
  "Unique maximizer among20partitions",
);
close(
  values(calc("perturbation-generalization"))[0],
  4,
  "Opposite residuals squared then averaged",
);
close(
  values(calc("perturbation-generalization", { context: 1 }))[0],
  5,
  "Orthogonal interaction/context error",
);
close(
  values(calc("variant-mixture-inference"))[0],
  0.25,
  "Diploid mixture expectedVAF",
);
close(
  values(calc("variant-mixture-inference"))[1],
  5 * Math.log(0.5) + 15 * Math.log(1.5),
  "VAF model likelihoodratio",
);
close(
  calc("variant-mixture-inference").stages[2].chart.y[5],
  15504 * 0.25 ** 5 * 0.75 ** 15,
  "Binomial20choose5 independent coefficient",
);
// Invariants across the meaningful ranges, not just initial settings.
for (const gc of [0.2, 0.5, 0.8])
  for (const alpha of [0.1, 1, 4]) {
    const r = calc("motif-pwm-scoring", { gc, alpha });
    r.stages[1].chart.values.forEach((row) =>
      close(
        row.reduce((a, b) => a + b, 0),
        1,
        "PWM row normalization",
      ),
    );
    assert.ok(values(r)[1] > 0, "AT beats TT under the declared motif");
  }
assert.ok(
  values(calc("motif-pwm-scoring", { gc: 0.8 }))[0] >
    values(calc("motif-pwm-scoring", { gc: 0.2 }))[0],
  "AT is more surprising in GC-rich background",
);
for (const contact of [0, 0.1, 0.2, 0.6]) {
  const r = calc("enhancer-gene-abc", { contact });
  close(
    r.stages[3].chart.values.reduce((a, b) => a + b, 0),
    1,
    "ABC normalization",
  );
  close(r.stages[1].chart.values[0], 0.4, "E1rawnumeratorfixed");
}
for (const target of [-3, -1, 0, 2, 3])
  close(
    values(calc("regulon-tf-activity", { target })).reduce((a, b) => a + b, 0),
    2,
    "Signed plus unsigned scores sum2 for this fixture",
  );
for (const r of [0.5, 2, 4, 6]) {
  const x = lrLabelPermutations(r),
    unit = (4 + Math.min(4, r)) / 6;
  assert.equal(x.scores.length, 20);
  const frequency = Array.from(
    { length: 4 },
    (_, h) => x.scores.filter((v) => Math.abs(v - h * unit) < 1e-10).length,
  );
  assert.deepEqual(
    frequency,
    [1, 9, 9, 1],
    "Hypergeometric label assignment counts",
  );
  close(
    x.scores.reduce((a, b) => a + b, 0) / 20,
    x.observed / 2,
    "Null mean from symmetry",
  );
  close(
    values(calc("ligand-receptor-inference", { subunit: r }))[1],
    0.05,
    "Specificityrankunchangedbyrescalinginthisfixture",
  );
}
close(
  values(calc("ligand-receptor-inference", { subunit: 6 }))[0],
  4,
  "R1 caps complex whenR2above4",
);
for (const interaction of [-4, -2, 0, 2, 4])
  for (const context of [-3, 0, 3])
    close(
      values(calc("perturbation-generalization", { interaction, context }))[0],
      interaction ** 2 + context ** 2,
      "ExacttoyMSEdecomposition",
    );
for (const purity of [0.1, 0.5, 1])
  for (const copies of [2, 4, 6]) {
    const r = calc("variant-mixture-inference", { purity, copies }),
      p = values(r)[0],
      dist = r.stages[2].chart.y;
    close(
      dist.reduce((a, b) => a + b, 0),
      1,
      "Binomialmasssums1",
    );
    close(
      dist.reduce((a, v, k) => a + k * v, 0),
      20 * p,
      "Binomialmean",
    );
  }
close(
  values(calc("variant-mixture-inference", { purity: 0.5, copies: 4 }))[0],
  1 / 6,
  "CN weighted denominator",
);
close(
  values(calc("variant-mixture-inference", { purity: 1, copies: 2 }))[1],
  0,
  "Identicalcandidatep=.5giveszeroLogLR",
);
close(
  values(calc("variant-mixture-inference", { purity: 0.5, copies: 2 }))[0],
  values(calc("variant-mixture-inference", { purity: 1, copies: 4 }))[0],
  "Two distinctpurity/CNcombinationssameVAF",
);
// Integration: six valid cross-site connections and the complete ordered learning path.
const expectedConnections = {
  "motif-pwm-scoring": ["rb04", "motif"],
  "enhancer-gene-abc": ["rb05", "enhancer"],
  "regulon-tf-activity": ["rb04", "motif"],
  "ligand-receptor-inference": ["rb07", "lr"],
  "perturbation-generalization": ["rb08", "models"],
  "variant-mixture-inference": ["rb03", "lineage"],
};
for (const [id, [chapter, lab]] of Object.entries(expectedConnections)) {
  assert.equal(biologyConnections[id].chapter, chapter);
  assert.equal(biologyConnections[id].lab, lab);
  assert.ok(biologyConnections[id].label);
  assert.equal(
    biologyChapterUrl(chapter),
    `https://haoyunli.github.io/intro-to-bio-for-computational-biology/textbook.html#${chapter}`,
  );
  assert.equal(
    biologyLabUrl(lab),
    `https://haoyunli.github.io/intro-to-bio-for-computational-biology/regulation-lab.html#${lab}`,
  );
}
const path = conceptPaths.find((p) => p.id === "biology-regulation-inference");
assert.ok(path);
sameIds(path.steps.map((s) => s.lessonId));
path.steps.forEach((s) => assert.ok(s.why.length > 12));
console.log(
  `Biology bridge validated: 6 detailed lessons, 12 exercises, 6 computed labs; ${states} parameter cases and ${charts} charts; independent numeric fixtures, mechanism invariants, 6 cross-site links and complete concept path.`,
);
