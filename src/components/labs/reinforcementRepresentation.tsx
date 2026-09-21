import type { LabDefinition, LabProps } from "./types";
import { LabCanvas, VizArrow, VizNode, VizText } from "./LabCanvas";

// These are deterministic teaching examples, not measurements or trained policies.
// Equations follow Sutton & Barto (2018), Spinning Up SAC, DPO (2305.18290),
// CPC / InfoNCE (1807.03748), and FaceNet (1503.03832).
const teal = "#177b70";
const orange = "#cd7444";
const blue = "#466aa6";
const muted = "#6e7c75";
const pale = "#e5eee8";
const motion = { transition: "all 450ms ease" };
const f = (n: number, digits = 2) => n.toFixed(digits);
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export function representationSoftmax(values: number[]) {
  const max = Math.max(...values);
  const weights = values.map((v) => Math.exp(v - max));
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((v) => v / sum);
}

export const rlLabCalculations = {
  discountedReturn: (gamma: number) => {
    const parts = [1, 2 * gamma, 4 * gamma ** 2];
    return { parts, total: parts.reduce((a, b) => a + b, 0) };
  },
  bandit: (epsilon: number) => [
    epsilon / 3,
    1 - epsilon + epsilon / 3,
    epsilon / 3,
  ],
  qLearning: (alpha: number) => {
    const target = 1 + 0.9 * 4;
    return { target, error: target - 1, next: 1 + alpha * (target - 1) };
  },
  sarsa: (action: number) => {
    const nextQ = [1, 4, -2][Math.round(action)];
    const target = 1 + 0.9 * nextQ;
    return { nextQ, target, next: 1 + 0.4 * (target - 1), qTarget: 4.6 };
  },
  dqn: (gamma: number) => {
    const target = 1 + gamma * 4;
    return { target, error: target - 2, loss: (target - 2) ** 2 };
  },
  reinforce: (reward: number) => {
    const advantage = reward - 1;
    const gradient = advantage * (1 - 0.4);
    const nextProbability = sigmoid(Math.log(0.4 / 0.6) + 0.2 * gradient);
    return {
      advantage,
      gradient,
      nextProbability,
      loss: -advantage * Math.log(0.4),
    };
  },
  actorCritic: (baseline: number) => {
    const target = 1 + 0.9 * 3;
    const delta = target - baseline;
    return {
      target,
      delta,
      nextValue: baseline + 0.2 * delta,
      nextProbability: sigmoid(Math.log(0.4 / 0.6) + 0.2 * delta * 0.6),
    };
  },
  sac: (alpha: number) => {
    const bonus = -alpha * -0.8;
    return { bonus, softValue: 2.5 + bonus, target: 1 + 0.9 * (2.5 + bonus) };
  },
  rewardModel: (gap: number) => {
    const probability = sigmoid(gap);
    return {
      probability,
      loss: -Math.log(probability),
      gradient: probability - 1,
    };
  },
  dpo: (beta: number) => {
    const policyLogRatio = Math.log(0.6 / 0.2);
    const referenceLogRatio = Math.log(0.4 / 0.3);
    const difference = policyLogRatio - referenceLogRatio;
    const probability = sigmoid(beta * difference);
    return {
      policyLogRatio,
      referenceLogRatio,
      difference,
      logit: beta * difference,
      probability,
      loss: -Math.log(probability),
      gradient: beta * (probability - 1),
    };
  },
  contrastive: (negativeDistance: number) => {
    const positiveLoss = 0.8 ** 2;
    const negativeLoss = Math.max(0, 1.5 - negativeDistance) ** 2;
    return { positiveLoss, negativeLoss, loss: positiveLoss + negativeLoss };
  },
  infoNce: (temperature: number) => {
    const logits = [0.8, 0.6, 0.1, -0.3].map((s) => s / temperature);
    const probabilities = representationSoftmax(logits);
    return { logits, probabilities, loss: -Math.log(probabilities[0]) };
  },
  triplet: (margin: number) => ({
    positiveSquared: 0.64,
    negativeSquared: 1.44,
    thresholdSquared: 0.64 + margin,
    loss: Math.max(0, 0.64 - 1.44 + margin),
  }),
};

function Caption({ first, second }: { first: string; second?: string }) {
  const lines: string[] = [];
  let line = "";
  let width = 0;
  for (const character of second ?? "") {
    const characterWidth = /[\u0000-\u007f]/.test(character) ? 0.55 : 1;
    if (width + characterWidth > 49) {
      lines.push(line);
      line = "";
      width = 0;
    }
    line += character;
    width += characterWidth;
  }
  if (line) lines.push(line);
  return (
    <g>
      <rect x={24} y={285} width={672} height={66} rx={12} fill="#f0f3ed" />
      <VizText x={360} y={304} anchor="middle" size={13} weight={650}>
        {first}
      </VizText>
      {lines.map((text, i) => (
        <VizText
          key={i}
          x={360}
          y={324 + i * 17}
          anchor="middle"
          size={13}
          fill={muted}
        >
          {text}
        </VizText>
      ))}
    </g>
  );
}

function HorizontalBar({
  x,
  y,
  width,
  fraction,
  label,
  color = teal,
  active = true,
}: {
  x: number;
  y: number;
  width: number;
  fraction: number;
  label: string;
  color?: string;
  active?: boolean;
}) {
  return (
    <g opacity={active ? 1 : 0.3} style={motion}>
      <rect x={x} y={y} width={width} height={18} rx={5} fill={pale} />
      <rect
        x={x}
        y={y}
        width={Math.max(0, Math.min(1, fraction)) * width}
        height={18}
        rx={5}
        fill={color}
        style={motion}
      />
      <VizText x={x} y={y - 7} size={13}>
        {label}
      </VizText>
    </g>
  );
}

