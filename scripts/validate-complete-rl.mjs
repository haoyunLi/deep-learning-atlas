import assert from "node:assert/strict";
import { createLoader } from "./lib/load-ts.mjs";
const labs = createLoader()("src/data/completeLabs/rl.ts").rlCompleteLabs;
const close = (actual, expected, note) =>
  assert.ok(
    Number.isFinite(actual) &&
      Math.abs(actual - expected) < 1e-9 * Math.max(1, Math.abs(expected)),
    `${note}: expected ${expected}, got ${actual}`,
  );
// Independent hand-worked fixtures. Values below use closed-form reductions of
// the declared input, not calculations imported from the lab implementation.
const teacherDenom = 1 + Math.exp(-4) + Math.exp(-8);
const vlDenom = Math.exp(-1) + 1 + Math.exp(1);
const tentativeLogit = 1 + Math.exp(1) / (1 + Math.exp(1)) ** 2;
const tentativeProb = 1 / (1 + Math.exp(-tentativeLogit));
const fixtures = {
  simclr: ["Anchor NT-Xent loss", Math.log(1 + Math.exp(-2.5) + Math.exp(-5))],
  moco: ["Key lag to online", 0.9 * Math.sqrt(2)],
  byol: ["BYOL one-direction loss", 1],
  "barlow-twins": ["Barlow Twins loss", 0.009],
  mae: ["Encoder attention pairs", 4],
  vicreg: ["Two-view variance penalty", 50 * (1 - Math.sqrt(0.5001))],
  dino: [
    "Teacher cross entropy",
    (-Math.log(0.6) -
      Math.exp(-4) * Math.log(0.3) -
      Math.exp(-8) * Math.log(0.1)) /
      teacherDenom,
  ],
  "supervised-contrastive": [
    "SupCon anchor loss",
    Math.log(1 + Math.exp(-0.5) + Math.exp(-3.5)) + 0.25,
  ],
  "zero-shot-learning": [
    "Top candidate probability",
    1 / (1 + Math.exp(-0.5) + Math.exp(-6)),
  ],
  "few-shot-learning": ["Query P(A)", 0.5],
  "linear-probe": ["Mean BCE after update", Math.log(1 + Math.exp(-0.25))],
  "prototypical-networks": ["P(A)", 1 / (1 + Math.exp(-8))],
  "vision-language-models": [
    "Cross-attention output",
    (2 * Math.exp(-1) - 1 + 3 * Math.exp(1)) / vlDenom,
  ],
  "two-tower-retrieval": ["A versus B score margin", 0],
  "multiple-instance-learning": ["Pooled bag feature", 5 / 3],
  "manifold-embeddings": [
    "Retained edge mass",
    1 + Math.exp(-0.4) + Math.exp(-1.2),
  ],
  "double-dqn": ["Double DQN target", 1.9],
  "dueling-dqn": ["Q(a1)", 10 / 3],
  "rainbow-dqn": ["n-step target", 4.807],
  trpo: ["KL(old || new)", -0.5 * Math.log(0.96)],
  ddpg: ["Updated actor parameter", 0.1],
  td3: ["TD3 target", 0.479],
  "model-based-rl": ["Return prediction error", -2.94],
  muzero: ["PUCT score A", 0.3 + 0.16 * Math.sqrt(5)],
  "behavior-cloning": ["BC mean loss", Math.log(2)],
  "offline-rl": ["Estimated greedy Q", 2],
  cql: ["Conservative penalty", Math.log(1 + Math.exp(1))],
  "decision-transformer": ["Remaining RTG", 4],
  rlhf: [
    "Regularized objective",
    1.6 - 0.5 * (0.8 * Math.log(1.6) + 0.2 * Math.log(0.4)),
  ],
  "off-policy-evaluation": ["Ordinary IS estimate", 0.5],
  "imitation-learning": ["Learner-state expert labels", 10],
  "safe-rl-pomdp": ["Risky expected cost", 8],
  "contextual-bandits-linucb": ["B minus A UCB score", 0.1],
  "matching-networks": [
    "Class A probability",
    (2 * Math.cosh(0.2)) / (1 + 2 * Math.cosh(0.2)),
  ],
  "relation-networks": ["Relation MSE", (1 / (1 + Math.exp(1))) ** 2],
  "siamese-triplet": ["Triplet loss", 0.16],
  "meta-sgd-anil": ["Query loss after adaptation", 2],
  // EMA optimizer at beta=.5: gradients -2,-1.8,-1.52;
  // states -1,-1.4,-1.46; theta3=.772; .5*(.772-2)^2.
  "learned-optimizers": ["Final inner loss", 0.753992],
  "hypernetworks-meta-gradients": ["Downstream loss", 0],
  "memory-augmented-meta-learning": ["Memory read", 5],
  "meta-reinforcement-learning": ["Posterior reward mean", 0.5],
  "cross-domain-few-shot": ["Raw class A probability", 1 / (1 + Math.exp(1.2))],
  "transfer-learning-strategies": ["Loss after transfer update", 0.72],
  "domain-adaptation-dann": ["Feature parameter after update", 0.96],
  "domain-generalization-irm": ["IRM objective", 2.25],
  "continual-learning": ["EWC optimum θ", 2 / 3],
  "multi-task-learning": ["Shared gradient x", 0],
  "automl-hpo-nas": ["Relaxed architecture loss", 0],
  "curriculum-self-paced": ["Selected examples", 2],
  "test-time-adaptation": [
    "Entropy after step",
    -tentativeProb * Math.log(tentativeProb) -
      (1 - tentativeProb) * Math.log(1 - tentativeProb),
  ],
  "semi-supervised-self-training": [
    "Unsupervised batch loss",
    -Math.log(0.56) / 3,
  ],
  "online-learning-drift": ["Prequential MSE", 7 / 32],
  "bayesian-optimization": ["Candidate C UCB", 1],
  "agent-workflows": ["Routed serial latency", 17],
  "tool-calling-contracts": ["Executed rows", 5],
  "react-agent-loop": ["Executed trace latency", 4],
  "agent-memory-context": ["Retained memory utility", 10],
  "agent-evaluation": ["All-trials success probability", 0.512],
  "agent-security-boundaries": ["Blocked untrusted actions", 2],
  "multi-agent-orchestration": ["Parallel wall time", 12.5],
  "model-context-protocol": ["Usable discovered tools", 2],
  "agent-state-checkpoints": ["Naive duplicate side effects", 1],
};
assert.equal(
  Object.keys(fixtures).length,
  62,
  "Independent numeric fixture required for each assigned lesson",
);
assert.deepEqual(
  Object.keys(labs).sort(),
  Object.keys(fixtures).sort(),
  "Assigned lesson coverage",
);
const initial = (lab) =>
  Object.fromEntries(lab.controls.map((c) => [c.id, c.initial]));
