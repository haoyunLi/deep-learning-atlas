import { cvMetadata } from "./cvMetadata";
import {
  bars,
  line,
  matrix,
  metric,
  type CompleteLab,
  type LabCalculation,
  type LabControl,
  type LabStage,
} from "./types";
export { fmt, softmax, sum, mean, sigmoid, metric } from "./types";
export const C = (
  label: string,
  min: number,
  max: number,
  step: number,
  initial: number,
  hint: string,
): LabControl => ({ id: "x", label, min, max, step, initial, hint });
export function S(
  title: string,
  explanation: string,
  formula: string,
  labels: string[],
  values: number[],
  unit: string,
): LabStage {
  return {
    title,
    explanation,
    formula,
    metrics: values.map((v, i) => metric(labels[i], v, unit)),
    chart: bars(labels, values, unit),
  };
}
export function M(
  title: string,
  explanation: string,
  formula: string,
  rows: string[],
  columns: string[],
  values: number[][],
  unit: string,
): LabStage {
  return {
    title,
    explanation,
    formula,
    metrics: [
      metric(
        "Sum",
        values.flat().reduce((a, b) => a + b, 0),
        unit,
      ),
    ],
    chart: matrix(rows, columns, values, unit),
  };
}
export function L(
  title: string,
  explanation: string,
  formula: string,
  x: number[],
  y: number[],
  xLabel: string,
  yLabel: string,
): LabStage {
  return {
    title,
    explanation,
    formula,
    metrics: [metric("Last", y[y.length - 1], yLabel)],
    chart: line(x, y, xLabel, yLabel),
  };
}
export function define(
  id: keyof typeof cvMetadata,
  question: string,
  input: string,
  control: LabControl,
  calculate: (v: Record<string, number>) => LabCalculation,
  tune: string,
  debug: [string, string, string][],
  boundary: string,
): CompleteLab {
  return {
    question,
    input,
    controls: [control],
    calculate,
    usage: cvMetadata[id].usage,
    tuning: [
      `本例 ${control.label} 从 ${control.initial} 起；${control.hint}`,
      tune,
    ],
    troubleshooting: debug.map(([symptom, check, action]) => ({
      symptom,
      check,
      action,
    })),
    boundary: `Synthetic teaching fixture。${boundary}`,
    source: cvMetadata[id].source,
  };
}
export const D = (a: [string, string, string], b: [string, string, string]) => [
  a,
  b,
];
export const dot = (a: number[], b: number[]) =>
  a.reduce((s, x, i) => s + x * b[i], 0);
export const norm = (a: number[]) => Math.sqrt(dot(a, a));
export const iou = (a: number[], b: number[]) => {
  const area = (z: number[]) => (z[2] - z[0]) * (z[3] - z[1]);
  const inter =
    Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) *
    Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  return {
    inter,
    union: area(a) + area(b) - inter,
    value: inter / (area(a) + area(b) - inter),
  };
};