function ReinforcementLearningLab({ step, value }: LabProps) {
  const { parts, total } = rlLabCalculations.discountedReturn(value);
  return (
    <LabCanvas label="强化学习的轨迹、奖励和折扣回报">
      <VizText x={30} y={31} size={14} weight={700}>
        沿着 trajectory，把未来 reward 带回现在
      </VizText>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <VizNode
            x={42 + i * 235}
            y={60}
            width={140}
            label={`状态 s${i}`}
            sublabel={`行动 a${i} → reward ${[1, 2, 4][i]}`}
            active={step >= i}
          />
          {i < 2 && (
            <VizArrow
              x1={186 + i * 235}
              y1={89}
              x2={269 + i * 235}
              y2={89}
              active={step >= i + 1}
            />
          )}
          <rect
            x={60 + i * 235}
            y={236 - parts[i] * 23}
            width={103}
            height={parts[i] * 23}
            rx={7}
            fill={[teal, blue, orange][i]}
            opacity={step >= 2 ? 0.9 : 0.25}
            style={motion}
          />
          <VizText
            x={112 + i * 235}
            y={140}
            anchor="middle"
            size={13}
            fill={muted}
          >
            {["γ⁰ × 1", "γ¹ × 2", "γ² × 4"][i]}
          </VizText>
          <VizText x={112 + i * 235} y={259} anchor="middle" weight={700}>
            {f(parts[i])}
          </VizText>
        </g>
      ))}
      <line x1={40} y1={236} x2={676} y2={236} stroke="#c8d5cc" />
      <Caption
        first={`G₀ = 1 + ${f(value)} × 2 + ${f(value)}² × 4 = ${f(total)}`}
        second="同一条三步轨迹；改变 γ 只改变未来收益的权重，不改变已收到的 reward。"
      />
    </LabCanvas>
  );
}

function BanditLab({ step, value }: LabProps) {
  const probabilities = rlLabCalculations.bandit(value);
  return (
    <LabCanvas label="三个老虎机的 epsilon greedy 动作选择概率">
      <VizText x={30} y={31} size={14} weight={700}>
        ε-greedy：随机探索也可能选到当前最优 arm
      </VizText>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={step >= 1 || i === 1 ? 1 : 0.45} style={motion}>
          <rect
            x={58 + i * 220}
            y={58}
            width={154}
            height={104}
            rx={20}
            fill={i === 1 ? "#e0efe6" : "#f1eee5"}
            stroke={i === 1 ? teal : "#d5d6cb"}
            strokeWidth={2}
          />
          <circle
            cx={99 + i * 220}
            cy={93}
            r={13}
            fill={i === 1 ? teal : orange}
          />
          <circle
            cx={143 + i * 220}
            cy={93}
            r={13}
            fill={i === 1 ? teal : orange}
          />
          <VizText x={135 + i * 220} y={141} anchor="middle" size={14}>
            Arm {i + 1} · Q = {[1, 3, 2][i]}
          </VizText>
          <HorizontalBar
            x={61 + i * 220}
            y={205}
            width={148}
            fraction={probabilities[i]}
            color={i === 1 ? teal : orange}
            active={step >= 2}
            label={`P(a${i + 1}) = ${f(probabilities[i] * 100, 1)}%`}
          />
          <VizText
            x={135 + i * 220}
            y={250}
            anchor="middle"
            size={13}
            fill={muted}
          >
            {i === 1 ? "1 − ε + ε/3" : "ε/3"}
          </VizText>
        </g>
      ))}
      <Caption
        first={`探索 ${f(value * 100, 0)}% ／ 贪心 ${f((1 - value) * 100, 0)}%`}
        second="Q 估计固定；横条是精确的选择概率，不是随机抽样次数或真实收益。"
      />
    </LabCanvas>
  );
}

function QLearningLab({ step, value }: LabProps) {
  const result = rlLabCalculations.qLearning(value);
  const x = (q: number) => 62 + q * 118;
  return (
    <LabCanvas label="Q learning 用最优下一动作建立目标并按 alpha 更新 Q">
      <VizNode
        x={30}
        y={42}
        label="当前 Q(s,a) = 1"
        sublabel="old estimate"
        active={step === 0}
      />
      <VizArrow x1={171} y1={71} x2={223} y2={71} active={step >= 1} />
      <VizNode
        x={230}
        y={42}
        width={216}
        label="下一状态 Q = [1, 4, −2]"
        sublabel="max Q(s′,a′) = 4"
        active={step >= 1}
      />
      <VizArrow x1={451} y1={71} x2={505} y2={71} active={step >= 2} />
      <VizNode
        x={514}
        y={42}
        width={174}
        label={`target = ${f(result.target)}`}
        sublabel="r + γ max Q = 1 + 0.9×4"
        active={step >= 2}
      />
      <VizText x={32} y={144} size={13} fill={muted}>
        α 决定沿 TD error 走多远
      </VizText>
      <line
        x1={x(0)}
        y1={207}
        x2={x(5)}
        y2={207}
        stroke="#c8d5cc"
        strokeWidth={3}
      />
      {[0, 1, 2, 3, 4, 5].map((tick) => (
        <VizText
          key={tick}
          x={x(tick)}
          y={235}
          size={13}
          anchor="middle"
          fill={muted}
        >
          {tick}
        </VizText>
      ))}
      <circle cx={x(1)} cy={207} r={9} fill={blue} />
      <circle cx={x(result.target)} cy={207} r={9} fill={orange} />
      <VizArrow
        x1={x(1) + 12}
        y1={177}
        x2={x(step >= 3 ? result.next : 1) + 13}
        y2={177}
        color={teal}
        active={step >= 3}
      />
      <circle
        cx={x(step >= 3 ? result.next : 1)}
        cy={207}
        r={13}
        fill={teal}
        stroke="white"
        strokeWidth={3}
        style={motion}
      />
      <VizText
        x={x(step >= 3 ? result.next : 1)}
        y={167}
        anchor="middle"
        size={13}
        fill={teal}
        weight={700}
      >
        {step >= 3 ? `new ${f(result.next)}` : "old 1.00"}
      </VizText>
      <Caption
        first={`Qnew = 1 + ${f(value)} × (${f(result.target)} − 1) = ${f(result.next)}`}
        second="一步更新示例：r = 1，γ = 0.9，非终止状态；Q-learning 的 target 取 max。"
      />
    </LabCanvas>
  );
}

function SarsaLab({ step, value }: LabProps) {
  const action = Math.round(value);
  const result = rlLabCalculations.sarsa(action);
  return (
    <LabCanvas label="SARSA 使用实际采样的下一动作，比较 Q learning 的 max target">
      <VizNode
        x={27}
        y={112}
        width={145}
        label="s → a → r → s′"
        sublabel="on-policy transition"
        active={step === 0}
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <VizArrow
            x1={177}
            y1={142}
            x2={257}
            y2={64 + i * 79}
            active={step >= 1 && action === i}
            color={teal}
          />
          <VizNode
            x={264}
            y={36 + i * 79}
            width={156}
            height={58}
            label={`a′${i + 1} · Q = ${[1, 4, -2][i]}`}
            sublabel={
              action === i ? "此次实际采样 selected" : "其他可能 action"
            }
            active={action === i}
          />
        </g>
      ))}
      <VizArrow
        x1={426}
        y1={64 + action * 79}
        x2={498}
        y2={111}
        active={step >= 2}
      />
      <VizNode
        x={506}
        y={82}
        width={182}
        label={`SARSA target ${f(result.target)}`}
        sublabel={`1 + 0.9 × (${result.nextQ})`}
        active={step >= 2}
      />
      <VizNode
        x={506}
        y={179}
        width={182}
        label="Q-learning target 4.60"
        sublabel="无论采到哪个，都取 max = 4"
        color={orange}
        active={step >= 3}
      />
      <Caption
        first={`Qnew = 1 + 0.4 × (${f(result.target)} − 1) = ${f(result.next)}`}
        second="滑块切换一次可能的采样结果；并非把 SARSA 改成确定性策略，也不是 Expected SARSA。"
      />
    </LabCanvas>
  );
}

