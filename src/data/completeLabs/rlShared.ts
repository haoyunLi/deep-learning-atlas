import {
  bars,
  metric,
  type CompleteLab,
  type LabCalculation,
  type LabControl,
  type LabStage,
} from "./types";
import { rlSources } from "./rlSources";
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
): LabStage => ({
  title,
  explanation,
  formula,
  metrics: labels.map((x, i) => metric(x, values[i], unit)),
  chart: bars(labels, values, unit),
});
export const result = (
  stages: LabStage[],
  label: string,
  value: number,
  unit = "",
  extra: { label: string; value: number; unit?: string }[] = [],
): LabCalculation => ({
  stages,
  outcomes: [metric(label, value, unit), ...extra],
});
type Guide = {
  use: [string, string];
  tune: [string, string];
  debug: [string, string, string, string, string, string];
  boundary: string;
};
export function make(
  id: string,
  question: string,
  input: string,
  parameter: LabControl,
  calculate: (p: number) => LabCalculation,
  guide: Guide,
): CompleteLab {
  return {
    question,
    input: `Synthetic teaching fixture。${input}`,
    controls: [parameter],
    calculate: (v) => calculate(v.p),
    usage: guide.use,
    tuning: guide.tune,
    troubleshooting: [
      {
        symptom: guide.debug[0],
        check: guide.debug[1],
        action: guide.debug[2],
      },
      {
        symptom: guide.debug[3],
        check: guide.debug[4],
        action: guide.debug[5],
      },
    ],
    boundary: guide.boundary,
    source: rlSources[id],
  };
}
export const logsumexp = (xs: number[]) => {
  const m = Math.max(...xs);
  return m + Math.log(xs.reduce((s, x) => s + Math.exp(x - m), 0));
};
export const entropy = (ps: number[]) =>
  -ps.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0);
export const kl = (p: number[], q: number[]) =>
  p.reduce((s, x, i) => s + (x > 0 ? x * Math.log(x / q[i]) : 0), 0);
