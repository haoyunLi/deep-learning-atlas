import { useEffect, useMemo, useState } from "react";
import {
  defaultArenaConfig,
  runArena,
  arenaModelSettings,
  type ArenaAlgorithm,
  type ArenaConfig,
  type ArenaDataset,
  type ArenaResult,
} from "../../studio/arenaMath";
import { visitStudioTool } from "../../studio/studioState";
import { arenaDataKey, readArenaExposures, saveArenaExposures, type ArenaExposure } from "../../studio/arenaEvidence";
import { StudioSectionTitle, StudioShell, StatusDot } from "./StudioShell";

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function color(probability: number) {
  if (probability >= 0.5) {
    const opacity = 0.08 + (probability - 0.5) * 0.34;
    return `rgba(36,95,189,${opacity.toFixed(3)})`;
  }
  const opacity = 0.08 + (0.5 - probability) * 0.34;
  return `rgba(181,76,54,${opacity.toFixed(3)})`;
}

function DecisionPlot({
  result,
  points,
}: {
  result: ArenaResult;
  points: ReturnType<typeof runArena>["points"];
}) {
  const toX = (value: number) => 20 + ((value + 2.4) / 4.8) * 500;
  const toY = (value: number) => 420 - ((value + 2.1) / 4.2) * 400;
  const cell = 500 / 24;
  return (
    <svg
      className="arena-plot"
      viewBox="0 0 540 440"
      role="img"
      aria-label={`${result.label} 决策边界，蓝色点为正类，红色点为负类`}
    >
      <rect
        x="20"
        y="20"
        width="500"
        height="400"
        fill="#fff"
        stroke="#bfcbd9"
      />
      <g className="arena-boundary">
        {result.boundary.map((item, index) => (
          <rect
            key={index}
            x={toX(item.x) - cell / 2}
            y={toY(item.y) - cell / 2}
            width={cell + 0.8}
            height={cell + 0.8}
            fill={color(item.probability)}
          />
        ))}
      </g>
      <g className="arena-grid">
        <path d="M20 120h500M20 220h500M20 320h500M145 20v400M270 20v400M395 20v400" />
      </g>
      <g>
        {points
          .filter((point) => point.split !== "test")
          .map((point, index) => (
            <circle
              key={`${point.split}-${index}`}
              cx={toX(point.x[0])}
              cy={toY(point.x[1])}
              r={point.split === "validation" ? 4.1 : 3.2}
              fill={point.y ? "#245fbd" : "#b54c36"}
              stroke={point.split === "validation" ? "#fff" : "none"}
              strokeWidth="1.6"
              opacity={point.split === "validation" ? 0.96 : 0.68}
            />
          ))}
      </g>
      <text x="24" y="437">
        x₁
      </text>
      <text x="5" y="24">
        x₂
      </text>
    </svg>
  );
}

function LearningCurve({ result }: { result: ArenaResult }) {
  const maxStep = Math.max(...result.curve.map((point) => point.step), 1);
  const points = result.curve
    .map(
      (point) =>
        `${28 + (point.step / maxStep) * 290},${150 - ((point.balancedAccuracy - 0.4) / 0.6) * 120}`,
    )
    .join(" ");
  return (
    <svg
      className="arena-curve"
      viewBox="0 0 340 180"
      role="img"
      aria-label={`${result.label} 验证集 balanced accuracy 学习曲线`}
    >
      <path
        className="curve-grid"
        d="M28 30h290M28 70h290M28 110h290M28 150h290M28 20v130"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#245fbd"
        strokeWidth="2.5"
      />
      {result.curve.map((point) => (
        <circle
          key={point.step}
          cx={28 + (point.step / maxStep) * 290}
          cy={150 - ((point.balancedAccuracy - 0.4) / 0.6) * 120}
          r="3.5"
          fill="#fff"
          stroke="#245fbd"
          strokeWidth="2"
        />
      ))}
      <text x="28" y="169">
        0
      </text>
      <text x="296" y="169">
        {result.curve[result.curve.length - 1]?.step}
      </text>
      <text x="3" y="34">
        1.0
      </text>
      <text x="3" y="153">
        .4
      </text>
    </svg>
  );
}

