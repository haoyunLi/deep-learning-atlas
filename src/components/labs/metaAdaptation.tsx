import type { LabDefinition, LabProps } from "./types";
import { LabCanvas, VizArrow, VizNode, VizText } from "./LabCanvas";

const navy = "#14284b";
const blue = "#2468c9";
const teal = "#16847b";
const orange = "#c66b3d";
const pale = "#e9f1fb";
const muted = "#60708b";
const motion = { transition: "all 420ms ease" };
const f = (value: number, digits = 2) => value.toFixed(digits);

export const metaAdaptationCalculations = {
  episode: (shots: number) => {
    const k = Math.max(1, Math.round(shots));
    const ways = 3;
    const queryPerClass = 4;
    return {
      ways,
      shots: k,
      support: ways * k,
      query: ways * queryPerClass,
      total: ways * (k + queryPerClass),
    };
  },
  firstOrder: (alpha: number) => {
    const theta = 0;
    const target = 2;
    const supportGradient = 2 * (theta - target);
    const adapted = theta - alpha * supportGradient;
    const queryLoss = (adapted - target) ** 2;
    const fomamlGradient = 2 * (adapted - target);
    const reptileDirection = adapted - theta;
    const exactMamlGradient = fomamlGradient * (1 - 2 * alpha);
    return {
      theta,
      target,
      supportGradient,
      adapted,
      queryLoss,
      fomamlGradient,
      reptileDirection,
      exactMamlGradient,
    };
  },
  active: (budget: number) => {
    const points = [
      { id: "A", entropy: 0.69, cluster: 0 },
      { id: "B", entropy: 0.67, cluster: 0 },
      { id: "C", entropy: 0.61, cluster: 1 },
      { id: "D", entropy: 0.54, cluster: 2 },
      { id: "E", entropy: 0.42, cluster: 1 },
    ];
    const count = Math.max(1, Math.min(points.length, Math.round(budget)));
    return { points, selected: points.slice(0, count), count };
  },
  federated: (localSteps: number) => {
    const steps = Math.max(1, Math.round(localSteps));
    const global = 0;
    const clientTargets = [-2, 1, 4];
    const sampleCounts = [1, 2, 1];
    const clientWeights = clientTargets.map(
      (target) => target + (global - target) * 0.6 ** steps,
    );
    const total = sampleCounts.reduce((sum, n) => sum + n, 0);
    const aggregate = clientWeights.reduce(
      (sum, weight, index) => sum + (sampleCounts[index] / total) * weight,
      0,
    );
    return {
      steps,
      global,
      clientTargets,
      sampleCounts,
      clientWeights,
      aggregate,
    };
  },
};

function Caption({ title, detail }: { title: string; detail: string }) {
  return (
    <g>
      <rect x={24} y={286} width={672} height={55} rx={10} fill="#f0f4f9" />
      <VizText x={360} y={307} anchor="middle" size={13} weight={700}>
        {title}
      </VizText>
      <VizText x={360} y={329} anchor="middle" size={12} fill={muted}>
        {detail}
      </VizText>
    </g>
  );
}

function EpisodicLab({ step, value }: LabProps) {
  const result = metaAdaptationCalculations.episode(value);
  const supportPoints = Array.from({ length: result.support });
  const queryPoints = Array.from({ length: result.query });
  const colors = [blue, teal, orange];
  return (
    <LabCanvas label="Three-Way Few-Shot Episode 的 Support Set、Query Set 与 Meta Split">
      <VizText x={28} y={31} size={14} weight={700}>
        3-way {result.shots}-shot：support 用于适配，query 只用于检验
      </VizText>
      <VizNode
        x={30}
        y={54}
        width={150}
        label="Meta-train tasks"
        sublabel="训练任务分布"
        active={step === 0}
      />
      <VizArrow x1={184} y1={83} x2={242} y2={83} active={step >= 1} />
      <VizNode
        x={248}
        y={54}
        width={184}
        label={`${result.support} support`}
        sublabel="adapter 可读取"
        active={step === 1}
        color={teal}
      />
      <VizArrow x1={436} y1={83} x2={494} y2={83} active={step >= 2} />
      <VizNode
        x={500}
        y={54}
        width={184}
        label={`${result.query} query`}
        sublabel="outer loss / evaluation"
        active={step >= 2}
        color={orange}
      />
      {supportPoints.map((_, index) => {
        const klass = index % result.ways;
        const shot = Math.floor(index / result.ways);
        return (
          <circle
            key={`s-${index}`}
            cx={275 + shot * 26 + klass * 7}
            cy={155 + klass * 28}
            r={7}
            fill={colors[klass]}
            opacity={step >= 1 ? 1 : 0.25}
            style={motion}
          />
        );
      })}
      {queryPoints.map((_, index) => {
        const klass = index % result.ways;
        const column = Math.floor(index / result.ways);
        return (
          <rect
            key={`q-${index}`}
            x={522 + column * 27 + klass * 4}
            y={148 + klass * 28}
            width={13}
            height={13}
            rx={3}
            fill={colors[klass]}
            opacity={step >= 2 ? 0.92 : 0.2}
            style={motion}
          />
        );
      })}
      <VizText
        x={30}
        y={260}
        size={13}
        fill={step === 3 ? blue : muted}
        weight={step === 3 ? 700 : 500}
      >
        Meta-test：换成未见 task，再重新采 support/query；query 绝不进入适配。
      </VizText>
      <Caption
        title={`Episode 总计 ${result.total} 个样本 = ${result.support} support + ${result.query} query`}
        detail="拖动 K 只改变 support；query 每类固定 4 个，用来隔离 K 的作用。"
      />
    </LabCanvas>
  );
}

