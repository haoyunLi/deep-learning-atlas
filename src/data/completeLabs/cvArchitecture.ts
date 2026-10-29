import type { CompleteLabMap } from "./types";
import { define, C, S, M, L, D, fmt, metric, sum } from "./cvHelpers";
export const cvArchitectureLabs: CompleteLabMap = {
  nnunet: define(
    "nnunet",
    "Patch 大一倍，3D activation 为什么不只大一倍？",
    "固定32channels、FP32、cubic patch；只核一个activation tensor，不模拟nnU-Net自动planner。",
    C(
      "Patch edge",
      32,
      128,
      16,
      64,
      "先用planner配置；OOM时核patch volume、batch与全部中间tensor，不盲增patch。",
    ),
    ({ x }) => {
      const vox = x ** 3,
        bytes = vox * 32 * 4;
      return {
        stages: [
          S(
            "Spatial extent",
            "每个轴一起改变，volume为三次方。",
            `${x}³=${vox}`,
            ["X", "Y", "Z"],
            [x, x, x],
            "voxels/axis",
          ),
          S(
            "Voxel count",
            "32channels在每个voxel保留32个值。",
            `V=${vox}; values=32V`,
            ["V", "32V"],
            [vox, vox * 32],
            "values",
          ),
          S(
            "Storage",
            "单个FP32 tensor每值4bytes。",
            `bytes=32×${vox}×4`,
            ["FP16 MiB", "FP32 MiB"],
            [bytes / 2 / 2 ** 20, bytes / 2 ** 20],
            "MiB",
          ),
          S(
            "Compare baseline",
            "与64³ patch比较；其它层、optimizer、gradient还占显存。",
            `ratio=(${x}/64)³`,
            ["64³", "current"],
            [32, bytes / 2 ** 20],
            "MiB",
          ),
        ],
        outcomes: [
          metric("One tensor", bytes / 2 ** 20, "MiB"),
          metric("Relative volume", vox / 64 ** 3),
        ],
      };
    },
    "Spacing改变后检查resampling后的物理视野；显存不足可先减batch，再比较patch覆盖是否丢掉关键context。",
    D(
      [
        "OOM",
        "检查所有activation与optimizer，不只input大小",
        "从planner输出记录patch/batch，再逐项减预算",
      ],
      [
        "细结构消失",
        "比较spacing前后最小结构占多少voxel",
        "保留物理单位并审查resampling与标注",
      ],
    ),
    "预算只是一个tensor；不复现完整nnU-Net规划，也不推断Dice。",
  ),
  "unet-plus-plus": define(
    "unet-plus-plus",
    "UNet++ 的 deep supervision 权重怎样分配梯度目标？",
    "固定三个decoder heads的toy segmentation losses [.8,.4,.2]；调整最深head权重，另两者平分余量。",
    C(
      "Deep-head weight",
      0,
      1,
      0.1,
      0.5,
      "先核实现的head/loss normalization；改变权重后同时记录各head独立验证结果。",
    ),
    ({ x }) => {
      const w = [(1 - x) / 2, (1 - x) / 2, x],
        loss = [0.8, 0.4, 0.2],
        parts = w.map((a, i) => a * loss[i]);
      return {
        stages: [
          S(
            "Separate heads",
            "Nested skip paths产生多个可监督输出。",
            "L=[.8,.4,.2]",
            ["shallow", "middle", "deep"],
            loss,
            "loss",
          ),
          S(
            "Normalize weights",
            "固定sum weights=1，避免只改变总loss尺度。",
            `w=[${w.map((a) => fmt(a)).join(",")}]`,
            ["w1", "w2", "w3"],
            w,
            "weight",
          ),
          S(
            "Weighted terms",
            "每条head分支向共享参数传递加权梯度。",
            "Ltotal=ΣwjLj",
            ["w1L1", "w2L2", "w3L3"],
            parts,
            "loss contribution",
          ),
          S(
            "Objective",
            "单个head最小loss不自动表示最佳泛化。",
            `Ltotal=${fmt(sum(parts))}`,
            ["equal weights", "current"],
            [sum(loss) / 3, sum(parts)],
            "loss",
          ),
        ],
        outcomes: [metric("Weighted loss", sum(parts))],
      };
    },
    "先等权baseline，再按各head梯度范数和验证表现调权；不能因某head训练loss低就给它所有权重。",
    D(
      [
        "多个head训练相互干扰",
        "分别检查每head loss与梯度范数",
        "统一reduction后做单head/多head消融",
      ],
      [
        "推理输出不同",
        "核部署用了哪个head或ensemble规则",
        "验证时使用同一推理分支",
      ],
    ),
    "演示deep supervision的目标组合，未运行nested convolutions；loss为固定合成值。",
  ),
  "deeplabv3-plus": define(
    "deeplabv3-plus",
    "Atrous rate 变大，采样位置与覆盖怎样变化？",
    "1D长度17信号x_i=i²，中心i=8，三点kernel=[1/3,1/3,1/3]；对应2D atrous机制的单行切片。",
    C(
      "Dilation rate",
      1,
      6,
      1,
      2,
      "先使dilation与output stride及object尺寸匹配；rate过大时检查稀疏采样和边界padding。",
    ),
    ({ x }) => {
      const ix = [8 - x, 8, 8 + x],
        v = ix.map((i) => i * i),
        y = sum(v) / 3;
      return {
        stages: [
          L(
            "Signal",
            "固定输入，不改变网络权重。",
            "x_i=i²",
            Array.from({ length: 17 }, (_, i) => i),
            Array.from({ length: 17 }, (_, i) => i * i),
            "position",
            "signal",
          ),
          S(
            "Atrous samples",
            "Rate改变kernel taps间的距离。",
            `indices=[${ix.join(",")}]`,
            ["left", "center", "right"],
            ix,
            "index",
          ),
          S(
            "Weighted messages",
            "每个tap权重1/3。",
            `samples=[${v.join(",")}]`,
            ["left/3", "center/3", "right/3"],
            v.map((a) => a / 3),
            "signal",
          ),
          S(
            "Receptive span",
            "有效kernel宽度1+(3−1)r；不是实际影响分布。",
            `span=${1 + 2 * x}; output=${fmt(y)}`,
            ["center value", "atrous output"],
            [64, y],
            "signal",
          ),
        ],
        outcomes: [
          metric("Output", y),
          metric("Theoretical span", 1 + 2 * x, "pixels"),
        ],
      };
    },
    "比较output_stride8/16时同步核ASPP rates；细边界差先查decoder和label alignment，再增rate。",
    D(
      [
        "Grid artifacts",
        "检查邻近输出是否重复遗漏相同位置",
        "组合不同rates并对比dense kernel",
      ],
      [
        "边界表现差",
        "分开看padding与低分辨率feature的影响",
        "检查输入/label同步变换和decoder分辨率",
      ],
    ),
    "仅线性三tap atrous计算，不声称等同完整ASPP或DeepLab性能。",
  ),
  vgg: define(
    "vgg",
    "连续3×3 convolutions 怎样扩大 theoretical receptive field？",
    "Stride1、dilation1、same padding的L层3×3卷积，channels恒64。",
    C(
      "Convolution layers L",
      1,
      8,
      1,
      3,
      "增加层数先核训练/验证gap和梯度；theoretical span变大不保证Effective Receptive Field均匀。",
    ),
    ({ x }) => {
      const ns = Array.from({ length: x }, (_, i) => i + 1),
        rf = ns.map((n) => 1 + 2 * n),
        params = x * 9 * 64 * 64;
      return {
        stages: [
          S(
            "Kernel",
            "每层从前一层读取3×3局部。",
            "k=3, stride=1",
            ["kernel", "jump"],
            [3, 1],
            "pixels",
          ),
          L(
            "Receptive recurrence",
            "每层增加2个input pixels。",
            "r_l=r_(l−1)+2j; j=1",
            ns,
            rf,
            "layer",
            "theoretical span",
          ),
          S(
            "Parameter cost",
            "同宽卷积每层9CinCout；不计bias。",
            `P=${x}×9×64²`,
            ["one layer", "all layers"],
            [9 * 64 ** 2, params],
            "parameters",
          ),
          S(
            "Compare large kernel",
            "相同span的单层dense kernel通常参数更多；非线性也不同。",
            `single-kernel size=${1 + 2 * x}`,
            ["stack", "single same-span"],
            [params, (1 + 2 * x) ** 2 * 64 ** 2],
            "parameters",
          ),
        ],
        outcomes: [
          metric("Theoretical RF", 1 + 2 * x, "pixels"),
          metric("Parameters", params),
        ],
      };
    },
    "复现VGG先按stage通道与pooling配置；改深度时按相同训练预算比较，不把本例恒通道计数当整个VGG。",
    D(
      [
        "以为所有位置影响相同",
        "查看input-gradient分布而非只看RF公式",
        "区分theoretical覆盖与Effective Receptive Field",
      ],
      ["训练难收敛", "检查梯度范数、初始化和LR", "先验证浅网络baseline再加深"],
    ),
    "固定stride1模型，省略真实VGG的pooling/stage与classification head。",
  ),
  densenet: define(
    "densenet",
    "Growth rate 怎样改变 concatenation 的通道数？",
    "C0=16、4个Dense layers，每层新增k个channels；所有旧features保留。",
    C(
      "Growth rate k",
      4,
      32,
      4,
      12,
      "从checkpoint规定k起；显存高先核累计channels和activation，再比较compression。",
    ),
    ({ x }) => {
      const cs = [0, 1, 2, 3, 4].map((l) => 16 + l * x),
        p = [0, 1, 2, 3].map((l) => 9 * (16 + l * x) * x);
      return {
        stages: [
          S(
            "Initial features",
            "旧features不会被相加覆盖。",
            "C0=16",
            ["initial"],
            [16],
            "channels",
          ),
          L(
            "Concatenate",
            "每层新增k channels。",
            `C_l=16+l×${x}`,
            [0, 1, 2, 3, 4],
            cs,
            "layer",
            "channels",
          ),
          S(
            "Convolution input grows",
            "本例直接3×3、无bottleneck；每层参数随输入channels变化。",
            "P_l=9 C_in k",
            ["L1", "L2", "L3", "L4"],
            p,
            "parameters",
          ),
          S(
            "Final representation",
            "DenseNet concat与ResNet addition的维度契约不同。",
            `C4=${cs[4]}`,
            ["initial", "new", "final"],
            [16, 4 * x, cs[4]],
            "channels",
          ),
        ],
        outcomes: [
          metric("Output channels", cs[4]),
          metric("Convolution parameters", sum(p)),
        ],
      };
    },
    "真实DenseNet有bottleneck/transition；调k后重算这些层，不可直接复用不匹配的weights。",
    D(
      [
        "Channel mismatch",
        "逐层打印concat前后shape",
        "按16+lk检查连接，别误用elementwise add",
      ],
      [
        "Memory超预算",
        "检查保存的各层features",
        "比较checkpointing或transition compression",
      ],
    ),
    "只展示Dense connectivity的shape与简化卷积参数量，不模拟真实DenseNet训练。",
  ),
  efficientnet: define(
    "efficientnet",
    "Compound scaling 为什么会快速花掉计算预算？",
    "Toy基线d=w=r=1；取α=1.2、β=1.1、γ=1.15，连续预算近似不做channels rounding。",
    C(
      "Scaling coefficient φ",
      0,
      4,
      0.25,
      1,
      "先用已发布的离散模型配置；若自行scale需测真实latency与精度。",
    ),
    ({ x }) => {
      const d = 1.2 ** x,
        w = 1.1 ** x,
        r = 1.15 ** x,
        f = d * w * w * r * r;
      return {
        stages: [
          S(
            "Three axes",
            "depth、width、resolution是不同变化。",
            `d=α^φ,w=β^φ,r=γ^φ`,
            ["depth", "width", "resolution"],
            [d, w, r],
            "relative scale",
          ),
          S(
            "Squared dimensions",
            "卷积cost对width和resolution通常近似平方。",
            "F∝d·w²·r²",
            ["d", "w²", "r²"],
            [d, w * w, r * r],
            "factor",
          ),
          S(
            "Multiply budget",
            "这些因子相乘，不是相加。",
            `F/F0=${fmt(f)}`,
            ["baseline", "scaled"],
            [1, f],
            "relative MACs",
          ),
          L(
            "Budget curve",
            "曲线仅为上述analytic模型。",
            "F(φ)=(1.2×1.1²×1.15²)^φ",
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4].map((t) => (1.2 * 1.1 ** 2 * 1.15 ** 2) ** t),
            "φ",
            "relative MACs",
          ),
        ],
        outcomes: [metric("Relative MACs", f), metric("Resolution ratio", r)],
      };
    },
    "Latency受kernel、memory与batch影响；把measured latency、显存、validation指标一起画，别把MACs比率当时间比率。",
    D(
      [
        "FLOPs更低却更慢",
        "核设备上的operators和memory traffic",
        "用一致batch/end-to-end流程实测",
      ],
      [
        "改resolution后失真",
        "检查resize/crop与目标尺寸",
        "与固定width的resolution-only对照",
      ],
    ),
    "αβγ是本例假设，不声称复现某EfficientNet型号或accuracy scaling law。",
  ),
  convnext: define(
    "convnext",
    "大kernel的 depthwise convolution 为什么不按C²增长？",
    "同一H=W=32、C=64，比较k×k depthwise与dense convolution；另计C→4C→C pointwise MLP。",
    C(
      "Kernel size k",
      3,
      11,
      2,
      7,
      "从checkpoint的kernel起；更大kernel需要weight适配或重训，不能当任意推理开关。",
    ),
    ({ x }) => {
      const dw = x * x * 64,
        dense = x * x * 64 * 64,
        pw = 8 * 64 ** 2;
      return {
        stages: [
          S(
            "Spatial kernel",
            "Dense混合所有input channels；depthwise逐channel。",
            `k=${x},C=64`,
            ["DW params", "dense params"],
            [dw, dense],
            "parameters",
          ),
          S(
            "Pointwise mixing",
            "ConvNeXt式通道混合仍需要pointwise计算。",
            "C×4C+4C×C=8C²",
            ["spatial DW", "pointwise"],
            [dw, pw],
            "parameters",
          ),
          S(
            "Activation work",
            "每个spatial位置应用同一组权重。",
            "MACs=H×W×parameters",
            ["DW block", "dense spatial only"],
            [(dw + pw) * 1024, dense * 1024],
            "MACs",
          ),
          S(
            "Budget attribution",
            "大kernel成本与channel mixing分开看。",
            `DW fraction=${fmt(dw / (dw + pw))}`,
            ["DW", "pointwise"],
            [dw / (dw + pw), pw / (dw + pw)],
            "fraction",
          ),
        ],
        outcomes: [
          metric("Block MACs", (dw + pw) * 1024),
          metric("DW share", dw / (dw + pw)),
        ],
      };
    },
    "选择kernel前固定normalization、augmentation与training recipe；本例只比计算，不将recipe收益归因于kernel。",
    D(
      [
        "大kernel未提升结果",
        "检查实际context与数据规模",
        "做same-budget ablation",
      ],
      [
        "理论省算却慢",
        "检查depthwise kernel支持与算子融合",
        "以设备端latency选型",
      ],
    ),
    "省略LayerNorm/GELU/bias与residual；参数计数不是完整ConvNeXt benchmark。",
  ),
  "swin-transformer": define(
    "swin-transformer",
    "Window size 改变了多少 attention 配对？",
    "固定8×8=64tokens，window边长m∈{1,2,4,8}。可整除时比较window与global的attention score数量。",
    C(
      "Window exponent e (m=2^e)",
      0,
      3,
      1,
      1,
      "先按checkpoint window配置；改变window须检查relative-position bias与shift mask。",
    ),
    ({ x }) => {
      const m = 2 ** x,
        nt = m * m,
        nw = 64 / nt;
      return {
        stages: [
          S(
            "Partition",
            "每个window包含m²tokens。",
            `m=${m}; windows=64/m²`,
            ["tokens/window", "windows"],
            [nt, nw],
            "count",
          ),
          M(
            "Allowed local pairs",
            "一个代表window的score矩阵全连接；其它windows独立。",
            "window score count=m⁴",
            ["query block"],
            ["key block"],
            [[nt * nt]],
            "pairs/window",
          ),
          S(
            "Total pair budget",
            "所有windows的score数为N m²。",
            `N m²=64×${nt}`,
            ["window", "global"],
            [64 * nt, 64 ** 2],
            "pairs",
          ),
          S(
            "Cross-window caveat",
            "下一层shift可传跨window信息，但不等于这一层global attention。",
            `relative pairs=${fmt(nt / 64)}`,
            ["local fraction", "saved fraction"],
            [nt / 64, 1 - nt / 64],
            "fraction",
          ),
        ],
        outcomes: [metric("Local pairs", 64 * nt), metric("Tokens/window", nt)],
      };
    },
    "Small windows限制本层context；若跨边界对象错误，查shift mask、stage depth与merge，不只增window。",
    D(
      [
        "跨window被切断",
        "检查交替shift及attention mask",
        "使用合法shift并核padding位置",
      ],
      [
        "Checkpoint shape mismatch",
        "核relative-position table尺寸",
        "按实现插值/重训并验证，勿静默忽略",
      ],
    ),
    "精确计数attention score entries，不含QKV/MLP，也不模拟训练后的跨层注意力。",
  ),
  "mobilenet-v2": define(
    "mobilenet-v2",
    "Expansion ratio 怎样同时改变hidden width和MACs？",
    "Stride1、Cin=Cout=16、H=W=16；1×1 expansion→3×3 depthwise→linear projection。",
    C(
      "Expansion ratio t",
      1,
      8,
      1,
      6,
      "跟随checkpoint；降低t可能省activation但影响capacity，需重新训练比较。",
    ),
    ({ x }) => {
      const e = 16 * x,
        ex = 16 * e,
        dw = 9 * e,
        pr = e * 16;
      return {
        stages: [
          S(
            "Expand",
            "窄输入映射到更宽的hidden channels。",
            `Cexp=16×${x}`,
            ["input", "expanded", "output"],
            [16, e, 16],
            "channels",
          ),
          S(
            "Parameter terms",
            "Depthwise不混通道，1×1负责混合。",
            "P=CinCexp+9Cexp+CexpCout",
            ["expand", "depthwise", "project"],
            [ex, dw, pr],
            "parameters",
          ),
          S(
            "Multiply spatial work",
            "本例stride1使三段都有256个位置。",
            "MACs=256P",
            ["expand", "depthwise", "project"],
            [ex * 256, dw * 256, pr * 256],
            "MACs",
          ),
          S(
            "Linear bottleneck",
            "输出projection不接ReLU是架构设计；residual需shape相同。",
            `total=${(ex + dw + pr) * 256}`,
            ["hidden values", "output values"],
            [e * 256, 16 * 256],
            "activation values",
          ),
        ],
        outcomes: [
          metric("Total MACs", (ex + dw + pr) * 256),
          metric("Expanded channels", e),
        ],
      };
    },
    "真实t=1实现常省略expansion层，本例始终保留以便对比公式；测latency时用实际实现而非本表。",
    D(
      [
        "Residual shape error",
        "核stride与Cin/Cout相等条件",
        "只在shape兼容时相加",
      ],
      [
        "压窄后信息损失",
        "查narrow projection后是否误加ReLU",
        "核linear bottleneck与单项ablation",
      ],
    ),
    "MACs模型不含bias/BN/activation；不是设备性能预测。",
  ),
  "mask-rcnn": define(
    "mask-rcnn",
    "RoIAlign 的 sampling point 移动时，feature怎样连续变化？",
    "2×2 feature grid=[[0,2],[4,6]]，采样y=.25、x可调；双线性插值。",
    C(
      "Sampling x",
      0,
      1,
      0.05,
      0.5,
      "先校验坐标单位、aligned convention与spatial_scale；不同库的half-pixel规则需单独核对。",
    ),
    ({ x }) => {
      const wy = 0.25,
        w = [(1 - x) * (1 - wy), x * (1 - wy), (1 - x) * wy, x * wy],
        v = [0, 2, 4, 6],
        p = w.map((a, i) => a * v[i]);
      return {
        stages: [
          M(
            "Grid values",
            "固定feature值，连续采样不进行整数取整。",
            "F=[[0,2],[4,6]]",
            ["y0", "y1"],
            ["x0", "x1"],
            [
              [0, 2],
              [4, 6],
            ],
            "feature",
          ),
          M(
            "Bilinear weights",
            "四角权重非负且和为1。",
            `x=${fmt(x)},y=.25`,
            ["y0", "y1"],
            ["x0", "x1"],
            [w.slice(0, 2), w.slice(2)],
            "weight",
          ),
          S(
            "Contributions",
            "值与权重逐项相乘。",
            "output=ΣwijFij",
            ["00", "01", "10", "11"],
            p,
            "feature",
          ),
          S(
            "Interpolated output",
            "相邻位置微移会连续改变输出；量化采样则可能跳变。",
            `output=${fmt(sum(p))}`,
            ["bilinear", "nearest corner"],
            [sum(p), x < 0.5 ? 0 : 2],
            "feature",
          ),
        ],
        outcomes: [metric("Interpolated feature", sum(p))],
      };
    },
    "mask边缘错位先看box映射、ROI scale与align参数；mask resolution提高会增加成本而不修复坐标bug。",
    D(
      [
        "Mask整体偏移",
        "用单个标记pixel做forward/inverse trace",
        "统一坐标、padding与half-pixel convention",
      ],
      [
        "小对象边缘粗糙",
        "比较feature stride和mask head resolution",
        "先修alignment再提高采样密度",
      ],
    ),
    "单个双线性sample，未复现完整RoIAlign bin pooling或Mask R-CNN。",
  ),
  detr: define(
    "detr",
    "Matching cost 的权重怎样改变 query→GT 配对？",
    "2queries×2GT；class cost [[.1,.8],[.7,.2]]，box cost [[.8,.1],[.1,.8]]；枚举两种one-to-one方案。",
    C(
      "Box matching weight λ",
      0,
      3,
      0.1,
      1,
      "先核官方cost系数与units；改变λ后同时记录class/L1/GIoU分量，不能只看总cost。",
    ),
    ({ x }) => {
      const a = [
          [0.1, 0.8],
          [0.7, 0.2],
        ],
        b = [
          [0.8, 0.1],
          [0.1, 0.8],
        ],
        c = a.map((r, i) => r.map((v, j) => v + x * b[i][j])),
        diag = c[0][0] + c[1][1],
        cross = c[0][1] + c[1][0];
      return {
        stages: [
          M(
            "Class cost",
            "这里Cclass=.9−p；p=[[.8,.1],[.2,.7]]，每行另有.1 background。平移不改变assignment，不是training CE。",
            "Cclass",
            ["q1", "q2"],
            ["GT1", "GT2"],
            a,
            "cost",
          ),
          M(
            "Box cost",
            "几何与类别信息倾向不同配对。",
            "Cbox",
            ["q1", "q2"],
            ["GT1", "GT2"],
            b,
            "cost",
          ),
          M(
            "Combine",
            "系数改变不同信号的相对影响。",
            `C=Cclass+${fmt(x)}Cbox`,
            ["q1", "q2"],
            ["GT1", "GT2"],
            c,
            "cost",
          ),
          S(
            "Discrete matching",
            "枚举2种排列；相等时选diagonal，不表示置信度。",
            "min(C11+C22,C12+C21)",
            ["diagonal", "cross"],
            [diag, cross],
            "total cost",
          ),
        ],
        outcomes: [
          metric("Optimal matching cost", Math.min(diag, cross)),
          metric("Cross selected", cross < diag ? 1 : 0),
        ],
      };
    },
    "先固定query capacity与no-object weight；matching发生no_grad，不等于后续matched loss不能反传。",
    D(
      [
        "匹配反复翻转",
        "检查两种assignment cost gap",
        "分项敏感性测试并审查标注",
      ],
      [
        "预测框数不足",
        "核queries是否低于image目标数",
        "增加容量并重训，别仅调matching系数",
      ],
    ),
    "2×2枚举体现set matching，不复现DETR网络、完整loss或优化过程。",
  ),
  "faster-rcnn-yolo": define(
    "faster-rcnn-yolo",
    "Proposal budget 怎样改变 two-stage 的候选上限和工作量？",
    "合成RPN已排序10个proposals；其中indices[1,3,6]分别覆盖3个GT，indices[8]重复GT1，其余background。",
    C(
      "Proposal budget K",
      1,
      10,
      1,
      5,
      "从实现默认budget起，画proposal recall对K曲线；recall不足先检查RPN尺度与matching，不直接增head。",
    ),
    ({ x }) => {
      const gt = [-1, 0, -1, 1, -1, -1, 2, -1, 0, -1],
        keep = gt.slice(0, x),
        covered = new Set(keep.filter((i) => i >= 0)).size,
        counts = [0, 1, 2].map((g) => keep.filter((t) => t === g).length);
      return {
        stages: [
          S(
            "Ranked proposals",
            "固定排序；预算只保留前K。",
            `K=${x}`,
            ["kept", "removed"],
            [x, 10 - x],
            "proposals",
          ),
          S(
            "GT coverage",
            "同GT重复proposal不增加recall。",
            "count unique covered GT",
            ["GT1", "GT2", "GT3"],
            counts,
            "proposals",
          ),
          S(
            "ROI feature budget",
            "每proposal抽7×7×256值，不计backbone。",
            "ROI values=K×7×7×256",
            ["current", "all10"],
            [x * 7 * 7 * 256, 10 * 7 * 7 * 256],
            "values",
          ),
          S(
            "Proposal recall",
            "这里只核固定proposal coverage。后续box regression可能改变IoU，因此proposal recall不是final detector recall的严格上界。",
            `proposal recall=${covered}/3`,
            ["covered GT", "missed GT"],
            [covered, 3 - covered],
            "objects",
          ),
        ],
        outcomes: [
          metric("Proposal recall", covered / 3),
          metric("ROI values", x * 7 * 7 * 256),
        ],
      };
    },
    "比较one-stage与two-stage需同pre/postprocessing预算；不同YOLO版本的head、matching与NMS并不相同。",
    D(
      [
        "Head很好但召回低",
        "看RPN proposal recall与small-object分层",
        "修proposal coverage再调ROI分类阈值",
      ],
      [
        "速度报告不一致",
        "核是否包含resize/NMS和ROI数",
        "使用统一端到端测量协议",
      ],
    ),
    "合成固定proposals，不是detector benchmark，也不暗示YOLO必然更快。",
  ),
  "segment-anything": define(
    "segment-anything",
    "一个negative point 能怎样排除不合适的 mask？",
    "4×4中3个固定候选masks；positive point固定(1,1)，negative point在16个pixel中移动。只演示prompt一致性筛选。",
    C(
      "Negative point index",
      0,
      15,
      1,
      14,
      "先在歧义区域增加正/负点；模型质量分数不是经过你的数据校准的概率。",
    ),
    ({ x }) => {
      const masks = [
          [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        ],
        pen = masks.map((a) => a[x]),
        valid = pen.map((v) => 1 - v),
        areas = masks.map((a) => sum(a));
      return {
        stages: [
          M(
            "Point coordinates",
            "index=4row+column；坐标需跟resize一致。",
            `negative=(${x % 4},${Math.floor(x / 4)})`,
            ["r0", "r1", "r2", "r3"],
            ["c0", "c1", "c2", "c3"],
            Array.from({ length: 4 }, (_, r) =>
              Array.from({ length: 4 }, (_, c) => (r * 4 + c === x ? 1 : 0)),
            ),
            "negative marker",
          ),
          S(
            "Positive support",
            "三个候选都包含positive(1,1)。",
            "M_i(positive)=1",
            ["A", "B", "C"],
            [1, 1, 1],
            "contains positive",
          ),
          S(
            "Negative conflict",
            "候选若包含negative point，本toy认为与prompt矛盾；negative与positive重合时，三个候选都会被拒绝。",
            "conflict_i=M_i(negative)",
            ["A", "B", "C"],
            pen,
            "conflict",
          ),
          S(
            "Candidates retained",
            "这是显式规则筛选，不是SAM decoder实际打分。",
            "valid_i=1−conflict_i",
            ["A", "B", "C"],
            valid,
            "valid",
          ),
        ],
        outcomes: [
          metric("Consistent candidates", sum(valid)),
          metric("Kept mask area sum", sum(areas.map((a, i) => a * valid[i]))),
        ],
      };
    },
    "先检查image embedding是否复用和prompt坐标；过分割/漏分割用点或box调整，再用真实mask标注评估。",
    D(
      [
        "点落在错误位置",
        "核原图与model输入坐标变换",
        "保存resize/pad metadata并可视化prompt",
      ],
      [
        "分数高但边界错",
        "检查是否是域偏移/对象定义不同",
        "用人工mask复验，必要时适配而非信任分数",
      ],
    ),
    "候选masks是固定synthetic arrays；不是SAM inference，也不能据此预测模型如何响应每个点。",
  ),
};
