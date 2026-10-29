import assert from "node:assert/strict";
import { createLoader } from "./lib/load-ts.mjs";
const labs = createLoader()("src/data/completeLabs/cv.ts").cvCompleteLabs;
const E = Math.E;
// Expected values are derived by hand from the declared fixtures, not generated
// by the lab calculators or their shared mathematical helpers.
const fixtures = {
  nnunet: [
    ["One tensor", 32],
    ["Relative volume", 1],
  ],
  "unet-plus-plus": [["Weighted loss", 0.4]],
  "deeplabv3-plus": [
    ["Output", 200 / 3],
    ["Theoretical span", 5],
  ],
  vgg: [
    ["Theoretical RF", 7],
    ["Parameters", 110592],
  ],
  densenet: [
    ["Output channels", 64],
    ["Convolution parameters", 14688],
  ],
  efficientnet: [["Relative MACs", 1.92027]],
  convnext: [["Block MACs", 36765696]],
  "swin-transformer": [
    ["Local pairs", 256],
    ["Tokens/window", 4],
  ],
  "mobilenet-v2": [
    ["Total MACs", 1007616],
    ["Expanded channels", 96],
  ],
  "mask-rcnn": [["Interpolated feature", 2]],
  detr: [
    ["Optimal matching cost", 1.7],
    ["Cross selected", 1],
  ],
  "faster-rcnn-yolo": [
    ["Proposal recall", 2 / 3],
    ["ROI values", 62720],
  ],
  "segment-anything": [
    ["Consistent candidates", 3],
    ["Kept mask area sum", 12],
  ],
  "camera-image-formation": [
    ["u", 520],
    ["v", 340],
  ],
  "local-features-matching": [["Kept matches", 2]],
  "registration-ransac": [
    ["Required iterations", 72],
    ["Theoretical success", 1 - (15 / 16) ** 72],
  ],
  "segmentation-task-metrics": [
    ["IoU", 0.5],
    ["Dice", 2 / 3],
  ],
  "optical-flow-motion": [
    ["Estimated u", 20 / 21],
    ["Residual squared", 2 / 441],
  ],
  "multi-object-tracking": [
    ["Best cost", 0.9],
    ["Cross assignment", 0],
  ],
  "stereo-depth-geometry": [
    ["Depth", 10],
    ["Sensitivity", 1.25],
  ],
  "point-cloud-learning": [
    ["Pooled max", 0.8],
    ["Pooled mean", 0.5],
  ],
  "nerf-gaussian-splatting": [
    ["Rendered color", 1 - 0.8 / E - 0.2 / E ** 2],
    ["Background transmission", 1 / E ** 2],
  ],
  "video-understanding": [
    ["Sampled frames", 8],
    ["Event hits", 1],
    ["Attention pairs", 16384],
  ],
  "document-ai-ocr": [
    ["Order inversions", 0],
    ["Right-column assigned count", 2],
  ],
  "feature-pyramids-small-objects": [
    ["Object extent", 1],
    ["Activation", 1],
  ],
  "box-regression-losses": [
    ["GIoU loss", 1.2],
    ["IoU", 0],
  ],
  "dense-visual-correspondence": [
    ["Winner index", 1],
    ["Similarity margin", Math.cos(Math.PI / 12) - Math.sqrt(3) / 2],
  ],
  "keypoint-heatmaps-pose": [
    ["Soft coordinate", (E ** 2 + 2 * E + 3) / (2 + E ** 2 + E)],
  ],
  "encoder-models": [
    ["Attention output", (2 * E ** 2 + 4 * E + 8) / (E ** 2 + E + 1)],
  ],
  "decoder-models": [
    ["Attention output", (2 * E + 4) / (E + 1)],
    ["Future/source3 weight", 0],
  ],
  "encoder-decoder": [
    ["Attention output", (2 * E ** 2 + 4 * E + 8) / (E ** 2 + E + 1)],
  ],
  "bidirectional-rnn": [
    ["Position2 past", 0.5],
    ["Position2 future", 1],
  ],
  seq2seq: [
    ["Rollout final error", 0.8],
    ["Teacher-forced final error", 0.2],
  ],
  tcn: [
    ["Theoretical RF", 29],
    ["Lookback", 28],
  ],
  word2vec: [
    ["SGNS sum loss", 4 * Math.log(1 + 1 / E)],
    ["Negative gradient sum", 3 / (1 + E)],
  ],
  roberta: [
    ["Expected covered positions", 9.559875],
    ["Never selected probability", 0.52200625],
  ],
  t5: [
    ["Encoder tokens", 17],
    ["Target tokens", 11],
  ],
  bart: [
    ["Corrupted input tokens", 6],
    ["Cross-attention entries", 54],
  ],
  "in-context-learning": [["Toy label1 score", 1 / (E + 2)]],
  "chain-of-thought-prompting": [
    ["Verified total", 88],
    ["Shortcut error", 2],
  ],
  tokenization: [
    ["Token count", 3],
    ["Score entries", 9],
  ],
  "positional-encoding": [
    ["Rotated score", Math.cos(0.5)],
    ["Key second coordinate", Math.sin(0.5)],
  ],
  "autoregressive-inference": [
    ["Entropy", Math.log(E ** 2 + E + 1) - (2 * E ** 2 + E) / (E ** 2 + E + 1)],
    ["Sample token index", 0],
  ],
  "kv-cache": [
    ["KV cache", 0.125],
    ["Context tokens", 64],
  ],
  "grouped-query-attention": [
    ["KV cache", 0.03125],
    ["Queries per KV head", 4],
  ],
  "retrieval-augmented-generation": [
    ["Evidence recall", 0.5],
    ["Document context tokens", 200],
  ],
  "time-series-forecasting": [
    ["Trend MAE", 1],
    ["Last-value MAE", 0.5],
  ],
  "state-space-models": [
    ["Final state", 0.625],
    ["Old impulse contribution", 0.125],
  ],
  mamba: [
    ["Final state", Math.exp(-2.5) - Math.exp(-3.5) + 2 - 2 * Math.exp(-1.5)],
  ],
  rwkv: [
    [
      "Gated WKV output",
      (0.5 * (Math.exp(-1) + 3 + 2 * Math.exp(-0.5) + 4 * Math.exp(0.3))) /
        (Math.exp(-1) + 1 + Math.exp(-0.5) + Math.exp(0.3)),
    ],
  ],
  "ctc-wav2vec": [
    ["Target sequence probability", 0.84],
    ["CTC NLL", -Math.log(0.84)],
  ],
  whisper: [
    ["Mel1 feature", 1 + Math.log10(2.5) / 4],
    ["Mel2 feature", 1 + Math.log10(0.625) / 4],
  ],
  "particle-filters": [
    ["Posterior mean", 1.5],
    ["ESS", (2 * (1 + Math.exp(-4)) ** 2) / (1 + Math.exp(-8))],
  ],
  "speculative-decoding": [
    ["Acceptance probability", 0.9],
    ["Rejection probability", 0.1],
  ],
};
const near = (actual, expected, label) =>
  assert(
    Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)),
    `${label}: ${actual} != ${expected}`,
  );
