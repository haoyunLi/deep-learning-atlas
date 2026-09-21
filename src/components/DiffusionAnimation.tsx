import { useId } from "react";

type DiffusionAnimationProps = { step: number };

type NoiseDot = { x: number; y: number; r: number; light: boolean };

function makeNoise(seed: number, count: number): NoiseDot[] {
  let value = seed;
  const random = () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };

  return Array.from({ length: count }, () => ({
    x: 5 + random() * 160,
    y: 5 + random() * 102,
    r: 1.1 + random() * 3.2,
    light: random() > 0.52,
  }));
}

const forwardNoise = makeNoise(17, 108);
const predictedNoise = makeNoise(41, 55);
const sampleNoise = makeNoise(83, 75);

function NoiseField({
  dots,
  opacity = 1,
  scale = 1,
}: {
  dots: NoiseDot[];
  opacity?: number;
  scale?: number;
}) {
  return (
    <g className="diffusion-noise" opacity={opacity}>
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={dot.r * scale}
          fill={dot.light ? "#ffffff" : "#264457"}
          opacity={dot.light ? 0.95 : 0.78}
        />
      ))}
    </g>
  );
}

function HouseScene({
  x,
  y,
  width,
  height,
  sceneOpacity = 1,
  noise,
  noiseOpacity = 0,
  generated = false,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  sceneOpacity?: number;
  noise?: NoiseDot[];
  noiseOpacity?: number;
  generated?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${width / 170} ${height / 112})`}>
      <rect width="170" height="112" rx="11" fill="#e6eff2" />
      <g opacity={sceneOpacity}>
        <rect x="1" y="1" width="168" height="74" rx="10" fill="#dbeef0" />
        <circle cx={generated ? 137 : 132} cy="25" r="12" fill="#f3c66c" />
        <path d="M0 82 Q31 61 65 79 T135 76 T170 79 V112 H0Z" fill="#9ccab5" />
        <path d="M0 94 Q32 83 61 91 T122 87 T170 96 V112 H0Z" fill="#74b4a3" />
        <rect
          x={generated ? 55 : 52}
          y="57"
          width="66"
          height="46"
          rx="3"
          fill="#fff8e9"
        />
        <path
          d={generated ? "M48 59 L88 29 L127 59Z" : "M45 59 L85 32 L124 59Z"}
          fill={generated ? "#dd8266" : "#d76e62"}
        />
        <rect
          x={generated ? 83 : 79}
          y="78"
          width="18"
          height="25"
          rx="2"
          fill="#528b8a"
        />
        <rect x="60" y="67" width="13" height="12" rx="2" fill="#78b8c1" />
        <path d="M66.5 67 V79 M60 73 H73" stroke="#f8f8e9" strokeWidth="1.5" />
      </g>
      {noise && <NoiseField dots={noise} opacity={noiseOpacity} />}
      <rect
        x="0.75"
        y="0.75"
        width="168.5"
        height="110.5"
        rx="10"
        fill="none"
        stroke="#96b9be"
        strokeWidth="1.5"
      />
    </g>
  );
}

function NoiseTile({
  x,
  y,
  width,
  height,
  dots,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  dots: NoiseDot[];
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${width / 170} ${height / 112})`}>
      <rect width="170" height="112" rx="11" fill="#b7cbd0" />
      <NoiseField dots={dots} scale={1.5} />
      <rect
        x="0.75"
        y="0.75"
        width="168.5"
        height="110.5"
        rx="10"
        fill="none"
        stroke="#839fa9"
        strokeWidth="1.5"
      />
    </g>
  );
}

const cards = [
  {
    number: "01",
    title: "干净样本",
    english: "Training data · x₀",
    caption: "取一张训练图像",
  },
  {
    number: "02",
    title: "逐步加噪",
    english: "Forward · q(xₜ | x₀)",
    caption: "随机取 t，按日程加噪",
  },
  {
    number: "03",
    title: "预测噪声",
    english: "Network · εθ(xₜ, t)",
    caption: "学习估计加入的 ε",
  },
  {
    number: "04",
    title: "反复去噪",
    english: "Sampling · xT → x̂₀",
    caption: "从新噪声生成样本",
  },
];

