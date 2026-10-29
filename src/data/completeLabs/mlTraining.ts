import {
  type CompleteLabMap,
  metric,
  line,
  matrix,
  fmt,
  sigmoid,
  softmax,
  mean,
  sum,
} from "./types";
import { make, control, stage, binaryEntropy, sq, range } from "./mlHelpers";
export const mlTrainingLabs: CompleteLabMap = {
  "learning-paradigms": make(
    "learning-paradigms",
    "同一个参数，换反馈来源后会朝哪边更新？",
    "固定 logit θ=.5、step size=.1；比较 label=1 的 Supervised gradient、两视图一致性的 gradient 与单个 sampled action 的 Policy Gradient。",
    control(
      "Sampled advantage A",
      -2,
      2,
      0.25,
      1,
      "只改变 RL 的反馈符号；reward 不是 class label。",
    ),
    (a) => {
      const p = sigmoid(0.5),
        gs = p - 1,
        gc = 1,
        gr = -a * (1 - p),
        updates = [0.5 - 0.1 * gs, 0.5 - 0.1 * gc, 0.5 - 0.1 * gr];
      return {
        stages: [
          stage(
            "共享输出",
            "先固定模型，区别来自学习信号。",
            `p=σ(.5)=${fmt(p)}`,
            ["P(action=1)", "P(action=0)"],
            [p, 1 - p],
            "probability",
          ),
          stage(
            "定义反馈",
            "Consistency toy 比较 θ 与 −θ，loss=(θ−(−θ))²/4=θ²。",
            "Supervised:y=1; consistency:two views; RL:sampled A",
            ["label", "consistency target", "advantage"],
            [1, 0, a],
            "signal",
          ),
          stage(
            "计算梯度",
            "这里是单样本 surrogate，不是三种训练效果的比较。",
            `gSL=p−1=${fmt(gs)}; gCons=2θ=1; gRL=−A(1−p)=${fmt(gr)}`,
            ["Supervised", "Consistency", "Policy gradient"],
            [gs, gc, gr],
            "gradient",
          ),
          stage(
            "执行一次更新",
            "负梯度使 θ 增大；负 advantage 会反转 Policy Gradient 方向。",
            "θnew=θ−.1g",
            ["Supervised θ", "Consistency θ", "RL θ"],
            updates,
            "parameter",
          ),
        ],
        outcomes: [
          metric("RL updated θ", updates[2]),
          metric("RL gradient", gr),
        ],
      };
    },
    {
      use: [
        "先按 label、unlabelled views 或 delayed reward 判定反馈契约，再选 architecture。",
        "同一 encoder 可同时接受多种 objective，但每项 loss 的目标与尺度要分开记录。",
      ],
      tune: [
        "先固定一项 objective 和 learning rate，检查 gradient 的符号，再增加混合权重。",
        "当辅助 loss 主导更新时比较每项 gradient norm；不要只比较 loss 的裸数值。",
      ],
      fail: [
        [
          "Loss 降低但任务变差",
          "检查 consistency 是否把不同语义视图拉到一起。",
          "改 augmentation 或减小辅助权重，并在独立任务指标复验。",
        ],
        [
          "RL 更新方向反了",
          "检查 advantage 的 baseline、符号和 policy log-prob。",
          "用 A=±1 的一条 trajectory 手算更新。",
        ],
      ],
      limit:
        "只展示三种局部更新信号；不训练完整模型，不将 gradient 大小解释为效果排名。",
    },
  ),
  "model-evaluation": make(
    "model-evaluation",
    "同一组 scores，为什么换 threshold 会改变结论？",
    "四个独立 synthetic 样本：labels=[1,1,0,0]，scores=[.9,.6,.7,.2]。",
    control(
      "Decision threshold",
      0.1,
      0.9,
      0.1,
      0.5,
      "以 score≥threshold 判 positive；不能在独立 test 上选 threshold。",
    ),
    (t) => {
      const ys = [1, 1, 0, 0],
        ps = [0.9, 0.6, 0.7, 0.2],
        pred = ps.map((p) => +(p >= t));
      let tp = 0,
        fp = 0,
        fn = 0,
        tn = 0;
      ys.forEach((y, i) => {
        if (y && pred[i]) tp++;
        else if (!y && pred[i]) fp++;
        else if (y) fn++;
        else tn++;
      });
      const acc = (tp + tn) / 4,
        f1 = (2 * tp) / (2 * tp + fp + fn);
      return {
        stages: [
          stage(
            "固定预测",
            "切分和模型不变，只有 action threshold 变化。",
            "scores=[.9,.6,.7,.2]",
            ["s1", "s2", "s3", "s4"],
            ps,
            "score",
          ),
          stage(
            "阈值变动作",
            "相同 ranking 可以对应不同 confusion matrix。",
            `prediction=1[score≥${fmt(t, 1)}]`,
            ["s1", "s2", "s3", "s4"],
            pred,
            "class",
          ),
          stage(
            "按真值计数",
            "先看四种错误，再看汇总。",
            "rows=true class; columns=predicted class",
            ["TP", "FP", "FN", "TN"],
            [tp, fp, fn, tn],
            "samples",
            matrix(
              ["true 0", "true 1"],
              ["pred 0", "pred 1"],
              [
                [tn, fp],
                [fn, tp],
              ],
              "samples",
            ),
          ),
          stage(
            "计算指标",
            "F1 忽略 TN；Accuracy 与 F1 回答不同问题。",
            `Accuracy=(TP+TN)/4; F1=2TP/(2TP+FP+FN)`,
            ["Accuracy", "Recall", "F1"],
            [acc, tp / 2, f1],
            "fraction",
          ),
        ],
        outcomes: [metric("Accuracy", acc), metric("F1", f1)],
      };
    },
    {
      use: [
        "先固定泛化单位及错误成本，再选择指标与 threshold。",
        "用于核查“更高 Accuracy”是否掩盖了少数类漏检。",
      ],
      tune: [
        "从自然 prevalence 的 validation set 画 threshold–error 曲线。",
        "误报成本高时提高 threshold，但同步记录 Recall 和绝对漏报数。",
      ],
      fail: [
        [
          "Test 指标随调参不断变好",
          "检查 test 是否参与 threshold 或 feature selection。",
          "重新保留未使用的 evaluation set。",
        ],
        [
          "总体分数高但某 donor 很差",
          "逐 donor 画 confusion matrix，检查支持范围。",
          "使用 group split 并报告分组结果与样本量。",
        ],
      ],
      limit: "四样本算术不能估计真实泛化误差或置信区间。",
    },
  ),
  "domain-shift": make(
    "domain-shift",
    "模型没有改，population risk 为什么会变？",
    "固定两个 subgroup 的错误率 .1/.4，只改变较难 group B 在目标人群中的比例；假设各组 conditional risk 保持不变。",
    control(
      "Target group B fraction",
      0,
      1,
      0.05,
      0.5,
      "这是 mixture shift；不是任意 Concept Drift 的模型。",
    ),
    (w) => {
      const mass = [1 - w, w],
        errors = [0.1 * (1 - w), 0.4 * w],
        risk = sum(errors),
        source = 0.1 * 0.8 + 0.4 * 0.2;
      return {
        stages: [
          stage(
            "改变人群构成",
            "目标域改变了组的权重，不是模型参数。",
            "Ptarget(A)=1−w; Ptarget(B)=w",
            ["A", "B"],
            mass,
            "population fraction",
          ),
          stage(
            "保持条件错误率",
            "模型在两组的能力固定，用于隔离 composition effect。",
            "rA=.1; rB=.4",
            ["rA", "rB"],
            [0.1, 0.4],
            "error probability",
          ),
          stage(
            "加权积分",
            "每组 error contribution=population mass×conditional risk。",
            `${fmt(1 - w)}×.1 + ${fmt(w)}×.4`,
            ["A errors", "B errors"],
            errors,
            "population fraction",
          ),
          stage(
            "比较 source 与 target",
            "Source 的 B fraction 固定为 .2。差异不是 retraining 的收益。",
            "Rtarget=.1(1−w)+.4w",
            ["Source risk", "Target risk"],
            [source, risk],
            "error probability",
          ),
        ],
        outcomes: [
          metric("Target risk", risk),
          metric("Risk change", risk - source),
        ],
      };
    },
    {
      use: [
        "评估部署人群 composition 与验证 cohort 不同时，先做分层风险分解。",
        "如果组内性能稳定，可估算 composition 对总体指标的贡献。",
      ],
      tune: [
        "从已定义的临床/设备/时间 strata 开始，报告每层样本数。",
        "若重加权后仍解释不了变化，检查 P(Y|X) 和标签流程而非继续调 weights。",
      ],
      fail: [
        [
          "总体下降但各组没降",
          "核对各组占比和加权公式。",
          "同时发布 standardized 与 observed-population 指标。",
        ],
        [
          "缺少目标标签却声称性能没变",
          "无标签 drift 不能验证 conditional risk。",
          "抽取代表性标注或推迟性能结论。",
        ],
      ],
      limit: "预设组内风险不变；真实 Domain Shift 可能同时改变组内条件关系。",
    },
  ),
  "external-validation": make(
    "external-validation",
    "TPR/FPR 不变，外部人群的 PPV 为什么变化？",
    "固定 sensitivity=.8、false-positive rate=.1，以1000个期望样本计算 confusion counts。",
    control(
      "Target prevalence",
      0.05,
      0.95,
      0.05,
      0.2,
      "这些为 expected counts，可为小数；不是随机抽样结果。",
    ),
    (r) => {
      const tp = 1000 * r * 0.8,
        fn = 1000 * r * 0.2,
        fp = 1000 * (1 - r) * 0.1,
        tn = 1000 * (1 - r) * 0.9,
        ppv = tp / (tp + fp);
      return {
        stages: [
          stage(
            "确定 target cohort",
            "事件率来自目标人群，不能沿用开发集比例。",
            "Expected positives=1000r",
            ["positive", "negative"],
            [1000 * r, 1000 * (1 - r)],
            "people",
          ),
          stage(
            "应用固定 operating point",
            "假设这里 TPR/FPR 可迁移，真实外部验证须检验。",
            "TP=.8N+; FP=.1N−",
            ["TP", "FP", "FN", "TN"],
            [tp, fp, fn, tn],
            "people",
          ),
          stage(
            "条件化 predicted positives",
            "PPV 的分母是所有 positive predictions。",
            `PPV=${fmt(tp)}/(${fmt(tp)}+${fmt(fp)})`,
            ["True alarms", "False alarms"],
            [tp, fp],
            "alarms",
          ),
          stage(
            "核对基率效应",
            "低 prevalence 时，少量 FPR 也可能制造大量误报。",
            "PPV=.8r/[.8r+.1(1−r)]",
            ["PPV", "Sensitivity"],
            [ppv, 0.8],
            "probability",
          ),
        ],
        outcomes: [metric("PPV", ppv), metric("False alarms per1000", fp)],
      };
    },
    {
      use: [
        "将冻结模型应用到新地点/时间/仪器时，先核 target prevalence 和标签定义。",
        "用于解释同一 threshold 的 workload 和 PPV 为什么不同。",
      ],
      tune: [
        "先锁定开发集 threshold 做外部评估，再独立划分 adaptation/calibration 数据。",
        "若真实 TPR/FPR 也下降，评估输入/标签 shift，不能只做 prevalence 修正。",
      ],
      fail: [
        [
          "外部 PPV 差就重新挑最好 threshold",
          "检查是否把外部 test 变成 validation。",
          "报告原冻结结果，另建适配验证与测试流程。",
        ],
        [
          "FPR 很低但 review 排队很长",
          "检查非事件人数与到达量。",
          "用每1000人 false alarms 和 review capacity 选工作点。",
        ],
      ],
      limit: "假设 sensitivity/FPR 可迁移；不是对真实人群性能的保证。",
    },
  ),
  "class-imbalance": make(
    "class-imbalance",
    "增加 positive weight，是在修概率还是改目标？",
    "Constant-feature population 的 true positive rate r=.2；negative weight=1，求 weighted Log Loss 的解析 optimum。",
    control(
      "Positive loss weight",
      1,
      9,
      0.5,
      3,
      "此参数改变训练目标，不是推理 threshold。",
    ),
    (w) => {
      const r = 0.2,
        p = (w * r) / (w * r + 1 - r),
        lp = -w * r * Math.log(p),
        ln = -(1 - r) * Math.log(1 - p);
      return {
        stages: [
          stage(
            "真实类别质量",
            "固定 population prevalence。",
            "r=.2",
            ["positive", "negative"],
            [r, 1 - r],
            "probability",
          ),
          stage(
            "改变 loss 权重",
            "重加权后的质量不再等于自然人群比例。",
            `weighted mass=[${fmt(w * r)},.8]`,
            ["weighted positive", "weighted negative"],
            [w * r, 0.8],
            "loss weight mass",
          ),
          stage(
            "解一阶条件",
            "令 −wr/p+(1−r)/(1−p)=0。",
            `p*=wr/(wr+1−r)=${fmt(p)}`,
            ["Natural probability", "Weighted optimum"],
            [r, p],
            "probability",
          ),
          stage(
            "拆开目标值",
            "Weighted optimum 不应直接当自然概率使用。",
            "L=−wr log p−(1−r)log(1−p)",
            ["Positive term", "Negative term"],
            [lp, ln],
            "weighted nats",
          ),
        ],
        outcomes: [
          metric("Weighted optimum probability", p),
          metric("Probability shift", p - r),
        ],
      };
    },
    {
      use: [
        "少数类对优化梯度贡献不足时，可比较 weighting 与 sampling。",
        "需要可信概率时，同时检查自然分布上的 calibration。",
      ],
      tune: [
        "先从 unweighted baseline 开始，试1/3/5并监控每类 Recall及NLL。",
        "若Recall上升而PPV或calibration变差，重新选择threshold或单独校准。",
      ],
      fail: [
        [
          "Weight后概率整体偏高",
          "检查优化目标和真实 prevalence 是否一致。",
          "在自然验证分布校准；不要把 weighted score 当风险概率。",
        ],
        [
          "少数类验证指标忽高忽低",
          "查看独立 positives 数量和label noise。",
          "增加独立标注并报告区间，别仅增大weight。",
        ],
      ],
      limit:
        "只求 constant-feature population optimum；有限模型、regularization和训练误差会改变结果。",
    },
  ),
  "batch-normalization": make(
    "batch-normalization",
    "同一个 x=1，为什么换 batch 同伴就变了？",
    "单 channel batch=[1,2,3,b]。训练用该 batch mean/biased variance；推理示例固定 running mean=2、variance=1，γ=1、β=0、ε=1e−5。",
    control(
      "Fourth batch value b",
      0,
      10,
      0.5,
      4,
      "只改变另一位 batch 同伴，观察第一个样本的 normalized output。",
    ),
    (b) => {
      const x = [1, 2, 3, b],
        m = mean(x),
        center = x.map((v) => v - m),
        v = mean(center.map(sq)),
        train = center.map((c) => c / Math.sqrt(v + 1e-5)),
        infer = x.map((v) => (v - 2) / Math.sqrt(1 + 1e-5));
      return {
        stages: [
          stage(
            "收集同 channel 样本",
            "本例轴为 batch；CNN 还会在同 channel 聚合空间位置。",
            "x=[1,2,3,b]",
            ["x1", "x2", "x3", "x4"],
            x,
            "activation",
          ),
          stage(
            "求 batch statistics",
            "前向 normalization 使用 biased variance。",
            `μ=${fmt(m)}; var=mean((x−μ)²)=${fmt(v)}`,
            ["x1−μ", "x2−μ", "x3−μ", "x4−μ"],
            center,
            "activation",
          ),
          stage(
            "训练模式归一化",
            "所有 batch 同伴共同影响分母和中心。",
            `z=(x−${fmt(m)})/sqrt(${fmt(v)}+1e−5)`,
            ["z1", "z2", "z3", "z4"],
            train,
            "normalized",
          ),
          stage(
            "对照冻结统计",
            "推理模式不从这个 batch 重新估计统计。",
            "z_eval=(x−2)/sqrt(1+1e−5)",
            ["Train x1", "Eval x1"],
            [train[0], infer[0]],
            "normalized",
          ),
        ],
        outcomes: [
          metric("Training output x1", train[0]),
          metric("Evaluation output x1", infer[0]),
          metric("Batch variance", v),
        ],
      };
    },
    {
      use: [
        "有足够同分布 batch 统计的CNN训练可比较BN。",
        "小batch、跨donor异质batch或序列模型需比较GroupNorm/LayerNorm。",
      ],
      tune: [
        "从实现默认 momentum 与 ε起步；训练/推理差大先核running statistics与eval模式。",
        "微调小数据时比较冻结统计和更新统计；记录全局batch及每device batch。",
      ],
      fail: [
        [
          "同一image单独预测变了",
          "检查是否忘了model.eval或track_running_stats配置。",
          "冻结running stats后用同输入重测。",
        ],
        [
          "小batch训练噪声很大",
          "看channel variance与batch组成。",
          "扩大有效统计样本或比较不依赖batch的normalization。",
        ],
      ],
      limit:
        "固定running stats仅为对照；不模拟moving average更新。PyTorch forward用biased variance，running variance更新用unbiased估计。",
    },
  ),
  "layer-normalization": make(
    "layer-normalization",
    "换第一个 token 的 feature，会改变第二个 token 的统计吗？",
    "两个 tokens：[1,3,b]和[2,4,6]，每token沿feature轴独立normalize；ε=1e−5，γ=1、β=0。",
    control(
      "First-token third feature",
      0,
      10,
      0.5,
      5,
      "只改变token1，token2的LayerNorm output应保持不变。",
    ),
    (b) => {
      const rows = [
          [1, 3, b],
          [2, 4, 6],
        ],
        ms = rows.map(mean),
        vs = rows.map((r, i) => mean(r.map((v) => sq(v - ms[i])))),
        zs = rows.map((r, i) =>
          r.map((v) => (v - ms[i]) / Math.sqrt(vs[i] + 1e-5)),
        ),
        rms = rows[0].map((v) => v / Math.sqrt(mean(rows[0].map(sq)) + 1e-5));
      return {
        stages: [
          stage(
            "明确归一化轴",
            "行是token，列是features；不混合两行。",
            "X:[2 tokens,3 features]",
            ["t1 f1", "t1 f2", "t1 f3"],
            rows[0],
            "activation",
            matrix(
              ["token1", "token2"],
              ["f1", "f2", "f3"],
              rows,
              "activation",
            ),
          ),
          stage(
            "分别求统计",
            "每个token各有mean和variance。",
            `μ=[${ms.map((v) => fmt(v)).join(",")}]; var=[${vs.map((v) => fmt(v)).join(",")}]`,
            ["token1 mean", "token2 mean"],
            ms,
            "activation",
          ),
          stage(
            "独立normalize",
            "改变token1的第三个feature不会改变token2。",
            "z_tj=(x_tj−μ_t)/sqrt(var_t+ε)",
            ["t1 z1", "t1 z2", "t1 z3"],
            zs[0],
            "normalized",
            matrix(["token1", "token2"], ["z1", "z2", "z3"], zs, "normalized"),
          ),
          stage(
            "比较RMSNorm",
            "RMSNorm不减mean，因此不是LayerNorm的同义词。",
            "RMSNorm=x/sqrt(mean(x²)+ε)",
            ["LN f1", "RMS f1"],
            [zs[0][0], rms[0]],
            "normalized",
          ),
        ],
        outcomes: [
          metric("Token1 first output", zs[0][0]),
          metric("Token2 first output", zs[1][0]),
        ],
      };
    },
    {
      use: [
        "Transformer按token归一化时，需要batch独立的feature统计。",
        "比较LN/RMSNorm时应保持residual位置和其他训练条件一致。",
      ],
      tune: [
        "先核normalized_shape对应feature维，别把sequence维一起归一化。",
        "出现近零variance放大时检查ε、dtype和输入scale，再考虑调整ε。",
      ],
      fail: [
        [
          "padding长度改变有效token输出",
          "检查normalized_shape是否包含sequence轴。",
          "只normalize预期feature轴并验证padding mask。",
        ],
        [
          "换LN为RMSNorm加载权重失败",
          "检查bias、mean subtraction及checkpoint契约。",
          "使用兼容architecture或重新训练适配。",
        ],
      ],
      limit:
        "无affine learned parameters或residual网络；仅展示统计轴与数值变化。",
    },
  ),
  "learning-rate-schedules": make(
    "learning-rate-schedules",
    "Warmup 后，Cosine schedule 怎样缩小一次更新？",
    "十次optimizer updates，前2步linear warmup到.1，后8步cosine到0；固定θ=3和gradient=6。",
    control(
      "Optimizer update index",
      0,
      10,
      1,
      5,
      "这里计数optimizer.step，不是micro-batch数量。",
    ),
    (t) => {
      const lr = (k: number) =>
          k <= 2
            ? (0.1 * k) / 2
            : 0.05 * (1 + Math.cos((Math.PI * (k - 2)) / 8)),
        rates = range(11).map(lr),
        eta = lr(t),
        delta = -eta * 6;
      return {
        stages: [
          stage(
            "数optimizer updates",
            "Gradient accumulation时，一个update可能包含多个micro-batches。",
            `t=${t}; warmup=2; total=10`,
            ["warmup", "decay updates"],
            [2, 8],
            "updates",
          ),
          stage(
            "计算schedule",
            "分段公式在t=2连续；这里不含restarts。",
            `η(t)=${fmt(eta)}`,
            ["current η"],
            [eta],
            "learning rate",
            line(range(11), rates, "optimizer update", "learning rate"),
          ),
          stage(
            "结合当前梯度",
            "Schedule只乘当前gradient，不自动修复错误的gradient。",
            `Δθ=−η×6=${fmt(delta)}`,
            ["θ before", "Δθ"],
            [3, delta],
            "parameter",
          ),
          stage(
            "比较固定step size",
            "同一gradient，.1固定step会改变−.6。",
            "θnew=3+Δθ",
            ["Scheduled θ", "Constant η=.1 θ"],
            [3 + delta, 2.4],
            "parameter",
          ),
        ],
        outcomes: [
          metric("Learning rate", eta),
          metric("Updated θ", 3 + delta),
        ],
      };
    },
    {
      use: [
        "长训练需要先稳定进入再逐渐收敛时比较warmup+decay。",
        "实际schedule单位应和optimizer updates保持一致。",
      ],
      tune: [
        "先按总updates设置warmup比例，记录实际LR曲线。",
        "初期loss爆炸先核gradient/初始化，再试更小peak LR或更长warmup。",
      ],
      fail: [
        [
          "Schedule提前结束",
          "核batch size/accumulation变化后总updates是否重算。",
          "以optimizer.step计数并恢复scheduler state。",
        ],
        [
          "恢复训练后LR跳变",
          "检查checkpoint是否含scheduler和optimizer state。",
          "恢复计数并画恢复前后LR。",
        ],
      ],
      limit: "固定gradient演示单步影响；不预测真实loss曲线或最佳schedule。",
    },
  ),
  "gradient-clipping": make(
    "gradient-clipping",
    "限制 norm 会保留 gradient 方向吗？",
    "固定gradient g=[3,4]，L2 norm=5，global norm clipping，SGD learning rate=.1。",
    control(
      "Maximum gradient norm",
      0.1,
      8,
      0.1,
      2,
      "c≥5时无需裁剪；c<5时两个坐标按同一比例缩放。",
    ),
    (c) => {
      const scale = Math.min(1, c / 5),
        g = [3 * scale, 4 * scale];
      return {
        stages: [
          stage(
            "原始gradient",
            "Global norm包括所有所选参数，不能逐tensor分别求norm后当相同操作。",
            "||g||₂=sqrt(9+16)=5",
            ["g1", "g2"],
            [3, 4],
            "gradient",
          ),
          stage(
            "求共同缩放",
            "epsilon仅为数值保护，此精确toy分母非零。",
            `s=min(1,c/5)=${fmt(scale)}`,
            ["clip factor"],
            [scale],
            "fraction",
          ),
          stage(
            "裁剪后的gradient",
            "共同正缩放保留方向；逐coordinate clipping一般不保留。",
            `gclip=[${g.map((v) => fmt(v)).join(",")}]`,
            ["g1 clipped", "g2 clipped"],
            g,
            "gradient",
          ),
          stage(
            "更新参数",
            "从θ=[0,0]执行一次SGD。",
            "Δθ=−.1gclip",
            ["Δθ1", "Δθ2"],
            g.map((v) => -0.1 * v),
            "parameter",
          ),
        ],
        outcomes: [
          metric("Clipped norm", Math.hypot(...g)),
          metric("Update norm", 0.1 * Math.hypot(...g)),
        ],
      };
    },
    {
      use: [
        "RNN或长序列训练偶发大gradient时可限制一次更新冲击。",
        "使用AMP/accumulation时应在最终unscale后进行global clipping。",
      ],
      tune: [
        "先记录未裁剪norm分布，再从其合理高分位试max_norm。",
        "几乎每步都裁剪时先降低LR或排查loss归一化，不把c无限减小。",
      ],
      fail: [
        [
          "AMP下clip后几乎不学习",
          "确认先unscale再clip。",
          "按optimizer更新顺序重排并检查实际unscaled norm。",
        ],
        [
          "loss出现NaN后clip仍无效",
          "检查非有限gradient来源，NaN不能靠缩放恢复。",
          "定位overflow/无效算子，跳过坏step并修复数值原因。",
        ],
      ],
      limit:
        "无Adam自适应预条件；gradient方向保留不等于最终optimizer update方向相同。",
    },
  ),
  "mixed-precision": make(
    "mixed-precision",
    "Loss scaling 怎样保住很小的 gradient？",
    "固定真实gradient=1e−8，按FP16 subnormal间距2⁻²⁴量化；模拟scale→round→unscale，假设硬件保留subnormal。",
    control(
      "Loss scale exponent k",
      0,
      12,
      1,
      8,
      "scale=2^k；这里不模拟overflow或dynamic scaler。",
    ),
    (k) => {
      const g = 1e-8,
        s = 2 ** k,
        quantum = 2 ** -24,
        raw = Math.round(g / quantum) * quantum,
        scaled = g * s,
        stored = Math.round(scaled / quantum) * quantum,
        restored = stored / s;
      return {
        stages: [
          stage(
            "直接存很小的gradient",
            "g小于半个FP16 subnormal量化间距时可能round为0。",
            `quantum=2^−24=${quantum.toExponential(3)}`,
            ["true g", "direct FP16"],
            [g, raw],
            "gradient",
          ),
          stage(
            "先放大loss与gradient",
            "链式法则让gradient乘相同scale。",
            `gscaled=1e−8×2^${k}=${scaled.toExponential(3)}`,
            ["scaled gradient"],
            [scaled],
            "scaled gradient",
          ),
          stage(
            "量化后再unscale",
            "此简化模拟只覆盖subnormal rounding，不覆盖所有FP16 binade。",
            `grestored=round(gscaled/quantum)×quantum/${s}`,
            ["restored", "true"],
            [restored, g],
            "gradient",
          ),
          stage(
            "核对相对误差",
            "Scale不改变理想数学gradient，但可改变有限精度保存结果。",
            `relative error=|grestored/g−1|=${fmt(Math.abs(restored / g - 1))}`,
            ["without scale", "with scale"],
            [1, Math.abs(restored / g - 1)],
            "relative error",
          ),
        ],
        outcomes: [
          metric("Restored gradient", restored),
          metric("Relative error", Math.abs(restored / g - 1)),
        ],
      };
    },
    {
      use: [
        "FP16 backward有underflow风险时使用实现提供的GradScaler。",
        "BF16指数范围更大，是否使用scaler应按框架和硬件配置判断。",
      ],
      tune: [
        "先沿用框架dynamic scaling；记录scale、skipped steps和nonfinite gradients。",
        "频繁overflow时先核loss scale、危险算子和input magnitude，不只换更大scale。",
      ],
      fail: [
        [
          "梯度大量为0",
          "比较FP32基线，检查underflow与激活饱和。",
          "尝试AMP标准流程或保留关键算子FP32。",
        ],
        [
          "裁剪后更新过小",
          "检查clip是否发生在unscale之前。",
          "先scaler.unscale，再clip和step。",
        ],
      ],
      limit:
        "只模拟已声明的subnormal round-to-nearest；flush-to-zero硬件和普通FP16间距变化未模拟。",
    },
  ),
  "language-model-evaluation": make(
    "language-model-evaluation",
    "一个低概率 token 会怎样拉高 Perplexity？",
    "固定同一tokenizer和三个目标tokens的条件概率[.8,p,.4]，使用自然对数。",
    control(
      "Probability of target token2",
      0.05,
      0.95,
      0.05,
      0.2,
      "不是采样temperature；直接改变目标token的模型条件概率。",
    ),
    (p) => {
      const ps = [0.8, p, 0.4],
        nll = ps.map((v) => -Math.log(v)),
        avg = mean(nll),
        ppl = Math.exp(avg);
      return {
        stages: [
          stage(
            "按目标token取概率",
            "评价的是真实目标token，不是模型自己选出的token。",
            "p=[.8,p,.4]",
            ["token1", "token2", "token3"],
            ps,
            "probability",
          ),
          stage(
            "转成surprisal",
            "小概率对应大negative log-likelihood。",
            "NLL_i=−ln p_i",
            ["token1", "token2", "token3"],
            nll,
            "nats",
          ),
          stage(
            "按有效token平均",
            "Padding和不计分prompt不能进入分母。",
            `mean NLL=${fmt(sum(nll))}/3=${fmt(avg)}`,
            ["Mean NLL"],
            [avg],
            "nats/token",
          ),
          stage(
            "指数还原",
            "Perplexity是exp(mean NLL)，不是mean(1/p)。",
            `PPL=exp(${fmt(avg)})=${fmt(ppl)}`,
            ["Perplexity", "mean inverse p"],
            [ppl, mean(ps.map((v) => 1 / v))],
            "value",
          ),
        ],
        outcomes: [
          metric("Perplexity", ppl),
          metric("Mean NLL", avg, "nats/token"),
        ],
      };
    },
    {
      use: [
        "比较同tokenizer、同计分协议下的语言建模能力。",
        "实际问答还需task success、factuality与工具结果评价。",
      ],
      tune: [
        "先固定context window、stride和mask；逐token检查loss来源。",
        "某类文档NLL升高时按长度/语言/格式分层，不只看全局平均。",
      ],
      fail: [
        [
          "更短tokenizer的PPL更低就说模型更好",
          "检查两模型token单位是否相同。",
          "使用共同task指标或统一可比的bits-per-byte协议。",
        ],
        [
          "加padding改变PPL",
          "检查labels ignore_index与reduction分母。",
          "只对有效目标token求和并除count。",
        ],
      ],
      limit: "三token手算不是生成质量、事实准确性或Agent成功率的测量。",
    },
  ),
  "deep-ensembles": make(
    "deep-ensembles",
    "平均预测相同，成员分歧为什么不同？",
    "三个binary members的positive probabilities=[.5−d,.5,.5+d]，平均始终.5。",
    control(
      "Member spread d",
      0,
      0.45,
      0.05,
      0.3,
      "只改变成员分歧，保持ensemble平均概率不变。",
    ),
    (d) => {
      const ps = [0.5 - d, 0.5, 0.5 + d],
        hs = ps.map(binaryEntropy),
        h = binaryEntropy(0.5),
        mi = h - mean(hs);
      return {
        stages: [
          stage(
            "成员概率",
            "本例所有members等权。",
            "p=[.5−d,.5,.5+d]",
            ["member1", "member2", "member3"],
            ps,
            "probability",
          ),
          stage(
            "平均概率",
            "先平均probabilities，不是先平均logits。",
            "pbar=mean(p)=.5",
            ["mean positive", "mean negative"],
            [0.5, 0.5],
            "probability",
          ),
          stage(
            "计算成员熵",
            "每个member内部的犹豫和成员之间的分歧不同。",
            "H(p)=−p ln p−(1−p)ln(1−p)",
            ["H1", "H2", "H3"],
            hs,
            "nats",
          ),
          stage(
            "分解finite mixture",
            "H(mean p)−mean H是label/member-index MI。",
            `disagreement=${fmt(h)}−${fmt(mean(hs))}=${fmt(mi)}`,
            ["Within-member entropy", "Disagreement"],
            [mean(hs), mi],
            "nats",
          ),
        ],
        outcomes: [
          metric("Disagreement MI", mi, "nats"),
          metric("Mean probability", 0.5),
        ],
      };
    },
    {
      use: [
        "需要检验不同训练解在同样输入上是否一致时比较ensemble。",
        "结合NLL/calibration与shift tests，不只观察disagreement。",
      ],
      tune: [
        "从3个独立seed作为预算起点，逐步增加并画真实收益/成本曲线。",
        "成员高度一致却一起出错时，检查共同数据偏差和OOD覆盖。",
      ],
      fail: [
        [
          "把低分歧当低风险",
          "检查模型是否共享错误假设。",
          "增加外部验证与拒答策略，不依赖分歧单一信号。",
        ],
        [
          "平均logits和平均概率结果不同",
          "核聚合契约。",
          "按概率mixture定义聚合并重新检查calibration。",
        ],
      ],
      limit:
        "Finite ensemble成员不自动是posterior draws；MI不是校准后的所有epistemic uncertainty。",
    },
  ),
  "conformal-selective-prediction": make(
    "conformal-selective-prediction",
    "减小 α，预测集怎样变宽？",
    "固定9个独立calibration scores=[.05,.1,.15,.2,.25,.3,.4,.6,.8]；新样本probabilities=[.6,.3,.1]。",
    control(
      "Miscoverage α",
      0.1,
      0.5,
      0.05,
      0.2,
      "k=ceil((n+1)(1−α))；此范围保证k≤n。",
    ),
    (a) => {
      const cal = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.6, 0.8],
        k = Math.ceil(10 * (1 - a) - 1e-10),
        q = cal[k - 1],
        scores = [0.4, 0.7, 0.9],
        keep = scores.map((s) => +(s <= q + 1e-12));
      return {
        stages: [
          stage(
            "排序calibration scores",
            "模型训练与调参已结束，这9个样本没有参与训练。",
            "n=9",
            ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"],
            cal,
            "nonconformity",
          ),
          stage(
            "选择有限样本quantile",
            "这里index从1开始；一般k>n时应返回全集，不可悄悄clip。",
            `k=ceil(10×(1−${fmt(a, 2)}))=${k}; q=${fmt(q)}`,
            ["q"],
            [q],
            "nonconformity",
          ),
          stage(
            "逐标签计算分数",
            "Classification score为1−p_y。",
            "new scores=[.4,.7,.9]",
            ["A", "B", "C"],
            scores,
            "nonconformity",
          ),
          stage(
            "阈值产生集合",
            "保留score≤q的labels；集合大小不等于错误概率。",
            `set size=${sum(keep)}; rule:s_y≤${fmt(q)}`,
            ["keep A", "keep B", "keep C"],
            keep,
            "included",
          ),
        ],
        outcomes: [
          metric("Prediction set size", sum(keep), "labels"),
          metric("Quantile threshold", q),
        ],
      };
    },
    {
      use: [
        "在exchangeability等条件成立时，为冻结模型提供marginal coverage集合。",
        "需要单点回答时，额外设计reject/review规则及成本。",
      ],
      tune: [
        "先选可接受miscoverage α，再观察set size、empty/full比例和workload。",
        "集合过宽时改善基础模型或数据，而非只把α提高后宣称同等保证。",
      ],
      fail: [
        [
          "目标域coverage下降",
          "检查时间漂移、calibration复用和nonconformity实现。",
          "重新隔离代表性calibration并单独验证shift。",
        ],
        [
          "90%coverage却accepted错误率高",
          "检查是否只接受singleton，导致条件人群改变。",
          "单独报告selective risk与acceptance rate。",
        ],
      ],
      limit:
        "给定calibration toy只展示算法；不通过9个数证明真实coverage，更不保证各subgroup或singleton risk。",
    },
  ),
  quantization: make(
    "quantization",
    "多一位 bit，会减少哪种 rounding error？",
    "固定weights=[−1,−.3,.2,.9]，对称signed uniform quantizer，clip range=[−1,1]，zero-point=0。",
    control(
      "Bit width",
      2,
      8,
      1,
      4,
      "Qmax=2^(b−1)−1；不等于所有硬件格式的encoding。",
    ),
    (b) => {
      const x = [-1, -0.3, 0.2, 0.9],
        qm = 2 ** (b - 1) - 1,
        s = 1 / qm,
        ints = x.map((v) => Math.max(-qm, Math.min(qm, Math.round(v / s)))),
        back = ints.map((v) => v * s),
        errs = x.map((v, i) => back[i] - v),
        mse = mean(errs.map(sq));
      return {
        stages: [
          stage(
            "确定scale",
            "更高bit在固定range内提供更细间距。",
            `Qmax=${qm}; scale=1/Qmax=${fmt(s)}`,
            ["weights1", "weights2", "weights3", "weights4"],
            x,
            "weight",
          ),
          stage(
            "round到integer",
            "超范围值将被clip；本例值都在range内。",
            "q=clip(round(x/scale),−Qmax,Qmax)",
            ["q1", "q2", "q3", "q4"],
            ints,
            "integer",
          ),
          stage(
            "dequantize",
            "真实计算可能整数accumulate后再rescale。",
            "xhat=q×scale",
            ["xhat1", "xhat2", "xhat3", "xhat4"],
            back,
            "weight",
          ),
          stage(
            "计算误差",
            "误差应在任务输出上再验证，weight MSE不是accuracy。",
            `MSE=mean((xhat−x)²)=${fmt(mse, 6)}`,
            ["e1", "e2", "e3", "e4"],
            errs,
            "weight error",
          ),
        ],
        outcomes: [metric("Weight MSE", mse), metric("Scale", s)],
      };
    },
    {
      use: [
        "受weight/activation memory或设备推理约束时比较PTQ/QAT。",
        "先确认目标runtime真正支持相应bit与kernel。",
      ],
      tune: [
        "从8-bit baseline检查calibration数据覆盖，再比较更低bit与per-channel scale。",
        "某些channels误差极大时检查outliers、range和敏感层保留高精度。",
      ],
      fail: [
        [
          "压缩文件变小却没加速",
          "检查运行时是否回退FP32或有dequantize开销。",
          "测完整pipeline latency而非仅参数bytes。",
        ],
        [
          "训练后quantization精度骤降",
          "检查activation calibration和preprocessing一致性。",
          "改善代表性calibration或比较QAT。",
        ],
      ],
      limit:
        "模拟统一对称quantizer；不模拟kernel速度、accumulator overflow或activation分布。",
    },
  ),
  "distillation-pruning": make(
    "distillation-pruning",
    "Temperature 怎样改变 teacher 的软目标和梯度？",
    "Teacher logits=[2,0,−1]，student logits=[1,0,0]；计算 T² KL(q_T||p_T) 对student logits的梯度。",
    control(
      "Distillation temperature T",
      0.5,
      5,
      0.5,
      2,
      "T²是常见尺度补偿；本实验只解释distillation分支。",
    ),
    (t) => {
      const q = softmax([2 / t, 0, -1 / t]),
        p = softmax([1 / t, 0, 0]),
        terms = q.map((v, i) => v * Math.log(v / p[i])),
        loss = t * t * sum(terms),
        grad = p.map((v, i) => t * (v - q[i]));
      return {
        stages: [
          stage(
            "Teacher soft targets",
            "增大T通常soften固定logits的分布。",
            "q=softmax(teacher/T)",
            ["q1", "q2", "q3"],
            q,
            "probability",
          ),
          stage(
            "Student probabilities",
            "Teacher与student使用同一T后比较。",
            "p=softmax(student/T)",
            ["p1", "p2", "p3"],
            p,
            "probability",
          ),
          stage(
            "计算KL",
            "各类别项可为负，sum KL仍非负。",
            `T² KL=${fmt(loss)}`,
            ["KL term1", "KL term2", "KL term3"],
            terms,
            "nats",
          ),
          stage(
            "追到logit gradient",
            "T²补偿之后，gradient=T(p−q)。",
            "dL/dz_student=T(p−q)",
            ["g1", "g2", "g3"],
            grad,
            "gradient",
          ),
        ],
        outcomes: [
          metric("Scaled distillation KL", loss),
          metric("Student first-logit gradient", grad[0]),
        ],
      };
    },
    {
      use: [
        "有高质量teacher且student预算更小时，可用soft target传递类间关系。",
        "结构化pruning需要实际改变计算图，是与本loss不同的压缩操作。",
      ],
      tune: [
        "先保留hard-label CE baseline，比较T=1/2/4和distillation权重。",
        "Teacher在目标域表现差时先核迁移质量，不强迫student继承错误。",
      ],
      fail: [
        [
          "T改变后gradient尺度乱跳",
          "检查是否采用T²补偿以及reduction约定。",
          "分别记录CE和KD gradient norm。",
        ],
        [
          "剪掉很多weights但延迟不变",
          "检查是否仍是同尺寸dense kernel。",
          "比较channel/head等结构化pruning并实测runtime。",
        ],
      ],
      limit: "固定logits手算不训练student，也不模拟pruned model的速度。",
    },
  ),
  "model-serving-monitoring": make(
    "model-serving-monitoring",
    "增加 worker，为什么 queue delay 会变化？",
    "10个jobs每50ms到达，一个worker每job服务100ms；按最早空闲worker分配，模拟确定性队列。",
    control(
      "Worker count",
      1,
      4,
      1,
      1,
      "假设workers独立且每个服务时间固定；不代表GPU并发能线性扩展。",
    ),
    (workers) => {
      const arrivals = range(10).map((i) => i * 50),
        free = range(workers).map(() => 0),
        waits: number[] = [],
        lat: number[] = [];
      for (const a of arrivals) {
        let j = free.indexOf(Math.min(...free)),
          start = Math.max(a, free[j]);
        waits.push(start - a);
        free[j] = start + 100;
        lat.push(free[j] - a);
      }
      const sorted = [...lat].sort((a, b) => a - b),
        p95 = sorted[Math.ceil(0.95 * 10) - 1];
      return {
        stages: [
          stage(
            "规定arrival与service",
            "Arrival interval=50ms；service time=100ms/job。",
            "a_i=50i",
            ["job1", "job2", "job3", "job4"],
            arrivals.slice(0, 4),
            "ms",
          ),
          stage(
            "等待空闲worker",
            "只改变worker数量，不改模型计算精度。",
            "start_i=max(arrival_i, earliest_free_worker)",
            ["wait1", "wait2", "wait3", "wait4"],
            waits.slice(0, 4),
            "ms",
            line(range(10), waits, "job index", "queue wait ms"),
          ),
          stage(
            "相加成端到端latency",
            "此toy只含queue+service；真实系统还要加pre/post/network。",
            "latency=queue wait+100",
            ["job1", "job2", "job3", "job4"],
            lat.slice(0, 4),
            "ms",
            line(range(10), lat, "job index", "latency ms"),
          ),
          stage(
            "检查tail",
            "10个样本nearest-rank p95恰是maximum；别把小样本tail当稳定estimate。",
            `mean=${fmt(mean(lat), 1)}; p95=${p95}`,
            ["mean latency", "p95 latency"],
            [mean(lat), p95],
            "ms",
          ),
        ],
        outcomes: [
          metric("Mean latency", mean(lat), "ms"),
          metric("Nearest-rank p95", p95, "ms"),
        ],
      };
    },
    {
      use: [
        "模型推理快但线上延迟高时，拆开queue与计算时间。",
        "比较并发/批处理策略时记录到达分布和端到端tail。",
      ],
      tune: [
        "从固定负载trace做replay，逐步增workers并监测利用率/吞吐。",
        "出现queue增长时先区分服务率不足、共同资源瓶颈与瞬时burst。",
      ],
      fail: [
        [
          "只报平均latency",
          "查看p95/p99和timeout比例的样本数。",
          "保存分段trace并按负载分层。",
        ],
        [
          "翻倍workers仍拥堵",
          "检查GPU、数据库或rate limit是否共享。",
          "针对真实瓶颈限流或扩容，不假设线性速度收益。",
        ],
      ],
      limit: "确定性queue toy，不预测真实设备性能；小样本p95仅解释计算定义。",
    },
  ),
  "nested-group-validation": make(
    "nested-group-validation",
    "多试几个配置，inner 分数更好就代表泛化更好吗？",
    "三个synthetic candidates的inner errors=[.15,.14,.05]，outer errors=[.18,.20,.30]；只用前m个候选做inner选择。",
    control(
      "Candidate count m",
      1,
      3,
      1,
      2,
      "Outer errors仅在选择完成后展示，禁止用其反选。",
    ),
    (m) => {
      const inner = [0.15, 0.14, 0.05].slice(0, m),
        outer = [0.18, 0.2, 0.3].slice(0, m),
        chosen = inner.indexOf(Math.min(...inner));
      return {
        stages: [
          stage(
            "内层可见候选",
            "Inner loop只看训练groups内的验证结果。",
            `available candidates=${m}`,
            inner.map((_, i) => "config" + (i + 1)),
            inner,
            "inner error",
          ),
          stage(
            "选择inner winner",
            "同分时保留更早配置；outer信息尚未参与。",
            `j*=argmin inner=${chosen + 1}`,
            ["chosen inner"],
            [inner[chosen]],
            "error",
          ),
          stage(
            "打开outer holdout",
            "Outer groups代表整套选择流程的一次测试，不再选配置。",
            `outer error(config ${chosen + 1})=${fmt(outer[chosen])}`,
            ["selected inner", "selected outer"],
            [inner[chosen], outer[chosen]],
            "error",
          ),
          stage(
            "量化gap",
            "更多候选可加重selection optimism，但本固定反例不证明普遍单调。",
            "gap=outer−inner",
            ["generalization gap"],
            [outer[chosen] - inner[chosen]],
            "error difference",
          ),
        ],
        outcomes: [
          metric("Selected outer error", outer[chosen]),
          metric("Selection gap", outer[chosen] - inner[chosen]),
        ],
      };
    },
    {
      use: [
        "小样本、高维feature选择或频繁HPO时，用nested validation评估完整流程。",
        "Cells来自同donor时，inner和outer都按实际泛化单位分组。",
      ],
      tune: [
        "先设有限搜索空间与固定budget，再比较outer folds的分布。",
        "Outer方差大时先检查independent groups数量，不通过挑最好fold解决。",
      ],
      fail: [
        [
          "Feature selection在全数据做完才CV",
          "检查预处理和特征筛选的fit位置。",
          "把所有有监督选择放进inner pipeline。",
        ],
        [
          "看outer分数后又扩大搜索",
          "检查是否把outer当新的validation。",
          "记录此选择并保留新的独立test。",
        ],
      ],
      limit:
        "固定分数反例，不是真实拟合或nested CV重采样；用于检查数据可见性与selection逻辑。",
    },
  ),
  "hierarchical-bootstrap": make(
    "hierarchical-bootstrap",
    "同一 donor 多测 cells，真的增加独立证据了吗？",
    "固定4个donor means=[1,2,5,8]；每donor重复m个相同测量。枚举4⁴个按donor有放回bootstrap样本。",
    control(
      "Repeated cells per donor",
      1,
      20,
      1,
      5,
      "Donor数始终4；重复相同值不增加跨donor信息。",
    ),
    (m) => {
      const ds = [1, 2, 5, 8],
        mu = mean(ds),
        variance = mean(ds.map((v) => sq(v - mu))),
        boots: number[] = [];
      for (let n = 0; n < 256; n++) {
        let code = n,
          s = 0;
        for (let j = 0; j < 4; j++) {
          s += ds[code % 4];
          code = Math.floor(code / 4);
        }
        boots.push(s / 4);
      }
      const sd = Math.sqrt(mean(boots.map((v) => sq(v - mu)))),
        naive = Math.sqrt(variance / (4 * m)),
        bins = range(29).map((i) => 1 + i * 0.25),
        counts = bins.map(
          (b) => boots.filter((v) => Math.abs(v - b) < 1e-10).length / 256,
        );
      return {
        stages: [
          stage(
            "保留cluster单位",
            "样本量要同时报告4donors与4m cells。",
            "donor means=[1,2,5,8]",
            ["D1", "D2", "D3", "D4"],
            ds,
            "mean outcome",
          ),
          stage(
            "枚举cluster resamples",
            "每次抽4个donors，有放回；不是从全部cells独立抽。",
            "4^4=256 ordered bootstrap samples",
            ["donors", "cells"],
            [4, 4 * m],
            "count",
          ),
          stage(
            "得到bootstrap分布",
            "重复cells不改变这组donor means的bootstrap分布。",
            `bootstrap SD=${fmt(sd)}`,
            ["cluster bootstrap SD"],
            [sd],
            "mean SD",
            line(bins, counts, "bootstrap mean", "probability mass"),
          ),
          stage(
            "对照伪独立SE",
            "Naive公式错误地把4m测量当独立样本。",
            "SE_naive=sqrt(population variance/(4m))",
            ["Cluster bootstrap SD", "Naive iid SE"],
            [sd, naive],
            "mean SD",
          ),
        ],
        outcomes: [
          metric("Naive iid SE", naive),
          metric("Cluster bootstrap SD", sd),
        ],
      };
    },
    {
      use: [
        "数据有donor、animal、site等cluster且希望泛化到新cluster时使用。",
        "决定先抽group再抽内部测量，需对应实际sampling设计。",
      ],
      tune: [
        "先固定resampling unit与estimand；增加bootstrap次数检查Monte Carlo稳定性。",
        "只有少数groups时，更多bootstrap draws不能创造独立对象；报告局限。",
      ],
      fail: [
        [
          "Cells翻倍后CI异常变窄",
          "检查是否忽略cluster dependence。",
          "按donor重采样并比较naive结果。",
        ],
        [
          "嵌套bootstrap混淆cell-type比例",
          "核是否保持estimand和composition定义。",
          "明确每层重采样规则并做敏感性分析。",
        ],
      ],
      limit:
        "内部cells为完全重复值；精确枚举仅用于小toy，不验证真实区间coverage。",
    },
  ),
  "proper-scoring-rules": make(
    "proper-scoring-rules",
    "报告多少概率，才能最小化长期 expected loss？",
    "真实binary event概率r=.2；报告q，分别计算expected Brier和Log Loss。",
    control(
      "Reported probability q",
      0.05,
      0.95,
      0.05,
      0.5,
      "评分对两个可能结果按真实概率加权，不只看一次是否猜中。",
    ),
    (q) => {
      const r = 0.2,
        terms = [r * sq(1 - q), (1 - r) * sq(q)],
        b = sum(terms),
        nll = -r * Math.log(q) - (1 - r) * Math.log(1 - q);
      return {
        stages: [
          stage(
            "两种结果",
            "Expected loss需考虑event和non-event。",
            "P(Y=1)=.2; P(Y=0)=.8",
            ["event", "non-event"],
            [0.2, 0.8],
            "probability",
          ),
          stage(
            "条件Brier losses",
            "同一个q在不同结果下有不同loss。",
            "Brier=(q−Y)²",
            ["if Y=1", "if Y=0"],
            [sq(1 - q), sq(q)],
            "squared error",
          ),
          stage(
            "按真实发生率加权",
            "诚实报告q=r使expected Brier最小。",
            `EBrier=.2(1−q)²+.8q²=${fmt(b)}`,
            ["event contribution", "non-event contribution"],
            terms,
            "expected loss",
          ),
          stage(
            "分解irreducible与excess",
            "期望最小不代表某个单独样本必然分数最好。",
            "EBrier=r(1−r)+(q−r)²",
            ["irreducible", "excess"],
            [r * (1 - r), sq(q - r)],
            "expected loss",
          ),
        ],
        outcomes: [
          metric("Expected Brier", b),
          metric("Expected Log Loss", nll, "nats"),
        ],
      };
    },
    {
      use: [
        "需要比较概率质量，而非只比较ranking或Accuracy时使用proper scores。",
        "在自然目标分布上评估，并另列action utility。",
      ],
      tune: [
        "先用base-rate predictor建立NLL/Brier baseline，再检查分组calibration。",
        "若重加权loss用于训练，验证时明确目标distribution与权重。",
      ],
      fail: [
        [
          "极端自信的少量错误主导NLL",
          "检查标签质量及probability是否接近0。",
          "记录分位数和案例；不要为好看任意clip后不披露。",
        ],
        [
          "Calibration好却任务没信息",
          "比较恒定prevalence baseline和resolution。",
          "联合ranking、proper score与decision指标评价。",
        ],
      ],
      limit:
        "已知真实r的population算术；真实r未知需用独立样本估计并考虑不确定性。",
    },
  ),
  "label-shift-correction": make(
    "label-shift-correction",
    "只改变 class prior，posterior 要怎样重新归一化？",
    "Source prior=.2、source posterior=.4；假设P(X|Y)不变并改变target prior。",
    control(
      "Target positive prior",
      0.05,
      0.95,
      0.05,
      0.5,
      "只有Label Shift假设成立时才可使用此prior ratio。",
    ),
    (r) => {
      const ratio = [r / 0.2, (1 - r) / 0.8],
        w = [0.4 * ratio[0], 0.6 * ratio[1]],
        z = sum(w),
        p = w[0] / z;
      return {
        stages: [
          stage(
            "Prior ratios",
            "Positive和negative都必须修正。",
            "w_y=πtarget(y)/πsource(y)",
            ["positive ratio", "negative ratio"],
            ratio,
            "ratio",
          ),
          stage(
            "重加权source posterior",
            "这些值尚未归一化，可能大于1。",
            "unnormalized=[.4×w1,.6×w0]",
            ["positive mass", "negative mass"],
            w,
            "mass",
          ),
          stage(
            "重新归一化",
            "分母是所有class重加权质量之和。",
            `Z=${fmt(z)}; posterior=${fmt(p)}`,
            ["target positive", "target negative"],
            [p, 1 - p],
            "probability",
          ),
          stage(
            "比较原始概率",
            "Prior不变时应恢复原posterior=.4。",
            "p_target=(.4r/.2)/[(.4r/.2)+(.6(1−r)/.8)]",
            ["source posterior", "target posterior"],
            [0.4, p],
            "probability",
          ),
        ],
        outcomes: [
          metric("Corrected posterior", p),
          metric("Posterior change", p - 0.4),
        ],
      };
    },
    {
      use: [
        "目标类别比例变动而class-conditional feature distribution稳定时考虑。",
        "需要可信source probabilities与可识别的target prior估计。",
      ],
      tune: [
        "从held-out source calibration和confusion matrix条件数检查开始。",
        "Prior估计对微小噪声敏感时报告范围、正则化与目标标签复验。",
      ],
      fail: [
        [
          "更多positive predictions就断言prevalence升高",
          "检查是否也可能是covariate/concept shift。",
          "收集目标标签或验证Label Shift条件。",
        ],
        [
          "修正后所有概率贴近1",
          "核prior ratio、source支持范围与calibration。",
          "检查near-zero priors和估计不确定性。",
        ],
      ],
      limit:
        "Target prior在toy中已知；没有估计BBSE，也不能从无标签数据自动证明P(X|Y)稳定。",
    },
  ),
};