const out = (id, x, label) => {
  const found = labs[id]
    .calculate({ x })
    .outcomes.find((m) => m.label === label);
  assert(found, `${id}: missing ${label}`);
  return found.value;
};
const unique = (a, label) => assert.equal(new Set(a).size, a.length, label);
assert.equal(Object.keys(labs).length, 54);
assert.deepEqual(
  Object.keys(labs).sort(),
  Object.keys(fixtures).sort(),
  "Exact 54 assigned IDs",
);
let ticks = 0,
  expectedChecks = 0;
for (const [id, lab] of Object.entries(labs)) {
  assert(
    lab.question &&
      lab.input &&
      lab.boundary &&
      lab.source.label &&
      /^https:\/\//.test(lab.source.url),
    id,
  );
  assert(
    lab.usage.length >= 2 &&
      lab.tuning.length >= 2 &&
      lab.troubleshooting.length >= 2,
    id + " guidance",
  );
  for (const d of lab.troubleshooting)
    assert(d.symptom && d.check && d.action, id + " actionable debugging");
  assert(lab.controls.length >= 1 && lab.controls.length <= 2, id);
  // This family deliberately has one isolated mechanism control per lab.
  assert.equal(lab.controls.length, 1, id);
  const c = lab.controls[0];
  near(
    (c.initial - c.min) / c.step,
    Math.round((c.initial - c.min) / c.step),
    id + " initial on tick",
  );
  assert(c.initial >= c.min && c.initial <= c.max && c.step > 0, id);
  const seen = new Set();
  for (let k = 0; k <= Math.round((c.max - c.min) / c.step); k++) {
    const x = Number((c.min + k * c.step).toFixed(10)),
      result = lab.calculate({ [c.id]: x });
    ticks++;
    assert.equal(result.stages.length, 4, id + " stages");
    assert(result.outcomes.length > 0, id);
    unique(
      result.outcomes.map((m) => m.label),
      id + " outcome labels",
    );
    for (const m of result.outcomes)
      assert(Number.isFinite(m.value), id + " outcome finite");
    seen.add(JSON.stringify(result.outcomes.map((m) => m.value)));
    for (const stage of result.stages) {
      assert(
        stage.title &&
          stage.explanation &&
          stage.formula &&
          stage.metrics.length,
        id + " stage content",
      );
      unique(
        stage.metrics.map((m) => m.label),
        id + " metric labels",
      );
      stage.metrics.forEach((m) =>
        assert(Number.isFinite(m.value), id + " metric finite"),
      );
      const ch = stage.chart;
      if (ch.kind === "bars") {
        assert(ch.labels.length > 0, id);
        assert.equal(ch.labels.length, ch.values.length, id);
        unique(ch.labels, id + " bar labels");
        ch.values.forEach((v) => assert(Number.isFinite(v), id));
      } else if (ch.kind === "line") {
        assert(ch.x.length > 0, id);
        assert.equal(ch.x.length, ch.y.length, id);
        [...ch.x, ...ch.y].forEach((v) => assert(Number.isFinite(v), id));
      } else if (ch.kind === "matrix") {
        assert(ch.rows.length > 0 && ch.columns.length > 0, id);
        unique(ch.rows, id + " matrix rows");
        unique(ch.columns, id + " matrix columns");
        assert.equal(ch.values.length, ch.rows.length, id);
        for (const row of ch.values) {
          assert.equal(row.length, ch.columns.length, id);
          row.forEach((v) => assert(Number.isFinite(v), id));
        }
      } else assert.fail(id + " unsupported chart");
    }
  }
  assert(seen.size > 1, id + " meaningful outcome variation");
  for (const [label, expected] of fixtures[id]) {
    near(out(id, c.initial, label), expected, `${id}: ${label}`);
    expectedChecks++;
  }
}
// Family limits, conservation laws and independently computed mechanism checks.
near(
  out("nnunet", 64, "One tensor") / out("nnunet", 32, "One tensor"),
  8,
  "3D volume scaling",
);
near(
  out("mask-rcnn", 0.5, "Interpolated feature"),
  (out("mask-rcnn", 0, "Interpolated feature") +
    out("mask-rcnn", 1, "Interpolated feature")) /
    2,
  "bilinear linearity",
);
near(
  out("swin-transformer", 3, "Local pairs"),
  64 ** 2,
  "one global window limit",
);
near(
  out("swin-transformer", 0, "Local pairs"),
  64,
  "one token per window limit",
);
assert.equal(out("detr", 0, "Cross selected"), 0);
assert.equal(out("detr", 3, "Cross selected"), 1);
for (let x = 0.2; x < 0.91; x += 0.05) {
  const n = out("registration-ransac", x, "Required iterations");
  assert(1 - (1 - x ** 4) ** n >= 0.99 - 1e-12, "RANSAC target");
  assert(
    1 - (1 - x ** 4) ** (n - 1) < 0.99 + 1e-12,
    "RANSAC minimal integer budget",
  );
}
for (let i = 2; i <= 18; i++) {
  const x = i * 0.05,
    io = out("segmentation-task-metrics", x, "IoU"),
    dice = out("segmentation-task-metrics", x, "Dice");
  near(dice, (2 * io) / (1 + io), "Dice–IoU identity");
  assert(io >= 0 && io <= 1 && dice >= 0 && dice <= 1);
}
for (const x of [2, 8, 40])
  near(out("stereo-depth-geometry", x, "Depth") * x, 80, "stereo Bf invariant");