function DqnLab({ step, value }: LabProps) {
  const result = rlLabCalculations.dqn(value);
  return (
    <LabCanvas label="DQN 从回放中取样，使用冻结 target network 计算 Bellman target">
      <g opacity={step === 0 ? 1 : 0.65} style={motion}>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={37 + i * 5}
            y={46 + i * 7}
            width={130}
            height={74}
            rx={11}
            fill="#edf1e9"
            stroke="#b5c6b8"
          />
        ))}
        <VizText x={111} y={82} anchor="middle" size={14} weight={700}>
          Replay buffer
        </VizText>
        <VizText x={111} y={107} anchor="middle" size={13}>
          (s,a,1,s′,done=0)
        </VizText>
      </g>
      <VizArrow x1={179} y1={85} x2={242} y2={85} active={step >= 1} />
      <VizNode
        x={248}
        y={55}
        width={192}
        label="Online network θ"
        sublabel="Qθ(s,a) = 2 · 会接收梯度"
        active={step >= 1}
      />
      <VizNode
        x={248}
        y={187}
        width={192}
        label="Target network θ⁻"
        sublabel="Qθ⁻(s′) = [2,4,3] · 冻结"
        active={step >= 2}
        color={blue}
      />
      <path
        d="M 177 103 L 202 103 L 202 216 L 241 216"
        fill="none"
        stroke={step >= 2 ? blue : "#cad4ca"}
        strokeWidth={2}
        strokeDasharray="6 5"
      />
      <VizArrow
        x1={446}
        y1={216}
        x2={509}
        y2={216}
        active={step >= 2}
        color={blue}
      />
      <VizNode
        x={516}
        y={187}
        width={170}
        label={`y = ${f(result.target)}`}
        sublabel={`1 + ${f(value)} × max[2,4,3]`}
        active={step >= 2}
        color={blue}
      />
      <VizNode
        x={516}
        y={55}
        width={170}
        label={`MSE = ${f(result.loss)}`}
        sublabel="(Qθ(s,a) − stopgrad(y))²"
        active={step >= 3}
        color={orange}
      />
      <VizArrow
        x1={602}
        y1={181}
        x2={602}
        y2={122}
        active={step >= 3}
        color={orange}
      />
      <VizArrow
        x1={510}
        y1={85}
        x2={447}
        y2={85}
        active={step >= 3}
        color={orange}
      />
      <Caption
        first={`TD error = y − Qθ = ${f(result.target)} − 2 = ${f(result.error)}`}
        second="图示为原始 DQN 的 max target；终止状态 done = 1 时 target 只剩即时奖励。"
      />
    </LabCanvas>
  );
}

function ReinforceLab({ step, value }: LabProps) {
  const result = rlLabCalculations.reinforce(value);
  const probability = step >= 3 ? result.nextProbability : 0.4;
  return (
    <LabCanvas label="REINFORCE 用轨迹回报减 baseline 改变所采样动作的概率">
      <VizNode
        x={30}
        y={39}
        width={167}
        label="采样 action a"
        sublabel="πθ(a|s) = 0.40"
        active={step === 0}
      />
      <VizArrow x1={203} y1={69} x2={260} y2={69} active={step >= 1} />
      <VizNode
        x={267}
        y={39}
        width={173}
        label={`完整轨迹 G = ${f(value)}`}
        sublabel="Monte Carlo return"
        active={step >= 1}
        color={blue}
      />
      <VizArrow x1={446} y1={69} x2={503} y2={69} active={step >= 2} />
      <VizNode
        x={510}
        y={39}
        width={178}
        label={`A = G − b = ${f(result.advantage)}`}
        sublabel="固定 baseline b = 1"
        active={step >= 2}
        color={result.advantage >= 0 ? teal : orange}
      />
      <HorizontalBar
        x={62}
        y={176}
        width={270}
        fraction={probability}
        label={`采样动作 a：${f(probability * 100, 1)}%`}
        active={step >= 2}
      />
      <HorizontalBar
        x={389}
        y={176}
        width={270}
        fraction={1 - probability}
        label={`另一个动作：${f((1 - probability) * 100, 1)}%`}
        color={orange}
        active={step >= 2}
      />
      <VizText
        x={360}
        y={231}
        anchor="middle"
        size={16}
        weight={700}
        fill={result.advantage >= 0 ? teal : orange}
      >
        {result.advantage > 0
          ? "↑ 超出预期，增加所选 action 的概率"
          : result.advantage < 0
            ? "↓ 低于预期，降低所选 action 的概率"
            : "A = 0，这条样本不推动 policy"}
      </VizText>
      <Caption
        first={`θnew = log(0.4/0.6) + 0.2 × A × (1−0.4) → pnew = ${f(result.nextProbability)}`}
        second="二动作 Bernoulli logit 的精确一步梯度上升示例；不是直接把 advantage 加到概率。"
      />
    </LabCanvas>
  );
}

function ActorCriticLab({ step, value }: LabProps) {
  const result = rlLabCalculations.actorCritic(value);
  return (
    <LabCanvas label="Actor Critic 的价值 baseline、TD error 与两个更新分支">
      <VizNode
        x={273}
        y={26}
        width={174}
        label="环境 transition"
        sublabel="r = 1, γ = 0.9, V(s′) = 3"
        active={step === 0}
      />
      <VizArrow x1={360} y1={91} x2={360} y2={123} active={step >= 1} />
      <VizNode
        x={238}
        y={129}
        width={244}
        label={`δ = 3.70 − ${f(value)} = ${f(result.delta)}`}
        sublabel="one-step TD advantage estimate"
        active={step >= 1}
        color={result.delta >= 0 ? teal : orange}
      />
      <VizArrow
        x1={231}
        y1={158}
        x2={192}
        y2={211}
        active={step >= 2}
        color={teal}
      />
      <VizArrow
        x1={489}
        y1={158}
        x2={529}
        y2={211}
        active={step >= 3}
        color={blue}
      />
      <VizNode
        x={31}
        y={211}
        width={237}
        label={`Actor: p(a) 0.40 → ${f(result.nextProbability)}`}
        sublabel="δ ∇ log π：改变行动倾向"
        active={step >= 2}
      />
      <VizNode
        x={452}
        y={211}
        width={237}
        label={`Critic: V ${f(value)} → ${f(result.nextValue)}`}
        sublabel="V ← V + 0.2 δ：校正估值"
        active={step >= 3}
        color={blue}
      />
      <Caption
        first={`bootstrap target = r + γV(s′) = 1 + 0.9×3 = ${f(result.target)}`}
        second="滑块改变当前 V(s)；δ 给 Actor 提供方向，同时给 Critic 提供预测误差。"
      />
    </LabCanvas>
  );
}

