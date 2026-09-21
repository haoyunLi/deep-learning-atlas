export type Exercise = {
  id: string;
  kind: "mechanism" | "decision";
  question: string;
  options: string[];
  /** Zero-based index, not an option label. */
  answer: number;
  explanation: string;
};
