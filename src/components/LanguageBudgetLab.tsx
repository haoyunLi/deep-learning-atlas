import { useState } from "react";
import { languageBudget, type BudgetConfig } from "./languageBudgetMath";
import "../practice.css";

const initial: BudgetConfig = {
  batch: 1,
  prompt: 2048,
  generated: 512,
  layers: 32,
  queryHeads: 32,
  kvHeads: 8,
  headDim: 128,
  bytes: 2,
};
const gib = (bytes: number) => (bytes / 2 ** 30).toFixed(3);
export default function LanguageBudgetLab() {
  const [config, setConfig] = useState(initial);
  const [phase, setPhase] = useState<"prefill" | "decode">("prefill");
  const result = languageBudget(config);
  const update = (key: keyof BudgetConfig, value: number) =>
    setConfig((current) => ({ ...current, [key]: value }));
  const fields: { key: keyof BudgetConfig; label: string; values: number[] }[] =
    [
      { key: "batch", label: "Batch · 并发序列 B", values: [1, 2, 4, 8, 16] },
      {
        key: "prompt",
        label: "Prompt tokens P",
        values: [128, 512, 2048, 8192, 32768],
      },
      { key: "generated", label: "新增 tokens G", values: [1, 128, 512, 2048] },
      { key: "layers", label: "层数 N", values: [12, 24, 32, 48, 80] },
      { key: "kvHeads", label: "KV heads Hkv", values: [1, 2, 4, 8, 16, 32] },
      { key: "headDim", label: "Head dimension d", values: [64, 128, 256] },
      { key: "bytes", label: "KV 每元素 bytes", values: [1, 2, 4] },
    ];
  return (
    <section className="budget-lab" id="language-budget">
      <div className="practice-eyebrow">SHAPES → MEMORY → COMPUTE</div>
      <h2>
        把语言模型的账算清楚 <span>Inference budget lab</span>
      </h2>
      <p>
        固定 query heads = 32，选择 KV heads 从 MHA（32）→ GQA（2–16）→
        MQA（1）。这里比较架构配置；已训练模型不能靠改一个配置字段就安全转换。
      </p>
      <div className="budget-controls">
        {fields.map((field) => (
          <label key={field.key}>
            {field.label}
            <select
              value={config[field.key]}
              onChange={(event) =>
                update(field.key, Number(event.target.value))
              }
            >
              {field.values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="budget-numbers" aria-live="polite">
        <div>
          <span>累计长度 L = P + G</span>
          <strong>{result.length.toLocaleString()} tokens</strong>
        </div>
        <div>
          <span>所有层的 K + V</span>
          <strong>{gib(result.kvBytes)} GiB</strong>
        </div>
        <div>
          <span>相同配置的 MHA</span>
          <strong>{gib(result.mhaBytes)} GiB</strong>
        </div>
        <div>
          <span>每增加一个 token / 每个 batch</span>
          <strong>{(result.bytesPerToken / 1024).toLocaleString()} KiB</strong>
        </div>
      </div>
      <div className="budget-bars" aria-label="KV cache 相对 MHA 大小">
        <div
          style={{ width: `${(100 * config.kvHeads) / config.queryHeads}%` }}
        />
        <p>
          {(config.kvHeads / config.queryHeads) * 100}% of MHA cache ·{" "}
          {config.queryHeads / config.kvHeads} 个 query heads 共享一组 K/V
        </p>
      </div>
      <code className="practice-formula">
        KV bytes = 2 × B × (P + G) × N × Hkv × d × bytes
        <br />= 2 × {config.batch} × {result.length} × {config.layers} ×{" "}
        {config.kvHeads} × {config.headDim} × {config.bytes}
      </code>
      <div className="practice-tabs" aria-label="推理阶段">
        {(["prefill", "decode"] as const).map((value) => (
          <button
            key={value}
            aria-pressed={phase === value}
            onClick={() => setPhase(value)}
          >
            {value === "prefill"
              ? "① Prefill · 处理整段 prompt"
              : "② Decode · 单 token 前向"}
          </button>
        ))}
      </div>
      <div className="budget-phase" key={phase}>
        <h3>
          {phase === "prefill" ? "一起读完 prompt" : "接着读一个新 token"}
        </h3>
        <div className="practice-table">
          <table>
            <thead>
              <tr>
                <th>Tensor / 每层</th>
                <th>Shape</th>
                <th>含义</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Q</td>
                <td>
                  [{config.batch}, 32, {phase === "prefill" ? config.prompt : 1}
                  , {config.headDim}]
                </td>
                <td>
                  {phase === "prefill"
                    ? "每个位置有 query"
                    : "仅新位置有 query"}
                </td>
              </tr>
              <tr>
                <td>K / V（各自）</td>
                <td>
                  [{config.batch}, {config.kvHeads},{" "}
                  {phase === "prefill" ? config.prompt : result.length},{" "}
                  {config.headDim}]
                </td>
                <td>
                  {phase === "prefill"
                    ? "写入 prompt 的 cache"
                    : "读取历史并追加当前位置"}
                </td>
              </tr>
              <tr>
                <td>Attention scores（逻辑形状）</td>
                <td>
                  [{config.batch}, 32, {phase === "prefill" ? config.prompt : 1}
                  , {phase === "prefill" ? config.prompt : result.length}]
                </td>
                <td>
                  {(phase === "prefill"
                    ? result.prefillScores
                    : result.decodeScores
                  ).toLocaleString()}{" "}
                  elements
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {phase === "prefill"
            ? "全长 causal attention 的逻辑 score 矩阵随 P² 增长；只有下三角可见。FlashAttention 等实现不必在显存中完整保存这个矩阵，但不能因此把标准全注意力的计算量说成线性。"
            : "这里展示 cache 已累计到 L 的一次前向：新 Q 与 L 个 K 比较，分数数目随 L 线性增长。处理该位置后输出下一 token；生成循环存在 prompt 首次预测与最后一枚 token 尚未前向的 off-by-one，显存规划用 P+G 作保守长度。"}
        </p>
      </div>
      <p className="practice-note">
        计算范围：标准 decoder full-attention 的理想 KV
        存储，不含权重、activations、allocator、padding、量化 scale 或通信
        buffer；不是 GPU 总显存。1 byte 表示理想化 8-bit
        cache，需要后端支持。TTFT 与每 token
        延迟还取决于硬件、带宽、kernel、batch
        和调度，不能从这个公式直接得出毫秒数。
      </p>
      <div className="practice-links">
        <a
          href="https://huggingface.co/docs/transformers/main/en/cache_explanation"
          target="_blank"
          rel="noreferrer"
        >
          Cache 原理 ↗
        </a>
        <a href="#/concepts/language-model-pipeline">走完整条 LM 路径 →</a>
        <button
          onClick={() => {
            setConfig(initial);
            setPhase("prefill");
          }}
          className="practice-button"
        >
          重置配置
        </button>
      </div>
    </section>
  );
}
