import assert from "node:assert/strict";
import { createLoader } from "./lib/load-ts.mjs";
const labs = createLoader()("./src/data/completeLabs/ml.ts").mlCompleteLabs;
// Independent hand-calculated fixtures: these do not call any production math helper.
// Each vector follows that lesson's public outcome order. Values are derived from
// the stated finite data, simple fractions, or closed-form reference expressions.
const fixtures = {
  "learning-paradigms": [1, [0.5377540668798146, -0.3775406687981454]],
  "model-evaluation": [0.5, [0.75, 0.8]],
  "domain-shift": [0.5, [0.25, 0.09]],
  "external-validation": [0.2, [2 / 3, 80]],
  "class-imbalance": [3, [3 / 7, 8 / 35]],
  "batch-normalization": [
    4,
    [-1.5 / Math.sqrt(1.25001), -1 / Math.sqrt(1.00001), 1.25],
  ],
  "layer-normalization": [
    5,
    [-2 / Math.sqrt(8 / 3 + 0.00001), -2 / Math.sqrt(8 / 3 + 0.00001)],
  ],
  "learning-rate-schedules": [5, [0.0691341716182545, 2.585194970290473]],
  "gradient-clipping": [2, [2, 0.2]],
  "mixed-precision": [8, [43 * 2 ** -32, 0.0011717677116394043]],
  "language-model-evaluation": [0.2, [2.5, Math.log(2.5)]],
  "deep-ensembles": [0.3, [0.12849650468117157, 0.5]],
  "conformal-selective-prediction": [0.2, [1, 0.6]],
  quantization: [4, [13 / 9800, 1 / 7]],
  "distillation-pruning": [2, [0.2966066133301411, -0.35333791466831277]],
  "model-serving-monitoring": [1, [325, 550]],
  "nested-group-validation": [2, [0.2, 0.06]],
  "hierarchical-bootstrap": [5, [Math.sqrt(3 / 8), Math.sqrt(15 / 8)]],
  "proper-scoring-rules": [0.5, [0.25, Math.log(2)]],
  "label-shift-correction": [0.5, [8 / 11, 18 / 55]],
  "random-forest": [5, [0.56, 0.0344]],
  xgboost: [1, [4 / 3, -1 / 6]],
  "matrix-factorization": [2, [3.6, 0.04]],
  "learning-to-rank": [1, [8.5 / (7 + 3 / Math.log2(3)), 2]],
  "survival-analysis": [2, [8 / 15, 0.6]],
  "causal-treatment-effects": [0.5, [0, 4]],
  "optimal-transport": [0.5, [1 / (1 + Math.exp(2)), 1 / (1 + Math.exp(2))]],
  "bayesian-updating": [7, [9 / 14, 3 / 196]],
  "gaussian-processes": [0.8, [0.4162121470651039, 0.809444193499002]],
  "mcmc-hmc": [1, [1, -3 / 32, 0.5]],
  "importance-sampling": [0.5, [0.64, 25 / 34]],
  "linear-regression-ols": [3, [1.5, -1 / 6, 1 / 18]],
  "naive-bayes": [1, [0.25, 0.2]],
  "boosting-families": [0.3, [98 / 75, 3.6]],
  "dbscan-density": [0.3, [1, 3]],
  "anomaly-detection": [0.5, [3, 2 / 3]],
  "hierarchical-partial-pooling": [3, [24 / 7, 12 / 7]],
  "quantile-regression": [0.75, [4, 17 / 16, 5]],
  "energy-based-models": [1, [0.42478961739555854, 0.8323955818399389]],
  ddpm: [0.5, [0.04, 2.5 / Math.sqrt(2)]],
  ddim: [0, [1.2274811517141364, 0]],
  "latent-diffusion": [1, [0.25, 4]],
  "flow-matching": [0.5, [0.5, 1]],
  scvi: [5, [-Math.log(16 / 243), 1]],
  "mixture-of-experts": [2, [(2 * Math.E - 1) / (Math.E + 1), 2]],
  gcn: [1, [0.5, 1 / Math.sqrt(6)]],
  graphsage: [2, [2, -2.5]],
  gat: [0.2, [3.933309441590308, 0.15274113834097147]],
  "neural-odes": [5, [Math.exp(-1) - 0.32768, 0.32768]],
  "probabilistic-graphical-models": [0.8, [4 / 13, 0.26]],
  "causal-graphs-identifiability": [0.8, [0.6, 0]],
  "knowledge-graphs-reasoning": [2, [2, 7]],
  "variational-inference-elbo": [0.5, [Math.log(0.4), Math.log(1.25)]],
  "bayes-decision-thresholds": [3, [0.4, 0.8]],
};
const close = (actual, expected, label, tolerance = 2e-10) =>
  assert.ok(
    Math.abs(actual - expected) <=
      1e-15 + tolerance * Math.max(Math.abs(expected), 1e-8),
    `${label}: ${actual} != ${expected}`,
  );
