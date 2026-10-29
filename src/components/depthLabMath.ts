export const normalize = (xs: number[]) => {
  const z = xs.reduce((a, b) => a + b, 0);
  return xs.map((x) => x / z);
};
export function hmmExperiment(
  stay = 0.8,
  accuracy = 0.8,
  observations = [1, 0, 1, 1, 0],
) {
  const A = [
    [stay, 1 - stay],
    [1 - stay, stay],
  ];
  let prior = [0.5, 0.5],
    delta = [0, 0],
    paths: number[][] = [[0], [1]],
    likelihood = 1;
  const frames = observations.map((o, t) => {
    const prediction =
      t === 0
        ? prior
        : [0, 1].map((j) => prior.reduce((s, p, i) => s + p * A[i][j], 0));
    const emission = [0, 1].map((j) => (j === o ? accuracy : 1 - accuracy));
    const mass = prediction.map((p, j) => p * emission[j]),
      scale = mass.reduce((a, b) => a + b, 0);
    prior = normalize(mass);
    likelihood *= scale;
    if (t === 0) {
      delta = emission.map((e) => Math.log(0.5 * e));
    } else {
      const nextPaths: number[][] = [];
      const nextDelta = [0, 1].map((j) => {
        const scores = delta.map((d, i) => d + Math.log(A[i][j]));
        const best = scores[1] > scores[0] ? 1 : 0;
        nextPaths[j] = [...paths[best], j];
        return scores[best] + Math.log(emission[j]);
      });
      delta = nextDelta;
      paths = nextPaths;
    }
    const best = delta[1] > delta[0] ? 1 : 0;
    return {
      t,
      o,
      prediction,
      emission,
      mass,
      scale,
      filtered: [...prior],
      likelihood,
      bestPath: [...paths[best]],
      bestJoint: Math.exp(delta[best]),
    };
  });
  let beta = [1, 1];
  const smoothed: number[][] = Array(observations.length);
  for (let t = observations.length - 1; t >= 0; t--) {
    smoothed[t] = normalize(frames[t].filtered.map((p, j) => p * beta[j]));
    if (t > 0)
      beta = [0, 1].map(
        (i) =>
          A[i].reduce((s, a, j) => s + a * frames[t].emission[j] * beta[j], 0) /
          frames[t].scale,
      );
  }
  return { A, frames, smoothed, likelihood, path: frames.at(-1)!.bestPath };
}
export function kalmanExperiment(q = 0.2, r = 1, shock = 3) {
  const observations = [0.2, 1.3, 1.7, 3 + shock, 4.2, 4.7];
  let mean = 0,
    variance = 1;
  const frames = observations.map((measurement, t) => {
    const predictedMean = mean + (t ? 1 : 0),
      predictedVariance = variance + q,
      innovation = measurement - predictedMean,
      S = predictedVariance + r,
      K = predictedVariance / S;
    mean = predictedMean + K * innovation;
    variance = (1 - K) ** 2 * predictedVariance + K * K * r;
    return {
      t,
      measurement,
      predictedMean,
      predictedVariance,
      innovation,
      S,
      K,
      mean,
      variance,
    };
  });
  return { frames, observations };
}
export function assignmentExperiment(weight = 0) {
  const geometry = [
      [0.1, 0.2, 0.9],
      [0.11, 0.9, 0.8],
      [0.8, 0.2, 0.1],
    ],
    appearance = [
      [0.1, 0.9, 0.8],
      [0.9, 0.1, 0.8],
      [0.8, 0.9, 0.1],
    ];
  const cost = geometry.map((r, i) =>
    r.map((x, j) => (1 - weight) * x + weight * appearance[i][j]),
  );
  const n = 3,
    u = Array(n + 1).fill(0),
    v = Array(n + 1).fill(0),
    p = Array(n + 1).fill(0),
    way = Array(n + 1).fill(0);
  const matching = () => p.slice(1).flatMap((i, j) => (i ? [[i - 1, j]] : []));
  const snapshot = (label: string) => ({
    label,
    u: u.slice(1),
    v: v.slice(1),
    matching: matching(),
    reduced: cost.map((r, i) => r.map((c, j) => c - u[i + 1] - v[j + 1])),
  });
  const frames = [snapshot("Start：原始 cost；还没有 matching")];
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity),
      used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let d = Infinity,
        j1 = 0;
      for (let j = 1; j <= n; j++)
        if (!used[j]) {
          const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < d) {
            d = minv[j];
            j1 = j;
          }
        }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += d;
          v[j] -= d;
        } else minv[j] -= d;
      }
      frames.push(
        snapshot(
          `Row ${i}：更新 potentials，Δ=${d.toFixed(3)}；寻找 reduced cost=0 的路径`,
        ),
      );
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
    frames.push(snapshot(`Row ${i}：沿 augmenting path 改配，已匹配 ${i} 行`));
  }
  const best = matching(),
    bestCost = best.reduce((s, [i, j]) => s + cost[i][j], 0);
  const used = new Set<number>();
  const greedy = cost.map((row, i) => {
    const j = row
      .map((c, j) => ({ c, j }))
      .filter((x) => !used.has(x.j))
      .sort((a, b) => a.c - b.c || a.j - b.j)[0].j;
    used.add(j);
    return [i, j];
  });
  return {
    cost,
    frames,
    best,
    bestCost,
    greedy,
    greedyCost: greedy.reduce((s, [i, j]) => s + cost[i][j], 0),
    dual:
      u.slice(1).reduce((a, b) => a + b, 0) +
      v.slice(1).reduce((a, b) => a + b, 0),
  };
}
export type Box = [number, number, number, number];
export function geometryExperiment(
  width = 320,
  height = 320,
  letterbox = true,
  flip = true,
) {
  const source: Box = [40, 30, 180, 130],
    sw = 320,
    sh = 180;
  const sx = letterbox ? Math.min(width / sw, height / sh) : width / sw,
    sy = letterbox ? sx : height / sh;
  const px = (width - sw * sx) / 2,
    py = (height - sh * sy) / 2;
  const resized: Box = [
    source[0] * sx + px,
    source[1] * sy + py,
    source[2] * sx + px,
    source[3] * sy + py,
  ];
  const output: Box = flip
    ? [width - resized[2], resized[1], width - resized[0], resized[3]]
    : [...resized];
  const unflipped: Box = flip
    ? [width - output[2], output[1], width - output[0], output[3]]
    : [...output];
  const recovered: Box = [
    (unflipped[0] - px) / sx,
    (unflipped[1] - py) / sy,
    (unflipped[2] - px) / sx,
    (unflipped[3] - py) / sy,
  ];
  const naive: Box = output.map((x, i) => x / (i % 2 ? sy : sx)) as Box;
  return {
    source,
    sw,
    sh,
    width,
    height,
    sx,
    sy,
    px,
    py,
    resized,
    output,
    recovered,
    naive,
  };
}
const children: Record<string, string[]> = {
  S: ["A", "B"],
  A: ["A0", "A1"],
  B: ["B0", "B1"],
};
export const treeRewards: Record<string, number> = {
  A0: 0.6,
  A1: 0.55,
  B0: 0.9,
  B1: 0.1,
};
export type TreeStats = Record<string, { n: number; w: number }>;
export function mctsExperiment(c = 1, simulations = 6, rolloutRight = 0.5) {
  let seed = 17;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const stats: TreeStats = { S: { n: 0, w: 0 } };
  const score = (id: string, parent: string) =>
    !stats[id]?.n
      ? Infinity
      : stats[id].w / stats[id].n +
        c * Math.sqrt(Math.log(Math.max(1, stats[parent].n)) / stats[id].n);
  const clone = () =>
    Object.fromEntries(Object.entries(stats).map(([id, s]) => [id, { ...s }]));
  type Frame = {
    phase: string;
    simulation: number;
    path: string[];
    reward: number | null;
    stats: TreeStats;
    note: string;
  };
  const frames: Frame[] = [
    {
      phase: "Start",
      simulation: 0,
      path: ["S"],
      reward: null,
      stats: clone(),
      note: "只展开 root；leaf returns 来自固定 synthetic model。",
    },
  ];
  for (let k = 1; k <= simulations; k++) {
    let node = "S";
    const path = ["S"];
    while (children[node] && children[node].every((x) => stats[x])) {
      node = [...children[node]].sort(
        (a, b) => score(b, node) - score(a, node) || a.localeCompare(b),
      )[0];
      path.push(node);
    }
    frames.push({
      phase: "Selection",
      simulation: k,
      path: [...path],
      reward: null,
      stats: clone(),
      note: "沿已完全展开的节点用 UCT 选择；遇到未展开 child 或 terminal 停止。",
    });
    if (children[node]) {
      node = children[node].find((x) => !stats[x])!;
      stats[node] = { n: 0, w: 0 };
      path.push(node);
    }
    frames.push({
      phase: "Expansion",
      simulation: k,
      path: [...path],
      reward: null,
      stats: clone(),
      note: "每次最多增加一个 tree node；未展开 siblings 按固定字母顺序处理。",
    });
    let leaf = node;
    const rollout = [...path];
    while (children[leaf]) {
      leaf = children[leaf][random() < rolloutRight ? 1 : 0];
      rollout.push(leaf);
    }
    const reward = treeRewards[leaf];
    frames.push({
      phase: "Rollout",
      simulation: k,
      path: rollout,
      reward,
      stats: clone(),
      note: "按固定 seed 的 rollout policy 走到 leaf；它提供模拟回报，不是模型真实可靠性。",
    });
    for (const id of path) {
      stats[id].n++;
      stats[id].w += reward;
    }
    frames.push({
      phase: "Backup",
      simulation: k,
      path: [...path],
      reward,
      stats: clone(),
      note: "仅给 tree path 上已展开节点累加 N 和 W；所有 Q 使用同一个 agent 的 return。",
    });
  }
  const recommendation = ["A", "B"]
    .filter((x) => stats[x])
    .sort((a, b) => stats[b].n - stats[a].n || a.localeCompare(b))[0];
  return { frames, stats, recommendation, children };
}
export function beamExperiment(width = 2, firstA = 0.6, onlyY = false) {
  const first = [
    { text: "A", p: firstA },
    { text: "B", p: 1 - firstA },
  ].sort((a, b) => b.p - a.p || a.text.localeCompare(b.text));
  const next = (text: string) =>
    onlyY
      ? [{ token: "y", p: 1 }]
      : text === "A"
        ? [
            { token: "x", p: 0.51 },
            { token: "y", p: 0.49 },
          ]
        : [
            { token: "x", p: 0.1 },
            { token: "y", p: 0.9 },
          ];
  const expand = (xs: typeof first) =>
    xs
      .flatMap((x) =>
        next(x.text).map((y) => ({ text: x.text + y.token, p: x.p * y.p })),
      )
      .sort((a, b) => b.p - a.p || a.text.localeCompare(b.text));
  const firstKept = first.slice(0, width),
    all = expand(first),
    candidates = expand(firstKept),
    kept = candidates.slice(0, width);
  return {
    first,
    firstKept,
    all,
    candidates,
    kept,
    best: kept[0],
    oracle: all[0],
    onlyY,
    width,
    firstA,
  };
}