export default function AlgorithmArena() {
  const [draft, setDraft] = useState<ArenaConfig>(defaultArenaConfig);
  const [config, setConfig] = useState<ArenaConfig>(defaultArenaConfig);
  const [selectedId, setSelectedId] = useState("boosting");
  const [testUnlocked, setTestUnlocked] = useState(false);
  const [exposures, setExposures] = useState<ArenaExposure[]>(readArenaExposures);
  const [reason, setReason] = useState("");
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const dataKey = arenaDataKey(config);
  const previousExposure = exposures.find((item) => item.dataKey === dataKey);
  const settings = arenaModelSettings(config);
  const seedValid = Number.isSafeInteger(draft.seed) && draft.seed >= 0 && draft.seed <= 4294967295;
  const arena = useMemo(
    () => runArena(config, testUnlocked),
    [config, testUnlocked],
  );
  const selected =
    arena.results.find((result) => result.id === selectedId) ||
    arena.results[0];

  useEffect(() => {
    visitStudioTool("arena");
  }, []);

  const setNumber = (key: keyof ArenaConfig, value: number) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const run = () => {
    if (!seedValid) return;
    setConfig({ ...draft });
    setTestUnlocked(false);
    setReason("");
  };
  const reveal = () => {
    if (!reason.trim()) return;
    const next = [...exposures, { dataKey, model: selected.id as ArenaAlgorithm, reason: reason.trim(), budget: config.budget, revealedAt: Date.now() }];
    setExposures(next);
    setStorageUnavailable(!saveArenaExposures(next));
    setTestUnlocked(true);
  };

  return (
    <StudioShell
      route="/studio/arena"
      eyebrow="ALGORITHM ARENA · 跨算法竞技场"
      title="同一数据，同一切分，明确模型设置。"
      english="Compare inductive biases under a controlled experiment."
      intro="五种教学算法使用相同二维合成数据与切分。训练集拟合标准化参数，验证集选型；各模型的更新步数、树桩数和 k 分别公开，未控制相同 FLOPs、时间或调参次数。"
    >
      <div className="arena-layout">
        <aside className="arena-controls">
          <StudioSectionTitle
            index="01"
            title="实验控制"
            english="Experiment controls"
          />
          <label>
            <span>数据形状 Dataset</span>
            <select
              value={draft.dataset}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  dataset: event.target.value as ArenaDataset,
                }))
              }
            >
              <option value="moons">弯月 Moons</option>
              <option value="circles">同心圆 Circles</option>
              <option value="shift">斜向边界 Shift</option>
            </select>
          </label>
          <label>
            <span>
              训练样本 <strong>{draft.trainSize}</strong>
            </span>
            <input
              type="range"
              min="60"
              max="300"
              step="20"
              value={draft.trainSize}
              onChange={(event) =>
                setNumber("trainSize", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span>
              噪声 Noise <strong>{draft.noise.toFixed(2)}</strong>
            </span>
            <input
              type="range"
              min="0.02"
              max="0.42"
              step="0.02"
              value={draft.noise}
              onChange={(event) =>
                setNumber("noise", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span>
              正类比例 <strong>{percent(draft.imbalance)}</strong>
            </span>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={draft.imbalance}
              onChange={(event) =>
                setNumber("imbalance", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span>
              测试偏移 Shift <strong>{draft.shift.toFixed(2)}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="1.2"
              step="0.1"
              value={draft.shift}
              onChange={(event) =>
                setNumber("shift", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span>
              设置倍率 Setting scale <strong>{draft.budget}</strong>
            </span>
            <input
              type="range"
              min="4"
              max="24"
              step="2"
              value={draft.budget}
              onChange={(event) =>
                setNumber("budget", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span>随机种子 Seed</span>
            <input
              type="number"
              min="0"
              max="4294967295"
              step="1"
              aria-invalid={!seedValid}
              value={Number.isFinite(draft.seed) ? draft.seed : ""}
              onChange={(event) =>
                setNumber("seed", event.target.valueAsNumber)
              }
            />
          </label>
          {!seedValid && <p role="status">Seed 请输入 0–4294967295 的整数。</p>}
          <button className="studio-primary-button" onClick={run} disabled={!seedValid}>
            重新训练五个模型 →
          </button>
          <p className="arena-split-note">
            <StatusDot tone="blue" />
            Train {config.trainSize} · Validation 120 · Test 160
          </p>
          <p className="arena-settings-note">设置倍率同时改变不同模型的不同参数。它不代表相等的计算预算。</p>
        </aside>

        <section className="arena-evidence">
          <StudioSectionTitle
            index="02"
            title="决策边界"
            english="Decision surface"
            note={selected.label}
          />
          <DecisionPlot result={selected} points={arena.points} />
          <div className="arena-legend">
            <span>
              <i className="negative" />
              负类 class 0
            </span>
            <span>
              <i className="positive" />
              正类 class 1
            </span>
            <span>
              <i className="validation" />
              白边为 validation
            </span>
          </div>
        </section>

        <aside className="arena-inspector">
          <StudioSectionTitle index="03" title="证据" english="Evidence" />
          <h3>
            {selected.label}
            <span>{selected.family}</span>
          </h3>
          <div className="arena-score">
            <span>VALIDATION BALANCED ACCURACY</span>
            <strong>{percent(selected.validation.balancedAccuracy)}</strong>
          </div>
          <LearningCurve result={selected} />
          <p className="arena-settings-note">横轴：{selected.curveUnit}。kNN 只有当前 k 的一个验证点，不表示训练曲线。</p>
          <dl>
            <div><dt>ACTUAL SETTINGS</dt><dd>{selected.settings}</dd></div>
            <div>
              <dt>COMPUTE</dt>
              <dd>{selected.cost}</dd>
            </div>
            <div>
              <dt>HOW TO TUNE</dt>
              <dd>{selected.tuning}</dd>
            </div>
            <div>
              <dt>FAILURE MODE</dt>
              <dd>{selected.failureMode}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <section className="arena-table-section">
        <details className="arena-settings"><summary>本轮五个模型的实际设置</summary><ul>{Object.entries(settings).map(([id, item]) => <li key={id}><strong>{id}</strong>：{item.value} {item.unit} · {item.detail}</li>)}</ul><p>树模型采用单层树桩，不能代表完整 Random Forest / Gradient Boosting 的实现与性能。</p></details>
        <StudioSectionTitle
          index="04"
          title="模型比较"
          english="Model comparison"
          note="按 validation balanced accuracy 排序"
        />
        <div className="arena-table" role="table" aria-label="模型验证结果比较">
          <div className="arena-table-row arena-table-head" role="row">
            <span>MODEL</span>
            <span>BAL ACC</span>
            <span>LOG LOSS</span>
            <span>FPR</span>
            <span>FNR</span>
            <span>TEST</span>
          </div>
          {arena.results.map((result, index) => (
            <button
              role="row"
              key={result.id}
              className={selected.id === result.id ? "active" : ""}
              onClick={() => setSelectedId(result.id)}
            >
              <span role="cell">
                <i>{String(index + 1).padStart(2, "0")}</i>
                <strong>{result.label}</strong>
                <small>{result.family}</small>
              </span>
              <span role="cell">
                {percent(result.validation.balancedAccuracy)}
              </span>
              <span role="cell">{result.validation.logLoss.toFixed(3)}</span>
              <span role="cell">
                {percent(result.validation.falsePositiveRate)}
              </span>
              <span role="cell">
                {percent(result.validation.falseNegativeRate)}
              </span>
              <span role="cell">
                {result.test ? percent(result.test.balancedAccuracy) : "LOCKED"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={`test-lock ${testUnlocked ? "unlocked" : ""}`}>
        <div>
          <StatusDot tone={testUnlocked ? "green" : "orange"} />
          <span>{testUnlocked ? "TEST REVEALED" : previousExposure ? "PREVIOUSLY EXPOSED TEST" : "TEST RESULTS HIDDEN"}</span>
        </div>
        <h2>
          {testUnlocked
            ? "测试集已经揭晓。不要再用它调参。"
            : previousExposure ? "这份测试数据曾揭晓，不能恢复为未见测试集。"
            : "先写下你选择的模型与理由，再看测试结果。"}
        </h2>
        <p>
          {testUnlocked
            ? `分布偏移强度 ${config.shift.toFixed(2)}；请比较 validation 与 test 的落差。`
            : previousExposure ? "重新训练只隐藏当前结果。后续查看属于探索；要做独立评估，请使用新的、未参与选型的数据。换一个合成 seed 也不能替代外部验证。" : "测试指标默认隐藏；数据由固定 seed 在浏览器生成，隐藏不是安全隔离。先记录模型和理由，揭晓后保留暴露历史。"}
        </p>
        {previousExposure && <p>首次记录：{previousExposure.model} · 设置倍率 {previousExposure.budget} · 理由：{previousExposure.reason}。当前数据共揭晓 {exposures.filter((item) => item.dataKey === dataKey).length} 次。</p>}
        {exposures.length > 0 && <p>本浏览器累计记录 {exposures.length} 次揭晓；改变配置或重新训练不会清除它们。{storageUnavailable ? "本机存储不可用；当前会话保留记录，刷新后可能丢失。" : "记录保存在本机浏览器，清除浏览器数据会丢失。"}</p>}
        {!testUnlocked && (
          <>
          <label className="arena-choice-reason">当前选择：{selected.label}。用 validation 说明理由<input type="text" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
          <button
            className="studio-primary-button"
            onClick={reveal}
            disabled={!reason.trim()}
          >
            记录当前选择并揭晓 Test →
          </button>
          </>
        )}
      </section>
    </StudioShell>
  );
}
