import type { Lesson } from "../data/lessons";
export const searchAliases: Record<string, string[]> = {
  "gradient-descent": ["sgd", "随机梯度下降"],
  "expectation-maximization": ["em", "期望最大化"],
  "batch-normalization": ["bn", "batchnorm", "批归一化"],
  "layer-normalization": ["ln", "layernorm", "层归一化", "rmsnorm"],
  "mixed-precision": ["amp", "fp16", "bf16", "混合精度"],
  "learning-rate-schedules": ["lr", "scheduler", "warmup", "学习率调度"],
  "gradient-clipping": ["clip grad", "梯度裁剪"],
  "logistic-regression": ["逻辑回归", "logistic"],
  "gaussian-mixture-model": ["gmm", "高斯混合"],
  "reward-model": ["rm", "奖励模型"],
  "gpt-language-model": ["lm", "llm", "语言模型"],
  "retrieval-augmented-generation": ["rag", "检索增强"],
  "grouped-query-attention": ["gqa", "mqa", "mha"],
  "kv-cache": ["kvcache", "kv", "键值缓存"],
  "autoregressive-inference": ["prefill", "decode", "ttft", "解码"],
  tokenization: ["tokenizer", "bpe", "分词"],
  "positional-encoding": ["rope", "位置编码"],
  "language-model-evaluation": ["ppl", "perplexity", "困惑度"],
  "off-policy-evaluation": ["ope", "ips", "dr", "离策略评估"],
  "flow-matching": ["cfm", "流匹配"],
  "latent-diffusion": ["ldm", "潜扩散"],
  "time-series-forecasting": ["forecast", "时间序列", "预测"],
  knn: ["k nearest neighbors", "近邻", "最近邻"],
  unet: ["u net"],
  nnunet: ["nn u net"],
  bert: ["burt"],
  resnet: ["残差", "residual"],
  graphsage: ["graph sage"],
};
export function normalizeSearch(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s_\-–—/]+/g, "");
}
export function matchesLesson(lesson: Lesson, query: string, extra = "") {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(normalizeSearch);
  const haystack = normalizeSearch(
    [
      lesson.id,
      lesson.title,
      lesson.englishTitle,
      lesson.summary,
      ...(searchAliases[lesson.id] || []),
      extra,
    ].join(" "),
  );
  return terms.every((term) => haystack.includes(term));
}
