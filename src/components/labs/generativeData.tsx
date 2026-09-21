import type { LabDefinition, LabProps } from "./types";
import { LabCanvas, VizArrow, VizNode, VizText } from "./LabCanvas";

const blue = "#245fbd",
  teal = "#087f85",
  orange = "#b36425",
  muted = "#60708b";
export function stableSoftmax(logits: number[], temperature = 1) {
  const peak = Math.max(...logits);
  const exps = logits.map((x) => Math.exp((x - peak) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((x) => x / sum);
}
export function gaussianKL(mu: number, sigma: number) {
  return 0.5 * (mu * mu + sigma * sigma - 1 - Math.log(sigma * sigma));
}
function plotLine(
  fn: (x: number) => number,
  left: number,
  bottom: number,
  width: number,
  height: number,
) {
  return Array.from(
    { length: 81 },
    (_, i) =>
      `${i ? "L" : "M"}${left + (i * width) / 80},${bottom - height * fn(-3 + (i * 6) / 80)}`,
  ).join(" ");
}

function VAE({ step, value }: LabProps) {
  const mu = 0.8,
    sigma = value,
    epsilon = 0.6,
    z = mu + sigma * epsilon;
  return (
    <LabCanvas
      label={`VAE 重参数化：均值0.8，标准差${sigma.toFixed(2)}，固定噪声0.6，z=${z.toFixed(2)}，KL=${gaussianKL(mu, sigma).toFixed(3)}`}
    >
      <VizText x={25} y={30} size={17} weight={700}>
        VAE · 从一个点，到一个分布
      </VizText>
      <VizNode
        x={25}
        y={58}
        width={120}
        label="输入 x"
        sublabel="Encoder"
        active={step === 0}
      />
      <VizArrow x1={150} y1={86} x2={198} y2={86} active={step === 0} />
      <VizNode
        x={205}
        y={58}
        width={190}
        label={`μ = 0.8 · σ = ${sigma.toFixed(2)}`}
        sublabel="qφ(z | x) = N(μ, σ²)"
        active={step === 1}
      />
      <VizArrow x1={400} y1={86} x2={448} y2={86} active={step >= 2} />
      <VizNode
        x={455}
        y={58}
        width={235}
        label={`z = μ + σε = ${z.toFixed(2)}`}
        sublabel="固定 ε = 0.6 · 便于比较"
        active={step === 2}
      />
      <line x1={55} y1={270} x2={405} y2={270} stroke="#a5b7cc" />
      <path
        d={plotLine(
          (x) => Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI),
          55,
          270,
          350,
          100,
        )}
        fill="none"
        stroke="#9bacbe"
        strokeWidth={3}
        strokeDasharray="5 4"
      />
      <path
        d={plotLine(
          (x) =>
            Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) /
            (sigma * Math.sqrt(2 * Math.PI)),
          55,
          270,
          350,
          100,
        )}
        fill="none"
        stroke={blue}
        strokeWidth={3}
      />
      <circle cx={55 + ((z + 3) * 350) / 6} cy={270} r={7} fill={teal} />
      <VizText x={70} y={300} fill={blue}>
        蓝：q(z|x)　灰虚线：标准正态 prior
      </VizText>
      <VizNode
        x={455}
        y={152}
        width={235}
        label="Decoder → x̂"
        sublabel="重建原始输入"
        active={step === 3}
      />
      <VizText x={463} y={250} fill={teal} weight={700}>
        KL(q ∥ p) = {gaussianKL(mu, sigma).toFixed(3)}
      </VizText>
      <VizText x={463} y={279} size={13}>
        训练同时权衡重建项与 KL 项
      </VizText>
      <VizText x={25} y={337} size={13} fill={muted}>
        改变 σ 会改变采样分布与 KL；示意中 μ 和 ε 固定，未训练解码器。
      </VizText>
    </LabCanvas>
  );
}