function SacLab({ step, value }: LabProps) {
  const result = rlLabCalculations.sac(value);
  return (
    <LabCanvas label="Soft Actor Critic 的双 Q 下界与 entropy 系数 alpha">
      <VizNode
        x={29}
        y={33}
        width={168}
        label="从 policy 采样 a′"
        sublabel="log π(a′|s′) = −0.80"
        active={step === 0}
      />
      <VizNode
        x={270}
        y={26}
        width={171}
        label="Target Q₁ = 3.00"
        sublabel="first critic"
        active={step >= 1}
        color={blue}
      />
      <VizNode
        x={270}
        y={107}
        width={171}
        label="Target Q₂ = 2.50"
        sublabel="second critic"
        active={step >= 1}
      />
      <VizArrow
        x1={203}
        y1={62}
        x2={263}
        y2={54}
        active={step >= 1}
        color={blue}
      />
      <VizArrow x1={203} y1={75} x2={263} y2={136} active={step >= 1} />
      <VizNode
        x={513}
        y={67}
        width={176}
        label="min(Q₁,Q₂) = 2.50"
        sublabel="取较小的 critic 估计"
        active={step >= 1}
      />
      <VizArrow x1={447} y1={55} x2={505} y2={93} active={step >= 1} />
      <VizArrow x1={447} y1={136} x2={505} y2={108} active={step >= 1} />
      <VizText x={36} y={199} size={13}>
        sampled soft value
      </VizText>
      <rect x={36} y={215} width={300} height={30} rx={6} fill={teal} />
      <rect
        x={336}
        y={215}
        width={step >= 2 ? result.bonus * 120 : 0}
        height={30}
        rx={6}
        fill={orange}
        style={motion}
      />
      <VizText x={182} y={236} anchor="middle" fill="white" size={13}>
        min Q = 2.50
      </VizText>
      <VizText x={354} y={271} size={13} fill={orange}>
        −α log π = {f(result.bonus)}
      </VizText>
      <Caption
        first={`y = 1 + 0.9 × [2.50 − ${f(value)} × (−0.80)] = ${f(result.target)}`}
        second="本例固定 sampled action 与 log π；α 改变熵项权重。连续动作的 log density 不一定为负。"
      />
    </LabCanvas>
  );
}

function RewardModelLab({ step, value }: LabProps) {
  const result = rlLabCalculations.rewardModel(value);
  const plotX = (x: number) => 386 + (x + 4) * 34;
  const plotY = (p: number) => 237 - p * 151;
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = -4 + i / 10;
    return `${i ? "L" : "M"}${plotX(x)} ${plotY(sigmoid(x))}`;
  }).join(" ");
  return (
    <LabCanvas label="Reward Model 的成对偏好分数与 sigmoid 概率">
      <VizNode
        x={29}
        y={49}
        width={257}
        label={`偏好回答 yw：r = ${f(value / 2)}`}
        sublabel="chosen answer · 人类标签为 winner"
        active={step === 0 || step >= 1}
      />
      <VizNode
        x={29}
        y={139}
        width={257}
        label={`另一回答 yl：r = ${f(-value / 2)}`}
        sublabel="rejected answer · 同一个 prompt"
        active={step >= 1}
        color={orange}
      />
      <VizText x={35} y={247} size={15} weight={700}>
        score gap Δr = {f(value)}
      </VizText>
      <line x1={386} y1={237} x2={663} y2={237} stroke="#bdcabc" />
      <line x1={386} y1={78} x2={386} y2={237} stroke="#bdcabc" />
      <path
        d={curve}
        fill="none"
        stroke={teal}
        strokeWidth={3}
        opacity={step >= 2 ? 1 : 0.3}
      />
      <line
        x1={plotX(value)}
        y1={237}
        x2={plotX(value)}
        y2={plotY(result.probability)}
        stroke={orange}
        strokeDasharray="4 4"
      />
      <circle
        cx={plotX(value)}
        cy={plotY(result.probability)}
        r={7}
        fill={orange}
        style={motion}
      />
      <VizText x={522} y={45} anchor="middle" size={15} weight={700}>
        P(yw ≻ yl) = σ(Δr)
      </VizText>
      <VizText x={522} y={68} anchor="middle" size={14} fill={teal}>
        {f(result.probability * 100, 1)}%
      </VizText>
      <VizText x={386} y={258} anchor="middle" size={13}>
        −4
      </VizText>
      <VizText x={522} y={258} anchor="middle" size={13}>
        0
      </VizText>
      <VizText x={658} y={258} anchor="middle" size={13}>
        4
      </VizText>
      <Caption
        first={`L = −log σ(${f(value)}) = ${f(result.loss)} · ∂L/∂Δr = ${f(result.gradient)}`}
        second="只解释 Bradley–Terry pairwise loss；reward 的绝对零点不可由成对偏好唯一确定。"
      />
    </LabCanvas>
  );
}

