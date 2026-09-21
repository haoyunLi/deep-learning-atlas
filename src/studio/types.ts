export type StudioDimensions = Record<string, number>;

export type CodeMode = "scratch" | "pytorch" | "production";

export type CodeLabStep = {
  id: string;
  title: string;
  english: string;
  summary: string;
  why: string;
  input: string;
  output: string;
  parameter: string;
  commonError: string;
  lines: Record<CodeMode, [number, number]>;
};

export type CodeVariant = {
  label: string;
  note: string;
  code: string;
};

export type CodeLab = {
  lessonId: string;
  title: string;
  english: string;
  dimensions: StudioDimensions;
  steps: CodeLabStep[];
  variants: Record<CodeMode, CodeVariant>;
  productionChecks: string[];
};

export type ShapeField = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
};

export type ShapeStage = {
  id: string;
  label: string;
  operation: string;
  input: string;
  output: string;
  why: string;
  parameters: string;
  error?: string;
  commonErrors: string[];
};

export type ShapeDefinition = {
  id: "cnn" | "rnn" | "attention" | "unet" | "gnn";
  label: string;
  english: string;
  fields: ShapeField[];
  defaults: StudioDimensions;
  makeError: (values: StudioDimensions) => StudioDimensions;
  repair: (values: StudioDimensions) => StudioDimensions;
  stages: (values: StudioDimensions) => ShapeStage[];
};