export function ganToy(generator: number) {
  const real = 2,
    score = (x: number) => 1 / (1 + Math.exp(-x));
  const fakeProbability = score(generator),
    realProbability = score(real);
  return {
    fakeProbability,
    realProbability,
    discriminatorLoss:
      -Math.log(realProbability) - Math.log(1 - fakeProbability),
    generatorLoss: -Math.log(fakeProbability),
    generatorGradient: fakeProbability - 1,
  };
}
function GAN({ step, value }: LabProps) {
  const m = ganToy(value);
  return (
    <LabCanvas
      label={`GAN 教学样本：生成值${value.toFixed(1)}，判别器D(x)=sigmoid(x)，D(fake)=${m.fakeProbability.toFixed(3)}`}
    >
      <VizText x={25} y={30} size={17} weight={700}>
        GAN · 同一个分数，两种优化目标
      </VizText>
      <VizNode
        x={30}
        y={65}
        width={160}
        label="真实样本 x = 2"
        sublabel="来自 data"
        active={step === 0}
        color={teal}
      />
      <VizNode
        x={30}
        y={159}
        width={160}
        label={`G(z) = ${value.toFixed(1)}`}
        sublabel="拖动生成器的输出"
        active={step === 0}
      />
      <VizArrow
        x1={198}
        y1={94}
        x2={280}
        y2={137}
        active={step === 1}
        color={teal}
      />
      <VizArrow x1={198} y1={188} x2={280} y2={155} active={step === 1} />
      <VizNode
        x={288}
        y={111}
        width={145}
        height={80}
        label="D(x) = sigmoid(x)"
        sublabel="本例固定判别器"
        active={step === 1}
      />
      <VizArrow x1={439} y1={150} x2={485} y2={150} active={step >= 1} />
      <VizText x={500} y={105} fill={teal}>
        D(real) = {m.realProbability.toFixed(3)}
      </VizText>
      <VizText x={500} y={145} fill={blue}>
        D(fake) = {m.fakeProbability.toFixed(3)}
      </VizText>
      <rect x={495} y={164} width={170} height={15} fill="#e0e8f2" rx={4} />
      <rect
        x={495}
        y={164}
        width={170 * m.fakeProbability}
        height={15}
        fill={blue}
        rx={4}
      />
      <VizNode
        x={30}
        y={258}
        width={310}
        label={`D loss = ${m.discriminatorLoss.toFixed(3)}`}
        sublabel="−log D(real) − log(1 − D(fake))"
        active={step === 2}
        color={teal}
      />
      <VizNode
        x={365}
        y={258}
        width={325}
        label={`G loss = ${m.generatorLoss.toFixed(3)}`}
        sublabel="Non-saturating · −log D(fake)"
        active={step === 3}
      />
      <VizText x={25} y={342} size={13} fill={muted}>
        训练 D 时冻结 G；训练 G 时梯度经过 D 回到 G。本图计算一次前向损失。
      </VizText>
    </LabCanvas>
  );
}

const clipScores = [
  [0.85, 0.1, 0.3],
  [0.12, 0.8, 0.2],
  [0.2, 0.22, 0.75],
];
function Clip({ step, value }: LabProps) {
  const probabilities = stableSoftmax(clipScores[0], value);
  return (
    <LabCanvas
      label={`CLIP 图片文字相似度矩阵，temperature=${value.toFixed(2)}，第一张图配对文本概率${probabilities[0].toFixed(3)}`}
    >
      <VizText x={25} y={30} size={17} weight={700}>
        CLIP · 图像和文字在同一个空间相遇
      </VizText>
      <VizNode
        x={25}
        y={60}
        width={165}
        label="图片 → 图像编码器"
        sublabel="image embeddings"
        active={step === 0}
      />
      <VizNode
        x={25}
        y={155}
        width={165}
        label="文本 → 文本编码器"
        sublabel="text embeddings"
        active={step === 1}
        color={teal}
      />
      <VizArrow x1={198} y1={90} x2={263} y2={148} active={step === 2} />
      <VizArrow
        x1={198}
        y1={185}
        x2={263}
        y2={168}
        active={step === 2}
        color={teal}
      />
      <VizText x={290} y={59} size={13}>
        cosine similarity · 合成数值
      </VizText>
      {clipScores.flatMap((row, i) =>
        row.map((s, j) => (
          <g key={`${i}-${j}`}>
            <rect
              x={289 + j * 53}
              y={78 + i * 53}
              width={48}
              height={48}
              fill={
                i === j
                  ? `rgba(8,127,133,${0.25 + s * 0.55})`
                  : `rgba(36,95,189,${s * 0.7})`
              }
              stroke={i === j ? teal : "#d1dfed"}
              strokeWidth={step >= 2 && i === j ? 3 : 1}
            />
            <VizText
              x={313 + j * 53}
              y={107 + i * 53}
              anchor="middle"
              weight={700}
            >
              {s.toFixed(2)}
            </VizText>
          </g>
        )),
      )}
      <VizText x={486} y={89} weight={700}>
        第 1 张图 → 文本概率
      </VizText>
      {probabilities.map((p, i) => (
        <g key={i}>
          <VizText x={485} y={122 + i * 45} size={12}>
            {["匹配描述", "不匹配 A", "不匹配 B"][i]}
          </VizText>
          <rect
            x={487}
            y={129 + i * 45}
            width={150}
            height={11}
            fill="#e1eaf4"
          />
          <rect
            x={487}
            y={129 + i * 45}
            width={p * 150}
            height={11}
            fill={i === 0 ? teal : blue}
          />
          <VizText x={675} y={139 + i * 45} anchor="end" size={12}>
            {p.toFixed(2)}
          </VizText>
        </g>
      ))}
      <VizText x={33} y={275} fill={teal} weight={700}>
        配对位于对角线；训练同时优化 image→text 和 text→image。
      </VizText>
      <VizText x={33} y={310}>
        行 softmax(S/τ) · τ = {value.toFixed(2)} · 第 1 行 loss ={" "}
        {(-Math.log(probabilities[0])).toFixed(3)}
      </VizText>
      <VizText x={25} y={340} size={13} fill={muted}>
        温度改变概率分布，保持本例相似度及排序不变；高分不等于已校准的真实概率。
      </VizText>
    </LabCanvas>
  );
}