function FirstOrderLab({ step, value }: LabProps) {
  const r = metaAdaptationCalculations.firstOrder(value);
  const x = (theta: number) => 85 + ((theta + 0.5) / 3) * 540;
  return (
    <LabCanvas label="MAML FOMAML 与 Reptile 的一维二次任务更新">
      <VizText x={28} y={31} size={14} weight={700}>
        Toy task: L(θ)=(θ−2)²，inner learning rate α={f(value)}
      </VizText>
      <line
        x1={70}
        y1={150}
        x2={650}
        y2={150}
        stroke="#b8c9dc"
        strokeWidth={2}
      />
      {[0, 1, 2].map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} y1={143} x2={x(tick)} y2={157} stroke={muted} />
          <VizText x={x(tick)} y={177} anchor="middle" size={12} fill={muted}>
            {tick}
          </VizText>
        </g>
      ))}
      <circle
        cx={x(r.theta)}
        cy={150}
        r={13}
        fill={navy}
        opacity={step >= 0 ? 1 : 0.3}
      />
      <VizText x={x(r.theta)} y={124} anchor="middle" size={12}>
        θ=0
      </VizText>
      <circle
        cx={x(r.adapted)}
        cy={150}
        r={13}
        fill={teal}
        opacity={step >= 1 ? 1 : 0.25}
        style={motion}
      />
      <VizText x={x(r.adapted)} y={116} anchor="middle" size={12} fill={teal}>
        θ′={f(r.adapted)}
      </VizText>
      <circle
        cx={x(r.target)}
        cy={150}
        r={10}
        fill={orange}
        opacity={step >= 1 ? 1 : 0.3}
      />
      <VizText x={x(r.target)} y={200} anchor="middle" size={12} fill={orange}>
        task optimum=2
      </VizText>
      <VizArrow
        x1={x(0) + 17}
        y1={136}
        x2={Math.max(x(0) + 28, x(r.adapted) - 17)}
        y2={136}
        active={step >= 1}
        color={teal}
      />
      <VizNode
        x={34}
        y={220}
        width={190}
        label={`MAML g=${f(r.exactMamlGradient)}`}
        sublabel="含 dθ′/dθ 曲率"
        active={step === 2}
      />
      <VizNode
        x={264}
        y={220}
        width={190}
        label={`FOMAML g≈${f(r.fomamlGradient)}`}
        sublabel="忽略 inner Hessian"
        active={step === 2}
        color={blue}
      />
      <VizNode
        x={494}
        y={220}
        width={190}
        label={`Reptile Δ=${f(r.reptileDirection)}`}
        sublabel="朝任务终点移动"
        active={step === 3}
        color={orange}
      />
      <Caption
        title={`Support gradient=${f(r.supportGradient)}；adapted query loss=${f(r.queryLoss)}`}
        detail="同一 toy task 精确重算；三种 outer direction 的尺度和符号不能直接当成同一学习率。"
      />
    </LabCanvas>
  );
}