function DpoLab({ step, value }: LabProps) {
  const result = rlLabCalculations.dpo(value);
  return (
    <LabCanvas label="DPO 比较 policy 与冻结 reference 的 log ratio 再乘 beta">
      <VizNode
        x={30}
        y={33}
        width={298}
        label="可训练 policy πθ"
        sublabel="πθ(yw|x)=0.60, πθ(yl|x)=0.20"
        active={step === 0 || step >= 2}
      />
      <VizNode
        x={391}
        y={33}
        width={298}
        label="冻结 reference πref"
        sublabel="πref(yw|x)=0.40, πref(yl|x)=0.30"
        active={step >= 1}
        color={blue}
      />
      <VizText x={179} y={121} anchor="middle" size={14}>
        log(0.60 / 0.20) = {f(result.policyLogRatio, 3)}
      </VizText>
      <VizText x={540} y={121} anchor="middle" size={14}>
        log(0.40 / 0.30) = {f(result.referenceLogRatio, 3)}
      </VizText>
      <VizArrow x1={179} y1={135} x2={285} y2={169} active={step >= 2} />
      <VizArrow
        x1={540}
        y1={135}
        x2={435}
        y2={169}
        active={step >= 2}
        color={blue}
      />
      <VizNode
        x={221}
        y={176}
        width={278}
        label={`Δ = policy − ref = ${f(result.difference, 3)}`}
        sublabel={`β × Δ = ${f(value)} × ${f(result.difference, 3)} = ${f(result.logit, 3)}`}
        active={step >= 2}
      />
      <g opacity={step >= 3 ? 1 : 0.35} style={motion}>
        <rect x={231} y={243} width={257} height={29} rx={6} fill={pale} />
        <rect
          x={231}
          y={243}
          width={257 * result.probability}
          height={29}
          rx={6}
          fill="#bbdace"
          style={motion}
        />
        <VizText
          x={360}
          y={263}
          anchor="middle"
          size={14}
          weight={700}
          fill={teal}
        >
          σ(βΔ) = {f(result.probability * 100, 1)}% · L = {f(result.loss, 3)}
        </VizText>
      </g>
      <Caption
        first={`L = −log σ(β[(log πθw − log πθl) − (log πref,w − log πref,l)])`}
        second="固定两组示意序列概率；β 改变这对样本的 logit 与梯度，不能据此推断训练后的偏好胜率。"
      />
    </LabCanvas>
  );
}

function ContrastiveLab({ step, value }: LabProps) {
  const result = rlLabCalculations.contrastive(value);
  const ax = 205;
  const ay = 153;
  const negativeX = ax + value * 87;
  return (
    <LabCanvas label="成对 contrastive loss 的正样本吸引与 margin 内负样本排斥">
      <circle
        cx={ax}
        cy={ay}
        r={130.5}
        fill="#eff3ed"
        stroke="#bdcdbf"
        strokeDasharray="6 5"
      />
      <VizText x={75} y={25} size={13} fill={muted}>
        负对 margin m = 1.50
      </VizText>
      <line
        x1={ax}
        y1={ay}
        x2={ax - 69.6}
        y2={ay}
        stroke={teal}
        strokeWidth={step >= 1 ? 4 : 1.5}
      />
      <line
        x1={ax}
        y1={ay}
        x2={negativeX}
        y2={ay}
        stroke={orange}
        strokeWidth={step >= 2 ? 4 : 1.5}
        style={motion}
      />
      <circle cx={ax} cy={ay} r={17} fill={blue} />
      <circle cx={ax - 69.6} cy={ay} r={13} fill={teal} />
      <circle cx={negativeX} cy={ay} r={13} fill={orange} style={motion} />
      <VizText x={ax} y={193} anchor="middle" size={13}>
        anchor
      </VizText>
      <VizText x={ax - 69.6} y={119} anchor="middle" size={13} fill={teal}>
        positive
      </VizText>
      <VizText x={negativeX} y={119} anchor="middle" size={13} fill={orange}>
        negative
      </VizText>
      {step >= 1 && (
        <VizArrow x1={145} y1={224} x2={187} y2={224} active color={teal} />
      )}
      {step >= 2 && value < 1.5 && (
        <VizArrow
          x1={negativeX + 15}
          y1={224}
          x2={negativeX + 62}
          y2={224}
          active
          color={orange}
        />
      )}
      <VizNode
        x={476}
        y={52}
        width={215}
        label="正对 L+ = d+² = 0.64"
        sublabel="d+ = 0.80 · 拉近 positive"
        active={step >= 1}
      />
      <VizNode
        x={476}
        y={144}
        width={215}
        label={`负对 L− = ${f(result.negativeLoss)}`}
        sublabel={`max(0, 1.50 − ${f(value)})²`}
        active={step >= 2}
        color={orange}
      />
      <VizText x={584} y={248} anchor="middle" size={14} weight={700}>
        {value < 1.5
          ? "negative 在 margin 内：推远"
          : "negative 已够远：此负对梯度为 0"}
      </VizText>
      <Caption
        first={`成对 contrastive loss = d+² + max(0,m−d−)² = ${f(result.loss)}`}
        second="这里展示一种 pairwise margin loss；contrastive learning 还可采用 InfoNCE 等其他目标。"
      />
    </LabCanvas>
  );
}

function InfoNceLab({ step, value }: LabProps) {
  const result = rlLabCalculations.infoNce(value);
  return (
    <LabCanvas label="InfoNCE 温度缩放如何改变正负候选的 softmax 概率">
      <VizText x={31} y={31} size={14} weight={700}>
        同一组 similarity，改变 temperature τ
      </VizText>
      <VizText x={111} y={63} anchor="middle" size={13} fill={muted}>
        candidate / similarity
      </VizText>
      <VizText x={307} y={63} anchor="middle" size={13} fill={muted}>
        logit = similarity / τ
      </VizText>
      <VizText x={532} y={63} anchor="middle" size={13} fill={muted}>
        softmax probability
      </VizText>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={31}
            y={79 + i * 46}
            width={162}
            height={32}
            rx={8}
            fill={i === 0 ? "#e0efe7" : "#f1eee5"}
          />
          <VizText
            x={112}
            y={101 + i * 46}
            anchor="middle"
            size={13}
            fill={i === 0 ? teal : muted}
          >
            {i === 0 ? "positive" : `negative ${i}`} ·{" "}
            {[0.8, 0.6, 0.1, -0.3][i]}
          </VizText>
          <VizArrow
            x1={202}
            y1={96 + i * 46}
            x2={252}
            y2={96 + i * 46}
            active={step >= 1}
          />
          <VizText x={307} y={101 + i * 46} anchor="middle" size={14}>
            {f(result.logits[i])}
          </VizText>
          <VizArrow
            x1={353}
            y1={96 + i * 46}
            x2={399}
            y2={96 + i * 46}
            active={step >= 2}
          />
          <rect
            x={411}
            y={85 + i * 46}
            width={212}
            height={21}
            rx={4}
            fill={pale}
          />
          <rect
            x={411}
            y={85 + i * 46}
            width={result.probabilities[i] * 212}
            height={21}
            rx={4}
            fill={i === 0 ? teal : orange}
            opacity={step >= 2 ? 1 : 0.35}
            style={motion}
          />
          <VizText x={639} y={101 + i * 46} size={13}>
            {f(result.probabilities[i] * 100, 1)}%
          </VizText>
        </g>
      ))}
      <Caption
        first={`p+ = exp(0.8/τ) / Σ exp(si/τ) = ${f(result.probabilities[0], 3)} → L = ${f(result.loss, 3)}`}
        second="固定 similarity 时，较低 τ 会放大分数差；若最高分是假负例，尖锐化也会强化错误配对。"
      />
    </LabCanvas>
  );
}

