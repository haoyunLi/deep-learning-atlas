export type LabControl = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  hint: string;
};
export type LabMetric = { label: string; value: number; unit?: string };
export type LabChart =
  | { kind: "bars"; labels: string[]; values: number[]; unit: string }
  | { kind: "line"; x: number[]; y: number[]; xLabel: string; yLabel: string }
  | {
      kind: "matrix";
      rows: string[];
      columns: string[];
      values: number[][];
      unit: string;
    };
export type LabStage = {
  title: string;
  explanation: string;
  formula: string;
  metrics: LabMetric[];
  chart: LabChart;
};
export type LabCalculation = { stages: LabStage[]; outcomes: LabMetric[] };
export type CompleteLab = {
  question: string;
  input: string;
  controls: LabControl[];
  calculate: (values: Record<string, number>) => LabCalculation;
  usage: string[];
  tuning: string[];
  troubleshooting: { symptom: string; check: string; action: string }[];
  boundary: string;
  source: { label: string; url: string };
};
export type CompleteLabMap = Record<string, CompleteLab>;
export const metric = (label: string, value: number, unit = ""): LabMetric => ({
  label,
  value,
  unit,
});
export const bars = (
  labels: string[],
  values: number[],
  unit: string,
): LabChart => ({ kind: "bars", labels, values, unit });
export const line = (
  x: number[],
  y: number[],
  xLabel: string,
  yLabel: string,
): LabChart => ({ kind: "line", x, y, xLabel, yLabel });
export const matrix = (
  rows: string[],
  columns: string[],
  values: number[][],
  unit: string,
): LabChart => ({ kind: "matrix", rows, columns, values, unit });
export const fmt = (v: number, digits = 4): string =>
  (Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v).toFixed(digits);
export const softmax = (xs: number[]): number[] => {
  const m = Math.max(...xs);
  const es = xs.map((x) => Math.exp(x - m));
  const z = es.reduce((a, b) => a + b, 0);
  return es.map((e) => e / z);
};
export const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: number[]): number => sum(xs) / xs.length;
export const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