function ActiveLearningLab({ step, value }: LabProps) {
  const result = metaAdaptationCalculations.active(value);
  const positions = [90, 195, 340, 485, 610];
  return (
    <LabCanvas label="Active Learning 按不确定性选择固定标注预算">
      <VizText x={28} y={31} size={14} weight={700}>
        Acquisition budget={result.count}：先打分，再选择，再请求标签
      </VizText>
      {result.points.map((point, index) => {
        const selected = index < result.count;
        return (
          <g key={point.id} opacity={step >= 1 ? 1 : 0.35} style={motion}>
            <circle
              cx={positions[index]}
              cy={145}
              r={25}
              fill={selected ? pale : "#fff"}
              stroke={selected ? blue : "#b9c9da"}
              strokeWidth={selected ? 3 : 1.5}
            />
            <VizText x={positions[index]} y={150} anchor="middle" weight={700}>
              {point.id}
            </VizText>
            <rect
              x={positions[index] - 31}
              y={200 - point.entropy * 90}
              width={62}
              height={point.entropy * 90}
              rx={5}
              fill={selected ? blue : "#b8c7d9"}
              opacity={step >= 1 ? 0.9 : 0.3}
            />
            <VizText
              x={positions[index]}
              y={218}
              anchor="middle"
              size={12}
              fill={muted}
            >
              H={f(point.entropy)}
            </VizText>
            <VizText
              x={positions[index]}
              y={241}
              anchor="middle"
              size={12}
              fill={selected ? blue : muted}
            >
              {selected && step >= 2 ? "请求标注" : "留在 pool"}
            </VizText>
          </g>
        );
      })}
      <VizText
        x={28}
        y={268}
        size={12}
        fill={step === 3 ? orange : muted}
        weight={step === 3 ? 700 : 500}
      >
        下一轮必须在同一 test 上画 metric vs 累计标注成本，并与随机采样多 seed
        比较。
      </VizText>
      <Caption
        title={`选择：${result.selected.map((point) => point.id).join("、")}`}
        detail="本图按固定 entropy 排序；真实 batch 还要加 diversity/OOD 过滤，避免重复和异常值。"
      />
    </LabCanvas>
  );
}

function FederatedLab({ step, value }: LabProps) {
  const r = metaAdaptationCalculations.federated(value);
  const scale = (weight: number) => 360 + weight * 68;
  return (
    <LabCanvas label="FedAvg 本地更新与按样本数聚合">
      <VizText x={28} y={31} size={14} weight={700}>
        FedAvg：每个客户端本地 {r.steps} 步，再按 nₖ 加权
      </VizText>
      <VizNode
        x={280}
        y={48}
        width={160}
        label="Global w=0"
        sublabel="server broadcasts"
        active={step === 0}
      />
      {r.clientWeights.map((weight, index) => (
        <g key={index}>
          <VizArrow
            x1={360}
            y1={108}
            x2={135 + index * 225}
            y2={143}
            active={step >= 1}
            color={[blue, teal, orange][index]}
          />
          <VizNode
            x={54 + index * 225}
            y={148}
            width={162}
            label={`Client ${index + 1}: ${f(weight)}`}
            sublabel={`target=${r.clientTargets[index]}, n=${r.sampleCounts[index]}`}
            active={step === 1 || step === 2}
            color={[blue, teal, orange][index]}
          />
          <circle
            cx={scale(weight)}
            cy={247 + index * 10}
            r={6}
            fill={[blue, teal, orange][index]}
            opacity={step >= 2 ? 1 : 0.25}
            style={motion}
          />
        </g>
      ))}
      <line x1={240} y1={247} x2={650} y2={247} stroke="#bdcddd" />
      <circle
        cx={scale(r.aggregate)}
        cy={247}
        r={12}
        fill={navy}
        opacity={step >= 3 ? 1 : 0.2}
        style={motion}
      />
      <VizText
        x={scale(r.aggregate)}
        y={274}
        anchor="middle"
        size={12}
        weight={700}
      >
        aggregate={f(r.aggregate)}
      </VizText>
      <Caption
        title={`w_next = (1·${f(r.clientWeights[0])} + 2·${f(r.clientWeights[1])} + 1·${f(r.clientWeights[2])}) / 4 = ${f(r.aggregate)}`}
        detail="本地步数越多，client weights 越靠各自 non-IID optimum，也可能产生更强 client drift。"
      />
    </LabCanvas>
  );
}

