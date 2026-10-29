import {
  type CompleteLabMap,
  softmax,
  sum,
  mean,
  fmt,
  matrix,
  metric,
} from "./types";
import { make, control, stage, result, entropy } from "./rlShared";

export const rlRepresentationLabs: CompleteLabMap = {
  simclr: make(
    "simclr",
    "Temperature 如何同时改变 positive probability 和梯度？",
    "固定一个 anchor，positive/negative cosine scores=[.8,.3,−.2]，只算一个 NT-Xent anchor loss。",
    control(
      "Temperature τ",
      0.05,
      1,
      0.05,
      0.2,
      "先从 .2 比较 .1/.5；低 τ 会放大 score 差和梯度。",
    ),
    (t) => {
      const z = [0.8, 0.3, -0.2],
        p = softmax(z.map((x) => x / t)),
        g = p.map((x, i) => (x - (i === 0 ? 1 : 0)) / t);
      return result(
        [
          stage(
            "Pair scores",
            "固定 embeddings 和 positive 身份，只改变 τ。",
            "s=[.8,.3,−.2]",
            ["positive", "negative 1", "negative 2"],
            z,
            "cosine",
          ),
          stage(
            "Scale logits",
            "NT-Xent 在同一 candidate set 内竞争。",
            `logits=s/τ; τ=${fmt(t)}`,
            ["positive", "negative 1", "negative 2"],
            z.map((x) => x / t),
            "logit",
          ),
          stage(
            "Normalize",
            "包括 positive 本身的 denominator。",
            "p=softmax(logits)",
            ["positive", "negative 1", "negative 2"],
            p,
            "probability",
          ),
          stage(
            "Backpropagate",
            "negative 梯度为正；gradient descent 会降低其 score。",
            `L=−ln p+=${fmt(-Math.log(p[0]))}; ∂L/∂s=(p−y)/τ`,
            ["positive", "negative 1", "negative 2"],
            g,
            "dL/dscore",
          ),
        ],
        "Anchor NT-Xent loss",
        -Math.log(p[0]),
        "nats",
      );
    },
    {
      use: [
        "有大量无标签样本、两种 augmentation 应保持相同语义时，用 SimCLR 学 representation。",
        "可作为 frozen-feature baseline；single-cell 中需先确认 augmentation 不抹掉稀有 biological state。",
      ],
      tune: [
        "从 τ=.2 的 toy 看尺度；真实实验沿公开配置比较 .1/.2/.5，记录 embedding norms 和 positive ranks。",
        "Batch size 改变 negative 数，不能只改 τ 后将 loss 数值横向当质量排名；固定验证协议。",
      ],
      debug: [
        "Loss 很小但 transfer 很差",
        "检查 positive 是否由背景/采集批次轻易识别",
        "改 augmentation 并做 donor/site-held-out linear probe",
        "梯度尖锐或不稳定",
        "打印 logits/τ、最大 probability 与梯度范数",
        "适当提高 τ 或修正 feature normalization",
      ],
      boundary:
        "这是固定三个 scores 的单 anchor 运算；没有 encoder 训练、双向 batch 平均或真实下游 accuracy。",
    },
  ),
  moco: make(
    "moco",
    "Momentum encoder 跟得慢，会留下多大的 key lag？",
    "old key encoder 参数=[1,0]，online 参数=[0,1]，执行一次 EMA；用更新参数向量作为 toy key。",
    control(
      "EMA momentum m",
      0,
      0.99,
      0.01,
      0.9,
      "m 越大 key 更新越慢；真实 MoCo 还要联合检查 queue age。",
    ),
    (m) => {
      const k = [m, 1 - m],
        norm = Math.hypot(...k),
        cos = k[0] / norm,
        p = softmax([cos / 0.2, 0.2 / 0.2]);
      return result(
        [
          stage(
            "Two encoders",
            "old 与 online 是不同参数副本。",
            "old=[1,0]; online=[0,1]",
            ["old x", "old y"],
            [1, 0],
            "parameter",
          ),
          stage(
            "Momentum update",
            "EMA 更新 key encoder，不能由 contrastive loss 直接更新它。",
            `key=m·old+(1−m)·online`,
            ["key x", "key y"],
            k,
            "parameter",
          ),
          stage(
            "Normalized key",
            "对 query=[1,0]，normalized dot product 是 cosine。",
            `||key||=${fmt(norm)}; cosine=${fmt(cos)}`,
            ["positive", "fixed negative"],
            [cos, 0.2],
            "cosine",
          ),
          stage(
            "Contrastive lookup",
            "固定一个 queue negative，查看目标 probability。",
            "p=softmax([cosine,.2]/.2)",
            ["positive", "negative"],
            p,
            "probability",
          ),
        ],
        "Key lag to online",
        Math.hypot(k[0], k[1] - 1),
        "parameter distance",
        [metric("Contrastive loss", -Math.log(p[0]), "nats")],
      );
    },
    {
      use: [
        "GPU batch 很小时，用 queue 维护更多 negative keys。",
        "需要稳定 encoder targets 时，EMA 将短期参数噪声平滑，但会带来滞后。",
      ],
      tune: [
        "先复现对应 MoCo 版本的 momentum/queue 配置；toy m=.9 对比 .5/.99 是机制演示。",
        "增大 queue 时记录 key age 与 domain mix；representation 变化快可减小 queue 或调整 EMA。",
      ],
      debug: [
        "Queue negatives 和当前 features 不兼容",
        "检查 queue 是否在 encoder/checkpoint 切换后沿用",
        "版本切换时重新填充 queue，并记录 key age",
        "Loss 无变化",
        "检查 key encoder 被错误 optimizer 更新或 query 被 detach",
        "只 stop-gradient key 分支，核对两套参数更新",
      ],
      boundary:
        "用参数向量代替 encoder 输出以显露 EMA；未模拟真实 image encoder、整个 queue 或 MoCo 下游表现。",
    },
  ),
  byol: make(
    "byol",
    "Normalized prediction 转过一个角度，BYOL loss 会怎样变？",
    "target=[1,0] 已 stop-gradient；online predictor output=[cosθ,sinθ]。",
    control(
      "Prediction angle θ",
      0,
      180,
      5,
      60,
      "从60°向0°转动，检查 normalized loss 与 cos 的关系。",
    ),
    (a) => {
      const r = (a * Math.PI) / 180,
        v = [Math.cos(r), Math.sin(r)],
        d = v.map((x, i) => x - (i ? 0 : 1)),
        loss = sum(d.map((x) => x * x));
      return result(
        [
          stage(
            "Stop-gradient target",
            "target 是固定方向，不接收本次 loss gradient。",
            "t=[1,0]",
            ["target x", "target y"],
            [1, 0],
            "unit vector",
          ),
          stage(
            "Predictor direction",
            "只改变 online prediction 的方向，norm 恒为1。",
            `p=[cos(${a}°),sin(${a}°)]`,
            ["prediction x", "prediction y"],
            v,
            "unit vector",
          ),
          stage(
            "Coordinate residual",
            "归一化后逐坐标相减。",
            "d=p−stopgrad(t)",
            ["residual x", "residual y"],
            d,
            "residual",
          ),
          stage(
            "Squared distance",
            "两个 unit vectors 的平方距离等于2−2cosθ。",
            `L=${fmt(loss)}=2−2cosθ`,
            ["x contribution", "y contribution"],
            d.map((x) => x * x),
            "loss",
          ),
        ],
        "BYOL one-direction loss",
        loss,
      );
    },
    {
      use: [
        "希望不显式构造 negative pairs 时，BYOL 以 predictor、stop-gradient 和 EMA teacher 学 representation。",
        "可在 augmentation 语义可靠的数据上比较 BYOL 与 contrastive baseline。",
      ],
      tune: [
        "先保留原实现的 predictor、normalization 和 EMA 配置；不要因没有 negatives 删除这些组成。",
        "监控 feature std、rank 与 downstream probe；loss 接近0时尤其要检查 collapse。",
      ],
      debug: [
        "所有样本 embeddings 几乎相同",
        "检查各维std和样本间cosine，而非只看loss",
        "核对stop-gradient、predictor与normalization，再改augmentation",
        "Online loss 下降而teacher输出震荡",
        "检查EMA调用时机和optimizer step计数",
        "确保每次真实更新后按约定更新teacher",
      ],
      boundary:
        "仅演示单向 normalized regression loss；角度不是 BYOL 的生产超参数，也没有证明防 collapse。",
    },
  ),
  "barlow-twins": make(
    "barlow-twins",
    "Off-diagonal correlation 增大时，冗余惩罚怎样计算？",
    "给定合法2×2 cross-correlation C=[[1,c],[c,1]]，λ=.05。",
    control(
      "Off-diagonal correlation c",
      0,
      0.9,
      0.05,
      0.3,
      "从 c=.3 比较0和.8；两条off-diagonal都要计入。",
    ),
    (c) => {
      const C = [
          [1, c],
          [c, 1],
        ],
        off = 2 * c * c,
        L = 0.05 * off;
      const first = stage(
        "Cross-correlation",
        "对normalized batch features形成跨视图矩阵，不是每个样本单独算。",
        "Cij=Σb zA_bi zB_bj / normalization",
        ["C11", "C22"],
        [1, 1],
        "correlation",
      );
      first.chart = matrix(["A1", "A2"], ["B1", "B2"], C, "correlation");
      return result(
        [
          first,
          stage(
            "Invariance diagonal",
            "对角线应接近1；本fixture特意令该项为0。",
            "Σi(1−Cii)²=0",
            ["dim1", "dim2"],
            [0, 0],
            "loss",
          ),
          stage(
            "Redundancy terms",
            "C12和C21各计一次。",
            `Σi≠j Cij²=2c²=${fmt(off)}`,
            ["C12²", "C21²"],
            [c * c, c * c],
            "loss",
          ),
          stage(
            "Weighted objective",
            "λ只调整redundancy相对权重，不改变本次给定C。",
            `L=0+.05×${fmt(off)}=${fmt(L)}`,
            ["diagonal", "weighted off-diagonal"],
            [0, L],
            "loss",
          ),
        ],
        "Barlow Twins loss",
        L,
      );
    },
    {
      use: [
        "需要两视图一致，同时减少不同feature维冗余时比较Barlow Twins。",
        "适合研究feature covariance结构；不能把decorrelation等同于生物因子独立。",
      ],
      tune: [
        "固定feature标准化轴，先复现λ后按dimension规模比较损失分量；本toy λ=.05仅便于手算。",
        "增加embedding维度时检查off-diagonal项数量增长，避免只比较total loss。",
      ],
      debug: [
        "Correlation数值极大或NaN",
        "检查batch variance是否接近0与epsilon位置",
        "修复标准化，记录每维std和有效batch大小",
        "Loss不大但features冗余",
        "分别打印diagonal/off-diagonal均值和总和",
        "调整λ并验证probe，不只降低invariance项",
      ],
      boundary:
        "固定C用于算目标项；没有从数据估计C或训练network，也不建立因果独立。",
    },
  ),
  mae: make(
    "mae",
    "Mask 更多 patches，encoder 计算与重建样本怎样变化？",
    "8个patch，masked error²固定[.01,.04,.09,.16,.25,.36,.49,.64]，前M个被mask。",
    control(
      "Masked patches M",
      1,
      7,
      1,
      6,
      "先比较M=4与6；这里只改变visible token数与参与loss的patch集合。",
    ),
    (m) => {
      const e = [0.01, 0.04, 0.09, 0.16, 0.25, 0.36, 0.49, 0.64],
        mask = e.map((_, i) => (i < m ? 1 : 0)),
        visible = 8 - m,
        loss = mean(e.slice(0, m));
      return result(
        [
          stage(
            "Mask contract",
            "mask=1表示decoder需要重建的patch。",
            "N=8; visible=N−M",
            e.map((_, i) => `patch${i + 1}`),
            mask,
            "mask",
          ),
          stage(
            "Encoder tokens",
            "MAE encoder只处理visible tokens；不是把所有masked tokens送进encoder。",
            `visible=${visible}; dense attention pairs=${visible}²`,
            ["visible", "masked"],
            [visible, m],
            "tokens",
          ),
          stage(
            "Masked residuals",
            "只对masked patches的reconstruction errors汇总。",
            "masked loss sum=Σmasked error²",
            e.slice(0, m).map((_, i) => `patch${i + 1}`),
            e.slice(0, m),
            "squared error",
          ),
          stage(
            "Normalize loss",
            "mean convention避免单纯因mask数量增加而线性放大。",
            `L=${fmt(sum(e.slice(0, m)))}/${m}=${fmt(loss)}`,
            ["mean masked error", "mean all errors"],
            [loss, mean(e)],
            "squared error",
          ),
        ],
        "Encoder attention pairs",
        visible * visible,
        "pairs",
        [metric("Masked mean loss", loss)],
      );
    },
    {
      use: [
        "有大量图像、希望用重建学习visual features时，MAE可作为self-supervised baseline。",
        "Encoder计算主要跟visible tokens相关，适合研究mask ratio与representation质量的取舍。",
      ],
      tune: [
        "沿用checkpoint的patch size及normalization，先比较mask ratio而不是同时换encoder。",
        "从原实现mask ratio附近做敏感性实验，报告visible tokens、训练成本和独立probe。",
      ],
      debug: [
        "Reconstruction loss低但定位差",
        "检查是否只学到低频背景及mask空间分布",
        "加入dense任务评估，不把pixel loss当定位质量",
        "Loss随mask ratio突然成倍变化",
        "检查sum/mean、mask=1语义与decoder输出索引",
        "对8patch toy验证masked mean再扩展",
      ],
      boundary:
        "固定patch errors用于观察loss归一化；attention pairs仅逻辑数量，不是总FLOPs、显存或重建质量预测。",
    },
  ),
  vicreg: make(
    "vicreg",
    "View 一致却全部 collapse，variance term 如何发现它？",
    "两视图相同，单feature样本=[−a,a]；使用unbiased sample variance与epsilon=1e−4。",
    control(
      "Feature amplitude a",
      0,
      1.5,
      0.05,
      0.5,
      "a=0表示collapse；调大a看到std达到1后hinge归零。",
    ),
    (a) => {
      const variance = 2 * a * a,
        std = Math.sqrt(variance + 1e-4),
        v = Math.max(0, 1 - std),
        L = 50 * v;
      return result(
        [
          stage(
            "Identical views",
            "两个view相同会使invariance MSE=0，即使两者都collapse。",
            "zA=zB=[−a,a]",
            ["sample1", "sample2"],
            [-a, a],
            "feature",
          ),
          stage(
            "Batch variance",
            "N=2，unbiased denominator是N−1=1。",
            `var=2a²=${fmt(variance)}`,
            ["sample1 deviation²", "sample2 deviation²"],
            [a * a, a * a],
            "feature²",
          ),
          stage(
            "Variance hinge",
            "std未达到γ=1时受到惩罚。",
            `std=√(var+1e−4)=${fmt(std)}; hinge=max(0,1−std)`,
            ["std", "target γ"],
            [std, 1],
            "feature",
          ),
          stage(
            "Two-view penalty",
            "两视图各有variance penalty；这里权重25。",
            `L=25(vA+vB)=50×${fmt(v)}=${fmt(L)}`,
            ["viewA penalty", "viewB penalty"],
            [25 * v, 25 * v],
            "loss",
          ),
        ],
        "Two-view variance penalty",
        L,
      );
    },
    {
      use: [
        "无negative pairs时，希望显式监控collapse与冗余，可比较VICReg。",
        "适合把invariance、variance、covariance各自诊断；不是只看总目标。",
      ],
      tune: [
        "先核batch-axis与variance的biased/unbiased约定，再使用官方配置权重。",
        "Small batch使variance估计噪声大；记录feature std分布并比较更稳定batch或统计方式。",
      ],
      debug: [
        "Invariance=0但representation无用",
        "检查每维std及embedding有效rank",
        "保留variance/covariance约束并排查输入重复",
        "Variance项和复现实现不符",
        "核对N−1、epsilon、两view求和方式",
        "先用本2样本fixture对齐数值",
      ],
      boundary:
        "单维fixture没有off-diagonal covariance项；不声称该variance term单独保证有用representation。",
    },
  ),
  dino: make(
    "dino",
    "Teacher temperature 如何改变 distillation target？",
    "teacher logits=[1,0,−1]，center=[.2,0,−.2]；student probabilities固定[.6,.3,.1]。",
    control(
      "Teacher temperature τt",
      0.05,
      1,
      0.05,
      0.2,
      "较小τt使target更尖锐；需和centering/EMA一起判断。",
    ),
    (t) => {
      const z = [0.8, 0, -0.8],
        p = softmax(z.map((v) => v / t)),
        s = [0.6, 0.3, 0.1],
        terms = p.map((v, i) => -v * Math.log(s[i]));
      return result(
        [
          stage(
            "Center teacher",
            "teacher先减running center；这里center固定便于手算。",
            "[1,0,−1]−[.2,0,−.2]=[.8,0,−.8]",
            ["code1", "code2", "code3"],
            z,
            "logit",
          ),
          stage(
            "Sharpen target",
            "temperature作用于teacher logits后再softmax。",
            `pt=softmax(centered/τt)`,
            ["code1", "code2", "code3"],
            p,
            "probability",
          ),
          stage(
            "Cross-view loss",
            "student拟合stop-gradient teacher probabilities。",
            "CE=−Σk pt,k log ps,k",
            ["code1 term", "code2 term", "code3 term"],
            terms,
            "nats",
          ),
          stage(
            "Collapse diagnostics",
            "低entropy是sharp target的结果，不自动说明语义正确。",
            `H(teacher)=${fmt(entropy(p))}; CE=${fmt(sum(terms))}`,
            ["teacher entropy", "cross entropy"],
            [entropy(p), sum(terms)],
            "nats",
          ),
        ],
        "Teacher cross entropy",
        sum(terms),
        "nats",
      );
    },
    {
      use: [
        "无标签图像中学习teacher/student自蒸馏features，可用DINO作为backbone。",
        "密集patch features用于匹配前，仍需验证spatial correspondence而非只看CLS。",
      ],
      tune: [
        "按checkpoint配置teacher temperature warm-up、center momentum与EMA；不要单独无限降低τt。",
        "监控per-code使用频率和entropy，区别整体collapse与合理的单样本sharpness。",
      ],
      debug: [
        "所有样本预测同一code",
        "检查batch aggregate distribution与center更新",
        "核对centering、teacher EMA及augmentation再调temperature",
        "Teacher被梯度直接更新",
        "检查optimizer参数列表和detach",
        "teacher仅走指定EMA路径，保留student梯度",
      ],
      boundary:
        "固定3个teacher/student codes的一步CE；不运行multi-crop训练或模拟DINOv2全部组件。",
    },
  ),
  "supervised-contrastive": make(
    "supervised-contrastive",
    "同类有两个 positives 时，SupCon 是平均哪一项？",
    "scores=[.8,.7,.1]，τ=.2；前P个candidate作为positives。",
    control(
      "Positive count P",
      1,
      2,
      1,
      2,
      "P=2时平均两条log-prob，不是先把positive probabilities相加再取log。",
    ),
    (n) => {
      const z = [0.8, 0.7, 0.1],
        p = softmax(z.map((x) => x / 0.2)),
        terms = p.slice(0, n).map((x) => -Math.log(x)),
        target = z.map((_, i) => (i < n ? 1 / n : 0)),
        g = p.map((v, i) => (v - target[i]) / 0.2);
      return result(
        [
          stage(
            "Label positives",
            "anchor本身不在candidate set；同类candidate按标签选入。",
            `P=${n}; target mass=1/P`,
            ["candidate1", "candidate2", "candidate3"],
            target,
            "target mass",
          ),
          stage(
            "Shared denominator",
            "所有candidate都在同一softmax denominator。",
            "p=softmax(scores/.2)",
            ["candidate1", "candidate2", "candidate3"],
            p,
            "probability",
          ),
          stage(
            "Average positive log loss",
            "对每个positive单独取log再平均。",
            `L=mean([${terms.map((x) => fmt(x)).join(",")}])`,
            terms.map((_, i) => `positive${i + 1}`),
            terms,
            "nats",
          ),
          stage(
            "Gradient allocation",
            "两个positive各分配1/P target mass。",
            "dL/ds=(p−target)/τ",
            ["candidate1", "candidate2", "candidate3"],
            g,
            "gradient",
          ),
        ],
        "SupCon anchor loss",
        mean(terms),
        "nats",
      );
    },
    {
      use: [
        "有可靠标签且想让同类不同实例聚集，可比较SupCon与实例级contrastive。",
        "标签定义应匹配迁移目标；细胞type标签过粗可能把重要state差异压平。",
      ],
      tune: [
        "每batch保证足够positive pairs；先记录每anchor positive count和被跳过比例。",
        "从原实现τ起比较label粒度与batch sampler，避免把class imbalance藏在pair数量里。",
      ],
      debug: [
        "Rare class loss异常",
        "查看其anchors是否没有positive",
        "用class-aware sampler或明确无positive处理规则",
        "同类细粒度状态消失",
        "检查positive label是否过粗",
        "改层级标签或减少跨state拉近约束",
      ],
      boundary:
        "这里只改变positive身份集合；给定scores不随训练改变，也不声明标签相同就一定生物相同。",
    },
  ),
  "zero-shot-learning": make(
    "zero-shot-learning",
    "不更新模型时，logit scale 能改变什么？",
    "一个image与三条text descriptions的cosine=[.7,.65,.1]；没有target-task训练。",
    control(
      "Logit scale s",
      1,
      20,
      1,
      10,
      "增大s提高confidence但不改变这组score的ranking。",
    ),
    (s) => {
      const cos = [0.7, 0.65, 0.1],
        z = cos.map((x) => s * x),
        p = softmax(z);
      return result(
        [
          stage(
            "Candidate descriptions",
            "固定candidate文本和encoder，不在目标数据上更新参数。",
            "cosine=[.7,.65,.1]",
            ["classA", "classB", "classC"],
            cos,
            "cosine",
          ),
          stage(
            "Scale scores",
            "scale是相似度到softmax的温度倒数。",
            `logits=s·cosine; s=${s}`,
            ["classA", "classB", "classC"],
            z,
            "logit",
          ),
          stage(
            "Candidate-relative probabilities",
            "增删candidate也会改变denominator。",
            "p=softmax(logits)",
            ["classA", "classB", "classC"],
            p,
            "probability",
          ),
          stage(
            "Confidence versus rank",
            "同一排序可对应很不同的confidence。",
            `top class=A; margin=${fmt(p[0] - p[1])}`,
            ["top probability", "runner-up"],
            [p[0], p[1]],
            "probability",
          ),
        ],
        "Top candidate probability",
        p[0],
        "probability",
      );
    },
    {
      use: [
        "没有target labels或需要快速测试语义类别时，用zero-shot作为baseline。",
        "可用text/image对齐模型探索新类，但必须记录class descriptions与候选集合。",
      ],
      tune: [
        "先沿用checkpoint logit scale并固定prompt templates；小验证集存在时再校准。",
        "比较多个语义等价prompt，报告每类和domain差异，不能只挑最好的template。",
      ],
      debug: [
        "Confidence高但预测错误",
        "检查候选描述、domain shift和label定义",
        "加入独立标注评估与拒答规则，不能靠降温修复ranking",
        "加一个类别后概率突然下降",
        "核对softmax denominator中的candidate集合",
        "比较raw similarity/rank并固定evaluation candidates",
      ],
      boundary:
        "给定cosines的zero-shot scoring toy；softmax值未校准，不代表真实正确率或zero-shot泛化保证。",
    },
  ),
  "few-shot-learning": make(
    "few-shot-learning",
    "Support examples 数量变化，估计的 class center 会怎样移动？",
    "一种few-shot原型baseline：A supports=[−1,1,2,4]，B=[5,7,6,8]；query=3。",
    control(
      "Shots per class K",
      1,
      4,
      1,
      2,
      "按固定顺序取前K个support；比较中心和query概率。",
    ),
    (k) => {
      const a = [-1, 1, 2, 4].slice(0, k),
        b = [5, 7, 6, 8].slice(0, k),
        c = [mean(a), mean(b)],
        d = c.map((x) => (3 - x) ** 2),
        p = softmax(d.map((x) => -x));
      return result(
        [
          stage(
            "Support set",
            "K变大也改变具体观测，不能把一次fixture当期望学习曲线。",
            `A=${a}; B=${b}`,
            ["A support sum", "B support sum"],
            [sum(a), sum(b)],
            "feature",
          ),
          stage(
            "Estimate centers",
            "只使用support labels，query label不可参与。",
            "center=Σsupport/K",
            ["A center", "B center"],
            c,
            "feature",
          ),
          stage(
            "Query distance",
            "query=3固定，比较squared Euclidean distance。",
            "d²=(3−center)²",
            ["A distance²", "B distance²"],
            d,
            "feature²",
          ),
          stage(
            "Class probabilities",
            "负距离进入softmax；class priors在此相等。",
            "p=softmax(−d²)",
            ["A", "B"],
            p,
            "probability",
          ),
        ],
        "Query P(A)",
        p[0],
        "probability",
      );
    },
    {
      use: [
        "每个新类只有少量support labels时，原型/linear probe是可解释baseline。",
        "Few-shot是数据设置；prompt examples、head adaptation和meta-learning是不同实现，要分开评估。",
      ],
      tune: [
        "先比较1/2/4-shot且重复抽support sets；按episode报告均值和不确定性。",
        "固定query set、encoder与split单位，再调整distance metric/normalization。",
      ],
      debug: [
        "一次support选取效果特别好",
        "检查是否选了代表性样本或泄漏query信息",
        "随机重复episodes，按patient或class独立切分",
        "K增加反而下降",
        "检查新support是outlier还是domain改变",
        "报告每次中心移动与support质量，不强行宣称单调收益",
      ],
      boundary:
        "该toy是prototype-based few-shot adaptation，不模拟LLM in-context learning；没有meta-training。",
    },
  ),
  "linear-probe": make(
    "linear-probe",
    "冻结 features 后，一次 head update 改了哪里？",
    "两个固定features x=[−1,1]、labels=[0,1]；binary head w=0、bias=0，mean BCE。",
    control(
      "Head learning rate η",
      0,
      2,
      0.1,
      0.5,
      "features完全固定；只有w更新，比较loss变化。",
    ),
    (eta) => {
      const grad = -0.5,
        w = 0 - eta * grad,
        p = 1 / (1 + Math.exp(-w)),
        loss = -Math.log(p);
      return result(
        [
          stage(
            "Freeze encoder",
            "两个feature点始终不变。",
            "x=[−1,1]; y=[0,1]",
            ["negative feature", "positive feature"],
            [-1, 1],
            "feature",
          ),
          stage(
            "Head gradient",
            "在w=0时两样本各贡献−.5，取mean仍为−.5。",
            "dL/dw=mean((σ(wx)−y)x)=−.5",
            ["sample1", "sample2"],
            [-0.5, -0.5],
            "gradient",
          ),
          stage(
            "Update head only",
            "encoder没有被optimizer包含。",
            `w′=0−${fmt(eta)}×(−.5)=${fmt(w)}`,
            ["before w", "after w"],
            [0, w],
            "weight",
          ),
          stage(
            "Recompute predictions",
            "两个样本的正确类概率相同。",
            `p(correct)=σ(w′)=${fmt(p)}; BCE=${fmt(loss)}`,
            ["before", "after"],
            [0.5, p],
            "correct-class probability",
          ),
        ],
        "Mean BCE after update",
        loss,
        "nats",
      );
    },
    {
      use: [
        "判断预训练features是否容易线性读出目标时，用linear probe。",
        "小数据时作为full fine-tuning的低成本对照，但只检验所选head的可读性。",
      ],
      tune: [
        "先冻结backbone和normalization statistics，只搜索head learning rate与regularization。",
        "验证集选head设置后固定test；报告feature预处理和是否含bias。",
      ],
      debug: [
        "所谓frozen baseline仍在变化",
        "检查BatchNorm running statistics及optimizer参数列表",
        "同时设置正确eval mode并确认backbone梯度为None",
        "训练loss下降验证差",
        "检查高维低样本head过拟合",
        "增加regularization并做grouped validation",
      ],
      boundary: "一维logistic head单步更新；不能估计真实encoder表征质量。",
    },
  ),
  "prototypical-networks": make(
    "prototypical-networks",
    "Query 穿过两个 prototypes，中间概率如何变化？",
    "A support=[0,2]，B=[4,6]，prototypes=[1,5]；改变query位置。",
    control(
      "Query feature q",
      0,
      6,
      0.25,
      2,
      "在q=3两prototype等距；距离温度在本例固定1。",
    ),
    (q) => {
      const c = [1, 5],
        d = c.map((x) => (q - x) ** 2),
        p = softmax(d.map((x) => -x));
      return result(
        [
          stage(
            "Support means",
            "每类prototype是support embeddings均值。",
            "cA=(0+2)/2=1; cB=(4+6)/2=5",
            ["prototype A", "prototype B"],
            c,
            "feature",
          ),
          stage(
            "Query residuals",
            "同一encoder坐标系下比较query和centers。",
            `q=${fmt(q)}; residual=q−c`,
            ["A residual", "B residual"],
            c.map((x) => q - x),
            "feature",
          ),
          stage(
            "Squared distances",
            "先平方再转为negative logits。",
            "d²=(q−c)²",
            ["A distance²", "B distance²"],
            d,
            "feature²",
          ),
          stage(
            "Normalize classes",
            "原型距离产生当前episode内class probabilities。",
            "p=softmax(−d²)",
            ["P(A)", "P(B)"],
            p,
            "probability",
          ),
        ],
        "P(A)",
        p[0],
        "probability",
      );
    },
    {
      use: [
        "新类support少、共享embedding合理时，用prototype分类作为few-shot baseline。",
        "适合快速添加新类；每类多模态时单中心可能不足。",
      ],
      tune: [
        "先比较Euclidean/cosine并固定embedding normalization，再调temperature。",
        "按episode调shots/ways；真实新类测试不得用训练类query反向挑参数。",
      ],
      debug: [
        "所有query都偏向某prototype",
        "检查feature norms、类别支持数量与domain差异",
        "统一normalization并查看每类distance分布",
        "同类两个亚群被压到中间",
        "检查类内多模态",
        "比较multiple prototypes或metric adaptation",
      ],
      boundary:
        "固定一维features，没有episodic encoder training；距离概率不自动校准。",
    },
  ),
  "vision-language-models": make(
    "vision-language-models",
    "一个 text query 怎样从 visual tokens 读取不同内容？",
    "scalar query q，visual keys=[−1,0,1]，values=[2,−1,3]；head dimension=1。",
    control(
      "Text query q",
      -2,
      2,
      0.25,
      1,
      "q改变query-key compatibility；values保持不变。",
    ),
    (q) => {
      const k = [-1, 0, 1],
        v = [2, -1, 3],
        z = k.map((x) => q * x),
        a = softmax(z),
        m = a.map((x, i) => x * v[i]);
      return result(
        [
          stage(
            "Visual key/value contract",
            "keys用于匹配；values提供被读取的内容，两者职责不同。",
            "K=[−1,0,1]; V=[2,−1,3]",
            ["v1", "v2", "v3"],
            v,
            "value",
          ),
          stage(
            "Query compatibility",
            "d=1，所以不另缩放；一般要除√d。",
            `scores=qK; q=${fmt(q)}`,
            ["token1", "token2", "token3"],
            z,
            "logit",
          ),
          stage(
            "Attention weights",
            "softmax只在可见visual tokens内归一化。",
            "a=softmax(scores)",
            ["token1", "token2", "token3"],
            a,
            "probability",
          ),
          stage(
            "Read values",
            "weight高不等于contribution大，还要乘value。",
            `output=Σaᵢvᵢ=${fmt(sum(m))}`,
            ["message1", "message2", "message3"],
            m,
            "value contribution",
          ),
        ],
        "Cross-attention output",
        sum(m),
        "value",
      );
    },
    {
      use: [
        "需要text根据问题读取image表示时，cross-attention提供条件化融合。",
        "VLM用于图文问答前，要确认模型真的依赖image而非语言先验。",
      ],
      tune: [
        "固定image resolution和token layout，再比较cross-attention位置/数量与成本。",
        "Prompt或visual tokens增加时记录mask、attention范围和context预算。",
      ],
      debug: [
        "换图片答案不变",
        "做图像打乱/遮挡与语言only对照",
        "检查image encoder连接、token mask和训练目标",
        "Attention高但解释不可信",
        "比较权重、value contribution与ablation",
        "不要将attention heatmap直接称为causal explanation",
      ],
      boundary:
        "一个scalar cross-attention head的精确运算；未训练真实VLM，也不输出图像语义。",
    },
  ),
  "two-tower-retrieval": make(
    "two-tower-retrieval",
    "User embedding 改变时，哪一个 item 会进入 top rank？",
    "user=[a,1−a]，items A=[1,0], B=[0,1], C=[.6,.6]，使用未归一化dot score。",
    control(
      "User coordinate a",
      0,
      1,
      0.05,
      0.5,
      "这里只移动query embedding；candidate向量和score定义固定。",
    ),
    (a) => {
      const u = [a, 1 - a],
        items = [
          [1, 0],
          [0, 1],
          [0.6, 0.6],
        ],
        scores = items.map((v) => v[0] * u[0] + v[1] * u[1]),
        p = softmax(scores);
      return result(
        [
          stage(
            "Independent towers",
            "item embeddings可预先计算；query tower在线生成user向量。",
            "u=[a,1−a]",
            ["user dim1", "user dim2"],
            u,
            "embedding",
          ),
          stage(
            "Inner-product contributions",
            "每个item的两个维度贡献相加。",
            "scoreᵢ=u·vᵢ",
            ["A", "B", "C"],
            scores,
            "dot score",
          ),
          stage(
            "Candidate ranking",
            "排序按raw dot score；softmax不是检索所必需。",
            `winner=${["A", "B", "C"][scores.indexOf(Math.max(...scores))]}`,
            ["A", "B", "C"],
            p,
            "candidate-relative probability",
          ),
          stage(
            "Recall boundary",
            "只对当前三个候选排名；ANN漏掉的item无法由reranker救回。",
            `A−B=${fmt(scores[0] - scores[1])}; A−C=${fmt(scores[0] - scores[2])}`,
            ["A−B", "A−C"],
            [scores[0] - scores[1], scores[0] - scores[2]],
            "score margin",
          ),
        ],
        "A versus B score margin",
        scores[0] - scores[1],
        "dot score",
      );
    },
    {
      use: [
        "候选规模很大时，two-tower允许预建item index并低延迟召回。",
        "适合recommendation/retrieval的first stage，复杂交互可交给second-stage reranker。",
      ],
      tune: [
        "先exact retrieval建立Recall@K基线，再调ANN/index与candidate K。",
        "固定embedding normalization和negative sampling分布；改变它们会改变score解释。",
      ],
      debug: [
        "训练loss好但召回低",
        "检查in-batch negatives和线上候选分布差异",
        "用真实candidate pool评价Recall@K并排查false negatives",
        "新item总是漏掉",
        "检查index刷新、版本和embedding维度",
        "以同checkpoint重建index并做exact-search对照",
      ],
      boundary:
        "三个固定向量的exact scoring；没有训练two towers、运行ANN或测量production latency。",
    },
  ),
  "multiple-instance-learning": make(
    "multiple-instance-learning",
    "Attention pooling 如何让少数 instances 主导 bag prediction？",
    "三个instance features=[0,1,4]，attention logits=[0,0,a]；toy bag head是identity。",
    control(
      "Third-instance attention logit a",
      -3,
      3,
      0.25,
      0,
      "改变第三个instance的相对weight；不改变该instance本身的feature。",
    ),
    (a) => {
      const h = [0, 1, 4],
        w = softmax([0, 0, a]),
        con = w.map((x, i) => x * h[i]);
      return result(
        [
          stage(
            "Bag instances",
            "只有bag label，instance数量与独立donor数量不同。",
            "h=[0,1,4]",
            ["instance1", "instance2", "instance3"],
            h,
            "feature",
          ),
          stage(
            "Attention normalization",
            "attention在bag内部sum-to-one。",
            `w=softmax([0,0,${fmt(a)}])`,
            ["instance1", "instance2", "instance3"],
            w,
            "weight",
          ),
          stage(
            "Weighted contributions",
            "weight和feature共同决定贡献。",
            "messages=w⊙h",
            ["message1", "message2", "message3"],
            con,
            "feature contribution",
          ),
          stage(
            "Bag representation",
            "先pool，再送入task head；本toy head是identity。",
            `z=Σmessages=${fmt(sum(con))}`,
            ["uniform mean", "attention pooled"],
            [mean(h), sum(con)],
            "bag feature",
          ),
        ],
        "Pooled bag feature",
        sum(con),
        "feature",
      );
    },
    {
      use: [
        "只有slide/donor/bag labels而没有每个cell/patch标签时，用MIL汇总instances。",
        "适合weak supervision baseline，但bag-level success不能验证instance biology。",
      ],
      tune: [
        "固定bag抽样上限并比较mean/max/attention pooling，先确认学习不只依赖bag size。",
        "按donor或slide划分，调整attention capacity时同时看attention entropy与外部验证。",
      ],
      debug: [
        "Attention只集中在artifact patches",
        "看high-weight patches、stain/site和background",
        "屏蔽artifact并做site-held-out验证",
        "Bag指标很好而instance解释不稳定",
        "比较seed、ablation和替代pooling",
        "将attention作为待验证线索，不作为细胞因果贡献",
      ],
      boundary:
        "固定features/logits的attention pooling；没有训练gated-attention网络，也没有instance ground truth。",
    },
  ),
  "manifold-embeddings": make(
    "manifold-embeddings",
    "Neighborhood size 改变的是哪几条局部边？",
    "五个邻居distance=[.1,.3,.7,1.2,2]；ρ=.1、σ=.5固定，只改变保留的k。",
    control(
      "Retained neighbors k",
      1,
      5,
      1,
      3,
      "观察新增边和edge mass；真实UMAP还会为每个点拟合局部σ。",
    ),
    (k) => {
      const d = [0.1, 0.3, 0.7, 1.2, 2],
        w = d.map((x, i) =>
          i < k ? Math.exp(-Math.max(0, x - 0.1) / 0.5) : 0,
        ),
        mass = sum(w),
        p = w.map((x) => x / mass);
      return result(
        [
          stage(
            "High-dimensional distances",
            "邻域来自所选metric和scaled features，不是二维图中的距离。",
            "d=[.1,.3,.7,1.2,2]",
            d.map((_, i) => `neighbor${i + 1}`),
            d,
            "distance",
          ),
          stage(
            "Select support",
            "k截断哪些neighbors参与局部graph。",
            `keep first ${k}`,
            d.map((_, i) => `neighbor${i + 1}`),
            d.map((_, i) => (i < k ? 1 : 0)),
            "included",
          ),
          stage(
            "Local edge strengths",
            "采用UMAP式局部exponential权重，但σ在toy中固定。",
            "w=exp(−max(0,d−ρ)/σ)",
            d.map((_, i) => `edge${i + 1}`),
            w,
            "edge strength",
          ),
          stage(
            "Inspect neighborhood mass",
            "额外sum-normalization仅用于看edge占比，不是UMAP的fuzzy union。",
            `mass=Σw=${fmt(mass)}`,
            d.map((_, i) => `edge${i + 1}`),
            p,
            "mass fraction",
          ),
        ],
        "Retained edge mass",
        mass,
        "strength",
      );
    },
    {
      use: [
        "探索高维neighbors结构时，用UMAP/t-SNE作可视化，而非自动证明clusters。",
        "需要比较local与global结构时，先看高维邻域保留及参数敏感性。",
      ],
      tune: [
        "从n_neighbors=15附近比较5/15/50，并固定feature scaling、metric与seed。",
        "改变min_dist时分开解释二维紧密程度；不要把岛间距离直接当生物距离。",
      ],
      debug: [
        "出现漂亮小岛但不稳定",
        "比较不同seed、neighbors、batch标签及高维距离",
        "把embedding当探索图，另用独立数据验证groups",
        "两个群在二维混合",
        "检查高维neighbors是否也混合及稀有群采样",
        "先改输入representation或采样，不只调二维美观",
      ],
      boundary:
        "只演示局部graph的一项权重与k截断；没有拟合UMAP σ、fuzzy union或低维优化，也不复现t-SNE。",
    },
  ),
};
