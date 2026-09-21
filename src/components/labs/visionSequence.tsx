import type { LabDefinition, LabProps } from "./types";
import { LabCanvas, VizArrow, VizNode, VizText } from "./LabCanvas";

const blue = "#245fbd";
const teal = "#087f85";
const amber = "#b57718";
const ink = "#183251";
const muted = "#60708b";
const pale = "#e7eef8";
const colors = [
  blue,
  teal,
  amber,
  "#945baf",
  "#bd596f",
  "#497745",
  "#7971ca",
  "#277f9e",
];
const fmt = (n: number) => n.toFixed(2);
const opacity = (step: number, at: number) => (step >= at ? 1 : 0.24);
const softmax = (xs: number[]) => {
  const es = xs.map((x) => Math.exp(x - Math.max(...xs)));
  const total = es.reduce((a, b) => a + b, 0);
  return es.map((x) => x / total);
};

function Cell({
  x,
  y,
  size = 34,
  value,
  fill = pale,
  border = "#c7d4e6",
}: {
  x: number;
  y: number;
  size?: number;
  value?: string | number;
  fill?: string;
  border?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={size - 2}
        height={size - 2}
        rx={4}
        fill={fill}
        stroke={border}
      />
      {value !== undefined && (
        <VizText
          x={x + (size - 2) / 2}
          y={y + size * 0.62}
          size={12}
          anchor="middle"
          fill={ink}
        >
          {value}
        </VizText>
      )}
    </g>
  );
}

function Convolution({ step, value }: LabProps) {
  const input = [
    [1, 1, 0, 0],
    [1, 2, 1, 0],
    [0, 1, 2, 1],
    [0, 0, 1, 1],
  ];
  const pos = Math.round(value),
    row = Math.floor(pos / 3),
    col = pos % 3;
  const kernel = [
    [1, -1],
    [1, -1],
  ];
  const outputs = Array.from({ length: 9 }, (_, p) => {
    const r = Math.floor(p / 3),
      c = p % 3;
    return (
      input[r][c] - input[r][c + 1] + input[r + 1][c] - input[r + 1][c + 1]
    );
  });
  return (
    <LabCanvas
      label={`2×2 convolution at row ${row + 1}, column ${col + 1}; output ${outputs[pos]}`}
    >
      <VizText x={34} y={35} weight={700}>
        共享 kernel 在图像上滑动
      </VizText>
      <VizText x={38} y={72} size={14}>
        Input 4 × 4
      </VizText>
      {input.flatMap((r, i) =>
        r.map((v, j) => (
          <Cell
            key={`${i}-${j}`}
            x={38 + j * 38}
            y={88 + i * 38}
            size={38}
            value={v}
            fill={
              i >= row && i < row + 2 && j >= col && j < col + 2
                ? "#bcd4f8"
                : pale
            }
          />
        )),
      )}
      <rect
        x={35 + col * 38}
        y={85 + row * 38}
        width={79}
        height={79}
        fill="none"
        stroke={blue}
        strokeWidth={3}
        rx={6}
      />
      <g opacity={opacity(step, 1)}>
        <VizText x={270} y={72} size={14}>
          Kernel 2 × 2
        </VizText>
        {kernel.flatMap((r, i) =>
          r.map((v, j) => (
            <Cell
              key={`${i}-${j}`}
              x={275 + j * 38}
              y={108 + i * 38}
              size={38}
              value={v}
              fill="#c3e5df"
            />
          )),
        )}
        <VizArrow x1={205} y1={159} x2={264} y2={159} active={step === 1} />
      </g>
      <g opacity={opacity(step, 2)}>
        <VizArrow x1={365} y1={159} x2={447} y2={159} active={step === 2} />
        <VizText x={478} y={72} size={14}>
          Output 3 × 3
        </VizText>
        {outputs.map((v, p) => (
          <Cell
            key={p}
            x={482 + (p % 3) * 38}
            y={108 + Math.floor(p / 3) * 38}
            size={38}
            value={v}
            fill={p === pos ? "#a8d9cf" : pale}
            border={p === pos ? teal : undefined}
          />
        ))}
      </g>
      <VizText
        x={38}
        y={282}
        size={15}
        fill={blue}
      >{`${input[row][col]}×1 + ${input[row][col + 1]}×(−1) + ${input[row + 1][col]}×1 + ${input[row + 1][col + 1]}×(−1) = ${outputs[pos]}`}</VizText>
      <VizText x={38} y={315} size={13} fill={muted}>
        {step === 3
          ? "同一组权重产生整张 feature map；边缘方向决定响应正负。"
          : "滑块选择窗口位置；stride = 1、padding = 0、bias = 0。"}
      </VizText>
    </LabCanvas>
  );
}

function Residual({ step, value }: LabProps) {
  const base = [1, 0.5, 1.5],
    delta = [0.4, -0.3, 0.2],
    out = base.map((v, i) => v + value * delta[i]);
  return (
    <LabCanvas label={`Residual addition y = x + alpha F(x), alpha ${value}`}>
      <VizText x={28} y={34} weight={700}>
        把需要的修正加回原特征
      </VizText>
      <VizNode
        x={32}
        y={116}
        width={128}
        label="x"
        sublabel="原始 representation"
        active={step === 0}
      />
      <path
        d="M 160 145 V 67 H 511 V 133"
        fill="none"
        stroke={blue}
        strokeWidth={3}
      />
      <VizText x={270} y={60} size={13} fill={blue}>
        identity shortcut
      </VizText>
      <VizArrow x1={161} y1={145} x2={218} y2={145} active={step === 1} />
      <VizNode
        x={222}
        y={116}
        width={155}
        label="α · F(x)"
        sublabel={`α = ${fmt(value)}`}
        active={step === 1}
      />
      <VizArrow x1={380} y1={145} x2={490} y2={145} active={step === 2} />
      <circle
        cx={511}
        cy={145}
        r={20}
        fill="#e0f0ec"
        stroke={teal}
        strokeWidth={2}
      />
      <VizText x={511} y={152} size={24} anchor="middle">
        +
      </VizText>
      <VizArrow x1={533} y1={145} x2={584} y2={145} active={step === 3} />
      <VizText x={617} y={152} size={22} anchor="middle">
        y
      </VizText>
      {[base, delta.map((v) => v * value), out].map((series, j) => (
        <g key={j}>
          {series.map((v, i) => (
            <g key={i}>
              <rect
                x={54 + j * 223 + i * 43}
                y={265 - Math.max(v, 0) * 40}
                width={29}
                height={Math.abs(v) * 40}
                rx={3}
                fill={colors[j]}
                opacity={opacity(step, j === 0 ? 0 : j === 1 ? 1 : 2)}
              />
              <VizText
                x={68 + j * 223 + i * 43}
                y={289}
                size={11}
                anchor="middle"
              >
                {fmt(v)}
              </VizText>
            </g>
          ))}
          <VizText x={115 + j * 223} y={316} size={13} anchor="middle">
            {["x", "αF(x)", "x + αF(x)"][j]}
          </VizText>
        </g>
      ))}
    </LabCanvas>
  );
}

