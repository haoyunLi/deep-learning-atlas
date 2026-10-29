// Deterministic teaching models; no fitted biological results are implied.
export const mixtureProfiles = [
  [0.8, 0.15, 0.05],
  [0.1, 0.8, 0.1],
  [0.15, 0.15, 0.7],
];
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
export function countMixtureEM(
  ambientCount = 5,
  includeAmbient = true,
  zeroStart = false,
  iterations = 12,
) {
  const counts = [8, 3, ambientCount];
  const profiles = mixtureProfiles.slice(0, includeAmbient ? 3 : 2);
  let weights = includeAmbient
    ? zeroStart
      ? [0.5, 0.5, 0]
      : [0.4, 0.4, 0.2]
    : [0.5, 0.5];
  const evaluate = (pi: number[]) => {
    const probabilities = counts.map((_, g) =>
      sum(pi.map((p, k) => p * profiles[k][g])),
    );
    const responsibilities = counts.map((_, g) =>
      pi.map((p, k) => (p * profiles[k][g]) / probabilities[g]),
    );
    const allocated = responsibilities.map((r, g) =>
      r.map((p) => p * counts[g]),
    );
    return {
      weights: [...pi],
      probabilities,
      responsibilities,
      allocated,
      expected: probabilities.map((p) => p * sum(counts)),
      logLikelihood: sum(counts.map((n, g) => n * Math.log(probabilities[g]))),
    };
  };
  const history = [evaluate(weights)];
  for (let i = 0; i < iterations; i++) {
    weights = weights.map(
      (_, k) => sum(history[i].allocated.map((row) => row[k])) / sum(counts),
    );
    history.push(evaluate(weights));
  }
  return { counts, profiles, history };
}

export function assignmentPlanning(gamma = 1, penalty = 1, reference = "BA") {
  const scores = [
    [0.9, 0.8],
    [0.85, 0.1],
  ];
  const paths = [0, 1].flatMap((first) =>
    [0, 1].map((second) => {
      const id = `${first === 0 ? "A" : "B"}${second === 0 ? "A" : "B"}`;
      const collision = first === second;
      const rewards = [
        scores[0][first],
        scores[1][second] - (collision ? penalty : 0),
      ];
      return {
        id,
        collision,
        rewards,
        value: rewards[0] + gamma * rewards[1],
        accuracy: [...id].filter((x, i) => x === reference[i]).length / 2,
      };
    }),
  );
  const optimal = paths.reduce((best, path) =>
    path.value > best.value ? path : best,
  );
  const greedy = paths
    .filter((path) => path.id[0] === "A")
    .reduce((best, path) => (path.rewards[1] > best.rewards[1] ? path : best));
  return { scores, paths, optimal, greedy };
}

export function gaeExperiment(gamma = 0.99, lambda = 0.95, truncated = false) {
  const rewards = [0, 0, 1],
    values = [0.4, 0.6, 0.5];
  const bootstrap = truncated ? 0.7 : 0;
  const deltas = rewards.map(
    (r, i) => r + gamma * (i < 2 ? values[i + 1] : bootstrap) - values[i],
  );
  const advantages = [0, 0, 0];
  for (let i = 2; i >= 0; i--)
    advantages[i] = deltas[i] + gamma * lambda * (advantages[i + 1] ?? 0);
  return {
    rewards,
    values,
    bootstrap,
    deltas,
    advantages,
    targets: advantages.map((a, i) => a + values[i]),
  };
}

export function gcnExperiment(bridge = 1, selfLoop = 1, layers = 8) {
  const adjacency = Array.from({ length: 6 }, (_, i) =>
    Array.from({ length: 6 }, (_, j) => (i === j ? selfLoop : 0)),
  );
  for (const [i, j, weight] of [
    [0, 1, 1],
    [1, 2, 1],
    [2, 3, bridge],
    [3, 4, 1],
    [4, 5, 1],
  ])
    adjacency[i][j] = adjacency[j][i] = weight;
  const degrees = adjacency.map(sum);
  const normalized = adjacency.map((row, i) =>
    row.map((a, j) => a / Math.sqrt(degrees[i] * degrees[j])),
  );
  const history = [[1, 1, 1, 0, 0, 0]];
  for (let l = 0; l < layers; l++)
    history.push(
      normalized.map((row) => sum(row.map((w, j) => w * history[l][j]))),
    );
  return {
    adjacency,
    degrees,
    normalized,
    history,
    gaps: history.map((h) => sum(h.slice(0, 3)) / 3 - sum(h.slice(3)) / 3),
  };
}

export function gatExperiment(temperature = 1, distractors = 1) {
  // Given post-activation edge logits. Temperature is a teaching extension (original GAT uses 1).
  const labels = [
    "Self",
    "Same-domain",
    ...Array.from({ length: distractors }, (_, i) => `Boundary ${i + 1}`),
  ];
  const logits = [1, 2, ...Array(distractors).fill(2.5)] as number[];
  const features = [0.9, 0.8, ...Array(distractors).fill(0.1)] as number[];
  const exps = logits.map((x) =>
    Math.exp((x - Math.max(...logits)) / temperature),
  );
  const weights = exps.map((x) => x / sum(exps));
  const messages = weights.map((p, i) => p * features[i]);
  return {
    labels,
    logits,
    features,
    weights,
    messages,
    output: sum(messages),
    uniform: sum(features) / features.length,
    boundaryMass: sum(weights.slice(2)),
    entropy: -sum(weights.map((p) => p * Math.log(p))),
  };
}

export function contrastiveExperiment(
  temperature = 0.2,
  includeFalseNegative = true,
) {
  const similarities = [0.8, 0.1, 0.2, ...(includeFalseNegative ? [0.9] : [])];
  const logits = similarities.map((x) => x / temperature);
  const max = Math.max(...logits),
    logZ = max + Math.log(sum(logits.map((x) => Math.exp(x - max))));
  const probabilities = logits.map((x) => Math.exp(x - logZ));
  const gradients = probabilities.map(
    (p, i) => (p - (i === 0 ? 1 : 0)) / temperature,
  );
  return { similarities, probabilities, gradients, loss: logZ - logits[0] };
}