const calc = (id, p) => labs[id].calculate({ p });
const outcome = (id, p) => calc(id, p).outcomes[0].value;
let swept = 0;
for (const [id, lab] of Object.entries(labs)) {
  assert.ok(
    lab.controls.length >= 1 && lab.controls.length <= 2,
    `${id} controls`,
  );
  assert.ok(
    lab.usage.length >= 2 &&
      lab.tuning.length >= 2 &&
      lab.troubleshooting.length >= 2,
    `${id} practical guide`,
  );
  assert.ok(
    lab.input.includes("Synthetic") && lab.boundary.length > 25,
    `${id} scope`,
  );
  assert.ok(
    lab.source?.label && /^https:\/\//.test(lab.source.url),
    `${id} source`,
  );
  const original = initial(lab),
    expected = fixtures[id],
    r = lab.calculate(original);
  assert.equal(r.outcomes[0].label, expected[0], `${id} named fixture`);
  close(r.outcomes[0].value, expected[1], `${id} independent default fixture`);
  const seen = new Set();
  for (const c of lab.controls) {
    close(
      (c.initial - c.min) / c.step,
      Math.round((c.initial - c.min) / c.step),
      `${id} initial on slider grid`,
    );
    for (let tick = 0; tick <= Math.round((c.max - c.min) / c.step); tick++) {
      const values = { ...original, [c.id]: c.min + tick * c.step };
      const x = lab.calculate(values);
      swept++;
      assert.equal(x.stages.length, 4, `${id} exactly four stages`);
      assert.ok(x.outcomes.length > 0, `${id} outcomes`);
      seen.add(
        x.outcomes.map((m) => Math.round(m.value * 1e9) / 1e9).join("|"),
      );
      for (const s of x.stages) {
        assert.ok(s.title && s.explanation && s.formula, `${id} narrative`);
        assert.equal(
          new Set(s.metrics.map((m) => m.label)).size,
          s.metrics.length,
          `${id} metric labels unique`,
        );
        assert.ok(
          s.metrics.length > 0 &&
            s.metrics.every((m) => Number.isFinite(m.value)),
          `${id} finite metrics`,
        );
        const ch = s.chart;
        if (ch.kind === "bars") {
          assert.equal(ch.labels.length, ch.values.length, `${id} bar shape`);
          assert.equal(
            new Set(ch.labels).size,
            ch.labels.length,
            `${id} bar labels unique`,
          );
          assert.ok(
            ch.values.length > 0 &&
              ch.values.length <= 30 &&
              ch.values.every(Number.isFinite),
            `${id} bar values`,
          );
        } else if (ch.kind === "matrix") {
          assert.equal(ch.values.length, ch.rows.length, `${id} matrix rows`);
          assert.ok(
            ch.values.length > 0 &&
              ch.values.every(
                (row) =>
                  row.length === ch.columns.length &&
                  row.every(Number.isFinite),
              ),
            `${id} matrix shape`,
          );
        } else {
          assert.equal(ch.x.length, ch.y.length, `${id} line shape`);
          assert.ok(
            ch.x.length > 0 &&
              ch.x.every(Number.isFinite) &&
              ch.y.every(Number.isFinite),
            `${id} finite line`,
          );
        }
      }
      assert.ok(
        x.outcomes.every((m) => Number.isFinite(m.value)),
        `${id} finite outcomes`,
      );
    }
  }
  assert.ok(seen.size > 1, `${id} outcome must respond to parameters`);
}
// These hand-calculated strings check the numeric intermediates as rendered,
// not just the final outcome. Passing fmt directly to map previously treated
// each array index as decimal precision, turning .5 into 1 in the first slot.
const formulaFixtures = [
  ["relation-networks", 1, 1, "r=σ(wφ)=[0.6225, 0.3775]"],
  ["memory-augmented-meta-learning", 0.35, 0, "s=[q,1−q]=[0.3500, 0.6500]"],
  ["multi-task-learning", 0.5, 2, "g_total=[1−λ,λ]=[0.5000, 0.5000]"],
  [
    "semi-supervised-self-training",
    0.5,
    3,
    "L_u=(0.9163+0.3567+0.2231)/3=0.4987",
  ],
  ["bayesian-optimization", 2, 1, "bonus=κσ=[0.2000, 0.6000, 1.2000]"],
];
for (const [id, p, stageIndex, expected] of formulaFixtures) {
  assert.equal(
    calc(id, p).stages[stageIndex].formula,
    expected,
    `${id}: independent rendered intermediate formula at p=${p}`,
  );
}
// Cross-family invariants probe edge cases and normalization conventions.
for (const t of [0.05, 0.2, 1]) {
  const r = calc("simclr", t);
  close(
    r.stages[2].chart.values.reduce((a, b) => a + b, 0),
    1,
    "NT-Xent softmax normalization",
  );
  close(
    r.stages[3].chart.values.reduce((a, b) => a + b, 0),
    0,
    "NT-Xent score gradient zero sum",
  );
}
close(outcome("moco", 0), 0, "EMA m=0 follows online exactly");
close(outcome("byol", 0), 0, "BYOL aligned unit vectors");
close(outcome("byol", 180), 4, "BYOL opposite unit vectors");
close(outcome("barlow-twins", 0), 0, "Identity correlation has no penalty");
close(outcome("mae", 1), 49, "MAE one masked patch leaves seven tokens");
close(outcome("mae", 7), 1, "MAE seven masked patches leaves one token");
close(outcome("vicreg", 0), 49.5, "VICReg epsilon convention at collapse");
close(
  outcome("supervised-contrastive", 2) - outcome("supervised-contrastive", 1),
  0.25,
  "Mean of positive logs, not log of sum",
);
close(outcome("prototypical-networks", 3), 0.5, "Prototype decision boundary");
close(outcome("linear-probe", 0), Math.log(2), "Zero learning rate leaves BCE");
close(
  outcome("manifold-embeddings", 1),
  1,
  "Nearest UMAP-style edge has unit strength",
);
close(outcome("double-dqn", 0), 1, "No bootstrap at zero discount");
close(
  outcome("double-dqn", 1),
  2,
  "Double DQN evaluates online argmax, not target max",
);
close(
  outcome("dueling-dqn", 0),
  2,
  "Centered advantage at zero first advantage",
);
close(outcome("trpo", 0.5), 0, "TRPO unchanged policy KL zero");
close(
  outcome("trpo", 0.4),
  outcome("trpo", 0.6),
  "Symmetric perturbation of uniform policy",
);
close(outcome("ddpg", 0.5), 0.5, "Critic optimum actor fixed point");
close(
  outcome("td3", -0.4),
  0.911,
  "TD3 target uses minimum critic after noise",
);
close(outcome("cql", 1), Math.log(2), "CQL equal actions logsumexp gap");
close(
  outcome("decision-transformer", 5),
  -1,
  "RTG subtracts rewards even when target exceeded",
);
close(outcome("rlhf", 0), 1.6, "Zero KL penalty recovers expected reward");
close(
  outcome("off-policy-evaluation", 0.8),
  0.5,
  "Behavior equals target gives unit IS weights",
);
close(
  calc("off-policy-evaluation", 0.8).outcomes[1].value,
  4,
  "Unit weights ESS equals sample count",
);
close(
  outcome("imitation-learning", 1),
  0,
  "All expert roll-ins collect no learner-state labels",
);
close(outcome("contextual-bandits-linucb", 1), 0, "LinUCB tie at alpha one");
close(outcome("siamese-triplet", 0), 0, "Satisfied margin has zero hinge");
close(
  outcome("meta-sgd-anil", 1.5),
  0,
  "Meta inner update reaches query optimum",
);
close(
  outcome("learned-optimizers", 0),
  0.524288,
  "Memory-free three-step SGD analytic loss",
);
close(
  outcome("hypernetworks-meta-gradients", 0),
  2,
  "Generated weight chain at z zero",
);
close(
  outcome("memory-augmented-meta-learning", 0.5),
  5,
  "Equal address weights read value mean",
);
close(
  outcome("meta-reinforcement-learning", 4),
  5 / 6,
  "Four successes plus Beta prior",
);
close(
  outcome("transfer-learning-strategies", 1),
  0.0032,
  "Simultaneous head/backbone gradient update",
);
close(
  outcome("domain-adaptation-dann", 0),
  0.9,
  "DANN lambda zero is task-only descent",
);
close(
  outcome("domain-generalization-irm", 0),
  0.25,
  "IRM zero penalty is mean ERM",
);
close(outcome("continual-learning", 0), 2, "EWC zero lambda new-task optimum");
close(
  outcome("multi-task-learning", 0),
  1,
  "Task 2 zero weight recovers task 1",
);
close(
  outcome("automl-hpo-nas", -1),
  outcome("automl-hpo-nas", 1),
  "DARTS symmetry around target midpoint",
);
close(
  outcome("curriculum-self-paced", 0.2),
  1,
  "Self-paced low threshold accepts only first",
);
close(
  outcome("curriculum-self-paced", 2),
  4,
  "Self-paced high threshold accepts all",
);
close(
  outcome("semi-supervised-self-training", 0.95),
  -Math.log(0.8) / 3,
  "FixMatch denominator is total batch, not accepted count",
);
close(outcome("online-learning-drift", 0), 0.5, "No update prequential MSE");
close(
  outcome("online-learning-drift", 1),
  1 / 6,
  "Immediate adaptation still incurs first unseen drift error",
);
close(
  outcome("bayesian-optimization", 0),
  0.4,
  "UCB zero exploration equals posterior mean",
);
close(
  outcome("agent-workflows", 4),
  23,
  "Routing all-complex still costs overhead",
);
close(outcome("tool-calling-contracts", 0), 0, "Schema minimum rejects zero");
close(
  outcome("tool-calling-contracts", 7),
  0,
  "Policy rejects schema-valid seven",
);
close(outcome("tool-calling-contracts", 6), 6, "Allowed boundary executes");
close(
  calc("react-agent-loop", 3).stages[3].chart.values[0],
  0,
  "No verification without verify step",
);
close(
  calc("react-agent-loop", 4).stages[3].chart.values[0],
  1,
  "Verification occurs only at fourth step",
);
close(outcome("agent-memory-context", 100), 0, "System consumes full budget");
close(
  outcome("agent-memory-context", 600),
  11,
  "All memory fits with system reserve",
);
assert.ok(
  outcome("agent-evaluation", 6) < outcome("agent-evaluation", 1),
  "pass^k decreases",
);
assert.ok(
  calc("agent-evaluation", 6).stages[1].chart.values[0] >
    calc("agent-evaluation", 1).stages[1].chart.values[0],
  "pass@k increases",
);
close(
  outcome("agent-security-boundaries", 4),
  3,
  "Untrusted requests cannot expand permissions",
);
close(
  outcome("multi-agent-orchestration", 1),
  24,
  "Single-worker serial baseline",
);
close(
  outcome("model-context-protocol", 4),
  2,
  "Discovery does not grant write or delete",
);
close(
  outcome("agent-state-checkpoints", 0),
  0,
  "Crash before side effect no duplicate",
);
close(
  outcome("agent-state-checkpoints", 2),
  0,
  "Saved receipt skips duplicate",
);
for (const c of [0, 1, 2])
  close(
    calc("agent-state-checkpoints", c).stages[2].chart.values[1],
    1,
    "Atomic idempotency yields one logical effect",
  );
console.log(
  `Validated ${Object.keys(labs).length} RL/representation/adaptation/Agent labs: 62 independent default fixtures, ${swept} slider positions, 5 rendered-formula fixtures, and family invariants.`,
);