assert.equal(
  out("box-regression-losses", 0, "GIoU loss"),
  0,
  "identical boxes",
);
for (let x = -2; x <= 2; x += 0.25) {
  for (const id of ["encoder-models", "decoder-models", "encoder-decoder"]) {
    const r = labs[id].calculate({ x }),
      weights = r.stages[2].chart.values;
    near(
      weights.reduce((a, b) => a + b, 0),
      1,
      id + " normalized attention",
    );
    assert(
      r.outcomes[0].value >= 2 && r.outcomes[0].value <= 8,
      id + " convex attention output",
    );
  }
  assert.equal(
    out("decoder-models", x, "Future/source3 weight"),
    0,
    "causal future exactly zero",
  );
}
for (let blocks = 1; blocks <= 5; blocks++) {
  let reachable = new Set([0]);
  for (let b = 0; b < blocks; b++)
    for (let conv = 0; conv < 2; conv++) {
      const next = new Set();
      for (const lag of reachable)
        for (const tap of [0, 1, 2]) next.add(lag + tap * 2 ** b);
      reachable = next;
    }
  near(
    out("tcn", blocks, "Theoretical RF"),
    Math.max(...reachable) + 1,
    "TCN enumerated receptive support",
  );
  assert.equal(
    reachable.size,
    Math.max(...reachable) + 1,
    "TCN no holes in this schedule",
  );
}
assert.deepEqual(
  [0, 1, 2].map((x) => out("tokenization", x, "Token count")),
  [6, 3, 2],
);
for (const x of [0, 1, 2]) {
  const chart = labs.tokenization.calculate({ x }).stages[2].chart;
  assert.equal(
    chart.labels.map((s) => s.split(":")[1]).join(""),
    "ababab",
    "BPE exact reconstruction",
  );
  near(
    chart.values.reduce((a, b) => a + b, 0),
    6,
    "BPE character conservation",
  );
}
for (let x = 0; x <= 8; x++) {
  const r = labs["positional-encoding"].calculate({ x }),
    coords = r.stages[2].chart.values;
  near(coords[0] ** 2 + coords[1] ** 2, 1, "RoPE norm");
}
for (let e = 4; e < 12; e++)
  near(
    out("kv-cache", e + 1, "KV cache"),
    2 * out("kv-cache", e, "KV cache"),
    "KV linear context scaling",
  );