function UNet({ step, value }: LabProps) {
  const coarse = [0.1, 0.1, 0.4, 0.7, 0.7, 0.4, 0.1, 0.1],
    edge = [0, 0.2, -0.2, 0.2, 0.2, -0.2, 0.2, 0];
  const plot = (xs: number[], x: number, y: number, color: string) => (
    <polyline
      points={xs.map((v, i) => `${x + i * 18},${y - v * 52}`).join(" ")}
      fill="none"
      stroke={color}
      strokeWidth={3}
    />
  );
  return (
    <LabCanvas
      label={`U-Net concatenates encoder edge features, displayed skip amplitude ${value}`}
    >
      <VizText x={28} y={32} weight={700}>
        U-Net：同尺度细节沿 skip 返回 decoder
      </VizText>
      <rect x={42} y={72} width={88} height={92} fill="#d7e5f8" stroke={blue} />
      <rect
        x={179}
        y={150}
        width={64}
        height={61}
        fill="#bcd4f8"
        stroke={blue}
      />
      <rect
        x={299}
        y={216}
        width={98}
        height={39}
        fill="#8fb7ed"
        stroke={blue}
      />
      <VizArrow x1={132} y1={147} x2={177} y2={176} active={step === 0} />
      <VizArrow x1={245} y1={204} x2={298} y2={233} active={step === 1} />
      <rect
        x={451}
        y={150}
        width={64}
        height={61}
        fill="#c6e4dc"
        stroke={teal}
      />
      <rect
        x={568}
        y={72}
        width={40}
        height={92}
        fill="#9bd4c5"
        stroke={teal}
      />
      <rect
        x={610}
        y={72}
        width={40}
        height={92}
        fill={blue}
        opacity={0.12 + 0.7 * value}
      />
      <VizArrow x1={399} y1={233} x2={449} y2={194} active={step === 2} />
      <VizArrow x1={517} y1={177} x2={566} y2={145} active={step === 2} />
      <path
        d="M 130 98 H 556"
        fill="none"
        stroke={amber}
        strokeWidth={2 + 4 * value}
        strokeDasharray="7 5"
        opacity={opacity(step, 2)}
      />
      <VizText x={331} y={86} size={12} anchor="middle" fill={amber}>
        copy → concatenate channels
      </VizText>
      <VizText x={87} y={188} size={12} anchor="middle">
        H × W × C
      </VizText>
      <VizText x={612} y={186} size={12} anchor="middle">
        H × W × 2C
      </VizText>
      <VizText x={41} y={284} size={12}>
        粗语义
      </VizText>
      {plot(coarse, 110, 300, teal)}
      <VizText x={280} y={284} size={12}>
        skip 细节
      </VizText>
      {plot(
        edge.map((v) => v * value),
        365,
        300,
        blue,
      )}
      <g opacity={opacity(step, 3)}>
        <VizArrow x1={611} y1={191} x2={611} y2={229} active={step === 3} />
        <VizText x={611} y={248} size={12} anchor="middle">
          1×1 pixel head
        </VizText>
        {coarse.map((v, i) => (
          <rect
            key={i}
            x={549 + i * 16}
            y={263}
            width={14}
            height={25}
            rx={2}
            fill={teal}
            opacity={0.15 + 0.8 * v}
          />
        ))}
        <VizText x={611} y={306} size={11} anchor="middle">
          逐像素输出（示意）
        </VizText>
      </g>
      <VizText x={28} y={336} size={13} fill={muted}>
        拼接保留两组 channels，再由 Conv 学习融合；滑块只缩放示意 skip 信号。
      </VizText>
    </LabCanvas>
  );
}

function RNN({ step, value }: LabProps) {
  const xs = [1, 0, 0, 0];
  let h = 0;
  const hs = xs.map((x) => {
    h = Math.tanh(x + value * h);
    return h;
  });
  return (
    <LabCanvas
      label={`Scalar RNN unrolls across four steps with recurrent weight ${value}`}
    >
      <VizText x={28} y={34} weight={700}>
        同一组权重，把过去压进 hidden state
      </VizText>
      {hs.map((state, i) => (
        <g key={i} opacity={i <= step ? 1 : 0.25}>
          {i > 0 && (
            <VizArrow
              x1={133 + (i - 1) * 166}
              y1={138}
              x2={49 + i * 166}
              y2={138}
              active={i === step}
            />
          )}
          <circle
            cx={91 + i * 166}
            cy={138}
            r={40}
            fill="#edf3fb"
            stroke={blue}
            strokeWidth={i === step ? 3 : 1}
          />
          <circle
            cx={91 + i * 166}
            cy={138}
            r={state * 34}
            fill={blue}
            opacity={0.5}
          />
          <VizText x={91 + i * 166} y={143} anchor="middle" size={13}>
            h{i + 1}
          </VizText>
          <VizArrow
            x1={91 + i * 166}
            y1={214}
            x2={91 + i * 166}
            y2={181}
            active={i === step}
          />
          <VizText
            x={91 + i * 166}
            y={244}
            anchor="middle"
            size={14}
          >{`x${i + 1} = ${xs[i]}`}</VizText>
          <VizText
            x={91 + i * 166}
            y={78}
            anchor="middle"
            size={14}
            fill={blue}
          >
            {fmt(state)}
          </VizText>
        </g>
      ))}
      <VizText x={28} y={296} size={15}>
        hₜ = tanh(xₜ + w · hₜ₋₁), h₀ = 0
      </VizText>
      <VizText
        x={28}
        y={326}
        size={13}
        fill={muted}
      >{`w = ${fmt(value)}；后续输入为 0，观察最初信息如何衰减或被维持。`}</VizText>
    </LabCanvas>
  );
}

