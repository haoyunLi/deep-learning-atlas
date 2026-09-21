import { useEffect, useRef, useState, type ComponentType } from "react";
import AttentionAnimation from "./AttentionAnimation";
import DiffusionAnimation from "./DiffusionAnimation";
import PPOAnimation from "./PPOAnimation";
import type { Lesson } from "../data/lessons";
import { parameterLabs } from "./labs";
import CourseWalkthrough, { courseAnimationSteps } from "./CourseWalkthrough";
import "../animation.css";

type AnimationSpec = {
  title: string;
  englishTitle: string;
  steps: { title: string; explanation: string }[];
};

export const legacyAnimationSpecs: Record<string, AnimationSpec> = {
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
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function AnimatedExplainer({ lesson }: { lesson: Lesson }) {
  const lab = parameterLabs[lesson.id];
  const visualSpec = lab ?? legacyAnimationSpecs[lesson.id];
  const [mode, setMode] = useState<"visual" | "flow">(
    visualSpec ? "visual" : "flow",
  );
  const [step, setStep] = useState(0);
  const [value, setValue] = useState(lab?.parameter.initial ?? 0);
  const [speed, setSpeed] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const flow = mode === "flow" || !visualSpec;
  const spec: AnimationSpec = flow
    ? {
        title: `${lesson.title}：跟着步骤走`,
        englishTitle: `${lesson.englishTitle} · Step walkthrough`,
        steps: courseAnimationSteps(lesson),
      }
    : visualSpec;
  const Visualization = lab?.render;
  const LegacyVisualization = visualizations[lesson.id];
  const count = spec.steps.length;
  const current = Math.min(step, count - 1);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPlaying(false);
    };
    media.addEventListener("change", sync);
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion || !visible) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) setStep((previous) => (previous + 1) % count);
    }, 5200 / speed);
    return () => window.clearInterval(interval);
  }, [playing, reducedMotion, visible, count, speed]);

  function selectStep(next: number) {
    setPlaying(false);
    setStep((next + count) % count);
  }
  function switchMode(next: "visual" | "flow") {
    setMode(next);
    setStep(0);
    setPlaying(false);
  }
  function reset() {
    setStep(0);
    setValue(lab?.parameter.initial ?? 0);
    setPlaying(false);
  }

  return (
    <section
      ref={sectionRef}
      className="animated-explainer"
      id="animation"
      data-playing={playing && !reducedMotion && visible}
      aria-label={`${spec.title}动效图`}
    >
      <div className="animated-explainer-heading">
        <div>
          <span className="animated-explainer-kicker">
            {flow
              ? "STEP WALKTHROUGH · 步骤导览"
              : lab
                ? "INTERACTIVE LAB · 参数实验"
                : "VISUAL EXPLAINER · 机制图"}
          </span>
          <h2>{spec.title}</h2>
          <p>{spec.englishTitle}</p>
        </div>
        <span className="animated-explainer-counter">
          {String(current + 1).padStart(2, "0")} <i>/</i>{" "}
          {String(count).padStart(2, "0")}
        </span>
      </div>
      {visualSpec && (
        <div
          className="animation-mode-tabs"
          role="group"
          aria-label="选择动效内容"
        >
          <button
            type="button"
            aria-pressed={!flow}
            onClick={() => switchMode("visual")}
          >
            {lab ? "调参数，看机制" : "机制动效"}
          </button>
          <button
            type="button"
            aria-pressed={flow}
            onClick={() => switchMode("flow")}
          >
            完整课程步骤
          </button>
        </div>
      )}
      {!flow && lab && (
        <div className="lab-parameter">
          <div>
            <label htmlFor={`lab-${lesson.id}`}>{lab.parameter.label}</label>
            <output htmlFor={`lab-${lesson.id}`}>
              {Number(value.toFixed(3))}
              {lab.parameter.unit ? ` ${lab.parameter.unit}` : ""}
            </output>
          </div>
          <input
            id={`lab-${lesson.id}`}
            type="range"
            min={lab.parameter.min}
            max={lab.parameter.max}
            step={lab.parameter.step}
            value={value}
            aria-describedby={`lab-${lesson.id}-hint`}
            aria-valuetext={`${Number(value.toFixed(3))}${lab.parameter.unit ? ` ${lab.parameter.unit}` : ""}`}
            onChange={(e) => {
              setValue(Number(e.target.value));
              setPlaying(false);
            }}
          />
          <p id={`lab-${lesson.id}-hint`}>{lab.parameter.hint}</p>
        </div>
      )}
      <div className="animated-explainer-stage">
        {flow ? (
          <CourseWalkthrough lesson={lesson} step={current} />
        ) : Visualization ? (
          <Visualization step={current} value={value} />
        ) : LegacyVisualization ? (
          <LegacyVisualization step={current} />
        ) : null}
      </div>
      <div className="animated-explainer-bottom">
        <div
          className="animated-step-copy"
          aria-live={playing ? "off" : "polite"}
        >
          <strong>{spec.steps[current].title}</strong>
          <p>{spec.steps[current].explanation}</p>
        </div>
        <div className="animated-controls" aria-label="动效播放控制">
          <button
            type="button"
            onClick={() => selectStep(current - 1)}
            aria-label="上一步"
          >
            ←
          </button>
          <button
            type="button"
            className="animated-play"
            onClick={() => setPlaying((v) => !v)}
            disabled={reducedMotion}
            aria-label={playing ? "暂停动效" : "播放动效"}
            aria-pressed={playing}
            title={
              reducedMotion ? "系统已启用减少动画，可手动切换步骤" : undefined
            }
          >
            {playing ? "Ⅱ 暂停" : "▶ 播放"}
          </button>
          <button
            type="button"
            onClick={() => selectStep(current + 1)}
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
            key={index}
            aria-label={`跳转第 ${index + 1} 步：${item.title}`}
            aria-current={current === index ? "step" : undefined}
            onClick={() => selectStep(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <small>{item.title}</small>
          </button>
        ))}
      </div>
      <div className="animation-utilities">
        <button type="button" onClick={reset}>
          ↺ 重置实验
        </button>
        <label>
          播放速度{" "}
          <select
            aria-label="播放速度"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5× · 慢读</option>
            <option value={1}>1× · 标准</option>
            <option value={2}>2× · 快览</option>
          </select>
        </label>
        <a href="#/animations">浏览全部动效 →</a>
      </div>
      <p className="animated-explainer-note">
        {flow
          ? "本图按课程步骤展示流程，不运行模型训练；具体设置与使用边界见下方课程。"
          : lab
            ? lab.note
            : "示意动效用于理解计算顺序；颜色和示例数字不代表实际训练结果。"}
        {!flow && (
          <span className="animated-mobile-hint">手机上可左右滑动图示。</span>
        )}
        {reducedMotion && (
          <span className="animation-reduced-note">
            系统已开启减少动态效果：自动播放关闭，仍可手动切步和调参。
          </span>
        )}
      </p>
    </section>
  );
}