function Cohort({ step, value }: LabProps) {
  const horizon = Math.round(value),
    origin = 300,
    scale = 2.4;
  return (
    <LabCanvas
      label={`Cohort 时间窗：预测日0，特征来自过去60天，结局窗口${horizon}天。`}
    >
      <VizText x={25} y={30} size={17} weight={700}>
        Cohort · 先画出你在什么时候预测什么
      </VizText>
      <rect
        x={156}
        y={80}
        width={144}
        height={65}
        fill="#e1edf9"
        stroke={blue}
      />
      <rect
        x={300}
        y={80}
        width={horizon * scale}
        height={65}
        fill="#e1f2ed"
        stroke={teal}
      />
      <VizText x={228} y={106} anchor="middle" fill={blue}>
        Feature window
      </VizText>
      <VizText x={228} y={128} anchor="middle" size={13}>
        过去 60 天
      </VizText>
      <VizText
        x={origin + (horizon * scale) / 2}
        y={175}
        anchor="middle"
        fill={teal}
      >
        Outcome: (0, {horizon}] 天
      </VizText>
      <line
        x1={85}
        y1={155}
        x2={650}
        y2={155}
        stroke="#829bb8"
        strokeWidth={2}
      />
      <line
        x1={origin}
        y1={62}
        x2={origin}
        y2={214}
        stroke={orange}
        strokeWidth={3}
      />
      <VizText x={origin} y={238} anchor="middle" fill={orange} weight={700}>
        Index date = 0
      </VizText>
      {[-60, -30, 0, 30, 60, 90, 120].map((day) => (
        <g key={day}>
          <line
            x1={origin + day * scale}
            y1={148}
            x2={origin + day * scale}
            y2={161}
            stroke="#829bb8"
          />
          <VizText x={origin + day * scale} y={196} size={12} anchor="middle">
            {day}
          </VizText>
        </g>
      ))}
      {[15, 45, 100].map((event, i) => (
        <g key={event} opacity={step >= 2 ? 1 : 0.4}>
          <circle
            cx={origin + event * scale}
            cy={115}
            r={8}
            fill={event <= horizon ? teal : "#b7c1ce"}
          />
          <VizText x={origin + event * scale} y={67} anchor="middle" size={12}>
            {["A", "B", "C"][i]}: {event}天
          </VizText>
        </g>
      ))}
      <VizNode
        x={30}
        y={269}
        width={205}
        label="定义纳入人群"
        sublabel="Eligibility criteria"
        active={step === 0}
      />
      <VizNode
        x={254}
        y={269}
        width={205}
        label={`事件落窗：${[15, 45, 100].filter((d) => d <= horizon).length}/3`}
        sublabel="示例均有完整随访"
        active={step === 2}
        color={teal}
      />
      <VizNode
        x={478}
        y={269}
        width={205}
        label="按个体分组切分"
        sublabel="同一人不能跨 train/test"
        active={step === 3}
      />
      <VizText x={25} y={344} size={13} fill={muted}>
        改变 horizon 会改变任务标签；真实研究还要处理失访、删失和时间变化。
      </VizText>
    </LabCanvas>
  );
}

