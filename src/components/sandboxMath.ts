/** Small, deterministic examples. All displayed intermediates come from these calculations. */
export const knnSamples = [
  { id: "A1", x: 1, y: 1, label: "A" },
  { id: "A2", x: 1.5, y: 3, label: "A" },
  { id: "A3", x: 2.5, y: 2, label: "A" },
  { id: "B1", x: 3.5, y: 3, label: "B" },
  { id: "B2", x: 4.5, y: 1.5, label: "B" },
  { id: "B3", x: 5, y: 4.5, label: "B" },
  { id: "B4", x: 3, y: 5, label: "B" },
] as const;

export function calculateKNN(x: number, y: number, k: number) {
  const ranked = knnSamples
    .map((point) => {
      const dx2 = (point.x - x) ** 2;
      const dy2 = (point.y - y) ** 2;
      return { ...point, dx2, dy2, distance: Math.sqrt(dx2 + dy2) };
    })
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  const selected = ranked.slice(0, k);
  const votes = {
    A: selected.filter((p) => p.label === "A").length,
    B: selected.filter((p) => p.label === "B").length,
  };
  // Odd k prevents a class-vote tie in this binary example.
  return { ranked, selected, votes, winner: votes.A > votes.B ? "A" : "B" };
}

export const emSamples = [-2, -1, 0, 3, 4, 5];
export function gaussianDensity(x: number, mean: number, sigma: number) {
  return (
    Math.exp(-0.5 * ((x - mean) / sigma) ** 2) /
    (sigma * Math.sqrt(2 * Math.PI))
  );
}
function gaussianLogDensity(x: number, mean: number, sigma: number) {
  return (
    -0.5 * ((x - mean) / sigma) ** 2 - Math.log(sigma * Math.sqrt(2 * Math.PI))
  );
}
function logSumExp(a: number, b: number) {
  const maximum = Math.max(a, b);
  return maximum + Math.log(Math.exp(a - maximum) + Math.exp(b - maximum));
}
export function emLogLikelihood(means: readonly number[], sigma: number) {
  return emSamples.reduce(
    (total, x) =>
      total +
      logSumExp(
        gaussianLogDensity(x, means[0], sigma),
        gaussianLogDensity(x, means[1], sigma),
      ) -
      Math.log(2),
    0,
  );
}
export function calculateEMStep(means: readonly number[], sigma: number) {
  const rows = emSamples.map((x) => {
    const log1 = gaussianLogDensity(x, means[0], sigma);
    const log2 = gaussianLogDensity(x, means[1], sigma);
    const r1 = Math.exp(log1 - logSumExp(log1, log2));
    const r2 = Math.exp(log2 - logSumExp(log1, log2));
    return {
      x,
      density1: Math.exp(log1),
      density2: Math.exp(log2),
      r1,
      r2,
      weighted1: r1 * x,
      weighted2: r2 * x,
    };
  });
  const mass = [
    rows.reduce((n, r) => n + r.r1, 0),
    rows.reduce((n, r) => n + r.r2, 0),
  ];
  const sums = [
    rows.reduce((n, r) => n + r.weighted1, 0),
    rows.reduce((n, r) => n + r.weighted2, 0),
  ];
  const nextMeans = sums.map((sum, i) => sum / mass[i]);
  return {
    rows,
    mass,
    sums,
    means: [...means],
    nextMeans,
    beforeLL: emLogLikelihood(means, sigma),
    afterLL: emLogLikelihood(nextMeans, sigma),
  };
}
export function calculateEM(
  initialMeans: readonly number[],
  sigma: number,
  iteration: number,
) {
  let means = [...initialMeans];
  for (let t = 0; t < iteration; t++)
    means = calculateEMStep(means, sigma).nextMeans;
  return calculateEMStep(means, sigma);
}

export const attentionTokens = [
  { name: "A", key: [1, 0], value: [2, 0] },
  { name: "B", key: [0, 1], value: [0, 2] },
  { name: "C", key: [1, 1], value: [1, 3] },
] as const;
export function calculateAttention(
  q1: number,
  q2: number,
  temperature: number,
  scaled: boolean,
  causal: boolean,
) {
  const divisor = scaled ? Math.sqrt(2) : 1;
  const raw = attentionTokens.map((token, i) => {
    const dot = q1 * token.key[0] + q2 * token.key[1];
    return {
      ...token,
      dot,
      score: dot / divisor / temperature,
      masked: causal && i === 2,
    };
  });
  const maxScore = Math.max(
    ...raw.filter((r) => !r.masked).map((r) => r.score),
  );
  const exps = raw.map((r) => (r.masked ? 0 : Math.exp(r.score - maxScore)));
  const denominator = exps.reduce((a, b) => a + b, 0);
  const rows = raw.map((r, i) => {
    const weight = exps[i] / denominator;
    return {
      ...r,
      shifted: r.score - maxScore,
      exp: exps[i],
      weight,
      contribution: r.value.map((v) => v * weight),
    };
  });
  return {
    rows,
    divisor,
    maxScore,
    denominator,
    output: [0, 1].map((i) =>
      rows.reduce((sum, r) => sum + r.contribution[i], 0),
    ),
  };
}

export function calculatePPO(
  ratio: number,
  epsilon: number,
  advantage: number,
) {
  const lower = 1 - epsilon;
  const upper = 1 + epsilon;
  const clippedRatio = Math.max(lower, Math.min(upper, ratio));
  const raw = ratio * advantage;
  const clipped = clippedRatio * advantage;
  const objective = Math.min(raw, clipped);
  const plateau =
    advantage > 0 ? ratio > upper : advantage < 0 && ratio < lower;
  const kink =
    advantage !== 0 && Math.abs(ratio - (advantage > 0 ? upper : lower)) < 1e-9;
  // A kink has no unique derivative. The UI explicitly uses zero as a chosen subgradient there.
  const gradient = kink ? null : plateau ? 0 : advantage;
  return {
    ratio,
    lower,
    upper,
    clippedRatio,
    raw,
    clipped,
    objective,
    plateau,
    kink,
    gradient,
    nextRatio: ratio + 0.05 * (gradient ?? 0),
    oldProbability: 0.4,
    newProbability: 0.4 * ratio,
  };
}

