// Small deterministic teaching fixtures, not benchmarks or model training.
export const treeRows = [0, 0, 1, 0, 1, 1, 0, 1].map((y, i) => ({
  x: i + 1,
  y,
}));
export function treeSplitExperiment(
  threshold = 4.5,
  minLeaf = 1,
  criterion: "gini" | "entropy" = "gini",
) {
  const impurity = (rows: typeof treeRows) => {
    if (!rows.length) return 0;
    const p = rows.filter((r) => r.y === 1).length / rows.length;
    return criterion === "gini"
      ? 2 * p * (1 - p)
      : -(p === 0 ? 0 : p * Math.log2(p)) -
          (p === 1 ? 0 : (1 - p) * Math.log2(1 - p));
  };
  const parent = impurity(treeRows);
  const evaluate = (cut: number) => {
    const left = treeRows.filter((r) => r.x <= cut),
      right = treeRows.filter((r) => r.x > cut);
    const child =
      (left.length * impurity(left) + right.length * impurity(right)) /
      treeRows.length;
    return {
      cut,
      left,
      right,
      leftImpurity: impurity(left),
      rightImpurity: impurity(right),
      child,
      gain: parent - child,
      valid: Math.min(left.length, right.length) >= minLeaf,
    };
  };
  const candidates = Array.from({ length: 7 }, (_, i) => evaluate(i + 1.5));
  const best = candidates
    .filter((c) => c.valid)
    .reduce((a, b) => (b.gain > a.gain ? b : a));
  return {
    rows: treeRows,
    parent,
    candidates,
    best,
    selected: evaluate(threshold),
  };
}

export const searchNodes = ["S", "A", "B", "C", "D", "G"];
export const searchEdges: [string, string, number][] = [
  ["S", "A", 2],
  ["S", "B", 1],
  ["A", "G", 6],
  ["A", "D", 4],
  ["B", "C", 1],
  ["C", "D", 1],
  ["D", "G", 2],
];
export const searchHeuristic: Record<string, number> = {
  S: 3,
  A: 1,
  B: 4,
  C: 3,
  D: 2,
  G: 0,
};
export function astarExperiment(weight = 1) {
  type Entry = { node: string; g: number; f: number; path: string[] };
  let frontier: Entry[] = [
    { node: "S", g: 0, f: weight * searchHeuristic.S, path: ["S"] },
  ];
  const best: Record<string, number> = { S: 0 };
  const trace: {
    current: Entry | null;
    frontier: Entry[];
    visited: string[];
    done: boolean;
  }[] = [{ current: null, frontier: [...frontier], visited: [], done: false }];
  const visited: string[] = [];
  while (frontier.length) {
    frontier.sort((a, b) => a.f - b.f || a.node.localeCompare(b.node));
    const current = frontier.shift()!;
    if (current.g > best[current.node]) continue;
    visited.push(current.node);
    if (current.node !== "G")
      for (const [from, to, cost] of searchEdges)
        if (from === current.node) {
          const g = current.g + cost;
          if (g < (best[to] ?? Infinity)) {
            best[to] = g;
            frontier.push({
              node: to,
              g,
              f: g + weight * searchHeuristic[to],
              path: [...current.path, to],
            });
          }
        }
    frontier = frontier
      .filter((e) => e.g === best[e.node])
      .sort((a, b) => a.f - b.f || a.node.localeCompare(b.node));
    trace.push({
      current,
      frontier: [...frontier],
      visited: [...visited],
      done: current.node === "G",
    });
    if (current.node === "G") break;
  }
  return { trace, result: trace[trace.length - 1].current! };
}

