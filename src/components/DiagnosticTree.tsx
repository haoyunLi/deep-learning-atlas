import { useState } from "react";
type Branch = {
  title: string;
  checks: { question: string; yes: string; no: string; link: string }[];
};
export const diagnosticBranches: Branch[] = [
  {
    title: "Loss 不降 / NaN",
    checks: [
      {
        question: "输入、logits、loss、grad 是否全为有限数？",
        yes: "定位第一个非有限 tensor；检查除零、log(0)、异常样本，先用 FP32 小 batch 重现，再检查 autocast 范围与 GradScaler。不要只跳过坏 batch。",
        no: "数值有限后再查数据与优化；检查 label 范围、目标 dtype、loss reduction 和 padding mask。",
        link: "mixed-precision",
      },
      {
        question: "能否把固定的 16 个样本 overfit？",
        yes: "若不能：关闭 augmentation/dropout，检查梯度非零、参数 requires_grad、optimizer 是否包含目标参数，以及 step/zero_grad 的顺序。",
        no: "能 overfit 说明基本链路可工作；逐项恢复正则化与增强，比较 train/eval 模式和训练样本难度。",
        link: "backpropagation",
      },
      {
        question: "梯度范数或更新量出现尖峰？",
        yes: "记录未裁剪 norm；先降 LR，检查 loss scaling 与 batch 累积，再做 unscale → clip → optimizer step。记录触发频率，不能把裁剪当成掩盖数值 bug 的办法。",
        no: "范数很小则检查饱和激活、冻结层、初始化与标签；画 LR 和梯度随 step 的曲线，核对 scheduler 调用次数。",
        link: "gradient-clipping",
      },
    ],
  },
  {
    title: "训练好，验证差",
    checks: [
      {
        question: "同一实体 / 近重复 / 未来信息是否跨 split？",
        yes: "按部署问题重建 group 或时间切分，清除未来特征，在每个训练 fold 内 fit scaler/imputer。更可信的分数可能更低。",
        no: "切分有效后比较样本数量、类比例、中心与时间构成；先不要简单把验证样本并回训练。",
        link: "data-leakage",
      },
      {
        question:
          "验证的确定性预处理是否与训练约定一致，并已正确切换到 eval 模式？",
        yes: "若不一致：核对 tokenizer、resize、标准化，验证时调用 eval() 关闭 dropout 并让 BN 使用 running stats；训练仍用 train()，可保留训练专用增强。验证阶段不要更新参数。",
        no: "一致则检查容量、正则化与 early stopping；用学习曲线区分样本不足与模型偏差，并保留简单 baseline。",
        link: "batch-normalization",
      },
      {
        question: "调参次数很多，但验证样本很少？",
        yes: "验证集也可能被选择过程过拟合；冻结搜索预算，采用嵌套验证或重新收集独立数据，最终测试仅用于最终报告。",
        no: "检查 subgroup errors、校准与置信区间，单个平均分不能说明所有人群的表现。",
        link: "model-evaluation",
      },
    ],
  },
  {
    title: "线上表现变差",
    checks: [
      {
        question: "线上 schema、缺失率或预处理版本是否变化？",
        yes: "比较训练/服务的同一原始样本输出，核对列顺序、单位、时间戳与 tokenizer/version；回滚错误 pipeline 并复放请求。",
        no: "一致后再查数据分布、标签定义和真实业务目标，而非立即重训。",
        link: "domain-shift",
      },
      {
        question: "新 cohort 的输入或标签比例发生漂移？",
        yes: "按时间/中心/群体监控分布、延迟标签与 calibration；分清 covariate shift、label shift 和概念变化，再决定再校准或重训。",
        no: "排查反馈回路、选择性标签、流量 routing 和统计波动；仅有无标签 drift 信号不能证明 accuracy 下降。",
        link: "cohort-design",
      },
      {
        question: "新策略只能用旧策略日志评估？",
        yes: "先看 action support 与 propensity 是否可信；报告 IPS/DR 的权重分布、有效样本量和敏感性；缺乏支持不能可靠推断新动作效果。",
        no: "若可做在线实验，预先定义指标、分流和停止规则，结合独立测试与分组监控。",
        link: "off-policy-evaluation",
      },
    ],
  },
];
export default function DiagnosticTree() {
  const [branch, setBranch] = useState(0);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const current = diagnosticBranches[branch];
  const check = current.checks[index];
  const labels =
    branch === 0 && index === 0
      ? ["发现非有限值", "全部有限"]
      : branch === 0 && index === 1
        ? ["不能 overfit", "能够 overfit"]
        : branch === 1 && index === 1
          ? ["发现不一致", "两者一致"]
          : ["有 / 是", "没有 / 否"];
  return (
    <section className="diagnostic-tree" id="diagnostics">
      <div className="practice-eyebrow">OBSERVE → ISOLATE → VERIFY</div>
      <h2>
        从症状往下查 <span>Debugging tree</span>
      </h2>
      <div className="practice-tabs">
        {diagnosticBranches.map((item, i) => (
          <button
            key={item.title}
            aria-pressed={i === branch}
            onClick={() => {
              setBranch(i);
              setIndex(0);
              setAnswer(null);
            }}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="diagnostic-node">
        <small>
          检查 {index + 1} / {current.checks.length}
        </small>
        <h3>{check.question}</h3>
        <div className="practice-tabs">
          {labels.map((label, i) => (
            <button
              key={label}
              aria-pressed={answer === (i === 0)}
              onClick={() => setAnswer(i === 0)}
            >
              {label}
            </button>
          ))}
        </div>
        {answer !== null && (
          <div className="exercise-feedback" role="status">
            <p>{answer ? check.yes : check.no}</p>
            <a href={`#/lesson/${check.link}`}>深入相关原理 →</a>
          </div>
        )}
        <div className="practice-links">
          <button
            className="practice-button"
            disabled={index === 0}
            onClick={() => {
              setIndex(index - 1);
              setAnswer(null);
            }}
          >
            上一项
          </button>
          <button
            className="practice-button"
            disabled={index === current.checks.length - 1}
            onClick={() => {
              setIndex(index + 1);
              setAnswer(null);
            }}
          >
            检查下一项
          </button>
        </div>
      </div>
      <p className="practice-note">
        一次只改一个因素，记录修改前后的证据。这些分支用于缩小排查范围；多个问题可能同时存在。
      </p>
    </section>
  );
}
