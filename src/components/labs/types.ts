import type { ComponentType } from "react";

export type AnimationStep = { title: string; explanation: string };
export type LabProps = { step: number; value: number };
export type LabDefinition = {
  title: string;
  englishTitle: string;
  steps: AnimationStep[];
  parameter: {
    label: string;
    min: number;
    max: number;
    step: number;
    initial: number;
    hint: string;
    unit?: string;
  };
  note: string;
  render: ComponentType<LabProps>;
};