function TripletLab({ step, value }: LabProps) {
  const result = rlLabCalculations.triplet(value);
  const radius = Math.sqrt(result.thresholdSquared) * 82;
  return (
    <LabCanvas label="Triplet loss 的距离差与 margin hinge 生效边界">
      <circle
        cx={191}
        cy={150}
        r={radius}
        fill={result.loss > 0 ? "#faeee3" : "#e8f1e8"}
        stroke={result.loss > 0 ? orange : teal}
        strokeDasharray="6 5"
        style={motion}
      />
      <circle
        cx={191}
        cy={150}
        r={65.6}
        fill="none"
        stroke={teal}
        opacity={0.45}
      />
      <line
        x1={191}
        y1={150}
        x2={125.4}
        y2={150}
        stroke={teal}
        strokeWidth={3}
      />
      <line
        x1={191}
        y1={150}
        x2={289.4}
        y2={150}
        stroke={orange}
        strokeWidth={3}
      />
      <circle cx={191} cy={150} r={15} fill={blue} />
      <circle cx={125.4} cy={150} r={12} fill={teal} />
      <circle cx={289.4} cy={150} r={12} fill={orange} />
      <VizText x={125.4} y={121} anchor="middle" size={13} fill={teal}>
        positive
      </VizText>
      <VizText x={289.4} y={121} anchor="middle" size={13} fill={orange}>
        negative
      </VizText>
      <VizText x={191} y={180} anchor="middle" size={13}>
        anchor
      </VizText>
      <VizText x={191} y={265} anchor="middle" size={13}>
        虚线：d(a,n)² 应 ≥ {f(result.thresholdSquared)}
      </VizText>
      <VizNode
        x={399}
        y={36}
        width={288}
        label="距离平方：d+² = 0.64, d−² = 1.44"
        sublabel="固定三元组；只改变 margin"
        active={step === 0}
      />
      <VizNode
        x={399}
        y={124}
        width={288}
        label={`要求 1.44 ≥ 0.64 + ${f(value)}`}
        sublabel={
          result.loss > 0
            ? "尚未满足：negative 落在虚线内"
            : "已满足：这条 triplet 不产生损失"
        }
        active={step >= 1}
        color={result.loss > 0 ? orange : teal}
      />
      {step >= 3 && result.loss > 0 && (
        <>
          <VizArrow x1={137} y1={214} x2={173} y2={214} active color={teal} />
          <VizArrow x1={282} y1={214} x2={322} y2={214} active color={orange} />
        </>
      )}
      <g opacity={step >= 2 ? 1 : 0.35} style={motion}>
        <VizText
          x={542}
          y={237}
          anchor="middle"
          size={22}
          weight={700}
          fill={result.loss > 0 ? orange : teal}
        >
          hinge loss = {f(result.loss)}
        </VizText>
      </g>
      <Caption
        first={`L = max(0, ||a−p||² − ||a−n||² + m) = max(0, ${f(value)} − 0.80)`}
        second="本图明确使用平方欧氏距离；换成欧氏距离或 cosine distance 时，margin 的尺度要重选。"
      />
    </LabCanvas>
  );
}

