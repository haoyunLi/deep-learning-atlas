import { useMemo, useState } from "react";
import LanguageBudgetLab from "./LanguageBudgetLab";
import DiagnosticTree from "./DiagnosticTree";
import {
  caseRows,
  caseSplit,
  evaluateCase,
  runCaseSearch,
  type CaseRow,
} from "./practiceMath";
import "../practice.css";

const stages = [
  "定义与切分",
  "建立基线",
  "调参比较",
  "特征消融",
  "错误分析",
  "独立测试",
];
const percent = (value: number | null) =>
  value === null ? "未定义" : `${(value * 100).toFixed(1)}%`;

function PracticalCase() {
  const trials = useMemo(runCaseSearch, []);
  const best = trials.reduce((a, b) =>
    a.validation.loss < b.validation.loss ? a : b,
  );
  const [selected, setSelected] = useState(best.id);
  const [threshold, setThreshold] = useState(0.5);
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const trial = trials[selected];
  const validation = evaluateCase(trial.model, caseSplit.validation, threshold);
  const ablation = evaluateCase(
    trial.ablation,
    caseSplit.validation,
    threshold,
  );
  const test = revealed
    ? evaluateCase(trial.model, caseSplit.test, threshold)
    : null;
  const mistakes = caseSplit.validation.filter(
    (row) => Number(trial.model.predict(row) >= threshold) !== row.y,
  );
  const csv =
    "id,index_day,recency_days,support_tickets,label_30day,split\n" +
    caseRows
      .map((row) =>
        [
          row.id,
          row.day,
          ...row.x,
          row.y,
          row.id <= 80
            ? "train"
            : row.id <= 90
              ? "embargo"
              : row.id <= 120
                ? "validation"
                : row.id <= 130
                  ? "embargo"
                  : "test",
        ].join(","),
      )
      .join("\n");
  const showRows = (rows: CaseRow[]) => (
    <div className="practice-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Index day</th>
            <th>Recency</th>
            <th>Tickets</th>
            <th>y</th>
            <th>p̂</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.day}</td>
              <td>{row.x[0]}</td>
              <td>{row.x[1]}</td>
              <td>{row.y}</td>
              <td>{trial.model.predict(row).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <section className="practical-case" id="case-study">
      <div className="practice-eyebrow">A REPRODUCIBLE TOY EXPERIMENT</div>
      <h2>
        从原始数据走到一次独立测试 <span>End-to-end case</span>
      </h2>
      <p>
        任务：在 index day 预测一位客户接下来 30 天是否流失。160
        位虚构客户，每人一行；两个特征只来自此前 30 天。固定 seed 的合成标签来自
        p(y=1)=sigmoid(−3+0.12×recency+0.4×tickets)，用于演示流程，不代表真实业务效果。
      </p>
      <div
        className="case-timeline"
        aria-label="80 训练，10 间隔，30 验证，10 间隔，30 测试"
      >
        <span>80 Train</span>
        <i>10 Gap</i>
        <span>30 Validation</span>
        <i>10 Gap</i>
        <span>30 Test</span>
      </div>
      <div className="case-stage-nav">
        {stages.map((label, i) => (
          <button
            key={label}
            aria-current={step === i ? "step" : undefined}
            onClick={() => setStep(i)}
          >
            <small>{String(i + 1).padStart(2, "0")}</small>
            {label}
          </button>
        ))}
      </div>
      <div className="case-stage" key={step}>
        <h3>
          {String(step + 1).padStart(2, "0")} · {stages[step]}
        </h3>
        {step === 0 && (
          <>
            <p>
              每行的 index day = 3 × (ID−1)。训练：day
              0–237；验证：270–357；测试：390–477。两个 30
              天间隔让前一段最后一例的结果窗在下一段开始前成熟；观测截止 day
              507，让测试标签也完整。相同客户没有跨集；真实多次就诊数据还要按患者或部署目的处理
              group。
            </p>
            <ol>
              <li>先冻结目标、正类、预测时刻、可用特征和 label horizon。</li>
              <li>
                切分后只在 80 条训练记录 fit mean/std；验证和测试复用它们。
              </li>
              <li>
                主选择指标是验证 log loss；同时报告 threshold 下
                precision/recall 和混淆矩阵。
              </li>
              <li>
                保存 seed=2026、split 边界、模型设置、搜索 seed=41 与实验记录。
              </li>
            </ol>
            {showRows(caseSplit.train.slice(0, 5))}
            <a
              className="practice-button"
              download="atlas-cohort-case.csv"
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            >
              下载 160 行合成数据 CSV
            </a>
          </>
        )}
        {step === 1 && (
          <>
            <p>
              先看 constant prevalence：每个人都输出训练正例比例。再训练带 L2 的
              Logistic Regression，并加入标准化后的 kNN。这里的概率基线用于 log
              loss；按 0.5 阈值分类时等价于多数类预测。
            </p>
            <div className="practice-table">
              <table>
                <thead>
                  <tr>
                    <th>Baseline</th>
                    <th>Train loss</th>
                    <th>Validation loss</th>
                    <th>Validation recall</th>
                  </tr>
                </thead>
                <tbody>
                  {[trials[0], trials[1], trials[15]].map((t) => (
                    <tr key={t.id}>
                      <td>
                        {t.model.name} · {t.model.setting}
                      </td>
                      <td>
                        {evaluateCase(t.model, caseSplit.train).loss.toFixed(3)}
                      </td>
                      <td>{t.validation.loss.toFixed(3)}</td>
                      <td>{percent(t.validation.recall)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Logistic 用 full-batch gradient descent 350 步：grad =
              mean((p−y)x) + λw，bias 不惩罚。kNN 用 (正邻居数+1)/(k+2) 的
              Laplace smoothing，避免概率为 0/1 导致无限 log loss；所有 split
              使用同一规则。
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <p>
              12 组 logistic 随机搜索：η ∼ log-uniform(0.01, 0.316)，λ ∼
              log-uniform(10⁻⁴, 0.1)。另比较
              k∈&#123;1,3,5,9,15&#125;。当前默认选验证 log loss
              最小者；你可以检查其他候选。固定 350
              步是本例的计算预算，真实训练还要检查收敛。
            </p>
            <div className="practice-table">
              <table>
                <thead>
                  <tr>
                    <th>选择</th>
                    <th>模型 / 参数</th>
                    <th>Validation loss ↓</th>
                  </tr>
                </thead>
                <tbody>
                  {trials.map((t) => (
                    <tr
                      key={t.id}
                      className={t.id === selected ? "case-selected" : ""}
                    >
                      <td>
                        <input
                          type="radio"
                          aria-label={`选择实验 ${t.id + 1}`}
                          name="case-model"
                          disabled={revealed}
                          checked={t.id === selected}
                          onChange={() => setSelected(t.id)}
                        />
                      </td>
                      <td>
                        {t.model.name}
                        <small>{t.model.setting}</small>
                      </td>
                      <td>
                        {t.validation.loss.toFixed(4)}{" "}
                        {t.id === best.id ? "← 本轮最小" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              搜索空间也是一种假设。只使用验证集选模型；不要看测试分数再扩大搜索。小样本验证噪声较大，本例不用于判断哪种算法普遍更好。
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <p>
              保持 split、算法、超参数、训练步数一致，去掉 support tickets
              后从头拟合。这样才能将变化归因于这一项输入，而不是同时换模型和训练预算。这里展示诊断结果，最终测试沿用原始双特征模型。
            </p>
            <div className="budget-numbers">
              <div>
                <span>完整特征 · validation loss</span>
                <strong>{validation.loss.toFixed(4)}</strong>
              </div>
              <div>
                <span>去掉 tickets · validation loss</span>
                <strong>{ablation.loss.toFixed(4)}</strong>
              </div>
              <div>
                <span>消融 − 完整</span>
                <strong>{(ablation.loss - validation.loss).toFixed(4)}</strong>
              </div>
            </div>
            <p>
              {trial.model.family === "constant"
                ? "常数基线不使用任何特征，所以消融不会改变它。"
                : ablation.loss > validation.loss
                  ? "本次消融使验证 loss 变差，提示 tickets 对这个数据和设置有用；这不是因果效应证据。"
                  : "本次消融没有使验证 loss 变差。样本噪声、优化或特征冗余都可能造成此结果，不能仅凭一次实验断言该特征永远无用。"}{" "}
              正式实验需多个种子和适合独立抽样单位的区间估计。
            </p>
          </>
        )}
        {step === 4 && (
          <>
            <p>
              检查 false positives 与 false
              negatives。低阈值通常增加召回，也增加误报；阈值应由成本和验证数据决定，然后冻结。不要借错误分析把测试标签带回特征工程。
            </p>
            <label className="case-threshold">
              分类阈值 Threshold <output>{threshold.toFixed(2)}</output>
              <input
                aria-label="案例分类阈值"
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                disabled={revealed}
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              />
            </label>
            <div className="budget-numbers">
              <div>
                <span>Precision</span>
                <strong>{percent(validation.precision)}</strong>
              </div>
              <div>
                <span>Recall</span>
                <strong>{percent(validation.recall)}</strong>
              </div>
              <div>
                <span>FP / FN</span>
                <strong>
                  {validation.fp} / {validation.fn}
                </strong>
              </div>
            </div>
            {showRows(mistakes.slice(0, 8))}
            <p>
              显示前 {Math.min(8, mistakes.length)} / {mistakes.length}{" "}
              个验证错误。进一步按
              recency、tickets、时间与数据来源分层；每层报告样本量。小组没有正例时
              recall 未定义，不能当作 0 或 100%。
            </p>
          </>
        )}
        {step === 5 && (
          <>
            <p>
              冻结：{trial.model.name}，{trial.model.setting}，threshold=
              {threshold.toFixed(2)}
              。点击后锁定模型和阈值，独立测试只用于报告；若据此修改方案，就需要新的独立测试数据。本例没有在
              train+validation 上重训，所有预测仍来自 train-only 模型。
            </p>
            {!revealed ? (
              <button
                className="practice-button primary"
                onClick={() => setRevealed(true)}
              >
                冻结方案，查看一次测试结果
              </button>
            ) : (
              test && (
                <div aria-live="polite">
                  <div className="budget-numbers">
                    <div>
                      <span>Test log loss</span>
                      <strong>{test.loss.toFixed(4)}</strong>
                    </div>
                    <div>
                      <span>Accuracy</span>
                      <strong>{percent(test.accuracy)}</strong>
                    </div>
                    <div>
                      <span>Precision / Recall</span>
                      <strong>
                        {percent(test.precision)} / {percent(test.recall)}
                      </strong>
                    </div>
                  </div>
                  <p>
                    30 位客户：TP={test.tp}，TN={test.tn}，FP={test.fp}，FN=
                    {test.fn}
                    。这是固定合成数据的实际计算，不是临床或产品效果证据。只看
                    30 个样本的点估计不够，正式报告还应给区间并做跨 cohort
                    验证。
                  </p>
                  <p>
                    部署后继续记录
                    schema、输入缺失率、预测分布、延迟标签、分组性能和校准。给数据、模型与评估都打版本；明确何时回滚、何时重新收集标签。
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
      <div className="practice-links">
        <button
          className="practice-button"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          ← 上一步
        </button>
        <span>{step + 1} / 6</span>
        <button
          className="practice-button"
          disabled={step === 5}
          onClick={() => setStep(step + 1)}
        >
          下一步 →
        </button>
      </div>
      <p className="practice-note">
        教学实例在浏览器内真实计算。刷新可重新体验，但这不产生新的独立测试集。全数据下载包含标签，适合复现，不承担访问隔离。
      </p>
      <div className="practice-links">
        <a
          href="https://jmlr.org/papers/v13/bergstra12a.html"
          target="_blank"
          rel="noreferrer"
        >
          Random Search 原论文 ↗
        </a>
        <a
          href="https://scikit-learn.org/stable/common_pitfalls.html"
          target="_blank"
          rel="noreferrer"
        >
          Pipeline 与数据泄漏 ↗
        </a>
        <a
          href="https://scikit-learn.org/stable/modules/cross_validation.html"
          target="_blank"
          rel="noreferrer"
        >
          切分与评估文档 ↗
        </a>
      </div>
    </section>
  );
}

export default function PracticeHub() {
  const [tab, setTab] = useState<"case" | "diagnostic" | "language">("case");
  return (
    <main className="practice-page page-gutter">
      <header className="practice-page-header">
        <div className="practice-eyebrow">THE PRACTICE WORKBENCH</div>
        <h1>从懂原理，到做对实验。</h1>
        <p>
          计算中间值，比较算法，再把模型放回完整工作流程。每节课程末尾也有两道可交互练习。
        </p>
      </header>
      <div className="practice-tabs practice-main-tabs">
        {(
          [
            { id: "case", title: "01 · 完整实验案例" },
            { id: "diagnostic", title: "02 · 训练诊断树" },
            { id: "language", title: "03 · LM 显存与形状" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div hidden={tab !== "case"}>
        <PracticalCase />
      </div>
      <div hidden={tab !== "diagnostic"}>
        <DiagnosticTree />
      </div>
      <div hidden={tab !== "language"}>
        <LanguageBudgetLab />
      </div>
      <section className="practice-sandboxes">
        <h2>
          五个手算沙盘 <span>Numeric sandboxes</span>
        </h2>
        <div>
          {[
            ["knn", "kNN · 距离与投票"],
            ["expectation-maximization", "EM · 责任度与均值"],
            ["attention", "Attention · 分数到输出"],
            ["ppo", "PPO · 带符号的裁剪"],
            ["cohort-design", "Cohort · 时间窗与泄漏"],
          ].map(([id, title]) => (
            <a key={id} href={`#/lesson/${id}?sandbox=1`}>
              {title}
              <span>逐步计算 →</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
