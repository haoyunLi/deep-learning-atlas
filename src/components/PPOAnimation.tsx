type PPOAnimationProps = { step: number };

const ink = "#14284b";
const muted = "#60708b";
const blue = "#245fbd";
const teal = "#178a83";
const orange = "#c16b20";

const stepLabels = [
  "旧策略采样动作，估计优势 A；示例动作 a₁ 的旧概率为 0.40，优势为正 1",
  "新策略给同一动作的概率为 0.52，概率比 r 为 0.52 除以 0.40，等于 1.30",
  "正优势下 PPO-Clip 的代理目标为 min(rA, clip(r, 0.8, 1.2)A)；r 为 1.30 时目标值为 1.20",
  "优化后用更新的策略重新采样，继续估计优势并训练；clip 限制代理目标的激励，不硬性保证策略参数或概率的变化幅度",
];

function Tag({
  x,
  y,
  width,
  children,
  accent = blue,
}: {
  x: number;
  y: number;
  width: number;
  children: string;
  accent?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height="30"
        rx="15"
        fill={`${accent}12`}
        stroke={`${accent}38`}
      />
      <text
        x={x + width / 2}
        y={y + 20}
        textAnchor="middle"
        fill={accent}
        fontSize="13"
        fontWeight="700"
      >
        {children}
      </text>
    </g>
  );
}

function ProbabilityBar({
  x,
  value,
  label,
  selected = false,
  color = blue,
}: {
  x: number;
  value: number;
  label: string;
  selected?: boolean;
  color?: string;
}) {
  const barHeight = value * 150;
  return (
    <g>
      <rect
        x={x}
        y={213 - barHeight}
        width="88"
        height={barHeight}
        rx="8"
        fill={selected ? color : "#bdcce1"}
      />
      <text
        x={x + 44}
        y={202 - barHeight}
        textAnchor="middle"
        fill={selected ? color : muted}
        fontSize="20"
        fontWeight="700"
      >
        {value.toFixed(2)}
      </text>
      <text
        x={x + 44}
        y="241"
        textAnchor="middle"
        fill={ink}
        fontSize="14"
        fontWeight={selected ? "700" : "500"}
      >
        {label}
      </text>
    </g>
  );
}

