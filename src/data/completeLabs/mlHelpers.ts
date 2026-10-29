import {
  bars,
  metric,
  type CompleteLab,
  type LabControl,
  type LabStage,
  type LabChart,
  type LabCalculation,
} from "./types";
import { mlSources } from "./mlSources";
export const control = (
  label: string,
  min: number,
  max: number,
  step: number,
  initial: number,
  hint: string,
): LabControl => ({ id: "p", label, min, max, step, initial, hint });
export const stage = (
  title: string,
  explanation: string,
  formula: string,
  labels: string[],
  values: number[],
  unit: string,
  chart?: LabChart,
): LabStage => ({
  title,
  explanation,
  formula,
  metrics: labels.map((l, i) => metric(l, values[i], unit)),
  chart: chart ?? bars(labels, values, unit),
});
type Guide = {
  use: [string, string];
  tune: [string, string];
  fail: [[string, string, string], [string, string, string]];
  limit: string;
};
export function make(
  id: string,
  question: string,
  input: string,
  parameter: LabControl,
  calculate: (p: number) => LabCalculation,
  g: Guide,
): CompleteLab {
  return {
    question,
    input,
    controls: [parameter],
    calculate: (v) => calculate(v.p),
    usage: g.use,
    tuning: g.tune,
    troubleshooting: g.fail.map(([symptom, check, action]) => ({
      symptom,
      check,
      action,
    })),
    boundary: "Synthetic teaching example；" + g.limit,
    source: mlSources[id],
  };
}
export const entropy = (ps: number[]) =>
  -ps.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0);
export const binaryEntropy = (p: number) => entropy([p, 1 - p]);
export const sq = (x: number) => x * x;
export const range = (n: number) => Array.from({ length: n }, (_, i) => i);