function LSTM({ step, value }: LabProps) {
  const old = 0.8,
    write = 0.15,
    retained = value * old,
    next = retained + write;
  return (
    <LabCanvas
      label={`LSTM cell update retains ${fmt(retained)} and writes .15; cell state ${fmt(next)}`}
    >
      <VizText x={28} y={34} weight={700}>
        LSTM：一条记忆主路，三个 gate 管理读写
      </VizText>
      <VizText x={44} y={90} size={15}>
        cₜ₋₁ = 0.80
      </VizText>
      <VizArrow x1={47} y1={130} x2={223} y2={130} active={step === 0} />
      <circle cx={243} cy={130} r={23} fill="#d7e5f8" stroke={blue} />
      <VizText x={243} y={138} size={25} anchor="middle">
        ×
      </VizText>
      <VizArrow x1={267} y1={130} x2={438} y2={130} active={step === 1} />
      <circle cx={461} cy={130} r={23} fill="#d9eee8" stroke={teal} />
      <VizText x={461} y={138} size={25} anchor="middle">
        +
      </VizText>
      <VizArrow x1={486} y1={130} x2={650} y2={130} active={step === 2} />
      <VizText
        x={561}
        y={95}
        size={15}
        fill={teal}
      >{`cₜ = ${fmt(next)}`}</VizText>
      <VizNode
        x={179}
        y={215}
        width={130}
        label={`fₜ = ${fmt(value)}`}
        sublabel="forget gate"
        active={step === 1}
      />
      <VizArrow x1={243} y1={212} x2={243} y2={155} active={step === 1} />
      <VizNode
        x={396}
        y={215}
        width={130}
        label="iₜ · gₜ = 0.15"
        sublabel="write new memory"
        active={step === 2}
      />
      <VizArrow x1={461} y1={212} x2={461} y2={155} active={step === 2} />
      <g opacity={opacity(step, 3)}>
        <VizText
          x={30}
          y={308}
          size={14}
        >{`hₜ = oₜ · tanh(cₜ) = 0.70 × tanh(${fmt(next)}) = ${fmt(0.7 * Math.tanh(next))}`}</VizText>
      </g>
      <VizText x={30} y={336} size={12} fill={muted}>
        fₜ 保留旧记忆；iₜ 控制写入；oₜ 控制读取。GRU 把状态与 gate
        组织得更紧凑。
      </VizText>
    </LabCanvas>
  );
}

function Transformer({ step, value }: LabProps) {
  const causal = value >= 1;
  return (
    <LabCanvas
      label={`${causal ? "Causal" : "Bidirectional"} attention visibility in a Transformer block`}
    >
      <VizText x={28} y={33} weight={700}>
        Transformer block：混合 token，再逐 token 变换
      </VizText>
      <VizText x={44} y={75} size={13}>
        {causal ? "Causal decoder mask" : "Bidirectional encoder mask"}
      </VizText>
      {Array.from({ length: 16 }, (_, i) => {
        const r = Math.floor(i / 4),
          c = i % 4,
          allowed = !causal || c <= r;
        return (
          <Cell
            key={i}
            x={48 + c * 35}
            y={93 + r * 35}
            size={35}
            value={allowed ? "✓" : "×"}
            fill={allowed ? "#bed4f5" : "#f3e1e4"}
          />
        );
      })}
      <VizText x={43} y={257} size={12} fill={muted}>
        行 = Query；列 = Key
      </VizText>
      <VizNode
        x={250}
        y={88}
        width={167}
        label="Self-attention"
        sublabel="跨 token 汇聚"
        active={step === 1}
      />
      <VizNode
        x={484}
        y={88}
        width={167}
        label="Feed-forward"
        sublabel="各位置共享 MLP"
        active={step === 2}
      />
      <VizArrow x1={195} y1={158} x2={248} y2={118} active={step === 0} />
      <VizArrow x1={419} y1={118} x2={482} y2={118} active={step === 2} />
      <path
        d="M 238 121 V 190 H 435 V 122 M 470 122 V 190 H 667 V 121"
        stroke={teal}
        fill="none"
        strokeWidth={2}
      />
      <VizText x={329} y={219} size={12} anchor="middle" fill={teal}>
        residual + normalization
      </VizText>
      <VizText x={569} y={219} size={12} anchor="middle" fill={teal}>
        residual + normalization
      </VizText>
      <g opacity={opacity(step, 3)}>
        <VizText x={250} y={279} size={15} fill={blue}>
          Attention + FFN → 重复堆叠 L 层
        </VizText>
      </g>
      <VizText x={28} y={327} size={13} fill={muted}>
        遮罩改变可读上下文；Pre-LN / Post-LN
        的归一化位置不同，图中省略具体位置。
      </VizText>
    </LabCanvas>
  );
}

function BERT({ step, value }: LabProps) {
  const selected = Math.round(value),
    words = ["这", "只", "猫", "喜欢", "鱼"];
  const cx = 70 + selected * 133;
  return (
    <LabCanvas
      label={`BERT predicts masked token ${words[selected]} using context on both sides`}
    >
      <VizText x={28} y={33} weight={700}>
        BERT MLM：利用两侧上下文，补回被隐藏的词
      </VizText>
      {words.map((word, i) => (
        <g key={word}>
          <rect
            x={29 + i * 133}
            y={83}
            width={83}
            height={44}
            rx={7}
            fill={selected === i ? "#f8e8c5" : pale}
            stroke={selected === i ? amber : blue}
          />
          <VizText x={70 + i * 133} y={111} anchor="middle" size={15}>
            {selected === i ? "[MASK]" : word}
          </VizText>
          {i !== selected && (
            <path
              d={`M ${70 + i * 133} 135 Q ${(70 + i * 133 + cx) / 2} ${185 + Math.abs(i - selected) * 13} ${cx} 225`}
              fill="none"
              stroke={i < selected ? blue : teal}
              strokeWidth={2}
              opacity={opacity(step, 1)}
            />
          )}
        </g>
      ))}
      <g opacity={opacity(step, 2)}>
        <circle cx={cx} cy={236} r={27} fill="#dbe9f9" stroke={blue} />
        <VizText x={cx} y={242} anchor="middle" size={13}>
          hᵢ
        </VizText>
      </g>
      <VizText x={354} y={292} anchor="middle" size={16} fill={teal}>
        {step === 3
          ? `MLM head → 目标标签 “${words[selected]}”`
          : "用 left + right context 构建被遮位置的表示"}
      </VizText>
      <VizText x={28} y={331} size={12} fill={muted}>
        这里演示一个
        [MASK]；原始训练还含随机替换/保持原词，损失只算被选中的目标位置。
      </VizText>
    </LabCanvas>
  );
}

