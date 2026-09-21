type AttentionAnimationProps = { step: number };

const tokens = [
  { text: "我", index: "1", x: 78, center: 153 },
  { text: "喜欢", index: "2", x: 305, center: 380 },
  { text: "猫", index: "3", x: 532, center: 607 },
];

const ink = "#14284b";
const muted = "#60708b";
const blue = "#245fbd";
const teal = "#087f85";
const amber = "#a76b13";

/** A single-query, causal self-attention example. Scores are chosen for teaching. */
export default function AttentionAnimation({ step }: AttentionAnimationProps) {
  const current = Math.max(0, Math.min(3, Math.round(step)));
  const stage = (index: number) => ({
    className: "attn-viz-stage",
    style: { opacity: current === index ? 1 : 0 },
    "aria-hidden": current !== index,
  });

  return (
    <div
      className="attn-viz-scroll"
      tabIndex={0}
      style={{ width: "100%", overflowX: "auto" }}
    >
      <svg
        className="attn-viz-svg"
        style={{ minWidth: 560 }}
        viewBox="0 0 760 420"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`以“我 喜欢 猫”为例，当前位置“喜欢”的因果自注意力，第 ${current + 1} 步：${["Q K V 投影", "缩放点积分数与未来词遮罩", "softmax 注意力权重", "对 Value 加权求和"][current]}。图中数值只是教学示例。`}
      >
        <style>{`
          .attn-viz-svg { display: block; width: 100%; height: auto; font-family: Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; }
          .attn-viz-stage { transition: opacity .45s ease; pointer-events: none; }
          .attn-viz-flow { stroke-dasharray: 7 5; animation: attn-viz-dash 1.8s linear infinite; }
          @keyframes attn-viz-dash { to { stroke-dashoffset: -24; } }
          @media (prefers-reduced-motion: reduce) {
            .attn-viz-stage { transition: none; }
            .attn-viz-flow { animation: none; }
          }
        `}</style>
        <rect
          x="1"
          y="1"
          width="758"
          height="418"
          rx="13"
          fill="#f8fbff"
          stroke="#d6dfe9"
        />

        <text
          x="30"
          y="33"
          fill={blue}
          fontSize="12"
          fontWeight="750"
          letterSpacing="1.3"
        >
          SCALED DOT-PRODUCT ATTENTION
        </text>
        <text
          x="728"
          y="33"
          fill={muted}
          fontSize="12"
          textAnchor="end"
          fontWeight="650"
        >
          {String(current + 1).padStart(2, "0")} / 04
        </text>

        {tokens.map((token, index) => (
          <g key={token.index}>
            <rect
              x={token.x}
              y="58"
              width="150"
              height="86"
              rx="10"
              fill={index === 1 ? "#e8f1ff" : "#fff"}
              stroke={index === 1 ? blue : "#c9d6e6"}
              strokeWidth={index === 1 ? "2" : "1.3"}
            />
            <text
              x={token.center}
              y="96"
              textAnchor="middle"
              fill={ink}
              fontSize="24"
              fontWeight="700"
            >
              {token.text}
            </text>
            <text
              x={token.center}
              y="124"
              textAnchor="middle"
              fill={index === 1 ? blue : muted}
              fontSize="12"
              fontWeight="650"
            >
              {index === 1 ? "当前 query · position 2" : `token ${token.index}`}
            </text>
          </g>
        ))}

        <line x1="30" y1="160" x2="730" y2="160" stroke="#d6dfe9" />

        <g {...stage(0)}>
          <text x="40" y="189" fill={ink} fontSize="16" fontWeight="700">
            ① 每个输入分别映射为 Q / K / V
          </text>
          {tokens.map((token, index) => {
            const colors = [blue, amber, teal];
            return (
              <g key={token.index}>
                <path
                  className="attn-viz-flow"
                  d={`M ${token.center} 197 V 213`}
                  fill="none"
                  stroke={index === 1 ? blue : "#9cb0c9"}
                  strokeWidth="1.7"
                />
                {["Q", "K", "V"].map((letter, chipIndex) => {
                  const x = token.x + 5 + chipIndex * 49;
                  const color = colors[chipIndex];
                  const isQuery = index === 1 && chipIndex === 0;
                  return (
                    <g key={letter}>
                      <rect
                        x={x}
                        y="215"
                        width="43"
                        height="39"
                        rx="7"
                        fill={isQuery ? "#dceaff" : "#fff"}
                        stroke={color}
                        strokeWidth={isQuery ? "2.2" : "1.2"}
                      />
                      <text
                        x={x + 21.5}
                        y="240"
                        textAnchor="middle"
                        fill={color}
                        fontSize="15"
                        fontWeight="750"
                      >
                        {letter}
                        {["₁", "₂", "₃"][index]}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
          <text
            x="380"
            y="293"
            textAnchor="middle"
            fill={ink}
            fontSize="16"
            fontWeight="700"
          >
            Qᵢ = xᵢW_Q　 ·　 Kᵢ = xᵢW_K　 ·　 Vᵢ = xᵢW_V
          </text>
          <text x="380" y="324" textAnchor="middle" fill={muted} fontSize="14">
            只取“喜欢”的 Q₂，去询问所有可见位置的 K；再取对应的 V。
          </text>
        </g>

        <g {...stage(1)}>
          <text x="40" y="189" fill={ink} fontSize="16" fontWeight="700">
            ② Q₂ 与每个 K 点积并除以 √dₖ；未来词先设为 −∞
          </text>
          {["我", "喜欢", "猫"].map((word, index) => {
            const x = 78 + index * 227;
            const blocked = index === 2;
            return (
              <g key={word}>
                <rect
                  x={x}
                  y="215"
                  width="150"
                  height="91"
                  rx="9"
                  fill={blocked ? "#f2f5f9" : "#fff"}
                  stroke={blocked ? "#b7c2d0" : "#a9c3e8"}
                  strokeWidth="1.4"
                  strokeDasharray={blocked ? "5 4" : undefined}
                />
                <text
                  x={x + 75}
                  y="241"
                  textAnchor="middle"
                  fill={muted}
                  fontSize="13"
                >
                  Q₂ · K{["₁", "₂", "₃"][index]} / √dₖ
                </text>
                <text
                  x={x + 75}
                  y="278"
                  textAnchor="middle"
                  fill={blocked ? muted : blue}
                  fontSize="27"
                  fontWeight="750"
                >
                  {blocked ? "−∞" : index === 0 ? "1.0" : "0.5"}
                </text>
              </g>
            );
          })}
          <text x="380" y="337" textAnchor="middle" fill={muted} fontSize="14">
            Causal mask：位置 2 看不到未来的“猫”；遮罩发生在 softmax 之前。
          </text>
        </g>

        <g {...stage(2)}>
          <text x="40" y="189" fill={ink} fontSize="16" fontWeight="700">
            ③ Softmax 把分数变成和为 1 的权重
          </text>
          {[
            { word: "我", value: 0.622, color: blue },
            { word: "喜欢", value: 0.378, color: teal },
            { word: "猫", value: 0, color: "#9caab9" },
          ].map((item, index) => {
            const y = 223 + index * 47;
            return (
              <g key={item.word}>
                <text
                  x="82"
                  y={y + 17}
                  fill={ink}
                  fontSize="16"
                  fontWeight="650"
                >
                  {item.word}
                </text>
                <rect
                  x="181"
                  y={y}
                  width="400"
                  height="24"
                  rx="5"
                  fill="#e9eff6"
                />
                <rect
                  x="181"
                  y={y}
                  width={400 * item.value}
                  height="24"
                  rx="5"
                  fill={item.color}
                />
                <text
                  x="606"
                  y={y + 18}
                  fill={item.value ? item.color : muted}
                  fontSize="16"
                  fontWeight="750"
                >
                  {item.value.toFixed(3)}
                </text>
              </g>
            );
          })}
          <text x="380" y="384" textAnchor="middle" fill={muted} fontSize="14">
            softmax([1.0, 0.5, −∞]) ≈ [0.622, 0.378, 0]
          </text>
        </g>

        <g {...stage(3)}>
          <text x="40" y="189" fill={ink} fontSize="16" fontWeight="700">
            ④ 用权重加权 V，得到位置 2 的新表示
          </text>
          {[
            { label: "0.622 × V我", y: 213, color: blue },
            { label: "0.378 × V喜欢", y: 260, color: teal },
            { label: "0 × V猫（遮罩）", y: 307, color: muted },
          ].map((item) => (
            <g key={item.label}>
              <rect
                x="83"
                y={item.y}
                width="229"
                height="37"
                rx="7"
                fill="#fff"
                stroke={item.color}
                strokeWidth="1.3"
              />
              <text
                x="197"
                y={item.y + 24}
                textAnchor="middle"
                fill={item.color}
                fontSize="16"
                fontWeight="700"
              >
                {item.label}
              </text>
              <path
                className="attn-viz-flow"
                d={`M 318 ${item.y + 18} H 443`}
                fill="none"
                stroke={item.color}
                strokeWidth="1.7"
              />
            </g>
          ))}
          <path
            d="M 446 231 l -8 -5 v 10 Z M 446 278 l -8 -5 v 10 Z M 446 325 l -8 -5 v 10 Z"
            fill="#8ea6c4"
          />
          <rect
            x="471"
            y="233"
            width="208"
            height="105"
            rx="10"
            fill="#e8f1ff"
            stroke={blue}
            strokeWidth="1.7"
          />
          <text
            x="575"
            y="263"
            textAnchor="middle"
            fill={muted}
            fontSize="13"
            fontWeight="650"
          >
            输出 · o₂
          </text>
          <text
            x="575"
            y="294"
            textAnchor="middle"
            fill={blue}
            fontSize="18"
            fontWeight="750"
          >
            Σ α₂ⱼ Vⱼ
          </text>
          <text x="575" y="318" textAnchor="middle" fill={ink} fontSize="14">
            带上下文的“喜欢”
          </text>
          <text x="380" y="383" textAnchor="middle" fill={muted} fontSize="14">
            V 是内容向量；输出是它们的加权和，不是选中单个词。
          </text>
        </g>

        <text x="380" y="408" textAnchor="middle" fill={muted} fontSize="11">
          示例分数仅用于演示计算，并非真实模型训练得到的注意力权重。
        </text>
      </svg>
    </div>
  );
}
