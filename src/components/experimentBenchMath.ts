// Synthetic, deterministic teaching calculations. No fitted clinical models.
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const logFactorial = (n: number) =>
  sum(Array.from({ length: Math.max(0, n) }, (_, i) => Math.log(i + 1)));
export function betaDensity(x: number, a: number, b: number) {
  return Math.exp(
    logFactorial(a + b - 1) -
      logFactorial(a - 1) -
      logFactorial(b - 1) +
      (a - 1) * Math.log(x) +
      (b - 1) * Math.log1p(-x),
  );
}
export function bayesUpdate(successes: number, strength: number) {
  const n = 20,
    a = strength / 2 + successes,
    b = strength / 2 + n - successes;
  return {
    n,
    a,
    b,
    mean: a / (a + b),
    variance: (a * b) / ((a + b) ** 2 * (a + b + 1)),
    mle: successes / n,
    points: Array.from({ length: 101 }, (_, i) => {
      const x = 0.001 + (0.998 * i) / 100;
      return {
        x,
        prior: betaDensity(x, strength / 2, strength / 2),
        posterior: betaDensity(x, a, b),
      };
    }),
  };
}
export const scoreDistributions = {
  positive: [1, 2, 3, 6, 10, 18, 25, 35],
  negative: [35, 25, 18, 10, 6, 3, 2, 1],
};
export function thresholdExperiment(prevalence: number, cut: number) {
  const positives = 1000 * prevalence,
    negatives = 1000 - positives;
  const recall = sum(scoreDistributions.positive.slice(cut)) / 100;
  const fpr = sum(scoreDistributions.negative.slice(cut)) / 100;
  const tp = positives * recall,
    fp = negatives * fpr;
  return {
    tp,
    fp,
    fn: positives - tp,
    tn: negatives - fp,
    recall,
    specificity: 1 - fpr,
    precision: tp + fp ? tp / (tp + fp) : null,
  };
}
export const transportCost = [
  [0, 1, 4],
  [1, 0, 1],
  [4, 1, 0],
];
export function sinkhornExperiment(
  epsilon: number,
  demand: number,
  iterations: number,
) {
  const a = [0.5, 0.3, 0.2],
    b = [0.2, demand, 0.8 - demand];
  const kernel = transportCost.map((row) =>
    row.map((c) => Math.exp(-c / epsilon)),
  );
  let u = [1, 1, 1],
    v = [1, 1, 1];
  for (let k = 0; k < iterations; k++) {
    u = a.map((mass, i) => mass / sum(kernel[i].map((x, j) => x * v[j])));
    v = b.map((mass, j) => mass / sum(kernel.map((row, i) => row[j] * u[i])));
  }
  const plan = kernel.map((row, i) => row.map((x, j) => u[i] * x * v[j]));
  const rows = plan.map(sum),
    columns = b.map((_, j) => sum(plan.map((row) => row[j])));
  return {
    a,
    b,
    u,
    v,
    kernel,
    plan,
    rows,
    columns,
    mass: sum(rows),
    error: Math.max(
      ...a.map((x, i) => Math.abs(x - rows[i])),
      ...b.map((x, j) => Math.abs(x - columns[j])),
    ),
    cost: sum(
      plan.map((row, i) => sum(row.map((x, j) => x * transportCost[i][j]))),
    ),
  };
}
function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
export function percentile(xs: number[], q: number) {
  const sorted = [...xs].sort((a, b) => a - b),
    at = (sorted.length - 1) * q,
    lo = Math.floor(at);
  return sorted[lo] + (sorted[Math.ceil(at)] - sorted[lo]) * (at - lo);
}
export function bootstrapExperiment(copies: number, replicates = 512) {
  const means = [2, 4, 8, 10];
  const cells = means.flatMap((m) =>
    Array.from({ length: copies }, () => [m - 1, m, m + 1]).flat(),
  );
  const rowRng = rng(733),
    donorRng = rng(919);
  const row = Array.from(
    { length: replicates },
    () =>
      sum(cells.map(() => cells[Math.floor(rowRng() * cells.length)])) /
      cells.length,
  );
  const donor = Array.from(
    { length: replicates },
    () =>
      sum(means.map(() => means[Math.floor(donorRng() * means.length)])) /
      means.length,
  );
  return {
    means,
    cells,
    row,
    donor,
    mean: sum(means) / means.length,
    rowInterval: [percentile(row, 0.025), percentile(row, 0.975)],
    donorInterval: [percentile(donor, 0.025), percentile(donor, 0.975)],
  };
}