function GPT({ step, value }: LabProps) {
  const probs = softmax([2 / value, 1 / value, 0 / value]);
  const words = ["猫", "狗", "书"];
  let cumulative = 0;
  const draw = 0.72;
  let chosen = 2;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (draw < cumulative) {
      chosen = i;
      break;
    }
  }
  return (
    <LabCanvas
      label={`Autoregressive next token softmax with temperature ${value}; fixed uniform draw .72 selects ${words[chosen]}`}
    >
      <VizText x={28} y={33} weight={700}>
        GPT：只读已有前缀，每次预测下一个 token
      </VizText>
      {["我", "喜欢", "?"].map((w, i) => (
        <g key={i}>
          <VizNode
            x={30 + i * 137}
            y={72}
            width={107}
            height={50}
            label={w}
            sublabel={i === 2 ? "next token" : undefined}
            active={i === step}
          />
          {i < 2 && (
            <VizArrow
              x1={139 + i * 137}
              y1={97}
              x2={164 + i * 137}
              y2={97}
              active={step === 0}
            />
          )}
        </g>
      ))}
      <VizText x={480} y={90} size={14}>
        logits = [2, 1, 0]
      </VizText>
      <VizText
        x={480}
        y={117}
        size={14}
        fill={blue}
      >{`p = softmax(logits / ${fmt(value)})`}</VizText>
      {probs.map((p, i) => (
        <g key={i} opacity={opacity(step, 1)}>
          <VizText x={42} y={181 + i * 39} size={14}>
            {words[i]}
          </VizText>
          <rect
            x={81}
            y={163 + i * 39}
            width={p * 450}
            height={24}
            rx={4}
            fill={colors[i]}
          />
          <VizText
            x={91 + p * 450}
            y={181 + i * 39}
            size={13}
          >{`${(p * 100).toFixed(1)}%`}</VizText>
        </g>
      ))}
      <g opacity={opacity(step, 2)}>
        <VizText
          x={30}
          y={305}
          size={15}
        >{`固定抽样 u = 0.72 → “${words[chosen]}”`}</VizText>
      </g>
      <VizText x={30} y={335} size={13} fill={muted}>
        {step === 3
          ? `追加到前缀：“我 喜欢 ${words[chosen]}” → 再预测下一词。`
          : "Temperature 改变分布锐度；固定随机数让参数影响可复现。词表简化为 3 个词。"}
      </VizText>
    </LabCanvas>
  );
}

function ViT({ step, value }: LabProps) {
  const patch = 2 ** Math.round(value),
    side = 8 / patch,
    count = side * side;
  return (
    <LabCanvas
      label={`ViT splits an 8 by 8 image into ${count} patches of ${patch} by ${patch} pixels`}
    >
      <VizText x={28} y={34} weight={700}>
        ViT：把图像切成 patch，再当成 token 序列
      </VizText>
      {Array.from({ length: 64 }, (_, i) => (
        <rect
          key={i}
          x={35 + (i % 8) * 20}
          y={84 + Math.floor(i / 8) * 20}
          width={20}
          height={20}
          fill={
            Math.abs((i % 8) - 3.5) + Math.abs(Math.floor(i / 8) - 3.5) < 3.5
              ? "#6a9ad8"
              : "#dce6f4"
          }
        />
      ))}
      {Array.from({ length: side + 1 }, (_, i) => (
        <g key={i}>
          <line
            x1={35 + i * patch * 20}
            x2={35 + i * patch * 20}
            y1={84}
            y2={244}
            stroke={ink}
            strokeWidth={2}
          />
          <line
            x1={35}
            x2={195}
            y1={84 + i * patch * 20}
            y2={84 + i * patch * 20}
            stroke={ink}
            strokeWidth={2}
          />
        </g>
      ))}
      <VizText
        x={115}
        y={273}
        anchor="middle"
        size={13}
      >{`8×8 image; P=${patch}`}</VizText>
      <VizArrow x1={211} y1={160} x2={273} y2={160} active={step === 1} />
      <g opacity={opacity(step, 1)}>
        {Array.from({ length: Math.min(count, 16) }, (_, i) => (
          <rect
            key={i}
            x={294 + (i % 4) * 22}
            y={93 + Math.floor(i / 4) * 34}
            width={15}
            height={26}
            rx={3}
            fill={colors[i % 4]}
          />
        ))}
        <VizText
          x={340}
          y={255}
          anchor="middle"
          size={13}
        >{`${count} patch tokens`}</VizText>
      </g>
      <VizArrow x1={393} y1={160} x2={439} y2={160} active={step === 2} />
      <VizNode
        x={443}
        y={114}
        width={220}
        height={87}
        label="Position + Transformer"
        sublabel={`sequence length = ${count} + 1 [CLS]`}
        active={step >= 2}
      />
      <VizText
        x={28}
        y={309}
        size={15}
        fill={blue}
      >{`attention matrix: ${count + 1} × ${count + 1} = ${(count + 1) ** 2} pairs / head`}</VizText>
      <VizText x={28} y={335} size={12} fill={muted}>
        更小 patch 保留更细空间信息，也增加 token 数；图中 +1 使用经典 ViT 的
        [CLS]。
      </VizText>
    </LabCanvas>
  );
}

function GNN({ step, value }: LabProps) {
  const hops = Math.round(value),
    coords = [
      [91, 179],
      [214, 90],
      [218, 250],
      [347, 71],
      [354, 274],
      [472, 166],
      [602, 108],
    ],
    dist = [0, 1, 1, 2, 2, 3, 4],
    features = [1, 2, 0, 4, 2, 5, 1];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [5, 6],
  ];
  let states = features;
  const layers = [states];
  for (let l = 0; l < hops; l++) {
    const previous = states;
    states = previous.map((_, i) => {
      const ns = [
        i,
        ...edges
          .filter((e) => e.includes(i))
          .map((e) => (e[0] === i ? e[1] : e[0])),
      ];
      return ns.reduce((sum, j) => sum + previous[j], 0) / ns.length;
    });
    layers.push(states);
  }
  const visibleLayer = step === 0 ? 0 : step === 1 ? 1 : hops,
    final = layers[Math.min(visibleLayer, hops)];
  return (
    <LabCanvas
      label={`Mean-aggregation GNN: ${hops} hops determines the target node receptive field`}
    >
      <VizText x={28} y={33} weight={700}>
        GNN：沿图边传信息，每层扩大一跳视野
      </VizText>
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={coords[a][0]}
          y1={coords[a][1]}
          x2={coords[b][0]}
          y2={coords[b][1]}
          stroke={
            dist[a] <= visibleLayer && dist[b] <= visibleLayer
              ? blue
              : "#cbd5e2"
          }
          strokeWidth={
            dist[a] <= visibleLayer && dist[b] <= visibleLayer ? 4 : 2
          }
        />
      ))}
      {coords.map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r={i === 0 ? 29 : 24}
            fill={dist[i] <= visibleLayer ? "#c7dcf7" : "#f2f5fa"}
            stroke={i === 0 ? teal : blue}
            strokeWidth={i === 0 ? 4 : 1}
          />
          <VizText x={x} y={y + 5} anchor="middle" size={13}>
            {fmt(final[i])}
          </VizText>
          <VizText x={x} y={y + 43} anchor="middle" size={11} fill={muted}>
            {i === 0 ? "target" : `${dist[i]} hop`}
          </VizText>
        </g>
      ))}
      <VizText
        x={28}
        y={331}
        size={13}
        fill={muted}
      >{`hᵢ ← mean(self + neighbors)；显示第 ${visibleLayer} 层，target = ${fmt(final[0])}。`}</VizText>
    </LabCanvas>
  );
}