export const reinforcementRepresentationLabs: Record<string, LabDefinition> = {
  "reinforcement-learning": {
    title: "把未来奖励折回现在",
    englishTitle: "Discounted return",
    parameter: {
      label: "折扣系数 γ",
      min: 0,
      max: 1,
      step: 0.05,
      initial: 0.9,
      hint: "γ 越大，远期 reward 在同一条轨迹中占比越大。",
    },
    steps: [
      {
        title: "Observe → act",
        explanation:
          "观察 state，按 policy 选 action；环境随后返回 reward 与下一个 state。",
      },
      {
        title: "Collect a trajectory",
        explanation:
          "固定示例奖励依次是 1、2、4。RL 要关心行动带来的未来结果，而非只有当下 reward。",
      },
      {
        title: "Apply discount",
        explanation:
          "三份贡献分别为 1、γ×2、γ²×4；拖动 γ，看较远的第三步如何被衰减。",
      },
      {
        title: "Add the return",
        explanation:
          "G₀ 是这些折扣奖励的和。实际 value 估计对可能轨迹取期望；这里仅展示一条已固定的轨迹。",
      },
    ],
    note: "三步有限轨迹的精确算例；不表示任何训练收益曲线。γ 的选择还依赖任务时域与 reward 定义。",
    render: ReinforcementLearningLab,
  },
  "multi-armed-bandit": {
    title: "探索概率怎样分给每个 arm",
    englishTitle: "Epsilon-greedy allocation",
    parameter: {
      label: "探索率 ε",
      min: 0,
      max: 1,
      step: 0.05,
      initial: 0.2,
      hint: "随机分支在全部三个 arm 中均匀抽样，包含当前最优 arm。",
    },
    steps: [
      {
        title: "Estimate values",
        explanation:
          "固定 Q=[1,3,2]，当前估计最好的 arm 是 2。这些数不是已知真实期望收益。",
      },
      {
        title: "Split the decision",
        explanation:
          "以 1−ε 的概率走 greedy 分支选 arm 2，以 ε 的概率走 uniform exploration 分支。",
      },
      {
        title: "Compute probabilities",
        explanation:
          "非最优 arm 各得 ε/3；最优 arm 得 1−ε+ε/3，所以三条概率总和始终是 1。",
      },
      {
        title: "Sample, then update",
        explanation:
          "按这组概率采样一次行动，再根据新 reward 更新被选 arm 的 Q。图中固定 Q 以单独观察 ε。",
      },
    ],
    note: "图示为 ε-greedy 的概率分配；UCB、Thompson sampling 有不同的探索机制。",
    render: BanditLab,
  },
  "q-learning": {
    title: "沿 TD error 更新一格 Q 表",
    englishTitle: "Q-learning backup",
    parameter: {
      label: "学习率 α",
      min: 0,
      max: 1,
      step: 0.05,
      initial: 0.4,
      hint: "α=0 保留旧估计，α=1 直接移到这次 Bellman target。",
    },
    steps: [
      {
        title: "Read the old estimate",
        explanation: "当前 Q(s,a)=1，收到 r=1 并到达非终止状态 s′。",
      },
      {
        title: "Choose max next Q",
        explanation:
          "下一状态动作价值是 [1,4,−2]。Q-learning 取最大值 4 构造 off-policy target。",
      },
      {
        title: "Build the target",
        explanation: "固定 γ=0.9，target=1+0.9×4=4.6，TD error=4.6−1=3.6。",
      },
      {
        title: "Move by α",
        explanation:
          "新估计是 Q+α×TD error。滑块只改变这一次更新的步长，不表示更多训练轮次。",
      },
    ],
    note: "表格型、非终止的一次更新；终止状态不加入未来 Q。",
    render: QLearningLab,
  },
  sarsa: {
    title: "下一步实际选谁，就用谁的 Q",
    englishTitle: "SARSA versus max backup",
    parameter: {
      label: "这次采样的下一动作 a′",
      min: 0,
      max: 2,
      step: 1,
      initial: 0,
      hint: "0、1、2 分别选择图中的 a′1、a′2、a′3；模拟不同采样结果。",
    },
    steps: [
      {
        title: "Observe S,A,R,S′",
        explanation:
          "SARSA 使用相邻两次决策的数据：状态、动作、奖励、下一状态、下一动作。",
      },
      {
        title: "Sample A′ from policy",
        explanation:
          "下一动作 a′ 由正在执行的行为 policy 采样；探索动作同样会进入更新目标。",
      },
      {
        title: "Use the sampled value",
        explanation:
          "target=r+γQ(s′,a′)。切换采样动作后，target 可能升高，也可能变成负数。",
      },
      {
        title: "Compare with Q-learning",
        explanation:
          "Q-learning 对同一 s′ 始终使用 max Q=4；SARSA 评估当前 policy 及其探索行为。",
      },
    ],
    note: "固定 γ=0.9、α=0.4、旧 Q=1；滑块选择一条可能结果，不替代真实的随机采样器。",
    render: SarsaLab,
  },
  dqn: {
    title: "冻结的 target 怎样监督 online network",
    englishTitle: "DQN replay and target network",
    parameter: {
      label: "折扣系数 γ",
      min: 0,
      max: 1,
      step: 0.05,
      initial: 0.9,
      hint: "改变未来 Q 的权重；观察 Bellman target 与平方误差一起变化。",
    },
    steps: [
      {
        title: "Sample replay",
        explanation:
          "从 replay buffer 采样 transition，打破连续观测的强相关；此例 reward=1、done=0。",
      },
      {
        title: "Online prediction",
        explanation:
          "可训练的 online network 对这条记录中的动作输出 Qθ(s,a)=2。",
      },
      {
        title: "Frozen target",
        explanation:
          "冻结的 target network 输出下一状态 [2,4,3]，用 y=1+γ×4 构造监督目标，并停止通过 y 反传。",
      },
      {
        title: "Regress and synchronize",
        explanation:
          "最小化 (Qθ−y)² 来更新 online 参数；target 参数按设定间隔复制。图中只展开一次损失计算。",
      },
    ],
    note: "采用原始 DQN 的 max target；Double DQN 会用 online 选动作、target 评价所选动作。",
    render: DqnLab,
  },
  reinforce: {
    title: "回报怎样提高或压低动作概率",
    englishTitle: "REINFORCE with a baseline",
    parameter: {
      label: "这条轨迹回报 G",
      min: -2,
      max: 4,
      step: 0.25,
      initial: 2.5,
      hint: "固定 baseline b=1；G 越过 1 时，policy gradient 的方向翻转。",
    },
    steps: [
      {
        title: "Sample an action",
        explanation:
          "二动作 policy 以 p=0.4 采到动作 a。参数 θ 是 logit，p=σ(θ)。",
      },
      {
        title: "Finish the rollout",
        explanation:
          "等轨迹结束后计算 Monte Carlo return G，避免在这里使用下一状态 value 来 bootstrap。",
      },
      {
        title: "Subtract a baseline",
        explanation:
          "使用固定 b=1 得到 A=G−b。baseline 不依赖所选动作，可以减少方差而不改变期望 policy gradient。",
      },
      {
        title: "Ascend the log probability",
        explanation:
          "对采到的动作，∂log p/∂θ=1−p；θ←θ+0.2A(1−p)，再用 sigmoid 得到新概率。",
      },
    ],
    note: "这是 REINFORCE 加固定 baseline 的一步二动作算例；真实训练通常对多个时间步与多个 rollout 求平均。",
    render: ReinforceLab,
  },
  "actor-critic": {
    title: "同一个 TD error 驱动两种更新",
    englishTitle: "Actor and critic feedback",
    parameter: {
      label: "Critic 当前估计 V(s)",
      min: 0,
      max: 5,
      step: 0.1,
      initial: 2,
      hint: "当 V(s) 超过 target=3.7 时，TD advantage 变负，Actor 转为降低该动作概率。",
    },
    steps: [
      {
        title: "Receive a transition",
        explanation:
          "固定 r=1、γ=0.9、V(s′)=3，得到一步 bootstrap target=3.7。",
      },
      {
        title: "Estimate advantage",
        explanation:
          "δ=r+γV(s′)−V(s) 表示这次结果相对于当前预期的好坏，是带 bootstrap 的 advantage 估计。",
      },
      {
        title: "Update actor",
        explanation:
          "Actor 用 δ∇logπ 改变动作倾向；此二动作示例从 p=0.4 做一次 logit 更新。",
      },
      {
        title: "Update critic",
        explanation:
          "Critic 用 V←V+0.2δ 靠近 target。实际神经网络通过 value loss 更新参数，Actor 通常不通过 δ 回传进 Critic。",
      },
    ],
    note: "固定下一个 value 以隔离 baseline 的作用；图中的标量 Critic 更新对应半平方误差梯度。",
    render: ActorCriticLab,
  },
  sac: {
    title: "在双 Q target 中加入熵项",
    englishTitle: "SAC entropy-regularized backup",
    parameter: {
      label: "熵系数 α",
      min: 0,
      max: 2,
      step: 0.1,
      initial: 0.2,
      hint: "本例 log π=-0.8 固定，熵项为 0.8α；它与 twin-Q 最小值一起构成 soft target。",
    },
    steps: [
      {
        title: "Sample next action",
        explanation:
          "从当前 stochastic policy 采样下一动作 a′，计算它的 log probability 或连续动作 log density。",
      },
      {
        title: "Take the smaller critic",
        explanation:
          "两个 target critic 分别给出 3.0、2.5，取 min=2.5 以缓解高估。",
      },
      {
        title: "Include entropy",
        explanation:
          "soft value=min Q−α logπ。本例 logπ=-0.8，因此橙色项增加 0.8α；拖动 α 观察贡献。",
      },
      {
        title: "Build the soft backup",
        explanation:
          "target=r+γ(min Q−αlogπ)。两个 critic 都回归该 target；Actor 则优化同形式的 Q 与熵权衡。",
      },
    ],
    note: "采用现代 SAC 的 twin-Q 形式；这是固定样本的算例，α 调大不保证最终 reward 提升。",
    render: SacLab,
  },
  "reward-model": {
    title: "把偏好分差变成 pairwise 概率",
    englishTitle: "Reward model pairwise loss",
    parameter: {
      label: "奖励分差 Δr",
      min: -4,
      max: 4,
      step: 0.2,
      initial: 1.4,
      hint: "正分差支持 chosen；负分差表示 reward model 当前把 rejected 排得更高。",
    },
    steps: [
      {
        title: "Collect a preference pair",
        explanation:
          "同一个 prompt 下有 chosen yw 与 rejected yl；标签说 yw 更受偏好。",
      },
      {
        title: "Score both answers",
        explanation:
          "同一个 reward model 输出两个标量。图中设 r(yw)=Δr/2，r(yl)=−Δr/2，隔离分差的作用。",
      },
      {
        title: "Convert the difference",
        explanation:
          "Bradley–Terry 模型给出 P(yw≻yl)=σ(rw−rl)，不是对单个 reward score 做绝对质量解释。",
      },
      {
        title: "Optimize pairwise loss",
        explanation:
          "最小化 −logσ(Δr)。对分差的梯度是 σ(Δr)−1，错误排序会产生更强的纠正信号。",
      },
    ],
    note: "偏好模型的概率是这一成对模型的输出；它不等于事实正确率，也不校准绝对 reward 零点。",
    render: RewardModelLab,
  },
  dpo: {
    title: "先扣除 reference，再比较偏好",
    englishTitle: "DPO reference-relative log odds",
    parameter: {
      label: "DPO 系数 β",
      min: 0.1,
      max: 3,
      step: 0.1,
      initial: 0.5,
      hint: "固定 πθ 和 πref；β 缩放 reference-relative gap，观察 sigmoid 与 loss。",
    },
    steps: [
      {
        title: "Policy log odds",
        explanation:
          "计算 policy 对 chosen/rejected 的 log probability 差，即 logπθ(yw|x)−logπθ(yl|x)。",
      },
      {
        title: "Reference log odds",
        explanation:
          "冻结 reference 也对同一对回答计算差值；它保留了参考模型原先的偏好程度。",
      },
      {
        title: "Subtract, then scale",
        explanation:
          "Δ=policy log odds−reference log odds。DPO 的 logit 是 βΔ，不是单独的 policy 分差。",
      },
      {
        title: "Compute preference loss",
        explanation:
          "最小化 −logσ(βΔ) 来直接更新 policy。固定概率下更大的 β 会让此例 loss 下降，但训练效果还依赖 reference 与数据。",
      },
    ],
    note: "序列概率为简化的固定算例；实际语言模型使用 token log probabilities 之和，并对 reference 停止梯度。",
    render: DpoLab,
  },
  "contrastive-learning": {
    title: "正对拉近，近处的负对推远",
    englishTitle: "Pairwise contrastive geometry",
    parameter: {
      label: "负样本距离 d−",
      min: 0.25,
      max: 2.5,
      step: 0.05,
      initial: 1,
      hint: "负对距离超过 margin=1.5 后，该负对的 hinge 项变为 0；正对仍有拉近损失。",
    },
    steps: [
      {
        title: "Define the relations",
        explanation:
          "先定义 anchor、语义相关 positive 和语义不同 negative；错误配对会直接改变学到的几何结构。",
      },
      {
        title: "Attract the positive",
        explanation:
          "这张图选用 pairwise contrastive loss 的正项 d+²；固定 d+=0.8，所以正项为 0.64。",
      },
      {
        title: "Repel nearby negatives",
        explanation:
          "负项是 max(0,m−d−)²，m=1.5。只有 margin 以内的负对会贡献这个排斥项。",
      },
      {
        title: "Combine the pair losses",
        explanation:
          "总损失为正对和负对项之和。图上位置为可调输入，箭头表示下降方向，不是已运行 encoder 训练。",
      },
    ],
    note: "Contrastive learning 是一类训练思路；本动效用 pairwise margin 目标解释几何，InfoNCE 动效另讲 softmax 目标。",
    render: ContrastiveLab,
  },
  infonce: {
    title: "温度如何改变多选题的难度",
    englishTitle: "InfoNCE temperature and softmax",
    parameter: {
      label: "温度 τ",
      min: 0.1,
      max: 2,
      step: 0.05,
      initial: 0.5,
      hint: "固定 similarity 下，低 τ 使 softmax 更尖锐；高 τ 使候选概率更接近。",
    },
    steps: [
      {
        title: "Compute similarities",
        explanation:
          "固定 anchor 对四个候选的 similarity=[0.8,0.6,0.1,−0.3]；第一项是已知 positive。",
      },
      {
        title: "Scale by temperature",
        explanation:
          "把各项除以 τ 得到 logits。τ 改变相对差距，但不会改变这组固定分数的排序。",
      },
      {
        title: "Normalize across candidates",
        explanation:
          "exp(logit) 除以全部候选指数和，得到总和为 1 的 softmax 概率，分母也包含 positive。",
      },
      {
        title: "Reward the correct pair",
        explanation:
          "L=−log p+。这组示例中 positive 分数最高，降低 τ 会降低 loss；若 hard negative 更高则不能照此推断。",
      },
    ],
    note: "候选与 similarity 均固定，展示的是精确目标计算；真实训练还要检查 false negatives 与 embedding collapse。",
    render: InfoNceLab,
  },
  "triplet-loss": {
    title: "margin 越过边界时，hinge 开始工作",
    englishTitle: "Triplet margin activation",
    parameter: {
      label: "间隔 margin m",
      min: 0.1,
      max: 2,
      step: 0.1,
      initial: 1,
      hint: "本例距离平方差为 0.8；m>0.8 才产生正损失，m≤0.8 时约束已满足。",
    },
    steps: [
      {
        title: "Pick a triplet",
        explanation:
          "固定 anchor、同类 positive、异类 negative；欧氏距离分别是 0.8 与 1.2。",
      },
      {
        title: "Set the required separation",
        explanation:
          "本例用平方欧氏距离，要求 d−²≥d+²+m。虚线半径是 sqrt(0.64+m)，不是 margin 本身。",
      },
      {
        title: "Apply the hinge",
        explanation:
          "L=max(0,0.64−1.44+m)。负例在虚线外时约束已满足，hinge loss 为零。",
      },
      {
        title: "Use informative triplets",
        explanation:
          "约束违反时，训练会拉近 positive、推远 negative。全是零损失的简单三元组时，需要更合适的 mining。",
      },
    ],
    note: "点固定、margin 可调；动效仅解释一次 triplet loss，不声称显示真实 embedding 的优化轨迹。",
    render: TripletLab,
  },
};