export default function PPOAnimation({ step }: PPOAnimationProps) {
  const activeStep = Math.max(
    0,
    Math.min(3, Math.round(Number.isFinite(step) ? step : 0)),
  );
  const panelClass = (index: number) =>
    `ppo-panel${activeStep === index ? " is-active" : ""}`;

  return (
    <div
      className="ppo-animation-scroll"
      tabIndex={0}
      role="region"
      aria-label="PPO 机制图（可横向滚动）"
      style={{ width: "100%", minWidth: 0, overflowX: "auto" }}
    >
      <svg
        viewBox="0 0 760 356"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`PPO-Clip 步骤 ${activeStep + 1}：${stepLabels[activeStep]}`}
        style={{
          display: "block",
          width: "100%",
          minWidth: 600,
          height: "auto",
          overflow: "visible",
        }}
      >
        <style>{`
        .ppo-panel { opacity: 0; transform: translateY(7px); transition: opacity 350ms ease, transform 350ms ease; pointer-events: none; }
        .ppo-panel.is-active { opacity: 1; transform: translateY(0); }
        .ppo-pulse { animation: ppo-emphasis 1.9s ease-in-out infinite; transform-origin: center; }
        @keyframes ppo-emphasis { 0%, 100% { opacity: 1; } 50% { opacity: .53; } }
        @media (prefers-reduced-motion: reduce) {
          .ppo-panel { transition: none; transform: none; }
          .ppo-pulse { animation: none; }
        }
      `}</style>
        <rect
          x="1"
          y="1"
          width="758"
          height="354"
          rx="18"
          fill="#f8fbff"
          stroke="#d9e5f2"
          strokeWidth="2"
        />
        <text x="30" y="37" fill={ink} fontSize="18" fontWeight="750">
          PPO · Clipped Surrogate
        </text>
        <text x="730" y="37" textAnchor="end" fill={muted} fontSize="13">
          数值示意 · illustrative values
        </text>
        <line x1="30" y1="50" x2="730" y2="50" stroke="#d9e5f2" />

        <g className={panelClass(0)} aria-hidden={activeStep !== 0}>
          <text x="54" y="83" fill={ink} fontSize="17" fontWeight="700">
            ① 用旧策略 π_old 与环境交互
          </text>
          <text x="54" y="107" fill={muted} fontSize="13">
            同一状态 s 下的动作概率分布
          </text>
          <line
            x1="55"
            y1="213"
            x2="349"
            y2="213"
            stroke="#9db1cb"
            strokeWidth="2"
          />
          <ProbabilityBar x={96} value={0.4} label="a₁ · 已采样" selected />
          <ProbabilityBar x={224} value={0.6} label="a₂" />
          <path d="M380 174H493" stroke={blue} strokeWidth="2.5" fill="none" />
          <path d="m493 174-9-6v12z" fill={blue} />
          <rect
            x="512"
            y="111"
            width="190"
            height="132"
            rx="14"
            fill="#fff"
            stroke="#b8cbe6"
          />
          <text x="607" y="145" textAnchor="middle" fill={muted} fontSize="13">
            采样后估计优势
          </text>
          <text
            x="607"
            y="186"
            textAnchor="middle"
            fill={teal}
            fontSize="29"
            fontWeight="750"
          >
            A(a₁) = +1
          </text>
          <text x="607" y="217" textAnchor="middle" fill={muted} fontSize="12">
            此动作比基线更好
          </text>
          <Tag x={55} y={284} width={235}>
            π_old(a₁ | s) = 0.40
          </Tag>
          <text x="307" y="304" fill={muted} fontSize="13">
            固定这批旧策略数据，进入本轮优化
          </text>
        </g>

        <g className={panelClass(1)} aria-hidden={activeStep !== 1}>
          <text x="54" y="83" fill={ink} fontSize="17" fontWeight="700">
            ② 比较同一动作在新旧策略下的概率
          </text>
          <text x="54" y="107" fill={muted} fontSize="13">
            分母来自采样时的旧策略；分子随当前参数更新
          </text>
          <rect
            x="72"
            y="143"
            width="202"
            height="95"
            rx="14"
            fill="#fff"
            stroke="#b8cbe6"
          />
          <text x="173" y="174" textAnchor="middle" fill={muted} fontSize="13">
            旧策略 · π_old(a₁ | s)
          </text>
          <text
            x="173"
            y="212"
            textAnchor="middle"
            fill={blue}
            fontSize="31"
            fontWeight="750"
          >
            0.40
          </text>
          <path d="M290 190H444" stroke={blue} strokeWidth="2.5" fill="none" />
          <path d="m444 190-9-6v12z" fill={blue} />
          <rect
            x="460"
            y="143"
            width="202"
            height="95"
            rx="14"
            fill="#fff"
            stroke="#a8d7d3"
          />
          <text x="561" y="174" textAnchor="middle" fill={muted} fontSize="13">
            新策略 · π_θ(a₁ | s)
          </text>
          <text
            x="561"
            y="212"
            textAnchor="middle"
            fill={teal}
            fontSize="31"
            fontWeight="750"
          >
            0.52
          </text>
          <Tag x={168} y={276} width={425} accent={teal}>
            r(θ) = π_θ / π_old = 0.52 / 0.40 = 1.30
          </Tag>
        </g>

        <g className={panelClass(2)} aria-hidden={activeStep !== 2}>
          <text x="54" y="83" fill={ink} fontSize="17" fontWeight="700">
            ③ 正优势的代理目标在 1 + ε 处变平
          </text>
          <text x="54" y="106" fill={muted} fontSize="13">
            A = +1，ε = 0.20；纵轴为单样本 clipped surrogate L
          </text>
          <line
            x1="104"
            y1="255"
            x2="678"
            y2="255"
            stroke="#92a8c2"
            strokeWidth="2"
          />
          <path d="m678 255-8-5v10z" fill="#92a8c2" />
          <line
            x1="104"
            y1="255"
            x2="104"
            y2="114"
            stroke="#92a8c2"
            strokeWidth="2"
          />
          <path d="m104 114-5 8h10z" fill="#92a8c2" />
          <text x="699" y="260" fill={muted} fontSize="12">
            r
          </text>
          <text x="95" y="105" textAnchor="end" fill={muted} fontSize="12">
            L
          </text>
          <line
            x1="445"
            y1="120"
            x2="445"
            y2="256"
            stroke="#9db1cb"
            strokeDasharray="4 5"
          />
          <line
            x1="502"
            y1="120"
            x2="502"
            y2="256"
            stroke="#c16b20"
            strokeDasharray="4 5"
          />
          <path
            d="M104 235L445 139L674 139"
            stroke={blue}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M445 139L502 123"
            stroke={orange}
            strokeWidth="2.5"
            strokeDasharray="5 5"
            fill="none"
          />
          <circle cx="502" cy="123" r="6" fill={orange} />
          <circle
            className="ppo-pulse"
            cx="502"
            cy="139"
            r="7"
            fill={blue}
            stroke="#fff"
            strokeWidth="2"
          />
          <text x="445" y="276" textAnchor="middle" fill={muted} fontSize="12">
            1.20
          </text>
          <text
            x="502"
            y="276"
            textAnchor="middle"
            fill={orange}
            fontSize="12"
            fontWeight="700"
          >
            1.30
          </text>
          <text x="533" y="119" fill={orange} fontSize="12">
            未截取 rA = 1.30
          </text>
          <text x="533" y="158" fill={blue} fontSize="12" fontWeight="700">
            代理目标 = 1.20
          </text>
          <text x="134" y="193" fill={blue} fontSize="12">
            继续鼓励提高概率
          </text>
          <Tag x={120} y={298} width={520}>
            min(rA, clip(r, 0.8, 1.2)A) = min(1.30, 1.20) = 1.20
          </Tag>
        </g>

        <g className={panelClass(3)} aria-hidden={activeStep !== 3}>
          <text x="54" y="83" fill={ink} fontSize="17" fontWeight="700">
            ④ 优化后，再用更新的策略采样
          </text>
          <text x="54" y="107" fill={muted} fontSize="13">
            下一轮重新收集轨迹、估计优势、计算概率比
          </text>
          <rect
            x="61"
            y="145"
            width="174"
            height="89"
            rx="14"
            fill="#fff"
            stroke="#b8cbe6"
          />
          <text x="148" y="176" textAnchor="middle" fill={muted} fontSize="13">
            本轮更新的策略
          </text>
          <text
            x="148"
            y="211"
            textAnchor="middle"
            fill={teal}
            fontSize="25"
            fontWeight="750"
          >
            π_θ
          </text>
          <path d="M245 190H321" stroke={blue} strokeWidth="2.5" fill="none" />
          <path d="m321 190-9-6v12z" fill={blue} />
          <rect
            x="337"
            y="145"
            width="174"
            height="89"
            rx="14"
            fill="#fff"
            stroke="#b8cbe6"
          />
          <text x="424" y="176" textAnchor="middle" fill={muted} fontSize="13">
            环境 · 下一批轨迹
          </text>
          <text
            x="424"
            y="211"
            textAnchor="middle"
            fill={ink}
            fontSize="22"
            fontWeight="700"
          >
            s, a, r
          </text>
          <path d="M521 190H582" stroke={blue} strokeWidth="2.5" fill="none" />
          <path d="m582 190-9-6v12z" fill={blue} />
          <rect
            x="599"
            y="145"
            width="111"
            height="89"
            rx="14"
            fill="#fff"
            stroke="#b8cbe6"
          />
          <text x="655" y="176" textAnchor="middle" fill={muted} fontSize="13">
            重估优势
          </text>
          <text
            x="655"
            y="211"
            textAnchor="middle"
            fill={teal}
            fontSize="23"
            fontWeight="750"
          >
            A
          </text>
          <rect
            x="61"
            y="269"
            width="649"
            height="51"
            rx="11"
            fill="#fff5e9"
            stroke="#f0cf9f"
          />
          <text
            x="385"
            y="290"
            textAnchor="middle"
            fill="#8b531d"
            fontSize="13"
            fontWeight="700"
          >
            注意：clip 限制代理目标的激励
          </text>
          <text
            x="385"
            y="308"
            textAnchor="middle"
            fill="#8b531d"
            fontSize="12"
          >
            并非对策略参数或真实策略概率变化的硬性约束
          </text>
        </g>
      </svg>
    </div>
  );
}