function LoRA({ step, value }: LabProps) {
  const rank = Math.round(value);
  const a = [1, -0.5, 0.25, 0.75],
    b = [0.4, 0.2, -0.3, 0.1],
    scale = 1 / rank;
  const update = a.slice(0, rank).reduce((s, v, i) => s + v * b[i], 0) * scale;
  return (
    <LabCanvas
      label={`LoRA rank ${rank}: trainable A ${rank} by 8 and B 8 by ${rank}; ${16 * rank} parameters`}
    >
      <VizText x={28} y={34} weight={700}>
        LoRA：冻结大矩阵，用两个小矩阵学习更新
      </VizText>
      <VizText x={49} y={173} size={24}>
        x
      </VizText>
      <VizArrow x1={70} y1={166} x2={200} y2={94} active={step === 0} />
      <VizArrow x1={70} y1={176} x2={171} y2={235} active={step === 1} />
      <VizNode
        x={210}
        y={66}
        width={245}
        label="W₀ frozen · 8 × 8"
        sublabel="64 frozen parameters"
        active={step === 0}
      />
      <g opacity={opacity(step, 1)}>
        {Array.from({ length: rank }, (_, i) => (
          <rect
            key={i}
            x={175}
            y={197 + i * 16}
            width={115}
            height={12}
            rx={3}
            fill={teal}
          />
        ))}
        <VizText
          x={234}
          y={293}
          anchor="middle"
          size={13}
        >{`A : ${rank} × 8`}</VizText>
      </g>
      <VizArrow x1={304} y1={228} x2={362} y2={228} active={step === 2} />
      <g opacity={opacity(step, 2)}>
        {Array.from({ length: rank }, (_, i) => (
          <rect
            key={i}
            x={376 + i * 16}
            y={194}
            width={12}
            height={72}
            rx={3}
            fill={blue}
          />
        ))}
        <VizText
          x={408}
          y={293}
          anchor="middle"
          size={13}
        >{`B : 8 × ${rank}`}</VizText>
      </g>
      <VizArrow x1={457} y1={96} x2={570} y2={159} active={step === 3} />
      <VizArrow x1={451} y1={228} x2={570} y2={184} active={step === 3} />
      <circle cx={591} cy={172} r={24} fill="#e1eee8" stroke={teal} />
      <VizText x={591} y={180} anchor="middle" size={26}>
        +
      </VizText>
      <VizText
        x={29}
        y={326}
        size={13}
      >{`ΔW = (α/r)BA；α=1；${16 * rank} trainable weights；示例 Δy₁ = ${fmt(update)}`}</VizText>
    </LabCanvas>
  );
}

function PredictionHead({ step, value }: LabProps) {
  const count = Math.round(value),
    features = [0.8, -0.3, 0.6],
    logits = Array.from({ length: count }, (_, i) =>
      features.reduce((s, x, j) => s + x * Math.cos((i + 1) * (j + 1)), 0),
    );
  const ps = softmax(logits);
  return (
    <LabCanvas
      label={`Prediction head projects a 3-dimensional representation to ${count} class logits`}
    >
      <VizText x={28} y={34} weight={700}>
        Prediction head：把表示映射到任务需要的输出
      </VizText>
      <VizText x={48} y={76} size={13}>
        Backbone h ∈ R³
      </VizText>
      {features.map((v, i) => (
        <g key={i}>
          <circle cx={103} cy={118 + i * 69} r={23} fill={colors[i]} />
          <VizText
            x={103}
            y={123 + i * 69}
            size={12}
            anchor="middle"
            fill="white"
          >
            {v}
          </VizText>
        </g>
      ))}
      {ps.map((p, i) => {
        const y = 94 + i * 43;
        return (
          <g key={i} opacity={opacity(step, 1)}>
            {features.map((_, j) => (
              <line
                key={j}
                x1={129}
                y1={118 + j * 69}
                x2={330}
                y2={y + 12}
                stroke={colors[i]}
                strokeWidth={1}
                opacity={0.25}
              />
            ))}
            <circle cx={344} cy={y + 12} r={16} fill={colors[i]} />
            <VizText x={372} y={y + 17} size={12}>
              {fmt(logits[i])}
            </VizText>
            <rect
              x={448}
              y={y}
              width={p * 330}
              height={24}
              rx={3}
              fill={colors[i]}
              opacity={opacity(step, 2)}
            />
            <VizText
              x={461 + p * 330}
              y={y + 16}
              size={12}
            >{`${(p * 100).toFixed(0)}%`}</VizText>
          </g>
        );
      })}
      <VizText x={305} y={63} size={13}>{`${count} logits`}</VizText>
      <VizText x={454} y={63} size={13}>
        softmax probabilities
      </VizText>
      <VizText
        x={28}
        y={331}
        size={13}
        fill={muted}
      >{`W ∈ R${count}×³, b ∈ R${count}；示例 b=0。${step === 3 ? "训练时 CE 比较 logits 与标签，梯度回传 head / backbone。" : "滑块改变类别数，head 的输出宽度与概率归一化一起变化。"}`}</VizText>
    </LabCanvas>
  );
}

