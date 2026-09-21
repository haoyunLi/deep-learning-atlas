export type ArenaDataset = "moons" | "circles" | "shift";
export type ArenaAlgorithm = "logistic" | "knn" | "forest" | "boosting" | "mlp";

export type ArenaConfig = {
  dataset: ArenaDataset;
  trainSize: number;
  noise: number;
  imbalance: number;
  shift: number;
  budget: number;
  seed: number;
};

export type ArenaPoint = {
  x: [number, number];
  y: 0 | 1;
  split: "train" | "validation" | "test";
};

export type ArenaMetrics = {
  accuracy: number;
  balancedAccuracy: number;
  logLoss: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
};

export type ArenaResult = {
  id: ArenaAlgorithm;
  label: string;
  family: string;
  validation: ArenaMetrics;
  test?: ArenaMetrics;
  cost: string;
  tuning: string;
  failureMode: string;
  curve: { step: number; balancedAccuracy: number }[];
  boundary: { x: number; y: number; probability: number }[];
};

type Sample = { x: [number, number]; y: 0 | 1 };
type Predictor = (x: [number, number]) => number;

const labels: Record<
  ArenaAlgorithm,
  Omit<ArenaResult, "validation" | "test" | "curve" | "boundary">
> = {
  logistic: {
    id: "logistic",
    label: "Logistic Regression",
    family: "线性概率模型",
    cost: "训练 O(n·budget)，推理 O(1)",
    tuning: "先调正则，再调学习率；输入必须标准化。",
    failureMode: "单一直线无法拟合弯月或同心圆边界。",
  },
  knn: {
    id: "knn",
    label: "kNN",
    family: "局部实例方法",
    cost: "几乎无训练；每次推理 O(n log k)",
    tuning: "小数据从奇数 k≈√n 开始，并检查距离尺度。",
    failureMode: "高维、分布偏移或密度不均时距离失真。",
  },
  forest: {
    id: "forest",
    label: "Random Forest",
    family: "Bagging 树集成",
    cost: "训练随树数增长；推理可并行",
    tuning: "先增加树到验证集稳定，再限制叶节点最小样本。",
    failureMode: "轴对齐切分拟合斜边界时需要很多树。",
  },
  boosting: {
    id: "boosting",
    label: "Gradient Boosting",
    family: "顺序残差集成",
    cost: "树必须顺序训练；浅树推理较快",
    tuning: "学习率与树数联动；越小的学习率通常需要越多树。",
    failureMode: "噪声标签上持续加树会追逐残差并过拟合。",
  },
  mlp: {
    id: "mlp",
    label: "Tiny MLP",
    family: "非线性神经网络",
    cost: "训练 O(n·hidden·budget)，可批量推理",
    tuning: "先验证能过拟合小批次，再调宽度、学习率与早停。",
    failureMode: "小数据下方差大，且对学习率和随机种子敏感。",
  },
};

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number) {
  const u = Math.max(random(), Number.EPSILON);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function shuffle<T>(items: T[], random: () => number) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

function sigmoid(value: number) {
  if (value >= 0) return 1 / (1 + Math.exp(-value));
  const exp = Math.exp(value);
  return exp / (1 + exp);
}

function clampProbability(value: number) {
  return Math.min(1 - 1e-6, Math.max(1e-6, value));
}

function createClassPoint(
  dataset: ArenaDataset,
  label: 0 | 1,
  index: number,
  total: number,
  noise: number,
  shift: number,
  random: () => number,
): Sample {
  const phase = (2 * Math.PI * (index + random())) / Math.max(2, total);
  const jitter = () => gaussian(random) * noise;
  if (dataset === "circles") {
    const radius = label === 0 ? 0.62 : 1.45;
    return {
      x: [
        radius * Math.cos(phase) + jitter(),
        radius * Math.sin(phase) + jitter(),
      ],
      y: label,
    };
  }
  if (dataset === "shift") {
    const direction = label === 0 ? -1 : 1;
    return {
      x: [
        direction * 0.9 + jitter() + shift * (label === 1 ? 0.35 : -0.1),
        phase / Math.PI - 1 + jitter(),
      ],
      y: label,
    };
  }
  const baseX = Math.cos(phase);
  const baseY = Math.sin(phase);
  return label === 0
    ? { x: [baseX + jitter(), baseY + jitter()], y: label }
    : {
        x: [
          1 - baseX + shift * 0.25 + jitter(),
          0.5 - baseY + shift * 0.1 + jitter(),
        ],
        y: label,
      };
}

function makeSplit(
  size: number,
  dataset: ArenaDataset,
  imbalance: number,
  noise: number,
  shift: number,
  random: () => number,
) {
  const positive = Math.max(
    1,
    Math.min(size - 1, Math.round(size * imbalance)),
  );
  const negative = size - positive;
  const samples: Sample[] = [];
  for (let index = 0; index < negative; index += 1) {
    samples.push(
      createClassPoint(dataset, 0, index, negative, noise, shift, random),
    );
  }
  for (let index = 0; index < positive; index += 1) {
    samples.push(
      createClassPoint(dataset, 1, index, positive, noise, shift, random),
    );
  }
  return shuffle(samples, random);
}

export function generateArenaData(config: ArenaConfig) {
  const random = mulberry32(config.seed);
  const train = makeSplit(
    config.trainSize,
    config.dataset,
    config.imbalance,
    config.noise,
    0,
    random,
  );
  const validation = makeSplit(
    120,
    config.dataset,
    0.5,
    config.noise,
    0,
    random,
  );
  const test = makeSplit(
    160,
    config.dataset,
    0.5,
    config.noise,
    config.shift,
    random,
  );
  return { train, validation, test };
}

function standardizer(train: Sample[]) {
  const mean: [number, number] = [0, 0];
  train.forEach(({ x }) => {
    mean[0] += x[0] / train.length;
    mean[1] += x[1] / train.length;
  });
  const variance: [number, number] = [0, 0];
  train.forEach(({ x }) => {
    variance[0] += (x[0] - mean[0]) ** 2 / train.length;
    variance[1] += (x[1] - mean[1]) ** 2 / train.length;
  });
  const scale: [number, number] = [
    Math.sqrt(variance[0]) || 1,
    Math.sqrt(variance[1]) || 1,
  ];
  const transform = ({ x, y }: Sample): Sample => ({
    x: [(x[0] - mean[0]) / scale[0], (x[1] - mean[1]) / scale[1]],
    y,
  });
  const transformX = (x: [number, number]): [number, number] => [
    (x[0] - mean[0]) / scale[0],
    (x[1] - mean[1]) / scale[1],
  ];
  return { transform, transformX };
}

export function arenaMetrics(
  samples: Sample[],
  predict: Predictor,
): ArenaMetrics {
  let correct = 0;
  let loss = 0;
  let positive = 0;
  let negative = 0;
  let truePositive = 0;
  let trueNegative = 0;
  samples.forEach((sample) => {
    const probability = clampProbability(predict(sample.x));
    const prediction = probability >= 0.5 ? 1 : 0;
    correct += Number(prediction === sample.y);
    loss -=
      sample.y * Math.log(probability) +
      (1 - sample.y) * Math.log(1 - probability);
    if (sample.y === 1) {
      positive += 1;
      truePositive += Number(prediction === 1);
    } else {
      negative += 1;
      trueNegative += Number(prediction === 0);
    }
  });
  const tpr = truePositive / Math.max(1, positive);
  const tnr = trueNegative / Math.max(1, negative);
  return {
    accuracy: correct / samples.length,
    balancedAccuracy: (tpr + tnr) / 2,
    logLoss: loss / samples.length,
    falsePositiveRate: 1 - tnr,
    falseNegativeRate: 1 - tpr,
  };
}

function curvePoint(step: number, samples: Sample[], predict: Predictor) {
  return {
    step,
    balancedAccuracy: arenaMetrics(samples, predict).balancedAccuracy,
  };
}

function trainLogistic(train: Sample[], validation: Sample[], budget: number) {
  const weights: [number, number, number] = [0, 0, 0];
  const learningRate = 0.12;
  const steps = Math.max(20, budget * 12);
  const curve: { step: number; balancedAccuracy: number }[] = [];
  const predict: Predictor = (x) =>
    sigmoid(weights[0] * x[0] + weights[1] * x[1] + weights[2]);
  for (let step = 1; step <= steps; step += 1) {
    const gradient: [number, number, number] = [0, 0, 0];
    train.forEach(({ x, y }) => {
      const error = predict(x) - y;
      gradient[0] += (error * x[0]) / train.length;
      gradient[1] += (error * x[1]) / train.length;
      gradient[2] += error / train.length;
    });
    weights[0] -= learningRate * (gradient[0] + 0.002 * weights[0]);
    weights[1] -= learningRate * (gradient[1] + 0.002 * weights[1]);
    weights[2] -= learningRate * gradient[2];
    if (
      step === 1 ||
      step === steps ||
      step % Math.max(1, Math.floor(steps / 7)) === 0
    ) {
      curve.push(curvePoint(step, validation, predict));
    }
  }
  return { predict, curve };
}

function trainKnn(train: Sample[], validation: Sample[], budget: number) {
  const k = Math.max(
    1,
    Math.min(
      train.length,
      Math.round(Math.sqrt(train.length) * (0.55 + budget / 40)),
    ),
  );
  const predict: Predictor = (x) => {
    const neighbors = train
      .map((sample) => ({
        distance: (sample.x[0] - x[0]) ** 2 + (sample.x[1] - x[1]) ** 2,
        y: sample.y,
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
    return neighbors.reduce((sum, item) => sum + item.y, 0) / neighbors.length;
  };
  return { predict, curve: [curvePoint(k, validation, predict)] };
}

type Stump = { feature: 0 | 1; threshold: number; left: number; right: number };

function stumpPredict(stump: Stump, x: [number, number]) {
  return x[stump.feature] <= stump.threshold ? stump.left : stump.right;
}

function candidateThresholds(samples: Sample[], feature: 0 | 1) {
  const values = samples.map(({ x }) => x[feature]).sort((a, b) => a - b);
  const thresholds: number[] = [];
  for (let quantile = 1; quantile < 10; quantile += 1) {
    thresholds.push(
      values[
        Math.min(values.length - 1, Math.floor((values.length * quantile) / 10))
      ],
    );
  }
  return [...new Set(thresholds)];
}

function fitProbabilityStump(
  samples: Sample[],
  feature: 0 | 1,
  threshold: number,
): Stump {
  let leftY = 1;
  let leftN = 2;
  let rightY = 1;
  let rightN = 2;
  samples.forEach(({ x, y }) => {
    if (x[feature] <= threshold) {
      leftY += y;
      leftN += 1;
    } else {
      rightY += y;
      rightN += 1;
    }
  });
  return { feature, threshold, left: leftY / leftN, right: rightY / rightN };
}

function trainForest(
  train: Sample[],
  validation: Sample[],
  budget: number,
  seed: number,
) {
  const random = mulberry32(seed + 103);
  const count = Math.max(8, budget * 3);
  const stumps: Stump[] = [];
  const curve: { step: number; balancedAccuracy: number }[] = [];
  const predict: Predictor = (x) =>
    stumps.reduce((sum, tree) => sum + stumpPredict(tree, x), 0) /
    Math.max(1, stumps.length);
  for (let index = 0; index < count; index += 1) {
    const bag = Array.from(
      { length: train.length },
      () => train[Math.floor(random() * train.length)],
    );
    const feature = (random() > 0.5 ? 1 : 0) as 0 | 1;
    const values = candidateThresholds(bag, feature);
    const threshold = values[Math.floor(random() * values.length)];
    stumps.push(fitProbabilityStump(bag, feature, threshold));
    if (
      index === 0 ||
      index === count - 1 ||
      (index + 1) % Math.max(1, Math.floor(count / 7)) === 0
    ) {
      curve.push(curvePoint(index + 1, validation, predict));
    }
  }
  return { predict, curve };
}

function trainBoosting(train: Sample[], validation: Sample[], budget: number) {
  const baseRate = train.reduce((sum, item) => sum + item.y, 0) / train.length;
  const base = Math.log(
    clampProbability(baseRate) / (1 - clampProbability(baseRate)),
  );
  const trees: Stump[] = [];
  const learningRate = 0.28;
  const count = Math.max(8, budget * 2);
  const score = (x: [number, number]) =>
    base +
    learningRate * trees.reduce((sum, tree) => sum + stumpPredict(tree, x), 0);
  const predict: Predictor = (x) => sigmoid(score(x));
  const curve: { step: number; balancedAccuracy: number }[] = [];
  for (let index = 0; index < count; index += 1) {
    const residuals = train.map((sample) => sample.y - predict(sample.x));
    let best: Stump | undefined;
    let bestLoss = Number.POSITIVE_INFINITY;
    ([0, 1] as const).forEach((feature) => {
      candidateThresholds(train, feature).forEach((threshold) => {
        let leftSum = 0;
        let leftCount = 0;
        let rightSum = 0;
        let rightCount = 0;
        train.forEach((sample, sampleIndex) => {
          if (sample.x[feature] <= threshold) {
            leftSum += residuals[sampleIndex];
            leftCount += 1;
          } else {
            rightSum += residuals[sampleIndex];
            rightCount += 1;
          }
        });
        const left = leftSum / Math.max(1, leftCount);
        const right = rightSum / Math.max(1, rightCount);
        const loss = train.reduce((sum, sample, sampleIndex) => {
          const estimate = sample.x[feature] <= threshold ? left : right;
          return sum + (residuals[sampleIndex] - estimate) ** 2;
        }, 0);
        if (loss < bestLoss) {
          bestLoss = loss;
          best = { feature, threshold, left: left * 4, right: right * 4 };
        }
      });
    });
    if (best) trees.push(best);
    if (
      index === 0 ||
      index === count - 1 ||
      (index + 1) % Math.max(1, Math.floor(count / 7)) === 0
    ) {
      curve.push(curvePoint(index + 1, validation, predict));
    }
  }
  return { predict, curve };
}

function trainMlp(
  train: Sample[],
  validation: Sample[],
  budget: number,
  seed: number,
) {
  const random = mulberry32(seed + 701);
  const hidden = 8;
  const w1 = Array.from(
    { length: hidden },
    () =>
      [gaussian(random) * 0.35, gaussian(random) * 0.35] as [number, number],
  );
  const b1 = Array.from({ length: hidden }, () => 0);
  const w2 = Array.from({ length: hidden }, () => gaussian(random) * 0.25);
  let b2 = 0;
  const forward = (x: [number, number]) => {
    const activations = w1.map((weights, index) =>
      Math.tanh(weights[0] * x[0] + weights[1] * x[1] + b1[index]),
    );
    return {
      activations,
      probability: sigmoid(
        activations.reduce((sum, value, index) => sum + value * w2[index], b2),
      ),
    };
  };
  const predict: Predictor = (x) => forward(x).probability;
  const steps = Math.max(30, budget * 15);
  const learningRate = 0.055;
  const curve: { step: number; balancedAccuracy: number }[] = [];
  for (let step = 1; step <= steps; step += 1) {
    const gw1 = Array.from(
      { length: hidden },
      () => [0, 0] as [number, number],
    );
    const gb1 = Array.from({ length: hidden }, () => 0);
    const gw2 = Array.from({ length: hidden }, () => 0);
    let gb2 = 0;
    train.forEach(({ x, y }) => {
      const { activations, probability } = forward(x);
      const outputError = probability - y;
      gb2 += outputError / train.length;
      activations.forEach((activation, index) => {
        gw2[index] += (outputError * activation) / train.length;
        const hiddenError =
          outputError * w2[index] * (1 - activation * activation);
        gw1[index][0] += (hiddenError * x[0]) / train.length;
        gw1[index][1] += (hiddenError * x[1]) / train.length;
        gb1[index] += hiddenError / train.length;
      });
    });
    b2 -= learningRate * gb2;
    for (let index = 0; index < hidden; index += 1) {
      w2[index] -= learningRate * gw2[index];
      w1[index][0] -= learningRate * gw1[index][0];
      w1[index][1] -= learningRate * gw1[index][1];
      b1[index] -= learningRate * gb1[index];
    }
    if (
      step === 1 ||
      step === steps ||
      step % Math.max(1, Math.floor(steps / 7)) === 0
    ) {
      curve.push(curvePoint(step, validation, predict));
    }
  }
  return { predict, curve };
}

function makeBoundary(
  predictRaw: Predictor,
  transformX: (x: [number, number]) => [number, number],
) {
  const boundary: { x: number; y: number; probability: number }[] = [];
  const resolution = 25;
  for (let row = 0; row < resolution; row += 1) {
    for (let column = 0; column < resolution; column += 1) {
      const x = -2.4 + (column / (resolution - 1)) * 4.8;
      const y = -2.1 + (row / (resolution - 1)) * 4.2;
      boundary.push({ x, y, probability: predictRaw(transformX([x, y])) });
    }
  }
  return boundary;
}

export function runArena(config: ArenaConfig, includeTest = false) {
  const raw = generateArenaData(config);
  const { transform, transformX } = standardizer(raw.train);
  const train = raw.train.map(transform);
  const validation = raw.validation.map(transform);
  const test = raw.test.map(transform);
  const trainers: Record<
    ArenaAlgorithm,
    () => {
      predict: Predictor;
      curve: { step: number; balancedAccuracy: number }[];
    }
  > = {
    logistic: () => trainLogistic(train, validation, config.budget),
    knn: () => trainKnn(train, validation, config.budget),
    forest: () => trainForest(train, validation, config.budget, config.seed),
    boosting: () => trainBoosting(train, validation, config.budget),
    mlp: () => trainMlp(train, validation, config.budget, config.seed),
  };
  const results = (Object.keys(trainers) as ArenaAlgorithm[]).map(
    (id): ArenaResult => {
      const trained = trainers[id]();
      return {
        ...labels[id],
        validation: arenaMetrics(validation, trained.predict),
        test: includeTest ? arenaMetrics(test, trained.predict) : undefined,
        curve: trained.curve,
        boundary: makeBoundary(trained.predict, transformX),
      };
    },
  );
  return {
    points: [
      ...raw.train.map((point): ArenaPoint => ({ ...point, split: "train" })),
      ...raw.validation.map((point): ArenaPoint => ({
        ...point,
        split: "validation",
      })),
      ...(includeTest
        ? raw.test.map((point): ArenaPoint => ({ ...point, split: "test" }))
        : []),
    ],
    results: results.sort(
      (a, b) => b.validation.balancedAccuracy - a.validation.balancedAccuracy,
    ),
  };
}

export const defaultArenaConfig: ArenaConfig = {
  dataset: "moons",
  trainSize: 120,
  noise: 0.16,
  imbalance: 0.5,
  shift: 0.45,
  budget: 10,
  seed: 42,
};