const calculation = (id, p) => labs[id].calculate({ p });
const values = (c) => c.outcomes.map((m) => m.value);
const outcome = (id, p, index = 0) => values(calculation(id, p))[index];
const unitInterval = (v, label) =>
  assert.ok(v >= -1e-12 && v <= 1 + 1e-12, `${label}: outside [0,1]`);
const chartValues = (c) =>
  c.kind === "line" ? c.y : c.kind === "matrix" ? c.values.flat() : c.values;
const total = (xs) => xs.reduce((a, b) => a + b, 0);
assert.equal(Object.keys(fixtures).length, 54);
assert.deepEqual(
  Object.keys(labs).sort(),
  Object.keys(fixtures).sort(),
  "All 54 assigned lessons, and only these, must be covered",
);
let sliderStates = 0,
  charts = 0;
for (const [id, lab] of Object.entries(labs)) {
  const [p, expected] = fixtures[id];
  const actual = values(calculation(id, p));
  assert.equal(actual.length, expected.length, `${id}: outcome count`);
  expected.forEach((v, i) =>
    close(actual[i], v, `${id}: independent fixture ${i}`),
  );
  assert.ok(
    lab.question && lab.input && lab.boundary.includes("Synthetic"),
    `${id}: scoped explanation`,
  );
  assert.ok(
    lab.usage.length >= 2 &&
      lab.tuning.length >= 2 &&
      lab.troubleshooting.length >= 2,
    `${id}: operational guidance`,
  );
  lab.troubleshooting.forEach((t) =>
    assert.ok(t.symptom && t.check && t.action),
  );
  assert.ok(
    /^https:\/\//.test(lab.source.url) && lab.source.label,
    `${id}: source`,
  );
  assert.equal(lab.controls.length, 1, `${id}: bounded authored control`);
  const c = lab.controls[0];
  assert.equal(c.id, "p");
  close(
    (c.initial - c.min) / c.step,
    Math.round((c.initial - c.min) / c.step),
    `${id}: initial tick`,
  );
  const ticks = Math.round((c.max - c.min) / c.step),
    snapshots = [];
  for (let k = 0; k <= ticks; k++) {
    const parameter = Number((c.min + k * c.step).toPrecision(12)),
      result = calculation(id, parameter);
    sliderStates++;
    assert.equal(result.stages.length, 4, `${id}: four progressive stages`);
    const serialized = JSON.stringify(result);
    assert.equal(
      serialized,
      JSON.stringify(calculation(id, parameter)),
      `${id}: deterministic fixed-input comparison`,
    );
    snapshots.push(JSON.stringify(values(result)));
    for (const stage of result.stages) {
      assert.ok(
        stage.title && stage.explanation && stage.formula,
        `${id}: stage narrative`,
      );
      assert.equal(
        new Set(stage.metrics.map((m) => m.label)).size,
        stage.metrics.length,
        `${id}: unique metric labels`,
      );
      stage.metrics.forEach((m) =>
        assert.ok(Number.isFinite(m.value), `${id}: finite intermediate`),
      );
      const ch = stage.chart,
        data = chartValues(ch);
      charts++;
      assert.ok(
        data.length > 0 && data.length <= 36,
        `${id}: readable chart size`,
      );
      data.forEach((v) => assert.ok(Number.isFinite(v), `${id}: finite chart`));
      if (ch.kind === "bars") {
        assert.equal(ch.labels.length, ch.values.length);
        assert.equal(new Set(ch.labels).size, ch.labels.length);
      }
      if (ch.kind === "line") {
        assert.equal(ch.x.length, ch.y.length);
        ch.x.forEach((v) => assert.ok(Number.isFinite(v)));
      }
      if (ch.kind === "matrix") {
        assert.equal(ch.values.length, ch.rows.length);
        ch.values.forEach((row) => assert.equal(row.length, ch.columns.length));
      }
    }
    result.outcomes.forEach((m) =>
      assert.ok(Number.isFinite(m.value), `${id}: finite outcome`),
    );
    assert.equal(
      new Set(result.outcomes.map((m) => m.label)).size,
      result.outcomes.length,
    );
    // Family-level invariants on every slider tick.
    if (
      [
        "model-evaluation",
        "external-validation",
        "class-imbalance",
        "label-shift-correction",
        "random-forest",
        "learning-to-rank",
        "survival-analysis",
        "bayesian-updating",
        "naive-bayes",
        "probabilistic-graphical-models",
        "bayes-decision-thresholds",
      ].includes(id)
    )
      unitInterval(result.outcomes[0].value, id);
    if (
      [
        "quantization",
        "distillation-pruning",
        "hierarchical-bootstrap",
        "proper-scoring-rules",
        "boosting-families",
        "latent-diffusion",
        "neural-odes",
        "scvi",
      ].includes(id)
    )
      assert.ok(
        result.outcomes[0].value >= -1e-12,
        `${id}: nonnegative loss/uncertainty`,
      );
    if (id === "deep-ensembles") {
      assert.ok(result.outcomes[0].value >= -1e-12);
      close(result.outcomes[1].value, 0.5, id);
    }
    if (id === "gradient-clipping") {
      assert.ok(outcome(id, parameter) <= parameter + 1e-12);
      close(outcome(id, parameter, 1), 0.1 * Math.min(parameter, 5), id);
    }
    if (id === "mixed-precision") {
      assert.ok(
        1e-8 * 2 ** parameter < 2 ** -14,
        "AMP remains entirely in subnormal regime",
      );
      assert.ok(outcome(id, parameter, 1) <= 1);
    }
    if (id === "layer-normalization") {
      const z = result.stages[2].chart.values;
      z.forEach((row) =>
        close(total(row), 0, `${id}: each token zero mean`, 1e-5),
      );
      close(
        z[1][0],
        -2 / Math.sqrt(8 / 3 + 0.00001),
        `${id}: token2 unaffected`,
      );
    }
    if (id === "optimal-transport") {
      const transport = result.stages.find(
        (s) => s.chart.kind === "matrix" && s.chart.unit === "transport mass",
      )?.chart;
      assert.ok(transport, `${id}: transport matrix must be visible`);
      transport.values.forEach((row) => close(total(row), 0.5, id));
      for (let j = 0; j < 2; j++)
        close(total(transport.values.map((row) => row[j])), 0.5, id);
      unitInterval(outcome(id, parameter), id);
    }
    if (id === "gaussian-processes")
      unitInterval(outcome(id, parameter, 1), id);
    if (id === "mcmc-hmc") unitInterval(outcome(id, parameter), id);
    if (id === "importance-sampling") {
      assert.ok(outcome(id, parameter) >= 0);
      unitInterval(outcome(id, parameter, 1), id);
    }
    if (id === "dbscan-density")
      values(result).forEach((v) =>
        assert.ok(Number.isInteger(v) && v >= 0 && v <= 6),
      );
    if (id === "energy-based-models") {
      close(total(result.stages[2].chart.values), 1, id);
      assert.ok(
        outcome(id, parameter, 1) >= 0 &&
          outcome(id, parameter, 1) <= Math.log(3),
      );
    }
    if (id === "ddpm")
      close(
        outcome(id, parameter),
        (0.04 * (1 - parameter)) / parameter,
        `${id}: exact error amplification`,
      );
    if (id === "ddim") {
      close(
        outcome(id, parameter, 1),
        (3 / 14) * parameter ** 2,
        `${id}: noise variance`,
      );
      assert.ok(outcome(id, parameter, 1) <= 0.3);
    }
    if (id === "scvi") {
      const pmf = result.stages[2].chart.y;
      assert.ok(total(pmf) < 1);
      pmf.forEach((v) => unitInterval(v, id));
      close(
        result.stages[1].metrics[1].value,
        0.2 * parameter + 0.02 * parameter ** 2,
        `${id}: NB variance`,
      );
    }
    if (id === "mixture-of-experts") {
      close(total(result.stages[2].chart.values), 1, id);
      assert.equal(
        result.stages[2].chart.values.filter((v) => v > 0).length,
        parameter,
      );
    }
    if (id === "gcn") {
      const S = result.stages[1].chart.values;
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) close(S[i][j], S[j][i], `${id}: symmetry`);
      close(
        result.stages[3].chart.values[2],
        0,
        `${id}: no two-hop propagation in one layer`,
      );
    }
    if (id === "gat") close(total(result.stages[2].chart.values), 1, id);
    if (id === "causal-graphs-identifiability") {
      close(total(result.stages[1].chart.values.flat()), 1, id);
      close(outcome(id, parameter, 1), 0, `${id}: intervention remains null`);
    }
    if (id === "variational-inference-elbo") {
      assert.ok(outcome(id, parameter) <= Math.log(0.5) + 1e-12);
      close(
        Math.log(0.5) - outcome(id, parameter),
        outcome(id, parameter, 1),
        `${id}: ELBO identity`,
      );
    }
    if (id === "hierarchical-bootstrap")
      close(
        outcome(id, parameter, 1),
        Math.sqrt(15 / 8),
        `${id}: donor information unchanged by cell count`,
      );
  }
  assert.ok(
    new Set(snapshots).size > 1,
    `${id}: at least one numeric outcome responds`,
  );
}
// Independent limits and special configurations spanning mechanism families.
close(outcome("learning-rate-schedules", 0), 0, "zero warmup");
close(outcome("learning-rate-schedules", 2), 0.1, "peak learning rate");
close(outcome("learning-rate-schedules", 10), 0, "cosine endpoint");
close(
  outcome("model-serving-monitoring", 2),
  100,
  "two servers exactly meet arrival spacing",
);
close(
  outcome("deep-ensembles", 0),
  0,
  "identical ensemble has no disagreement",
);
close(
  outcome("label-shift-correction", 0.2),
  0.4,
  "unchanged prior recovers source posterior",
);
close(
  outcome("proper-scoring-rules", 0.2),
  0.16,
  "Brier optimum at true event rate",
);
close(
  outcome("proper-scoring-rules", 0.3) - outcome("proper-scoring-rules", 0.2),
  0.01,
  "Brier excess equals squared probability error",
);
close(
  outcome("matrix-factorization", 3),
  3.4,
  "all latent components recover observed rating",
);
close(outcome("linear-regression-ols", 2, 2), 0, "collinear OLS exact fit");
close(outcome("boosting-families", 1), 0, "unit residual step fits fixture");
close(
  outcome("conformal-selective-prediction", 0.1),
  2,
  "conformal conservative set",
);
close(
  outcome("conformal-selective-prediction", 0.5),
  0,
  "empty conformal set allowed",
);
close(outcome("dbscan-density", 0.1), 0, "all isolated points no cluster");
close(outcome("dbscan-density", 0.1, 1), 6, "isolated points all noise");
close(outcome("graphsage", 4), 3.25, "full-neighbor GraphSAGE mean");
close(outcome("graphsage", 4, 1), 0, "full sample mean exact");
close(outcome("latent-diffusion", 0), 0, "identity codec");
close(outcome("latent-diffusion", 3), 1.25, "one block variance");
close(outcome("flow-matching", 0), -2, "flow noise endpoint");
close(outcome("flow-matching", 1), 3, "flow data endpoint");
close(
  outcome("knowledge-graphs-reasoning", 4, 1),
  10,
  "all ordered reachable chain pairs",
);
close(
  outcome("variational-inference-elbo", 0.8),
  Math.log(0.5),
  "exact posterior tight ELBO",
);
close(
  outcome("variational-inference-elbo", 0.8, 1),
  0,
  "exact posterior zero KL",
);
close(
  outcome("causal-graphs-identifiability", 0.5),
  0,
  "independent assignment has no observed confounding",
);
close(
  outcome("bayes-decision-thresholds", 1, 1),
  0.4,
  "negative action preferred at low FN cost",
);
for (const d of [1, 2, 4]) {
  const curve = calculation("survival-analysis", d).stages[2].chart;
  assert.equal(curve.kind, "line");
  assert.deepEqual(
    curve.x,
    [0, 1, 1, 2, 2],
    "KM has vertical jumps at event times",
  );
  for (let i = 1; i < curve.x.length; i++)
    if (curve.x[i] !== curve.x[i - 1])
      close(curve.y[i], curve.y[i - 1], "KM is constant between events");
}
for (const eta of [0, 0.5, 1]) {
  const budget = calculation("ddim", eta).stages[1].chart;
  assert.equal(budget.unit, "variance");
  close(budget.values[0], (eta * eta * 3) / 14, "DDIM injected variance");
  close(
    budget.values.reduce((a, b) => a + b, 0),
    0.3,
    "DDIM variance allocation conserves 1-alpha_s",
  );
}
console.log(
  `Complete ML labs validated: 54 independent fixtures; ${sliderStates} slider states; ${charts} stage charts; family normalization, limits, and invariance checks.`,
);