function AttentionHeads({ step, value }: LabProps) {
  const heads = 2 ** Math.round(value),
    width = 8 / heads;
  return (
    <LabCanvas
      label={`Multihead attention splits model width 8 into ${heads} heads of width ${width}`}
    >
      <VizText x={28} y={34} weight={700}>
        Attention heads：多个子空间，输出再拼回 d_model
      </VizText>
      <VizText x={29} y={79} size={14}>
        d_model = 8
      </VizText>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={32}
          y={94 + i * 20}
          width={75}
          height={16}
          rx={3}
          fill={colors[Math.floor(i / width)]}
        />
      ))}
      <VizArrow x1={113} y1={170} x2={200} y2={170} active={step === 0} />
      {Array.from({ length: heads }, (_, i) => {
        const y = 83 + i * (184 / heads),
          height = 168 / heads;
        return (
          <g key={i}>
            <rect
              x={210}
              y={y}
              width={225}
              height={Math.max(16, height)}
              rx={4}
              fill={colors[i]}
              opacity={step >= 1 ? 0.85 : 0.3}
            />
            <VizText
              x={322}
              y={y + Math.max(16, height) / 2 + 4}
              size={12}
              fill="white"
              anchor="middle"
            >{`head ${i + 1} · d_head = ${width}`}</VizText>
            <path
              d={`M 438 ${y + height / 2} L 524 ${94 + i * width * 20 + width * 9}`}
              fill="none"
              stroke={colors[i]}
              strokeWidth={2}
              opacity={opacity(step, 2)}
            />
          </g>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={531}
          y={94 + i * 20}
          width={53}
          height={16}
          rx={3}
          fill={colors[Math.floor(i / width)]}
          opacity={opacity(step, 2)}
        />
      ))}
      <VizArrow x1={591} y1={170} x2={633} y2={170} active={step === 3} />
      <VizText x={648} y={165} size={15}>
        Wᴼ
      </VizText>
      <VizText x={647} y={186} size={11}>
        mix
      </VizText>
      <VizText
        x={28}
        y={306}
        size={15}
        fill={blue}
      >{`${heads} heads × ${width} dimensions = 8；Concat(head₁, …, headₕ)Wᴼ`}</VizText>
      <VizText x={28} y={335} size={12} fill={muted}>
        每个 head 各有 Q/K/V 投影与注意力权重；head
        不预先指定“语法”或“语义”职责。
      </VizText>
    </LabCanvas>
  );
}