function Leakage({ step, value }: LabProps) {
  const cutoff = Math.round(value),
    times = [-40, -10, 5, 30],
    origin = 342;
  return (
    <LabCanvas
      label={`数据泄漏：特征截断日${cutoff}，预测发生在第0天，晚于第0天的特征不可用。`}
    >
      <VizText x={25} y={30} size={17} weight={700}>
        Data leakage · 这条信息在预测时已经知道吗？
      </VizText>
      <rect x={origin} y={85} width={225} height={108} fill="#fff0e4" />
      <line
        x1={70}
        y1={157}
        x2={660}
        y2={157}
        stroke="#8da2bd"
        strokeWidth={2}
      />
      <line
        x1={origin}
        y1={65}
        x2={origin}
        y2={220}
        stroke={orange}
        strokeWidth={3}
      />
      <VizText x={origin} y={244} anchor="middle" fill={orange}>
        预测时点 t = 0
      </VizText>
      <line
        x1={origin + cutoff * 5}
        y1={80}
        x2={origin + cutoff * 5}
        y2={205}
        stroke={blue}
        strokeDasharray="5 4"
        strokeWidth={3}
      />
      {times.map((day, i) => {
        const included = day <= cutoff,
          leak = included && day > 0,
          x = origin + day * 5;
        return (
          <g key={day} opacity={included ? 1 : 0.3}>
            <circle cx={x} cy={150} r={12} fill={leak ? orange : teal} />
            <VizText x={x} y={116} anchor="middle" size={13}>
              {["既往记录", "基线检查", "治疗反应", "出院编码"][i]}
            </VizText>
            <VizText x={x} y={185} anchor="middle" size={12}>
              {day} 天
            </VizText>
            {leak && (
              <VizText x={x} y={53} fill={orange} anchor="middle" weight={700}>
                未来信息！
              </VizText>
            )}
          </g>
        );
      })}
      <VizNode
        x={35}
        y={270}
        width={190}
        label={`纳入特征 ${times.filter((d) => d <= cutoff).length} 项`}
        sublabel={`cutoff = ${cutoff} 天`}
        active={step === 0}
      />
      <VizNode
        x={265}
        y={270}
        width={190}
        label={`泄漏 ${times.filter((d) => d <= cutoff && d > 0).length} 项`}
        sublabel="只按时点检查的示例"
        active={step === 1}
        color={orange}
      />
      <VizNode
        x={495}
        y={270}
        width={190}
        label={step === 3 ? "独立测试集评估" : "训练集拟合预处理"}
        sublabel={
          step === 3 ? "test 从未参与拟合" : "scaler / imputer / selector"
        }
        active={step >= 2}
      />
      <VizText x={25} y={345} size={13} fill={muted}>
        时间合规只是第一关；还要检查同一人重复、标签代理、全量数据拟合预处理。
      </VizText>
    </LabCanvas>
  );
}

function Calibration({ step, value }: LabProps) {
  const logits = [1.8, 0.6, -0.3],
    probs = stableSoftmax(logits, value),
    original = stableSoftmax(logits);
  return (
    <LabCanvas
      label={`Temperature scaling：温度${value.toFixed(2)}，最大概率由${original[0].toFixed(3)}变为${probs[0].toFixed(3)}，最高类别不变。`}
    >
      <VizText x={25} y={30} size={17} weight={700}>
        Calibration · 调整信心，不改变类别排序
      </VizText>
      <VizNode
        x={35}
        y={59}
        width={170}
        label="冻结原模型"
        sublabel="logits [1.8, 0.6, −0.3]"
        active={step === 0}
      />
      <VizArrow x1={211} y1={89} x2={266} y2={89} active={step === 1} />
      <VizNode
        x={274}
        y={59}
        width={170}
        label={`logits / T · T=${value.toFixed(2)}`}
        sublabel="T > 0"
        active={step === 1}
      />
      <VizArrow x1={450} y1={89} x2={505} y2={89} active={step === 2} />
      <VizNode
        x={512}
        y={59}
        width={170}
        label="softmax → 概率"
        sublabel="仍预测类别 A"
        active={step === 2}
      />
      {probs.map((p, i) => (
        <g key={i}>
          <rect
            x={110 + i * 210}
            y={270 - original[i] * 140}
            width={45}
            height={original[i] * 140}
            rx={4}
            fill="#acbad0"
          />
          <rect
            x={162 + i * 210}
            y={270 - p * 140}
            width={45}
            height={p * 140}
            rx={4}
            fill={blue}
          />
          <VizText
            x={133 + i * 210}
            y={258 - original[i] * 140}
            anchor="middle"
            size={13}
          >
            {original[i].toFixed(2)}
          </VizText>
          <VizText
            x={184 + i * 210}
            y={258 - p * 140}
            anchor="middle"
            size={13}
            fill={blue}
          >
            {p.toFixed(2)}
          </VizText>
          <VizText x={158 + i * 210} y={295} anchor="middle">
            类别 {"ABC"[i]}
          </VizText>
        </g>
      ))}
      <VizText x={40} y={323} fill={muted} size={13}>
        灰色：原始 T=1　蓝色：当前 T　·　只展示一个样本的输出
      </VizText>
      <VizText x={40} y={345} size={13} fill={step === 3 ? orange : muted}>
        T 要用单独校准集的 NLL 拟合；是否更校准须在独立测试集验证。
      </VizText>
    </LabCanvas>
  );
}

