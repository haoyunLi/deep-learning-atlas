import { useEffect, useMemo, useState } from "react";
import {
  defaultArenaConfig,
  runArena,
  type ArenaConfig,
  type ArenaDataset,
  type ArenaResult,
} from "../../studio/arenaMath";
import { visitStudioTool } from "../../studio/studioState";
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
        budget
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
    setConfig(draft);
    setTestUnlocked(false);
  };

  return (
    <StudioShell
      route="/studio/arena"
      eyebrow="ALGORITHM ARENA · 跨算法竞技场"
      title="同一数据，同一切分，同一预算。"
      english="Compare inductive biases under a controlled experiment."
      intro="五种算法在相同的二维分类任务上实际训练。训练集拟合标准化参数，验证集选型；分布偏移后的测试集保持锁定，直到你明确揭晓。"
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
              训练预算 Budget <strong>{draft.budget}</strong>
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
              value={draft.seed}
              onChange={(event) =>
                setNumber("seed", Number(event.target.value) || 1)
              }
            />
          </label>
          <button className="studio-primary-button" onClick={run}>
            重新训练五个模型 →
          </button>
          <p className="arena-split-note">
            <StatusDot tone="blue" />
            Train {config.trainSize} · Validation 120 · Test 160
          </p>
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
          <dl>
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
          <span>{testUnlocked ? "TEST REVEALED" : "LOCKED TEST SET"}</span>
        </div>
        <h2>
          {testUnlocked
            ? "测试集已经揭晓。不要再用它调参。"
            : "先写下你选择的模型与理由，再看测试结果。"}
        </h2>
        <p>
          {testUnlocked
            ? `分布偏移强度 ${config.shift.toFixed(2)}；请比较 validation 与 test 的落差。`
            : "测试集含未用于选型的分布偏移。揭晓会重新训练相同配置并只增加一次测试评估。"}
        </p>
        {!testUnlocked && (
          <button
            className="studio-primary-button"
            onClick={() => setTestUnlocked(true)}
          >
            冻结选择并揭晓 Test →
          </button>
        )}
      </section>
    </StudioShell>
  );
}