export type DetectionBox = {
  id: string;
  xyxy: [number, number, number, number];
  score: number;
  label: string;
};
export function boxIoU(a: number[], b: number[]) {
  const intersection =
    Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) *
    Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const area = (x: number[]) =>
    Math.max(0, x[2] - x[0]) * Math.max(0, x[3] - x[1]);
  const union = area(a) + area(b) - intersection;
  return union > 0 ? intersection / union : 0;
}
export function nmsExperiment(
  iouThreshold = 0.45,
  scoreThreshold = 0.5,
  classAware = true,
  shift = 8,
) {
  const boxes: DetectionBox[] = [
    { id: "A", xyxy: [10, 10, 70, 70], score: 0.95, label: "cat" },
    {
      id: "B",
      xyxy: [10 + shift, 16, 70 + shift, 76],
      score: 0.85,
      label: "cat",
    },
    { id: "C", xyxy: [22, 20, 82, 80], score: 0.9, label: "dog" },
    { id: "D", xyxy: [120, 20, 170, 70], score: 0.6, label: "cat" },
  ];
  let pending = boxes
    .filter((b) => b.score >= scoreThreshold)
    .sort((a, b) => b.score - a.score);
  const kept: string[] = [],
    suppressed: { id: string; by: string; iou: number }[] = [];
  const trace = [
    {
      kept: [...kept],
      suppressed: [...suppressed],
      pending: pending.map((b) => b.id),
    },
  ];
  while (pending.length) {
    const selected = pending.shift()!;
    kept.push(selected.id);
    pending = pending.filter((b) => {
      const iou = boxIoU(selected.xyxy, b.xyxy);
      if ((!classAware || b.label === selected.label) && iou > iouThreshold) {
        suppressed.push({ id: b.id, by: selected.id, iou });
        return false;
      }
      return true;
    });
    trace.push({
      kept: [...kept],
      suppressed: [...suppressed],
      pending: pending.map((b) => b.id),
    });
  }
  return {
    boxes,
    kept,
    suppressed,
    filtered: boxes.filter((b) => b.score < scoreThreshold).map((b) => b.id),
    trace,
  };
}

export function rrfExperiment(k = 10, depth = 4, denseWeight = 1, outputK = 3) {
  const keyword = ["A", "B", "C", "D"].slice(0, depth),
    dense = ["B", "E", "C", "A"].slice(0, depth),
    relevant = ["C", "E"];
  const ranking = [...new Set([...keyword, ...dense])]
    .map((id) => {
      const keywordRank = keyword.indexOf(id) + 1,
        denseRank = dense.indexOf(id) + 1;
      const lexical = keywordRank ? 1 / (k + keywordRank) : 0,
        semantic = denseRank ? denseWeight / (k + denseRank) : 0;
      return {
        id,
        keywordRank,
        denseRank,
        lexical,
        semantic,
        score: lexical + semantic,
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const retrieved = ranking.slice(0, outputK),
    hit = (ids: string[]) =>
      relevant.filter((id) => ids.includes(id)).length / relevant.length;
  return {
    keyword,
    dense,
    ranking,
    retrieved,
    relevant,
    candidateRecall: hit(ranking.map((r) => r.id)),
    recall: hit(retrieved.map((r) => r.id)),
  };
}

export function reliabilityExperiment(
  stages = 5,
  p = 0.9,
  attempts = 1,
  outage = 0.1,
) {
  const q = 1 - (1 - p) ** attempts;
  const expectedStage = Array.from(
    { length: attempts },
    (_, j) => (1 - p) ** j,
  ).reduce((a, b) => a + b, 0);
  const conditionalCalls =
    expectedStage *
    Array.from({ length: stages }, (_, i) => q ** i).reduce((a, b) => a + b, 0);
  return {
    q,
    independentSuccess: q ** stages,
    success: (1 - outage) * q ** stages,
    expectedCalls: outage * attempts + (1 - outage) * conditionalCalls,
    worstCalls: stages * attempts,
    stageSuccess: Array.from({ length: stages }, (_, i) => ({
      stage: i + 1,
      oneTry: p ** (i + 1),
      retry: q ** (i + 1),
      withOutage: (1 - outage) * q ** (i + 1),
    })),
  };
}