export const visionSequenceLabs: Record<string, LabDefinition> = {
  cnn: {
    title: "卷积窗口如何读图",
    englishTitle: "Convolution window",
    steps: [
      {
        title: "选局部区域 · Patch",
        explanation:
          "2×2 kernel 覆盖当前窗口。滑块选择 3×3 输出中的位置，对应输入中实际移动的 receptive field。",
      },
      {
        title: "逐元素相乘 · Multiply",
        explanation:
          "每个像素乘同位置的 kernel 权重；这里用 [1, −1; 1, −1] 比较左右响应。深度学习框架通常实现 cross-correlation，不翻转 kernel。",
      },
      {
        title: "求和写输出 · Accumulate",
        explanation:
          "把 4 个乘积相加，再加 bias；本例 bias=0。数值写到 feature map 中同一位置。",
      },
      {
        title: "共享权重 · Slide",
        explanation:
          "同一个 kernel 在所有窗口重复计算。更多 output channels 使用更多独立 kernel；stride 和 padding 决定空间尺寸。",
      },
    ],
    parameter: {
      label: "窗口位置 Window index",
      min: 0,
      max: 8,
      step: 1,
      initial: 4,
      hint: "0–8 按从左到右、从上到下选择窗口；公式和输出会实时重算。",
    },
    note: "精确小矩阵示例；单输入/输出通道，stride=1、padding=0，无激活函数。",
    render: Convolution,
  },
  resnet: {
    title: "残差究竟加了什么",
    englishTitle: "Residual addition",
    steps: [
      {
        title: "保留原输入 · Identity",
        explanation:
          "Shortcut 直接传递 x，给深层块提供一条原始信息和梯度的路径。",
      },
      {
        title: "学习修正 · Residual",
        explanation:
          "卷积分支学习 F(x)。本图额外用 α 控制修正幅度，便于观察；标准基础残差块通常相当于 α=1。",
      },
      {
        title: "逐元素相加 · Add",
        explanation:
          "输出 y=x+αF(x)，不是拼接。两个分支的 tensor shape 必须一致；尺寸变化时可使用 projection shortcut。",
      },
      {
        title: "继续向后传 · Propagate",
        explanation:
          "当 F(x) 接近零时，块可以接近 identity；这是残差参数化的直觉。激活与 normalization 的位置取决于具体 ResNet 变体。",
      },
    ],
    parameter: {
      label: "残差比例 α",
      min: 0,
      max: 2,
      step: 0.1,
      initial: 1,
      hint: "观察每个坐标如何从原值变化；α=0 时完全沿 shortcut 输出。",
    },
    note: "固定 x 和 F(x) 的代数示例；不表示训练效果，也不主张残差越大越好。",
    render: Residual,
  },
  unet: {
    title: "沿 U 形找回空间细节",
    englishTitle: "U-Net skip features",
    steps: [
      {
        title: "下采样 · Encoder",
        explanation:
          "逐层压缩空间尺寸并提取上下文，同时保存每个尺度的 encoder features。",
      },
      {
        title: "瓶颈 · Bottleneck",
        explanation:
          "低分辨率表示汇总较大视野，但细小边界信息可能在下采样中丢失。",
      },
      {
        title: "上采样与拼接 · Concatenate",
        explanation:
          "把 decoder 上采样到匹配尺度，与 encoder skip 在 channel 维拼接。图中 C+C=2C，再用卷积学习融合。",
      },
      {
        title: "逐像素预测 · Pixel head",
        explanation:
          "恢复高分辨率特征后，用 1×1 卷积产生各像素 logits。观察 skip 的边缘变化，但最终 mask 还取决于训练得到的融合权重。",
      },
    ],
    parameter: {
      label: "示意 skip 振幅",
      min: 0,
      max: 1,
      step: 0.1,
      initial: 1,
      hint: "缩放蓝色细节信号；不改变 concatenation 的通道数。",
    },
    note: "滑块用于教学消融，标准 U-Net 不要求此 gate。拼接与 ResNet 的逐元素相加不同。",
    render: UNet,
  },
  rnn: {
    title: "信息如何穿过时间",
    englishTitle: "Recurrent hidden state",
    steps: [
      {
        title: "第一个输入 · t=1",
        explanation:
          "从 h₀=0 开始，x₁=1 经 tanh 写入状态。隐藏状态同时依赖当前输入和上一步状态。",
      },
      {
        title: "再次使用同一权重 · t=2",
        explanation:
          "x₂=0，h₂=tanh(w·h₁)。Unrolling 展开的是时间步骤，参数 w 在所有步骤共享。",
      },
      {
        title: "继续记忆 · t=3",
        explanation:
          "第三步没有新信号，状态变化来自重复递归。调小 w 可看到早期信号快速衰减；较大 w 也会进入 tanh 饱和区域。",
      },
      {
        title: "读出最终状态 · t=4",
        explanation:
          "可从每步 hₜ 输出预测，或只用最后状态做序列分类。训练使用 backpropagation through time，梯度也穿过这条时间链。",
      },
    ],
    parameter: {
      label: "递归权重 w",
      min: 0,
      max: 1.5,
      step: 0.1,
      initial: 0.8,
      hint: "固定 x=[1,0,0,0]，每次实时重算 4 个 hidden states。",
    },
    note: "标量 vanilla RNN 教学例子；真实模型使用向量、矩阵和 bias。",
    render: RNN,
  },
  "lstm-gru": {
    title: "打开与关闭记忆阀门",
    englishTitle: "LSTM memory gates",
    steps: [
      {
        title: "旧记忆 · Cell state",
        explanation:
          "LSTM 同时维护 cell state c 和 hidden state h。这里从 cₜ₋₁=0.8 开始，观察一个坐标的更新。",
      },
      {
        title: "保留多少 · Forget gate",
        explanation:
          "sigmoid 输出 fₜ∈[0,1]，旧记忆乘 fₜ。滑块直接展示从清空到保留的连续变化。",
      },
      {
        title: "写入新内容 · Input gate",
        explanation:
          "新 cell state 为 cₜ=fₜcₜ₋₁+iₜgₜ。本图固定写入项 iₜgₜ=0.15，避免把 forget gate 和写入混为一谈。",
      },
      {
        title: "读出 · Output gate",
        explanation:
          "hₜ=oₜ tanh(cₜ)，本例 oₜ=0.7。GRU 使用 reset/update gates，并把记忆组织为单一 hidden state；它没有完全相同的独立 c 路径。",
      },
    ],
    parameter: {
      label: "Forget gate fₜ",
      min: 0,
      max: 1,
      step: 0.05,
      initial: 0.8,
      hint: "fₜ 越大保留越多旧记忆；新写入项保持不变。",
    },
    note: "图演示 LSTM 的一个坐标；实际 gate 由输入和前一 hidden state 学习生成。",
    render: LSTM,
  },
  transformer: {
    title: "一层 Transformer 在做什么",
    englishTitle: "Transformer block and mask",
    steps: [
      {
        title: "规定可见范围 · Mask",
        explanation:
          "矩阵行是 query，列是 key。Bidirectional 可读所有有效位置；causal 仅可读当前位置及更早位置。",
      },
      {
        title: "跨位置混合 · Attention",
        explanation:
          "Self-attention 根据 QK 分数加权汇总 V，让每个位置读取允许的上下文；residual 路径保留原表示。",
      },
      {
        title: "逐位置变换 · FFN",
        explanation:
          "Feed-forward network 对每个位置分别应用同一套权重。它扩展与压缩特征维度，本身不额外混合 token。",
      },
      {
        title: "堆叠多层 · Depth",
        explanation:
          "Attention 与 FFN 反复堆叠，逐层构造表示。LayerNorm 的具体位置有 Pre-LN / Post-LN 等方案。",
      },
    ],
    parameter: {
      label: "上下文模式 0=双向 / 1=因果",
      min: 0,
      max: 1,
      step: 1,
      initial: 0,
      hint: "切换遮罩，观察 attention 矩阵中哪些连接被禁用。",
    },
    note: "画的是一个简化 self-attention block；encoder–decoder 模型还包含 cross-attention。",
    render: Transformer,
  },
  bert: {
    title: "被遮住的词怎样恢复",
    englishTitle: "Bidirectional masked language modeling",
    steps: [
      {
        title: "隐藏目标 · Corrupt token",
        explanation:
          "选中一个词并用 [MASK] 替换，原词保留为训练标签。滑块改变被遮住的位置。",
      },
      {
        title: "读取两侧 · Bidirectional context",
        explanation:
          "左右有效 token 都可为被遮位置提供上下文；颜色区分左侧与右侧信息流，线宽不代表学习到的注意力。",
      },
      {
        title: "构造表示 · Contextual state",
        explanation:
          "多层 encoder 构造该位置的 contextual hidden state hᵢ。词本身已被隐藏，模型需要利用句子环境。",
      },
      {
        title: "词表预测 · MLM loss",
        explanation:
          "MLM head 映射到整个词表 logits；cross-entropy 监督被选中的目标位置。训练后可更换任务 head 用于分类、序列标注等。",
      },
    ],
    parameter: {
      label: "被遮位置 Mask index",
      min: 0,
      max: 4,
      step: 1,
      initial: 2,
      hint: "0–4 对应“这 / 只 / 猫 / 喜欢 / 鱼”；左右上下文随位置变化。",
    },
    note: "本图突出 [MASK] 分支；原始 BERT 的 corruption 还会随机替换或保留目标词。",
    render: BERT,
  },
  "gpt-language-model": {
    title: "温度如何改变下一个词",
    englishTitle: "Autoregressive sampling temperature",
    steps: [
      {
        title: "读前缀 · Causal prefix",
        explanation:
          "Decoder 的 causal mask 避免读取未来词。当前前缀“我 喜欢”产生下一词的 logits。",
      },
      {
        title: "变成概率 · Temperature",
        explanation:
          "先把 logits 除以 T，再做 softmax。T 较低使分布更集中，T 较高使分布更平坦；排序保持不变。",
      },
      {
        title: "从分布采样 · Sample",
        explanation:
          "用固定 u=0.72 在累计概率中选词。固定随机数有助于比较不同温度，不代表每次都应选同一个词。",
      },
      {
        title: "追加并重复 · Autoregression",
        explanation:
          "采到的 token 追加到前缀，再做下一步预测。训练时通常用已知前缀并行计算移位标签的 next-token loss。",
      },
    ],
    parameter: {
      label: "采样温度 Temperature",
      min: 0.2,
      max: 2,
      step: 0.1,
      initial: 1,
      hint: "固定 logits=[2,1,0]；概率条和固定随机抽样结果一起变化。",
    },
    note: "三词表和 logits 是教学设定；温度不等于知识准确度，图中没有 top-k / top-p 截断。",
    render: GPT,
  },
  vit: {
    title: "Patch 大小与 token 数",
    englishTitle: "Image patches into tokens",
    steps: [
      {
        title: "切图 · Patchify",
        explanation:
          "把图像切成 P×P 不重叠 patches。本例图像仅 8×8 像素，滑块切换 P=1、2、4。",
      },
      {
        title: "展平与投影 · Patch embedding",
        explanation:
          "每个 patch 展平后，经共享 linear projection 变成固定宽度的 embedding。Patch 越小，序列中的 token 越多。",
      },
      {
        title: "加入位置 · Position",
        explanation:
          "加入 positional embedding，并在经典 ViT 中加入 [CLS] token，再送入 Transformer encoder。位置帮助区分 patch 的空间布局。",
      },
      {
        title: "全局交互 · Attention",
        explanation:
          "每个 head 形成 N×N attention。减小 patch 会显著增加 token 数和标准 attention 的计算/存储需求。",
      },
    ],
    parameter: {
      label: "Patch 指数 e（P=2ᵉ）",
      min: 0,
      max: 2,
      step: 1,
      initial: 1,
      hint: "e=0/1/2 对应 P=1/2/4，实时显示 token 数与 attention 配对数。",
    },
    note: "原始 ViT 机制的微型图像示例；N² 只表示标准 attention 矩阵元素数，并非实测显存。",
    render: ViT,
  },
  gnn: {
    title: "图上的信息能传多远",
    englishTitle: "Message passing and receptive field",
    steps: [
      {
        title: "节点起点 · Features",
        explanation:
          "每个节点带一个初始标量 feature。绿色边框是目标节点，图边决定允许的信息传播。",
      },
      {
        title: "一跳聚合 · Neighborhood",
        explanation:
          "每个节点同时对自己与直接邻居的旧状态求平均。一次 message-passing layer 让目标读取一跳信息。",
      },
      {
        title: "堆叠 K 层 · K-hop context",
        explanation:
          "重复同步聚合，目标的有效感受野可达到 K 跳。滑块控制 K，并实际重算所有节点状态。",
      },
      {
        title: "读出任务 · Readout",
        explanation:
          "目标节点的新表示可用于 node prediction；图级任务还需 pooling/readout。层数太多可能出现过度平滑，因此更多 hops 不保证更好。",
      },
    ],
    parameter: {
      label: "传播层数 / hops",
      min: 1,
      max: 3,
      step: 1,
      initial: 2,
      hint: "比较目标节点数值和被高亮的可达范围；每层包含 self-loop。",
    },
    note: "演示无训练权重的 mean aggregation；标准 GCN 常使用对称度归一化和可学习线性映射。",
    render: GNN,
  },
  "transfer-lora": {
    title: "低秩更新如何绕开大矩阵",
    englishTitle: "Low-rank adaptation",
    steps: [
      {
        title: "冻结基座 · Frozen weights",
        explanation:
          "保留预训练矩阵 W₀。本例 W₀ 是 8×8，64 个基座权重不参与 adapter 更新。",
      },
      {
        title: "压到低维 · A projection",
        explanation:
          "可训练 A∈Rʳ×⁸ 把输入映射到 rank-r 子空间。滑块改变 r，因此矩阵形状和参数量都变化。",
      },
      {
        title: "映回输出 · B projection",
        explanation:
          "B∈R⁸×ʳ 将低维更新映回输出，ΔW=(α/r)BA。新增参数为 r(d_in+d_out)，这里为 16r。",
      },
      {
        title: "合并两路 · Add update",
        explanation:
          "输出 y=W₀x+(α/r)BAx。适用线性层可在推理时合并权重；是否合并取决于部署实现与 adapter 管理需求。",
      },
    ],
    parameter: {
      label: "LoRA rank r",
      min: 1,
      max: 4,
      step: 1,
      initial: 2,
      hint: "改变中间维度；α 固定为 1，所以同时包含 α/r 缩放。",
    },
    note: "示例只演示一层与一个输出坐标，省略 bias；更多 rank 扩大可表达更新空间，但不保证更好表现。",
    render: LoRA,
  },
  "prediction-heads": {
    title: "为什么换任务要换 head",
    englishTitle: "Task prediction head",
    steps: [
      {
        title: "获得表示 · Backbone",
        explanation:
          "Backbone 给出一个 3 维 feature vector h。它可以来自图像 pooled features 或文本 representation。",
      },
      {
        title: "输出 logits · Linear head",
        explanation:
          "分类 head 计算 z=Wh+b。C 个互斥类别需要 C 个 logits，本图改变 C 时同步改变 W 的行数。",
      },
      {
        title: "归一化 · Softmax",
        explanation:
          "Softmax 把 logits 转成总和为 1 的类别概率。增加类别改变分母，所以已有类别的概率也会变化。",
      },
      {
        title: "监督与改造 · Task loss",
        explanation:
          "多类分类常用 CE；多标签可用逐类 sigmoid+BCE，回归 head 则输出连续值。Head 类型由目标与 loss 决定。",
      },
    ],
    parameter: {
      label: "类别数 C",
      min: 2,
      max: 5,
      step: 1,
      initial: 3,
      hint: "固定 feature 与确定性权重公式，重算当前类别集的 logits 和 softmax。",
    },
    note: "Prediction head 负责产生任务输出，与 Transformer 内部的 attention head 是不同概念。",
    render: PredictionHead,
  },
  "attention-heads": {
    title: "一个宽表示怎样分成多个 head",
    englishTitle: "Multi-head width allocation",
    steps: [
      {
        title: "投影与分头 · Project",
        explanation:
          "标准 multi-head attention 为各 head 学习 Q/K/V 投影。固定总宽度 d_model=8，并使用相同 head width。",
      },
      {
        title: "各自关注 · Attend",
        explanation:
          "每个 head 在自己的投影子空间计算 softmax(QKᵀ/√d_head)V；学习到的关注模式可以不同。",
      },
      {
        title: "拼回宽度 · Concatenate",
        explanation:
          "把各 head 的输出在特征维拼接。图中 heads×d_head 始终等于 8，因此增加 head 会减少每头维度。",
      },
      {
        title: "混合输出 · Output projection",
        explanation:
          "Wᴼ 对拼接结果再做线性混合。Heads 并不预先对应类别或固定语义，增加数量也不等于增加总特征宽度。",
      },
    ],
    parameter: {
      label: "Head 指数 e（heads=2ᵉ）",
      min: 0,
      max: 3,
      step: 1,
      initial: 1,
      hint: "e=0/1/2/3 对应 1/2/4/8 heads；所有选项都整除 d_model=8。",
    },
    note: "本图采用标准 MHA 等宽分头；GQA / MQA 会让多个 query heads 共享 K/V，结构不同。",
    render: AttentionHeads,
  },
};