/** An illustrative DDPM process; this diagram does not display actual model predictions. */
export default function DiffusionAnimation({ step }: DiffusionAnimationProps) {
  const titleId = useId();
  const descId = useId();
  const activeStep = Math.max(
    0,
    Math.min(3, Math.round(Number.isFinite(step) ? step : 0)),
  );

  return (
    <div
      className="diffusion-animation-scroll"
      tabIndex={0}
      style={{ width: "100%", minWidth: 0, overflowX: "auto" }}
    >
      <svg
        className="diffusion-animation"
        viewBox="0 0 876 326"
        width="100%"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        style={{ minWidth: 600, display: "block" }}
      >
        <title id={titleId}>Diffusion 扩散模型的四阶段示意</title>
        <desc id={descId}>
          训练时，从干净样本 x 零出发，逐步加入噪声得到 x t；网络读取 x t
          和时间步 t，估计噪声。 采样时，从新的随机噪声 x T
          开始，多次使用网络预测并逐步去噪，得到新的样本。
          图中的房屋和噪点只用于解释机制，不是真实模型输出，也不表示一步完成去噪。
        </desc>
        <style>{`
          .diffusion-animation { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
          .diffusion-animation .diffusion-card { opacity: .7; transition: opacity .5s ease, transform .5s ease; transform-box: fill-box; transform-origin: center; }
          .diffusion-animation .diffusion-card.is-active { opacity: 1; transform: translateY(-3px); }
          .diffusion-animation .diffusion-card-outline { fill: #fffdf8; stroke: #cad9dc; stroke-width: 1.5; transition: fill .5s ease, stroke .5s ease, stroke-width .5s ease; }
          .diffusion-animation .is-active .diffusion-card-outline { fill: #f7fcfb; stroke: #16888b; stroke-width: 2.5; }
          .diffusion-animation .diffusion-progress { transition: opacity .5s ease; }
          .diffusion-animation .diffusion-noise { transform-box: fill-box; transform-origin: center; }
          .diffusion-animation .is-active .diffusion-noise { animation: diffusion-grain 2.6s ease-in-out infinite alternate; }
          @keyframes diffusion-grain { to { transform: translate(1.5px, -1px); opacity: .82; } }
          @media (prefers-reduced-motion: reduce) {
            .diffusion-animation .diffusion-card,
            .diffusion-animation .diffusion-card-outline,
            .diffusion-animation .diffusion-progress { transition: none; }
            .diffusion-animation .is-active .diffusion-noise { animation: none; }
          }
        `}</style>

        <text
          x="13"
          y="26"
          fill="#3c6e75"
          fontSize="13"
          fontWeight="700"
          letterSpacing=".05em"
        >
          训练 / TRAINING
        </text>
        <path
          d="M147 22 H620"
          stroke="#c5dbd9"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
        <text
          x="654"
          y="26"
          fill="#3c6e75"
          fontSize="13"
          fontWeight="700"
          letterSpacing=".05em"
        >
          生成 / SAMPLING
        </text>

        {cards.map((card, index) => {
          const x = 10 + index * 216;
          return (
            <g
              key={card.number}
              className={`diffusion-card${activeStep === index ? " is-active" : ""}`}
            >
              <rect
                className="diffusion-card-outline"
                x={x}
                y="42"
                width="202"
                height="239"
                rx="16"
              />
              <text
                x={x + 16}
                y="69"
                fill="#137d84"
                fontSize="12"
                fontWeight="800"
              >
                {card.number}
              </text>
              <text
                x={x + 42}
                y="70"
                fill="#223d48"
                fontSize="18"
                fontWeight="750"
              >
                {card.title}
              </text>
              <text x={x + 16} y="91" fill="#5a777b" fontSize="12.5">
                {card.english}
              </text>

              {index === 0 && (
                <HouseScene x={x + 16} y={103} width={170} height={112} />
              )}
              {index === 1 && (
                <HouseScene
                  x={x + 16}
                  y={103}
                  width={170}
                  height={112}
                  sceneOpacity={0.37}
                  noise={forwardNoise}
                  noiseOpacity={0.95}
                />
              )}
              {index === 2 && (
                <g>
                  <HouseScene
                    x={x + 16}
                    y={122}
                    width={45}
                    height={66}
                    sceneOpacity={0.35}
                    noise={forwardNoise}
                    noiseOpacity={0.85}
                  />
                  <path
                    d={`M${x + 64} 155 H${x + 76}`}
                    stroke="#6c969a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${x + 76} 155 l-5 -4 M${x + 76} 155 l-5 4`}
                    stroke="#6c969a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect
                    x={x + 79}
                    y="125"
                    width="54"
                    height="61"
                    rx="12"
                    fill="#dbeee9"
                    stroke="#79b7ae"
                    strokeWidth="1.6"
                  />
                  <path
                    d={`M${x + 89} 138 Q${x + 106} 130 ${x + 123} 138 M${x + 89} 173 Q${x + 106} 181 ${x + 123} 173`}
                    fill="none"
                    stroke="#9cc9c0"
                    strokeWidth="2"
                  />
                  <text
                    x={x + 106}
                    y="161"
                    textAnchor="middle"
                    fill="#126b72"
                    fontSize="19"
                    fontWeight="750"
                  >
                    εθ
                  </text>
                  <path
                    d={`M${x + 136} 155 H${x + 148}`}
                    stroke="#6c969a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${x + 148} 155 l-5 -4 M${x + 148} 155 l-5 4`}
                    stroke="#6c969a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <NoiseTile
                    x={x + 151}
                    y={122}
                    width={35}
                    height={66}
                    dots={predictedNoise}
                  />
                  <text
                    x={x + 38}
                    y="203"
                    textAnchor="middle"
                    fill="#668086"
                    fontSize="11"
                  >
                    xₜ + t
                  </text>
                  <text
                    x={x + 167}
                    y="203"
                    textAnchor="middle"
                    fill="#668086"
                    fontSize="11"
                  >
                    ε̂
                  </text>
                </g>
              )}
              {index === 3 && (
                <g>
                  <NoiseTile
                    x={x + 16}
                    y={123}
                    width={46}
                    height={64}
                    dots={sampleNoise}
                  />
                  <path
                    d={`M${x + 65} 155 H${x + 76} m-4 -4 4 4 -4 4`}
                    fill="none"
                    stroke="#78a7aa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <HouseScene
                    x={x + 79}
                    y={123}
                    width={46}
                    height={64}
                    sceneOpacity={0.64}
                    noise={forwardNoise}
                    noiseOpacity={0.55}
                    generated
                  />
                  <path
                    d={`M${x + 128} 155 H${x + 139} m-4 -4 4 4 -4 4`}
                    fill="none"
                    stroke="#78a7aa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <HouseScene
                    x={x + 142}
                    y={123}
                    width={44}
                    height={64}
                    generated
                  />
                  <text
                    x={x + 39}
                    y="203"
                    textAnchor="middle"
                    fill="#668086"
                    fontSize="11"
                  >
                    xT
                  </text>
                  <text
                    x={x + 102}
                    y="203"
                    textAnchor="middle"
                    fill="#668086"
                    fontSize="11"
                  >
                    …
                  </text>
                  <text
                    x={x + 164}
                    y="203"
                    textAnchor="middle"
                    fill="#668086"
                    fontSize="11"
                  >
                    x̂₀
                  </text>
                </g>
              )}

              <path
                d={`M${x + 16} 226 H${x + 186}`}
                stroke="#e0e9e8"
                strokeWidth="1"
              />
              <text
                x={x + 16}
                y="251"
                fill="#344f56"
                fontSize="12.5"
                fontWeight="600"
              >
                {card.caption}
              </text>
              <rect
                className="diffusion-progress"
                x={x + 16}
                y="264"
                width="170"
                height="4"
                rx="2"
                fill={activeStep === index ? "#1b9894" : "#dce9e7"}
              />
            </g>
          );
        })}

        {[212, 428, 644].map((x) => (
          <path
            key={x}
            d={`M${x} 150 l5 7 -5 7`}
            fill="none"
            stroke="#75a7a5"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <text x="12" y="308" fill="#5e777b" fontSize="12.5">
          示意 / Schematic ·
          每次反向迭代只去掉一部分噪声；新生成的样本不必等于训练图像。
        </text>
      </svg>
    </div>
  );
}
