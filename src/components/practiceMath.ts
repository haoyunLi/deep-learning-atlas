export type CaseRow = {
  id: number;
  day: number;
  x: [number, number];
  y: number;
};
export type CaseModel = {
  name: string;
  family: "constant" | "logistic" | "knn";
  setting: string;
  predict: (row: CaseRow) => number;
};
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export function makeCaseData(): CaseRow[] {
  const random = seeded(2026);
  return Array.from({ length: 160 }, (_, i) => {
    const recency = Math.floor(random() * 31);
    const tickets = Math.floor(random() * 6);
    const p = sigmoid(-3 + recency * 0.12 + tickets * 0.4);
    return {
      id: i + 1,
      day: i * 3,
      x: [recency, tickets],
      y: Number(random() < p),
    };
  });
}
export const caseRows = makeCaseData();
export const caseSplit = {
  train: caseRows.slice(0, 80),
  validation: caseRows.slice(90, 120),
  test: caseRows.slice(130),
  excluded: [...caseRows.slice(80, 90), ...caseRows.slice(120, 130)],
};
export function featureStats(rows: CaseRow[]) {
  const mean = [0, 1].map(
    (j) => rows.reduce((sum, r) => sum + r.x[j], 0) / rows.length,
  );
  const scale = [0, 1].map(
    (j) =>
      Math.sqrt(
        rows.reduce((sum, r) => sum + (r.x[j] - mean[j]) ** 2, 0) / rows.length,
      ) || 1,
  );
  return { mean, scale };
}
export function fitLogistic(
  train: CaseRow[],
  rate: number,
  penalty: number,
  ablate = false,
): CaseModel {
  const { mean, scale } = featureStats(train);
  const x = (row: CaseRow) => [
    1,
    (row.x[0] - mean[0]) / scale[0],
    ablate ? 0 : (row.x[1] - mean[1]) / scale[1],
  ];
  const w = [0, 0, 0];
  for (let iteration = 0; iteration < 350; iteration++) {
    const gradient = [0, 0, 0];
    for (const row of train) {
      const a = x(row);
      const error = sigmoid(a.reduce((sum, v, j) => sum + v * w[j], 0)) - row.y;
      a.forEach((v, j) => (gradient[j] += (error * v) / train.length));
    }
    for (let j = 0; j < 3; j++)
      w[j] -= rate * (gradient[j] + (j === 0 ? 0 : penalty * w[j]));
  }
  return {
    name: ablate ? "Logistic − tickets" : "Logistic regression",
    family: "logistic",
    setting: `η=${rate.toFixed(3)}, λ=${penalty.toFixed(4)}`,
    predict: (row) => sigmoid(x(row).reduce((sum, v, j) => sum + v * w[j], 0)),
  };
}
export function fitKnn(train: CaseRow[], k: number, ablate = false): CaseModel {
  const { scale } = featureStats(train);
  return {
    name: ablate ? "kNN − tickets" : "kNN",
    family: "knn",
    setting: `k=${k}`,
    predict: (row) => {
      const neighbors = train
        .map((r) => ({
          row: r,
          d:
            (row.x[0] - r.x[0]) ** 2 / scale[0] ** 2 +
            (ablate ? 0 : (row.x[1] - r.x[1]) ** 2 / scale[1] ** 2),
        }))
        .sort((a, b) => a.d - b.d || a.row.id - b.row.id)
        .slice(0, k);
      // Laplace smoothing avoids log(0); the same rule is used on all splits.
      return (neighbors.reduce((sum, r) => sum + r.row.y, 0) + 1) / (k + 2);
    },
  };
}
export function evaluateCase(
  model: CaseModel,
  rows: CaseRow[],
  threshold = 0.5,
) {
  let tp = 0,
    tn = 0,
    fp = 0,
    fn = 0,
    loss = 0;
  rows.forEach((row) => {
    const p = Math.max(1e-7, Math.min(1 - 1e-7, model.predict(row)));
    loss -= row.y * Math.log(p) + (1 - row.y) * Math.log(1 - p);
    const pred = p >= threshold;
    if (row.y) {
      if (pred) tp++;
      else fn++;
    } else {
      if (pred) fp++;
      else tn++;
    }
  });
  return {
    tp,
    tn,
    fp,
    fn,
    loss: loss / rows.length,
    accuracy: (tp + tn) / rows.length,
    precision: tp + fp ? tp / (tp + fp) : null,
    recall: tp + fn ? tp / (tp + fn) : null,
  };
}
export function runCaseSearch() {
  const random = seeded(41);
  const train = caseSplit.train;
  const prevalence = train.reduce((sum, row) => sum + row.y, 0) / train.length;
  const baseline: CaseModel = {
    name: "Constant prevalence",
    family: "constant",
    setting: `p=${prevalence.toFixed(3)}`,
    predict: () => prevalence,
  };
  const trials = Array.from({ length: 12 }, () => {
    const rate = 10 ** (-2 + random() * 1.5);
    const penalty = 10 ** (-4 + random() * 3);
    return {
      model: fitLogistic(train, rate, penalty),
      ablation: fitLogistic(train, rate, penalty, true),
    };
  });
  const neighbors = [1, 3, 5, 9, 15].map((k) => ({
    model: fitKnn(train, k),
    ablation: fitKnn(train, k, true),
  }));
  return [{ model: baseline, ablation: baseline }, ...trials, ...neighbors].map(
    (trial, index) => ({
      ...trial,
      id: index,
      validation: evaluateCase(trial.model, caseSplit.validation),
    }),
  );
}