for (let e = 0; e <= 3; e++)
  near(
    out("grouped-query-attention", e, "KV cache") *
      out("grouped-query-attention", e, "Queries per KV head"),
    0.125,
    "GQA cache/head-group product",
  );
for (let i = 0; i <= 9; i++) {
  const a = i / 10,
    r = labs["state-space-models"].calculate({ x: a });
  near(
    r.stages[1].chart.y[3],
    r.stages[3].chart.values.reduce((p, q) => p + q, 0),
    "SSM scan/convolution agreement",
  );
  near(
    out("state-space-models", a, "Final state"),
    a + a * a * a,
    "SSM impulse sum",
  );
}
for (let i = 1; i <= 10; i++) {
  const x = i / 10;
  near(
    out("mamba", x, "Final state"),
    Math.exp(-5 * x) - Math.exp(-7 * x) + 2 - 2 * Math.exp(-3 * x),
    "Mamba expanded ZOH",
  );
  const r = labs.mamba.calculate({ x });
  r.stages[3].chart.y.forEach((v) =>
    assert(v >= 0 && v <= 2, "Mamba convex state bounds"),
  );
}
for (let i = 0; i <= 20; i++) {
  const x = i / 10,
    r = labs.rwkv.calculate({ x }),
    state = r.stages[2].chart.values;
  near(
    out("rwkv", x, "Gated WKV output"),
    (0.5 * (state[0][2] + 4 * Math.exp(0.3))) / (state[1][2] + Math.exp(0.3)),
    "RWKV recurrence/direct sum",
  );
  assert(
    out("rwkv", x, "Gated WKV output") >= 0.5 &&
      out("rwkv", x, "Gated WKV output") <= 2,
  );
}
for (let i = 1; i <= 9; i++) {
  const x = i / 10,
    r = labs["ctc-wav2vec"].calculate({ x });
  near(
    r.stages[1].chart.values.reduce((a, b) => a + b, 0),
    1,
    "CTC exhaustive path probability",
  );
  near(
    out("ctc-wav2vec", x, "Target sequence probability"),
    1 - (1 - x) ** 2,
    "CTC nonempty complement",
  );
  assert(
    r.stages[3].chart.values[0] <= r.stages[3].chart.values[1] + 1e-12,
    "CTC sum at least best path",
  );
}
near(
  out("whisper", 2, "Mel1 feature") - out("whisper", 1, "Mel1 feature"),
  Math.log10(4) / 4,
  "Whisper amplitude squared then log",
);
for (let i = 0; i <= 30; i++) {
  const x = i / 10,
    r = labs["particle-filters"].calculate({ x }),
    weights = r.stages[1].chart.values;
  near(
    weights.reduce((a, b) => a + b, 0),
    1,
    "Particle normalized weights",
  );
  assert(
    out("particle-filters", x, "ESS") >= 1 &&
      out("particle-filters", x, "ESS") <= 4,
    "ESS bounds",
  );
  near(
    out("particle-filters", x, "Posterior mean") +
      out("particle-filters", 3 - x, "Posterior mean"),
    3,
    "Particle symmetry",
  );
}
for (let i = 0; i <= 14; i++) {
  const x = 0.1 + i * 0.05,
    r = labs["speculative-decoding"].calculate({ x }),
    recovered = r.stages[3].chart.values[2];
  [0.5, 0.3, 0.2].forEach((p, k) =>
    near(recovered[k], p, "Speculative recovered target"),
  );
  const alpha = out("speculative-decoding", x, "Acceptance probability");
  assert(alpha >= 0 && alpha <= 1 + 1e-12);
  const residual = r.stages[2].chart.values;
  near(
    residual.reduce((a, b) => a + b, 0),
    Math.abs(x - 0.5) < 1e-12 ? 0 : 1,
    "Speculative residual normalization/unused branch",
  );
}
near(
  out("speculative-decoding", 0.5, "Acceptance probability"),
  1,
  "p=q always accepts",
);
console.log(
  `CV complete labs validated: 54 courses, ${ticks} slider states, ${expectedChecks} independent expected values, mechanism invariants passed.`,
);