export type SplitMethod = "row" | "group" | "time" | "group-time";
type CohortRecord = {
  id: string;
  patient: string;
  age: number;
  index: number;
  history: number;
  followup: number;
  event: number | null;
  naive: "train" | "test";
  features: { day: number; available: number; value: number }[];
};
export const cohortRecords: CohortRecord[] = [
  {
    id: "A1",
    patient: "A",
    age: 52,
    index: 80,
    history: 120,
    followup: 60,
    event: 12,
    naive: "train",
    features: [
      { day: -45, available: -44, value: 1 },
      { day: -10, available: -9, value: 2 },
      { day: 3, available: 4, value: 9 },
    ],
  },
  {
    id: "A2",
    patient: "A",
    age: 52,
    index: 150,
    history: 180,
    followup: 60,
    event: null,
    naive: "test",
    features: [
      { day: -45, available: -44, value: 2 },
      { day: -5, available: 2, value: 5 },
      { day: 7, available: 8, value: 8 },
    ],
  },
  {
    id: "B1",
    patient: "B",
    age: 64,
    index: 70,
    history: 90,
    followup: 60,
    event: 45,
    naive: "test",
    features: [
      { day: -20, available: -19, value: 3 },
      { day: -2, available: -1, value: 4 },
      { day: 10, available: 11, value: 7 },
    ],
  },
  {
    id: "C1",
    patient: "C",
    age: 40,
    index: 135,
    history: 100,
    followup: 60,
    event: 20,
    naive: "train",
    features: [
      { day: -25, available: -24, value: 2 },
      { day: -1, available: 1, value: 6 },
      { day: 14, available: 14, value: 8 },
    ],
  },
  {
    id: "D1",
    patient: "D",
    age: 17,
    index: 65,
    history: 100,
    followup: 60,
    event: 15,
    naive: "train",
    features: [{ day: -5, available: -4, value: 2 }],
  },
  {
    id: "E1",
    patient: "E",
    age: 38,
    index: 110,
    history: 15,
    followup: 10,
    event: null,
    naive: "test",
    features: [{ day: -4, available: -3, value: 3 }],
  },
  {
    id: "F1",
    patient: "F",
    age: 45,
    index: 100,
    history: 100,
    followup: 60,
    event: null,
    naive: "train",
    features: [
      { day: -15, available: -14, value: 4 },
      { day: 2, available: 3, value: 9 },
    ],
  },
  {
    id: "G1",
    patient: "G",
    age: 60,
    index: 175,
    history: 120,
    followup: 10,
    event: null,
    naive: "test",
    features: [{ day: -10, available: -9, value: 2 }],
  },
];
export function calculateCohort(
  lookback: number,
  horizon: number,
  featureEnd: number,
  splitDay: number,
  method: SplitMethod,
) {
  const base = cohortRecords.map((r) => {
    const eligible = r.age >= 18 && r.history >= lookback;
    const positive =
      r.event !== null &&
      r.event > 0 &&
      r.event <= horizon &&
      r.event <= r.followup;
    const observed = positive || r.followup >= horizon;
    const requested = r.features.filter(
      (f) => f.day >= -lookback && f.day <= featureEnd,
    );
    const safe = requested.filter((f) => f.day < 0 && f.available <= 0);
    const leaked = requested.filter((f) => f.day >= 0 || f.available > 0);
    return {
      ...r,
      eligible,
      observed,
      label: positive ? 1 : observed ? 0 : null,
      requested,
      safe,
      leaked,
    };
  });
  const usable = base.filter((r) => r.eligible && r.observed);
  // Every eligible patient's later test encounter reserves that whole patient for evaluation.
  const futurePatients = new Set(
    base.filter((r) => r.eligible && r.index >= splitDay).map((r) => r.patient),
  );
  const safeSplit = (r: (typeof base)[number]): string => {
    if (!r.eligible || !r.observed) return "excluded";
    if (r.index >= splitDay) return "test";
    if (futurePatients.has(r.patient)) return "purged-group";
    if (r.index + horizon >= splitDay) return "purged-time";
    return "train";
  };
  const selectedSplit = (r: (typeof base)[number]): string => {
    if (!r.eligible || !r.observed) return "excluded";
    if (method === "row") return r.naive;
    if (method === "group")
      return ["A", "C", "G"].includes(r.patient) ? "test" : "train";
    if (method === "time") return r.index >= splitDay ? "test" : "train";
    return safeSplit(r);
  };
  const rows = base.map((r) => ({
    ...r,
    split: selectedSplit(r),
    safeSplit: safeSplit(r),
  }));
  const train = rows.filter((r) => r.split === "train");
  const test = rows.filter((r) => r.split === "test");
  const trainPatients = new Set(train.map((r) => r.patient));
  const overlappingPatients = [
    ...new Set(
      test.filter((r) => trainPatients.has(r.patient)).map((r) => r.patient),
    ),
  ];
  const futureTrain = train.filter((r) => r.index + horizon >= splitDay);
  const pastTest = test.filter((r) => r.index < splitDay);
  return {
    rows,
    usable,
    train,
    test,
    overlappingPatients,
    futureTrain,
    pastTest,
    leakedCount: rows
      .filter((r) => r.eligible)
      .reduce((sum, r) => sum + r.leaked.length, 0),
  };
}
