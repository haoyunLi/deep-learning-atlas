import { useEffect, useState, type ComponentType } from "react";
import AttentionAnimation from "./AttentionAnimation";
import DiffusionAnimation from "./DiffusionAnimation";
import PPOAnimation from "./PPOAnimation";
import "../animation.css";

type AnimationSpec = {
  title: string;
  englishTitle: string;
  steps: { title: string; explanation: string }[];
};

export const animationSpecs: Record<string, AnimationSpec> = {
  attention: {
    title: "注意力怎样挑选上下文？",
    englishTitle: "Attention · Q/K/V walkthrough",
    steps: [
      {
        title: "同一序列生成 Q、K、V",
        explanation:
          "每个 token 的表示经过三组可学习投影。当前 token 的 Q 用来发问，所有 token 的 K 用来匹配，V 携带待汇总的信息。",
      },
      {
        title: "给可见位置打分",
        explanation:
          "Q 与各 K 做点积并除以 √dₖ；padding 或 causal mask 在 softmax 前屏蔽不允许读取的位置。",
      },
      {
        title: "Softmax 变成权重",
        explanation:
          "同一 query 的可见位置分数变为非负权重，总和为 1。分数较大的位置贡献更多，但权重不等于因果解释。",
      },
      {
        title: "对 V 加权求和",
        explanation:
          "把每个 V 按对应权重相加，形成当前 token 的上下文表示；多头注意力再把各头输出拼接并投影。",
      },
    ],
  },
  diffusion: {
    title: "扩散怎样从噪声生成图像？",
    englishTitle: "Diffusion · noise and denoise",
    steps: [
      {
        title: "准备真实样本 x₀",
        explanation:
          "训练从真实数据开始。图中小图案是抽象的像素示意，真实模型可处理更复杂的图像或其他数据。",
      },
      {
        title: "前向过程逐步加噪",
        explanation:
          "选一个时间步 t，把已知随机噪声加入 x₀ 得到 xₜ；时间越晚，原始结构通常越难辨认。",
      },
      {
        title: "网络学习预测噪声",
        explanation:
          "把 xₜ 和 t 交给网络，训练它预测加入的噪声 ε。训练目标与采样器的参数化要配套记录。",
      },
      {
        title: "从噪声多步反向采样",
        explanation:
          "生成时从 xₜ≈纯噪声出发，反复利用网络估计更新到更少噪声的状态；这张图压缩展示了多次迭代。",
      },
    ],
  },
  ppo: {
    title: "PPO 怎样限制更新激励？",
    englishTitle: "PPO-Clip · policy update walkthrough",
    steps: [
      {
        title: "旧策略采样并估 Advantage",
        explanation:
          "先用旧策略与环境交互，记下动作、旧概率和奖励，再估计该动作相对价值基线有多好。",
      },
      {
        title: "比较新旧动作概率",
        explanation:
          "对同一条采样记录计算 r=πnew(a|s)/πold(a|s)。r>1 表示新策略提高了该动作的概率。",
      },
      {
        title: "用 clipped surrogate 更新",
        explanation:
          "示例取 A=+1、ε=0.2、r=1.3，目标用 min(1.3,1.2)=1.2。裁剪限制继续增大概率的目标收益，不是参数变化的硬约束。",
      },
      {
        title: "有限更新后重新采样",
        explanation:
          "对这批轨迹做有限轮 actor/critic 更新，随后用当前策略收集新数据；持续看回报、KL 与 value loss。",
      },
    ],
  },
};

const visualizations: Record<string, ComponentType<{ step: number }>> = {
  attention: AttentionAnimation,
  diffusion: DiffusionAnimation,
  ppo: PPOAnimation,
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AnimatedExplainer({ lessonId }: { lessonId: string }) {
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const spec = animationSpecs[lessonId];
  const Visualization = visualizations[lessonId];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPlaying(false);
    };
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) setStep((current) => (current + 1) % 4);
    }, 3400);
    return () => window.clearInterval(interval);
  }, [playing, reducedMotion]);

  if (!spec || !Visualization) return null;

  function selectStep(next: number) {
    setPlaying(false);
    setStep((next + spec.steps.length) % spec.steps.length);
  }

  return (
    <section
      className="animated-explainer"
      id="animation"
      aria-label={`${spec.title}动效图`}
    >
      <div className="animated-explainer-heading">
        <div>
          <span className="animated-explainer-kicker">
            INTERACTIVE WALKTHROUGH · 动效拆解
          </span>
          <h2>{spec.title}</h2>
          <p>{spec.englishTitle}</p>
        </div>
        <span className="animated-explainer-counter">
          {String(step + 1).padStart(2, "0")} <i>/</i>{" "}
          {String(spec.steps.length).padStart(2, "0")}
        </span>
      </div>
      <div className="animated-explainer-stage">
        <Visualization step={step} />
      </div>
      <div className="animated-explainer-bottom">
        <div
          className="animated-step-copy"
          aria-live={playing ? "off" : "polite"}
        >
          <strong>{spec.steps[step].title}</strong>
          <p>{spec.steps[step].explanation}</p>
        </div>
        <div className="animated-controls" aria-label="动效播放控制">
          <button
            type="button"
            onClick={() => selectStep(step - 1)}
            aria-label="上一步"
          >
            ←
          </button>
          <button
            type="button"
            className="animated-play"
            onClick={() => setPlaying((value) => !value)}
            disabled={reducedMotion}
            aria-label={playing ? "暂停动效" : "播放动效"}
            title={
              reducedMotion
                ? "系统已启用减少动画，可使用前后步骤按钮"
                : undefined
            }
          >
            {playing ? "Ⅱ 暂停" : "▶ 播放"}
          </button>
          <button
            type="button"
            onClick={() => selectStep(step + 1)}
            aria-label="下一步"
          >
            →
          </button>
        </div>
      </div>
      <div className="animated-step-jumps" aria-label="跳转动效步骤">
        {spec.steps.map((item, index) => (
          <button
            type="button"
            key={item.title}
            aria-label={`跳转第 ${index + 1} 步：${item.title}`}
            aria-current={step === index ? "step" : undefined}
            onClick={() => selectStep(index)}
          />
        ))}
      </div>
      <p className="animated-explainer-note">
        示意动效用于理解计算顺序；颜色和示例数字不代表实际训练结果。
        <span className="animated-mobile-hint">手机上可左右滑动图示。</span>
      </p>
    </section>
  );
}
