import type { CompleteLabMap } from "./types";
import { define, C, S, M, L, D, fmt, metric, softmax, sum } from "./cvHelpers";
export const cvStateLabs: CompleteLabMap = {
  "state-space-models": define(
    "state-space-models",
    "同一个 linear SSM 怎样既写成 recurrence 又写成 convolution？",
    "h_t=a h_(t−1)+x_t、y_t=h_t、h0=0；输入[1,0,1,0]，固定time-invariant scalar coefficients。",
    C(
      "State retention a",
      0,
      0.9,
      0.1,
      0.5,
      "a接近1保留更久但不一定稳定/有效；多维SSM需检查A的谱与discretization，不能只调一个scalar。",
    ),
    ({ x }) => {
      const input = [1, 0, 1, 0],
        h: number[] = [];
      input.forEach((v, i) => h.push(x * (h[i - 1] ?? 0) + v));
      const kernel = [1, x, x * x, x ** 3],
        parts = [x ** 3, 0, x, 0];
      return {
        stages: [
          S(
            "Input impulses",
            "两个脉冲分别在t1和t3进入state。",
            "x=[1,0,1,0]",
            ["t1", "t2", "t3", "t4"],
            input,
            "input",
          ),
          L(
            "Recurrent scan",
            "每一步保留a比例旧state，再加当前input。",
            `h_t=${fmt(x)}h_(t−1)+x_t`,
            [1, 2, 3, 4],
            h,
            "time",
            "state",
          ),
          S(
            "Impulse-response kernel",
            "固定linear time-invariant system的kernel是a的各次幂。",
            "K_lag=a^lag",
            ["lag0", "lag1", "lag2", "lag3"],
            kernel,
            "kernel coefficient",
          ),
          S(
            "Convolution at t4",
            "展开recurrence即可得到同一个结果；time-varying系数不能直接复用此固定kernel。",
            `y4=a³x1+a²x2+ax3+x4=${fmt(sum(parts))}`,
            [
              "x1 contribution",
              "x2 contribution",
              "x3 contribution",
              "x4 contribution",
            ],
            parts,
            "output contribution",
          ),
        ],
        outcomes: [
          metric("Final state", h[3]),
          metric("Old impulse contribution", x ** 3),
        ],
      };
    },
    "长序列适合比较SSM/RNN/attention的context成本；实际S4还包含structured matrix和discretization，选择implementation时核训练/推理state一致性。",
    D(
      [
        "Recurrent与convolution结果不一致",
        "检查kernel方向、initial state和discretization",
        "用短impulse sequence逐项比对",
      ],
      [
        "State爆炸或遗忘太快",
        "检查retention/eigenvalues与step size",
        "监测state norm并调整稳定参数化",
      ],
    ),
    "精确scalar LTI SSM；不复现S4的structured A或训练性能，也不将a当所有SSM的单一超参数。",
  ),
  mamba: define(
    "mamba",
    "Input-dependent Δ 怎样改变 selective state 更新？",
    "scalar continuous A=−1,B=1；x=[1,0,0,2]，Δ_t=baseΔ×(1+|x_t|)。Zero-order hold给出a_t=e^(−Δ_t),b_t=1−e^(−Δ_t)。",
    C(
      "Base Δ",
      0.1,
      1,
      0.1,
      0.5,
      "较大Δ更快忘记旧state并靠近当前input；真实Mamba的Δ/B/C由learned projections产生，本例固定规则仅为展示。",
    ),
    ({ x }) => {
      const inp = [1, 0, 0, 2],
        delta = inp.map((v) => x * (1 + Math.abs(v))),
        a = delta.map((v) => Math.exp(-v)),
        b = a.map((v) => 1 - v),
        h: number[] = [];
      inp.forEach((v, i) => h.push(a[i] * (h[i - 1] ?? 0) + b[i] * v));
      return {
        stages: [
          S(
            "Content-dependent step",
            "同一个baseΔ遇到不同input会产生不同effective step。",
            `Δ_t=${fmt(x)}(1+|x_t|)`,
            ["t1", "t2", "t3", "t4"],
            delta,
            "time step",
          ),
          S(
            "Discretize retention",
            "从continuous A得到discrete transition，Δ越大retention越小。",
            "a_t=exp(−Δ_t)",
            ["t1", "t2", "t3", "t4"],
            a,
            "retention",
          ),
          S(
            "Input injection",
            "ZOH把input在interval内的累积贡献写成1−exp(−Δ)。",
            "b_t=A⁻¹(exp(Δ_t A)−I)B=1−a_t",
            ["t1 injection", "t2 injection", "t3 injection", "t4 injection"],
            b.map((v, i) => v * inp[i]),
            "injected state",
          ),
          L(
            "Selective recurrence",
            "固定input与参数，可见更新量随内容变化；不像LTI SSM的单一固定卷积kernel。",
            `h_t=a_t h_(t−1)+b_t x_t; h4=${fmt(h[3])}`,
            [1, 2, 3, 4],
            h,
            "time",
            "state",
          ),
        ],
        outcomes: [
          metric("Final state", h[3]),
          metric("First-step retention", a[0]),
        ],
      };
    },
    "选择Mamba处理长序列时仍需检验具体task的retrieval与ordering能力；数值问题先核Δ positivity、precision与state initialization。",
    D(
      [
        "State迅速饱和或遗忘",
        "查看Δ分布与exp(ΔA)的范围",
        "核positive parameterization及discretization，再调初始化",
      ],
      [
        "Chunked inference与整段不一致",
        "检查state跨chunk传递与reset条件",
        "用同一sequence逐chunk/whole比较",
      ],
    ),
    "scalar selective-SSM teaching fixture，采用显式ZOH；不是完整Mamba block/optimized kernel的逐项复现，省略learned B/C、gate和convolution。",
  ),
  rwkv: define(
    "rwkv",
    "RWKV 的 decayed history 怎样由固定大小state保存？",
    "单channel RWKV-style WKV：history keys=[0,.5,−.5]，values=[1,3,2]；当前k=0,v=4，time-first u=.3，receptance gate=.5。",
    C(
      "Positive decay w",
      0,
      2,
      0.1,
      0.5,
      "w越大history衰减越快；真实模型每channel有learned decay，注意checkpoint版本的参数化和state格式。",
    ),
    ({ x }) => {
      const keys = [0, 0.5, -0.5],
        values = [1, 3, 2],
        weights = keys.map((k, i) => Math.exp(k - (2 - i) * x)),
        curr = Math.exp(0.3),
        num = sum(weights.map((w, i) => w * values[i])) + curr * 4,
        den = sum(weights) + curr,
        scanA: number[] = [],
        scanB: number[] = [];
      keys.forEach((k, i) => {
        scanA.push(
          Math.exp(-x) * (scanA[i - 1] ?? 0) + Math.exp(k) * values[i],
        );
        scanB.push(Math.exp(-x) * (scanB[i - 1] ?? 0) + Math.exp(k));
      });
      return {
        stages: [
          S(
            "Decay by age",
            "t4之前history ages为2,1,0；当前token由time-first u单独加权。",
            `weight_i=exp(k_i−age_i×${fmt(x)})`,
            ["history1", "history2", "history3", "current"],
            [...weights, curr],
            "unnormalized weight",
          ),
          S(
            "Numerator contributions",
            "历史value先乘weight再求和，避免把key score当value。",
            "N=Σweight_i value_i+exp(u+k4)v4",
            ["history1", "history2", "history3", "current"],
            [...weights.map((w, i) => w * values[i]), curr * 4],
            "weighted value",
          ),
          M(
            "Recurrent sufficient state",
            "a,b分别累积numerator/denominator；处理新history只需旧state，无需保存所有tokens。",
            "a_i=e^(−w)a_(i−1)+e^ki vi; b_i=e^(−w)b_(i−1)+e^ki",
            ["a", "b"],
            ["t1", "t2", "t3"],
            [scanA, scanB],
            "state",
          ),
          S(
            "Normalize and gate",
            "当前token先以time-first项参加读出，再用于下一步history更新。",
            `WKV=N/D=${fmt(num / den)}; output=.5×WKV`,
            ["WKV", "gated output"],
            [num / den, (0.5 * num) / den],
            "value",
          ),
        ],
        outcomes: [
          metric("Gated WKV output", (0.5 * num) / den),
          metric("Oldest history weight", weights[0]),
        ],
      };
    },
    "长生成可利用固定state预算，但state reset、precision和checkpoint版本必须严格配套；吞吐/质量用实际sequence测量。",
    D(
      [
        "长序列出现overflow/underflow",
        "检查指数累加是否采用数值稳定state",
        "使用官方稳定实现并与短序列direct sum对照",
      ],
      [
        "跨样本输出串扰",
        "检查recurrent state是否按request隔离/reset",
        "显式管理state lifecycle并测试batch边界",
      ],
    ),
    "单channel、固定keys/values的WKV读出手算，按原始RWKV-style time decay/time-first形式；省略token shift、channel mix及版本差异，不测完整模型。",
  ),
  "ctc-wav2vec": define(
    "ctc-wav2vec",
    "CTC 为什么要把多个 alignment paths 的概率相加？",
    "2个frames，alphabet={A,blank}；每frame P(A)=p，P(blank)=1−p，target只有一个A。",
    C(
      "Per-frame P(A)",
      0.1,
      0.9,
      0.1,
      0.6,
      "先核log-probabilities、input/target lengths和blank ID；CTC loss不是把每frame强行对齐到同一个target token。",
    ),
    ({ x }) => {
      const aa = x * x,
        ab = x * (1 - x),
        ba = (1 - x) * x,
        blank = (1 - x) ** 2,
        total = aa + ab + ba;
      return {
        stages: [
          M(
            "Frame distributions",
            "模型输出每frame类别分布；本例两frames概率相同，仅为手算简化。",
            `P(A)=${fmt(x)},P(blank)=${fmt(1 - x)}`,
            ["frame1", "frame2"],
            ["A", "blank"],
            [
              [x, 1 - x],
              [x, 1 - x],
            ],
            "probability",
          ),
          S(
            "Enumerate paths",
            "Paths的概率是各frame概率相乘。",
            "P(AA)=p²;P(A_)=P(_A)=p(1−p)",
            ["AA", "A_blank", "blank_A", "blank_blank"],
            [aa, ab, ba, blank],
            "path probability",
          ),
          S(
            "CTC collapse",
            "先合并连续重复，再移除blank；AA、A_、_A都变成A，__变成empty。",
            `P(A)=p²+2p(1−p)=${fmt(total)}`,
            ["target A", "empty"],
            [total, blank],
            "sequence probability",
          ),
          S(
            "Negative log likelihood",
            "把所有匹配target的path概率相加后才取log，而不是只取最佳path。",
            `L=−ln(${fmt(total)})`,
            ["CTC NLL", "best-path NLL"],
            [-Math.log(total), -Math.log(Math.max(aa, ab, ba))],
            "nats",
          ),
        ],
        outcomes: [
          metric("Target sequence probability", total),
          metric("CTC NLL", -Math.log(total)),
        ],
      };
    },
    "真实长序列用dynamic programming在log-space求和；target有连续重复token时要额外blank分隔，input length必须足够。",
    D(
      [
        "CTC loss为infinity",
        "检查frames不足、连续重复target和lengths",
        "核最小可行alignment并修data pipeline，勿只隐藏inf",
      ],
      [
        "训练只输出blank",
        "查看blank比例、token mapping和log_softmax维度",
        "先overfit少量短语并逐frame检查",
      ],
    ),
    "精确枚举两frame CTC，未运行wav2vec encoder；frame-wise factorization来自CTC模型，实际audio features不在本例中。",
  ),
  whisper: define(
    "whisper",
    "Waveform amplitude 怎样经过 power、Mel 与log进入Whisper frontend？",
    "单frame三频率power=[4,1,.25]，缩放waveform amplitude a；toy Mel filters=[[.5,.5,0],[0,.5,.5]]。",
    C(
      "Waveform amplitude a",
      0.1,
      2,
      0.1,
      1,
      "保持训练期audio normalization与sample rate；不能把clipping后的信号当作单纯amplitude rescale。",
    ),
    ({ x }) => {
      const pow = [4, 1, 0.25].map((v) => v * x * x),
        mel = [0.5 * pow[0] + 0.5 * pow[1], 0.5 * pow[1] + 0.5 * pow[2]],
        raw = mel.map((v) => Math.log10(Math.max(v, 1e-10))),
        floor = Math.max(...raw) - 8,
        clipped = raw.map((v) => Math.max(v, floor)),
        out = clipped.map((v) => (v + 4) / 4);
      return {
        stages: [
          S(
            "Power spectrum",
            "Amplitude乘a时power乘a²；本例从已知power开始，不运行STFT。",
            `power'=power×${fmt(x)}²`,
            ["bin1", "bin2", "bin3"],
            pow,
            "power",
          ),
          S(
            "Mel projection",
            "每个Mel band对频率power作非负加权和。",
            "mel=filterbank×power",
            ["Mel1", "Mel2"],
            mel,
            "band power",
          ),
          S(
            "Log and dynamic-range floor",
            "使用Whisper code形式：log10(max(mel,1e−10))，再以global max−8截底；本例只有一frame。",
            `log floor=max(logmel)−8=${fmt(floor)}`,
            ["Mel1 log", "Mel2 log"],
            clipped,
            "log10 power",
          ),
          S(
            "Frontend normalization",
            "这是固定affine transform，不是每个sample独立z-score。",
            "feature=(logmel+4)/4",
            ["Mel1 feature", "Mel2 feature"],
            out,
            "normalized feature",
          ),
        ],
        outcomes: [
          metric("Mel1 feature", out[0]),
          metric("Mel2 feature", out[1]),
        ],
      };
    },
    "真实Whisper应使用checkpoint匹配的Mel维度、16kHz mono与官方preprocessing；做ASR评估要同时核language/task tokens和timestamps设置。",
    D(
      [
        "音频听起来正常但识别很差",
        "检查sample rate、PCM scaling与channel mixing",
        "与官方frontend对同一waveform逐值比对",
      ],
      [
        "输出幻觉或静音也生成",
        "检查VAD/no-speech、输入截断和任务prompt",
        "评估静音/噪声样本并记录拒绝/过滤策略",
      ],
    ),
    "只执行合成2band Mel/log/normalization算术；实际Whisper使用80或128Mel bands，未运行audio encoder/decoder，不估计WER。",
  ),
  "particle-filters": define(
    "particle-filters",
    "新观测如何重排 particles 的权重与有效样本量？",
    "预测后particles=[0,1,2,3]，prior weights均为.25；observation model z|state~Normal(state,σ²=.5²)。",
    C(
      "Observed z",
      0,
      3,
      0.1,
      1.5,
      "σ=.5固定；真实filter需同时设置transition/process noise与observation noise，不能把小σ当更精确的证据。",
    ),
    ({ x }) => {
      const states = [0, 1, 2, 3],
        logL = states.map((s) => -0.5 * ((x - s) / 0.5) ** 2),
        w = softmax(logL),
        weighted = states.map((s, i) => s * w[i]),
        ess = 1 / sum(w.map((v) => v * v)),
        cdf = w.map((_, i) => sum(w.slice(0, i + 1))),
        resampled = [0.125, 0.375, 0.625, 0.875].map(
          (u) => states[cdf.findIndex((a) => u < a)],
        );
      return {
        stages: [
          S(
            "Observation log likelihood",
            "共同normalization常数抵消；距离按σ标准化后平方。",
            `log L_i=−.5((${fmt(x)}−s_i)/.5)²`,
            states.map((s) => `state${s}`),
            logL,
            "log likelihood up to constant",
          ),
          S(
            "Bayesian weight update",
            "uniform prior使normalized posterior=softmax(logL)；非均匀prior须加log prior。",
            "w_i∝prior_i L_i;Σw=1",
            states.map((s) => `state${s}`),
            w,
            "posterior weight",
          ),
          S(
            "Posterior summary",
            "Mean使用权重，ESS只衡量weight concentration，不等于估计精度。",
            `mean=Σw_i s_i=${fmt(sum(weighted))};ESS=1/Σw_i²=${fmt(ess)}`,
            states.map((s) => `state${s} contribution`),
            weighted,
            "state contribution",
          ),
          S(
            "Systematic resampling illustration",
            "四个quantiles=.125,.375,.625,.875，固定offset只为可复现；选中粒子后weights重置为1/4。",
            "s'_j=inverseCDF(u_j)",
            ["particle1", "particle2", "particle3", "particle4"],
            resampled,
            "resampled state",
          ),
        ],
        outcomes: [metric("Posterior mean", sum(weighted)), metric("ESS", ess)],
      };
    },
    "从ESS阈值如N/2作为需验证的起点，按需resample；particle depletion时增N/改善proposal，并检查observation model是否错误。",
    D(
      [
        "权重集中到单particle",
        "检查observation noise与proposal覆盖",
        "用log weights稳定计算并改善proposal/particle数",
      ],
      [
        "Resampling后多样性消失",
        "检查过于频繁resample与process noise",
        "按ESS触发并考虑适当rejuvenation步骤",
      ],
    ),
    "执行单次measurement update与固定offset的systematic resampling；不模拟transition、不声称posterior已覆盖连续真实state。",
  ),
  "speculative-decoding": define(
    "speculative-decoding",
    "拒绝 draft token 后，为什么需要 residual distribution？",
    "Target p=[.5,.3,.2]；draft q=[qA,.6(1−qA),.4(1−qA)]；一个位置、三个tokens，均在同一prefix下。",
    C(
      "Draft q(A)",
      0.1,
      0.8,
      0.05,
      0.4,
      "Draft应兼顾低成本与分布接近；acceptance高不保证加速，仍需实测verification和draft latency。",
    ),
    ({ x }) => {
      const p = [0.5, 0.3, 0.2],
        q = [x, 0.6 * (1 - x), 0.4 * (1 - x)],
        accept = p.map((v, i) => Math.min(1, v / q[i])),
        mass = q.map((v, i) => v * accept[i]),
        alpha = sum(mass),
        positive = p.map((v, i) => Math.max(v - q[i], 0)),
        r =
          alpha < 1 - 1e-12 ? positive.map((v) => v / (1 - alpha)) : [0, 0, 0],
        final = mass.map((v, i) => v + (1 - alpha) * r[i]);
      return {
        stages: [
          M(
            "Target and draft",
            "同一temperature/support等sampling变换必须在p/q定义中保持一致。",
            `q=[${q.map((v) => fmt(v)).join(",")}]`,
            ["target p", "draft q"],
            ["A", "B", "C"],
            [p, q],
            "probability",
          ),
          S(
            "Accept probability",
            "对实际抽到的draft token i，以min(1,p_i/q_i)接受。",
            "a_i=min(1,p_i/q_i)",
            ["A", "B", "C"],
            accept,
            "conditional acceptance",
          ),
          S(
            "Rejected branch",
            "接受的unconditional mass=min(p,q)；被拒绝后从normalized positive residual重采样。",
            alpha < 1 - 1e-12
              ? `r_i=max(p_i−q_i,0)/(1−α);α=${fmt(alpha)}`
              : "p=q: α=1，reject branch不会发生，图中residual置0表示unused。",
            ["residual A", "residual B", "residual C"],
            r,
            "conditional residual probability",
          ),
          M(
            "Recover target exactly",
            "accept branch加reject branch逐token恢复p。分布一致不表示同seed生成同字符串。",
            "Pout_i=min(p_i,q_i)+(1−α)r_i=p_i",
            ["accepted mass", "rejected mass", "output"],
            ["A", "B", "C"],
            [mass, r.map((v) => (1 - alpha) * v), final],
            "probability mass",
          ),
        ],
        outcomes: [
          metric("Acceptance probability", alpha),
          metric("Rejection probability", 1 - alpha),
        ],
      };
    },
    "生产实现还需多tokenprefix verification、cache rollback及bonus token；先逐位置验证distribution，再benchmark端到端speedup。",
    D(
      [
        "Acceptance高却更慢",
        "测draft/target verification耗时与batch",
        "减少draft length或换更轻draft，并用真实workload测latency",
      ],
      [
        "输出分布与target不一致",
        "检查accept ratio、residual clipping和rejection后cache位置",
        "对tiny vocabulary穷举distribution再验证大模型",
      ],
    ),
    "精确算单位置accept/reject分布；不调用models，不估算speedup，p=q时reject residual定义为unused零向量。",
  ),
};
