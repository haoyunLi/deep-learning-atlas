export type BudgetConfig = {
  batch: number;
  prompt: number;
  generated: number;
  layers: number;
  queryHeads: number;
  kvHeads: number;
  headDim: number;
  bytes: number;
};
export function languageBudget(c: BudgetConfig) {
  const length = c.prompt + c.generated;
  const kvBytes =
    2 * c.batch * length * c.layers * c.kvHeads * c.headDim * c.bytes;
  const mhaBytes = (kvBytes * c.queryHeads) / c.kvHeads;
  const prefillScores = c.batch * c.queryHeads * c.prompt * c.prompt;
  const decodeScores = c.batch * c.queryHeads * length;
  return {
    length,
    kvBytes,
    mhaBytes,
    prefillScores,
    decodeScores,
    bytesPerToken: 2 * c.batch * c.layers * c.kvHeads * c.headDim * c.bytes,
  };
}