export const metaAdaptationLabs: Record<string, LabDefinition> = {
  "episodic-meta-learning": {
    title: "N-Way K-Shot Episode 如何组成",
    englishTitle: "Support Set / Query Set anatomy",
    parameter: {
      label: "每类 Support Set 样本数 K",
      min: 1,
      max: 5,
      step: 1,
      initial: 1,
      hint: "固定 3-way 和每类 4 个 Query Set 样本；只改变 Support Set 标注预算。",
    },
    steps: [
      {
        title: "Split tasks first",
        explanation:
          "先按类别、用户或域隔离 meta-train/val/test；新任务边界比样本随机切分更重要。",
      },
      {
        title: "Build the Support Set",
        explanation:
          "每类 K 个 support 可被 prototype、head 或 inner loop 读取。拖动 K 会重算标注预算。",
      },
      {
        title: "Hold out the Query Set",
        explanation:
          "query 与 support 同任务但样本不重叠，只用于适配后 loss 或评估。",
      },
      {
        title: "Repeat on unseen tasks",
        explanation:
          "最终在未见 meta-test tasks 上反复采 episodes，报告均值、方差和失败任务。",
      },
    ],
    note: "这是精确的 episode 计数沙盘；图中颜色表示类别，不是模型预测结果。",
    render: EpisodicLab,
  },
  "fomaml-reptile": {
    title: "一阶近似怎样改变 meta update",
    englishTitle: "MAML, FOMAML and Reptile directions",
    parameter: {
      label: "Inner learning rate α",
      min: 0.05,
      max: 0.45,
      step: 0.05,
      initial: 0.2,
      hint: "固定 L=(θ−2)²、θ=0；实时重算适配点、query loss 与三种 outer direction。",
    },
    steps: [
      {
        title: "Start from shared θ",
        explanation: "所有任务从共同初始化出发；toy task 的最优点固定为 2。",
      },
      {
        title: "Take an inner step",
        explanation:
          "用 support gradient 做 θ′=θ−αg。α 越大，一步越接近或越过任务最优点。",
      },
      {
        title: "Compare MAML and FOMAML",
        explanation:
          "MAML 包含 inner update 的导数；FOMAML 把它近似为单位映射，因此梯度尺度不同。",
      },
      {
        title: "Move with Reptile",
        explanation:
          "Reptile 不显式用 query gradient，而把初始化朝任务适配终点 θ′ 移动。",
      },
    ],
    note: "一维二次函数用于核对公式；真实多任务结果还取决于多步、不同 support batches 与 outer learning rate。",
    render: FirstOrderLab,
  },
  "active-learning": {
    title: "Active Learning：固定标注预算下怎样选下一批",
    englishTitle: "Acquisition budget and uncertainty",
    parameter: {
      label: "本轮标注预算",
      min: 1,
      max: 5,
      step: 1,
      initial: 2,
      hint: "按固定 entropy 排序选择；预算增加时展示 acquisition batch 的扩张。",
    },
    steps: [
      {
        title: "Train on labeled data",
        explanation: "从当前已标注集训练模型，封闭 test 不参与 acquisition。",
      },
      {
        title: "Score the unlabeled pool",
        explanation: "这里使用 entropy；真实系统还需校准、OOD 与代表性检查。",
      },
      {
        title: "Request a batch",
        explanation: "只请求预算允许的样本；批量选择还要避免近重复。",
      },
      {
        title: "Measure label efficiency",
        explanation:
          "标签返回后重训，比较相同累计成本下的 test 曲线与随机采样。",
      },
    ],
    note: "候选 entropy 为固定教学数值；不确定性最高不必然等于业务价值最高。",
    render: ActiveLearningLab,
  },
  "federated-learning": {
    title: "FedAvg：Local Steps 为何产生 Client Drift",
    englishTitle: "FedAvg local steps and aggregation",
    parameter: {
      label: "Local steps E",
      min: 1,
      max: 5,
      step: 1,
      initial: 2,
      hint: "三个客户端目标和样本数固定；增加本地步数会让各自模型更靠本地 optimum。",
    },
    steps: [
      {
        title: "Broadcast one model",
        explanation: "服务器向本轮客户端下发同一个 global checkpoint。",
      },
      {
        title: "Train locally",
        explanation:
          "客户端只在本地 non-IID 数据上走 E 步；更多步减少通信，也让终点更分散。",
      },
      {
        title: "Return model deltas",
        explanation: "服务器接收权重或 delta；数据不上传不自动构成隐私保证。",
      },
      {
        title: "Aggregate by sample count",
        explanation:
          "FedAvg 按 nₖ 加权；下一轮再广播 aggregate，并继续监控最差客户端。",
      },
    ],
    note: "这是确定性一维二次目标，不模拟隐私、掉线或真实深网；用于看清 local steps 与加权平均。",
    render: FederatedLab,
  },
};