export const generativeDataLabs: Record<string, LabDefinition> = {
  "autoencoder-vae": {
    title: "VAE 的随机性从哪里来？",
    englishTitle: "VAE · Reparameterization",
    parameter: {
      label: "潜变量标准差 σ",
      min: 0.3,
      max: 1.6,
      step: 0.1,
      initial: 0.8,
      hint: "固定均值 μ=0.8 与同一 ε=0.6，只改变分布的宽度。",
    },
    render: VAE,
    steps: [
      {
        title: "编码成分布参数",
        explanation:
          "VAE encoder 输出 μ 和 σ（常输出 log variance），描述近似后验 qφ(z|x)，不同于普通自编码器的单一编码。",
      },
      {
        title: "观察分布的宽度",
        explanation:
          "σ 较大时同一输入可产生更分散的潜变量；蓝色曲线是 q，灰色是标准正态先验。",
      },
      {
        title: "重参数化采样",
        explanation:
          "把随机性写成 ε∼N(0,I)，计算 z=μ+σε，让梯度能沿 μ、σ 传播。本图固定 ε，便于比较参数。",
      },
      {
        title: "重建加 KL 约束",
        explanation:
          "decoder 根据 z 重建 x；负 ELBO 包含重建项和 KL(q∥p)。图中只计算一维高斯 KL，没有展示训练效果。",
      },
    ],
    note: "一维高斯教学模型；曲线与 KL 是实际公式计算，重建图像未进行模型推理。",
  },
  gan: {
    title: "生成器和判别器怎样互相学习？",
    englishTitle: "GAN · Adversarial objectives",
    parameter: {
      label: "生成器输出 G(z)",
      min: -3,
      max: 3,
      step: 0.1,
      initial: -1,
      hint: "固定 D(x)=sigmoid(x)，查看同一个生成值怎样改变 D 与 G 的损失。",
    },
    render: GAN,
    steps: [
      {
        title: "准备真实和生成样本",
        explanation:
          "真实数据来自 data distribution，生成器把噪声 z 映射为 G(z)。这里用一维数值表示一个样本。",
      },
      {
        title: "判别器打分",
        explanation:
          "D 输出样本来自真实数据的分数。本例固定 D(x)=sigmoid(x)，拖动 G(z) 会即时改变 D(fake)。",
      },
      {
        title: "更新判别器",
        explanation:
          "固定 G，最小化 −log D(real)−log(1−D(fake))，分别提高真实分数、降低生成分数。",
      },
      {
        title: "更新生成器",
        explanation:
          "固定 D 的参数，梯度经过 D 回传给 G。图中用常见 non-saturating loss −log D(G(z))；真实训练交替更新二者。",
      },
    ],
    note: "这是固定判别器的一次损失计算；降低这一个样本的 G loss 不代表生成分布已逼近真实分布。",
  },
  clip: {
    title: "图像和文字怎样学会匹配？",
    englishTitle: "CLIP · Cross-modal similarity",
    parameter: {
      label: "温度 τ",
      min: 0.05,
      max: 1,
      step: 0.05,
      initial: 0.2,
      hint: "降低 τ 会让同一组相似度的 softmax 更尖锐，观察正例概率和负例竞争。",
    },
    render: Clip,
    steps: [
      {
        title: "分别编码图像和文字",
        explanation:
          "图像编码器读取图片，文本编码器读取描述。先把两类表示投影到同一维度并归一化。",
      },
      {
        title: "构建相似度矩阵",
        explanation:
          "batch 中每张图与每段文字计算余弦相似度。本例的对角线是已知配对，非对角线作为其他候选。",
      },
      {
        title: "按温度计算分布",
        explanation:
          "对相似度除以温度后做 softmax；较低温度让分布更集中。图中展示第一张图对所有文字的概率。",
      },
      {
        title: "双向对比，再迁移",
        explanation:
          "训练通常平均图→文和文→图的交叉熵。零样本分类时，把候选类别写成文本，再比较相似度；模型不在这一步更新。",
      },
    ],
    note: "合成相似度用于演示；高相似度和尖锐 softmax 都不保证下游正确率或概率校准。",
  },
  "cohort-design": {
    title: "预测窗口怎样改变学习任务？",
    englishTitle: "Cohort · Index date and windows",
    parameter: {
      label: "结局观察期 horizon",
      min: 15,
      max: 120,
      step: 15,
      initial: 60,
      unit: "天",
      hint: "拖动预测日之后的观察窗口，看哪些已记录事件被计入标签。",
    },
    render: Cohort,
    steps: [
      {
        title: "明确研究人群",
        explanation:
          "先写清目标人群与纳入排除标准。Cohort 是按共同标准定义的人群，不是一种神经网络。",
      },
      {
        title: "固定预测时点",
        explanation:
          "在 index date 做预测，特征窗口只能使用当时已可获得的信息。图中固定过去 60 天的特征窗。",
      },
      {
        title: "定义结局窗口",
        explanation:
          "事件是否落入 (0,horizon] 决定此示例的二元标签。延长窗口会改变任务本身；这里假设三人均有完整随访。",
      },
      {
        title: "按个体与环境验证",
        explanation:
          "避免同一个人的多条记录分散到训练和测试；根据目标部署环境使用时间或地点外部验证。真实数据还需处理失访与删失。",
      },
    ],
    note: "合成时间线，不是临床分析或真实患病率；窗口需根据具体任务定义。",
  },
  "data-leakage": {
    title: "未来信息是怎样混进训练的？",
    englishTitle: "Data leakage · Availability timeline",
    parameter: {
      label: "特征截断时间 cutoff",
      min: -40,
      max: 30,
      step: 5,
      initial: 0,
      unit: "天",
      hint: "预测发生在第 0 天；把 cutoff 移到右边，观察未来信息何时被误纳入。",
    },
    render: Leakage,
    steps: [
      {
        title: "列出信息可用时间",
        explanation:
          "为每个候选特征记录实际可得时间，而不只看数据库写入日期。这里列出既往记录、基线检查、治疗反应和出院编码。",
      },
      {
        title: "排除未来信号",
        explanation:
          "对于第 0 天的预测，治疗反应和出院信息属于未来。图中的橙色特征表示已经被 cutoff 纳入但不可在预测时使用。",
      },
      {
        title: "训练范围内拟合",
        explanation:
          "scaler、imputer、feature selector 都只在训练集 fit，在验证/测试集 transform；交叉验证每折都要重新 fit。",
      },
      {
        title: "重新检查泛化",
        explanation:
          "修正时点后，还要排查同一实体重复、标签代理及调参用到测试集。用隔离的测试数据重新评估。",
      },
    ],
    note: "计数只检查本图的时间可用性；没有泄漏时点不等于整个数据流程已无泄漏。",
  },
  "calibration-uncertainty": {
    title: "预测 90% 就真的有九成把握吗？",
    englishTitle: "Calibration · Temperature scaling",
    parameter: {
      label: "温度 T",
      min: 0.5,
      max: 3,
      step: 0.1,
      initial: 1,
      hint: "T>1 通常降低最大 softmax 概率；正温度不会改变类别排序。",
    },
    render: Calibration,
    steps: [
      {
        title: "冻结模型的 logits",
        explanation:
          "先收集一个与训练、最终测试分开的校准集。本图固定一个三分类样本的 logits，只说明温度变换。",
      },
      {
        title: "用正温度缩放",
        explanation:
          "计算 softmax(logits/T)。T>1 让分布变平，0<T<1 让分布更尖，argmax 保持不变。",
      },
      {
        title: "比较概率变化",
        explanation:
          "灰色是原始输出，蓝色是缩放后输出。信心改变并不意味着这个样本被纠正，因为预测类别未变。",
      },
      {
        title: "独立验证校准",
        explanation:
          "用校准集负对数似然拟合 T，在测试集上看可靠性图、NLL 或 Brier score。降低信心本身不保证校准改善。",
      },
    ],
    note: "只展示概率映射；没有可靠性曲线或人群数据，不能据此判定真实模型已经校准。",
  },
};
