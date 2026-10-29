import type { CompleteLabMap } from "./types";
import {
  define,
  C,
  S,
  M,
  L,
  D,
  fmt,
  metric,
  softmax,
  sum,
  iou,
  dot,
} from "./cvHelpers";
export const cvGeometryLabs: CompleteLabMap = {
  "camera-image-formation": define(
    "camera-image-formation",
    "Depth 改变时，同一个3D点投影到哪里？",
    "P=(1,.5,Z)meters、fx=fy=400px、principal point=(320,240)；identity extrinsics，无distortion。",
    C(
      "Depth Z (m)",
      1,
      10,
      0.5,
      2,
      "先核相机intrinsics和单位；depth越近perspective变化越强，Z必须为正。",
    ),
    ({ x }) => {
      const nx = 1 / x,
        ny = 0.5 / x,
        u = 400 * nx + 320,
        v = 400 * ny + 240;
      return {
        stages: [
          S(
            "Camera coordinates",
            "先把world point变换到camera frame；本例R=I,t=0。",
            `Pcam=(1,.5,${x})`,
            ["X", "Y", "Z"],
            [1, 0.5, x],
            "m",
          ),
          S(
            "Perspective division",
            "normalize by depth，并非直接乘focal length。",
            "xn=X/Z,yn=Y/Z",
            ["xn", "yn"],
            [nx, ny],
            "normalized coordinate",
          ),
          S(
            "Apply intrinsics",
            "focal length的单位是pixel。",
            `u=400×${fmt(nx)}+320`,
            ["u", "v"],
            [u, v],
            "pixel",
          ),
          L(
            "Depth sensitivity",
            "同样1m depth误差近处影响更大。",
            "u(Z)=400/Z+320",
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((z) => 400 / z + 320),
            "depth m",
            "u pixel",
          ),
        ],
        outcomes: [metric("u", u, "px"), metric("v", v, "px")],
      };
    },
    "Resize图像时同步scale fx/fy/cx/cy；实际registration还需extrinsics和distortion。",
    D(
      [
        "投影镜像/倒置",
        "检查camera轴、row/column和单位",
        "用已知3D点做投影单元测试",
      ],
      [
        "resize后持续偏移",
        "核principal point是否同样变换",
        "更新K并保留crop/pad metadata",
      ],
    ),
    "只做理想pinhole forward projection；一张图的pixel不唯一确定3D点。",
  ),
  "local-features-matching": define(
    "local-features-matching",
    "Ratio test 阈值怎样改变 ambiguity 与coverage？",
    "四个query的最近/次近descriptor distances固定为(.2,.8),(.4,.5),(.1,.3),(.6,.61)。",
    C(
      "Ratio threshold τ",
      0.3,
      0.95,
      0.05,
      0.7,
      "先从文献/实现的ratio设置作起点，再用几何inliers与验证标注选择，不把ratio当概率。",
    ),
    ({ x }) => {
      const d1 = [0.2, 0.4, 0.1, 0.6],
        d2 = [0.8, 0.5, 0.3, 0.61],
        ratio = d1.map((a, i) => a / d2[i]),
        pass = ratio.map((a) => (a < x ? 1 : 0));
      return {
        stages: [
          S(
            "Nearest distances",
            "每个query要有两个合法候选。",
            "d1",
            ["q1", "q2", "q3", "q4"],
            d1,
            "descriptor distance",
          ),
          S(
            "Second distances",
            "背景重复纹理会产生很近的第一、第二名。",
            "d2",
            ["q1", "q2", "q3", "q4"],
            d2,
            "descriptor distance",
          ),
          S(
            "Ambiguity ratio",
            "小ratio表示第一名比第二名明显近。",
            "r=d1/d2",
            ["q1", "q2", "q3", "q4"],
            ratio,
            "ratio",
          ),
          S(
            "Keep or reject",
            "这里使用strict r<τ；仍需geometry verification。",
            `keep=(r<${fmt(x)})`,
            ["q1", "q2", "q3", "q4"],
            pass,
            "keep",
          ),
        ],
        outcomes: [metric("Kept matches", sum(pass)), metric("Threshold", x)],
      };
    },
    "更多matches不必然更好；对比precision/coverage、spatial distribution与RANSAC支持，而不是只看数量。",
    D(
      [
        "重复纹理错配多",
        "查看d1/d2是否接近1",
        "收紧ratio并加mutual/geometry检查",
      ],
      [
        "几乎无matches",
        "核descriptor metric和候选数量",
        "float特征用适合metric，binary特征核Hamming",
      ],
    ),
    "固定distance案例；不提取SIFT/ORB，也不把ratio acceptance等同真实match。",
  ),
  "registration-ransac": define(
    "registration-ransac",
    "Inlier 比例下降，RANSAC 需要多少次抽样？",
    "独立抽样、最小样本size s=4、成功概率目标=.99；假定每个全inlier最小集可产生正确homography。",
    C(
      "Inlier probability w",
      0.2,
      0.9,
      0.05,
      0.5,
      "先过滤明显错配；w估计低时iteration budget会快速增加，应同时诊断模型和threshold。",
    ),
    ({ x }) => {
      const all = x ** 4,
        n = Math.ceil(Math.log(0.01) / Math.log(1 - all)),
        prob = 1 - (1 - all) ** n;
      return {
        stages: [
          S(
            "Single point",
            "四个点都需inlier，不是只需一个。",
            `w=${fmt(x)}`,
            ["inlier", "outlier"],
            [x, 1 - x],
            "probability",
          ),
          S(
            "Minimal set",
            "独立近似下概率为w^s。",
            "P(all4 inliers)=w⁴",
            ["valid set", "bad set"],
            [all, 1 - all],
            "probability",
          ),
          L(
            "Repeated trials",
            "至少一次全inlier集的概率。",
            "P=1−(1−w⁴)^N",
            [1, 10, 50, 100, 500, 1000],
            [1, 10, 50, 100, 500, 1000].map((k) => 1 - (1 - all) ** k),
            "iterations",
            "success probability",
          ),
          S(
            "Required budget",
            "ceil保证理论概率不低于目标。",
            `N=ceil(log(.01)/log(1−w⁴))=${n}`,
            ["required N"],
            [n],
            "iterations",
          ),
        ],
        outcomes: [
          metric("Required iterations", n),
          metric("Theoretical success", prob),
        ],
      };
    },
    "reprojection threshold应匹配噪声pixel尺度；inlier多但结构性残差大时换模型，不只增iterations。",
    D(
      [
        "次数很多仍失败",
        "检查共线点/退化sample和错误model",
        "排除退化并对比affine/homography适用条件",
      ],
      [
        "Inliers很多但warping错误",
        "检查residual spatial pattern与坐标方向",
        "用独立landmarks验证并refit",
      ],
    ),
    "公式依赖独立抽样和非退化条件；真实RANSAC自适应停止与sample策略可能不同。",
  ),
  "segmentation-task-metrics": define(
    "segmentation-task-metrics",
    "Threshold 改变，IoU 与Dice怎样一起变化？",
    "固定8pixel labels=[1,1,1,0,0,0,1,0]和probabilities=[.9,.7,.4,.6,.2,.1,.55,.8]。",
    C(
      "Mask threshold",
      0.1,
      0.9,
      0.05,
      0.5,
      "先在validation按任务成本选阈值；要分开看semantic overlap与instance merge/split。",
    ),
    ({ x }) => {
      const y = [1, 1, 1, 0, 0, 0, 1, 0],
        p = [0.9, 0.7, 0.4, 0.6, 0.2, 0.1, 0.55, 0.8],
        pred = p.map((a) => (a >= x ? 1 : 0)),
        tp = sum(pred.map((a, i) => a * y[i])),
        fp = sum(pred.map((a, i) => a * (1 - y[i]))),
        fn = 4 - tp,
        io = tp / (tp + fp + fn),
        dice = (2 * tp) / (2 * tp + fp + fn);
      return {
        stages: [
          S(
            "Probability map",
            "概率来自合成fixture，不代表校准结果。",
            "p_i",
            p.map((_, i) => `p${i + 1}`),
            p,
            "probability",
          ),
          M(
            "Threshold mask",
            "本例规则p≥threshold。",
            `threshold=${fmt(x)}`,
            ["truth", "prediction"],
            p.map((_, i) => `${i + 1}`),
            [y, pred],
            "binary label",
          ),
          S(
            "Confusion counts",
            "Overlap分母包含false positives与false negatives。",
            "TP,FP,FN",
            ["TP", "FP", "FN"],
            [tp, fp, fn],
            "pixels",
          ),
          S(
            "Overlap scores",
            "同一个mask的IoU与Dice不是独立指标。",
            "IoU=TP/(TP+FP+FN);Dice=2TP/(2TP+FP+FN)",
            ["IoU", "Dice"],
            [io, dice],
            "score",
          ),
        ],
        outcomes: [metric("IoU", io), metric("Dice", dice)],
      };
    },
    "Dice很高但cell counts错时检查instance topology；按object size/group报告，不只总体pixel均值。",
    D(
      [
        "Dice好但实例数错",
        "检查touching objects是否merge",
        "补instance matching/PQ与split-merge计数",
      ],
      [
        "空mask分数异常",
        "明确empty/empty的约定",
        "统一metric实现并保留case counts",
      ],
    ),
    "只演示binary semantic overlap；未计算dataset AP/PQ或训练分割网络。",
  ),
  "optical-flow-motion": define(
    "optical-flow-motion",
    "只有一条边缘时，为什么二维 motion 仍不确定？",
    "两pixel的brightness equations均为u=1，Ix=1,Iy=0,It=−1；用ridge λ解正规方程。",
    C(
      "Ridge regularization λ",
      0.01,
      2,
      0.01,
      0.1,
      "regularization能给出稳定数值，但不能创造未观察到的垂直motion信息。",
    ),
    ({ x }) => {
      const u = 2 / (2 + x),
        res = u - 1;
      return {
        stages: [
          M(
            "Brightness equations",
            "两行相同，只有horizontal component受约束。",
            "A=[[1,0],[1,0]],b=[1,1]",
            ["pixel1", "pixel2"],
            ["Ix", "Iy"],
            [
              [1, 0],
              [1, 0],
            ],
            "gradient",
          ),
          M(
            "Normal equations",
            "AᵀA rank1；v是不可识别方向。",
            "AᵀA+λI",
            ["u", "v"],
            ["u", "v"],
            [
              [2 + x, 0],
              [0, x],
            ],
            "normal coefficient",
          ),
          S(
            "Ridge solution",
            "v=0来自regularizer，不是数据证明垂直速度为零。",
            `u=2/(2+λ)=${fmt(u)};v=0`,
            ["u", "v"],
            [u, 0],
            "pixels/frame",
          ),
          S(
            "Bias–stability tradeoff",
            "更大λ压小motion，也增大brightness residual。",
            "residual=u−1",
            ["pixel1", "pixel2"],
            [res, res],
            "brightness residual",
          ),
        ],
        outcomes: [
          metric("Estimated u", u, "px/frame"),
          metric("Residual squared", 2 * res * res),
        ],
      };
    },
    "真实flow在遮挡、光照变化和large motion下失效；检查forward–backward consistency及有效mask。",
    D(
      [
        "边缘沿线运动不确定",
        "看structure tensor最小eigenvalue",
        "需要二维纹理或额外先验，不能仅加正则冒充证据",
      ],
      [
        "运动很大导致估计错",
        "核linearization与brightness假设",
        "比较pyramid/warping或learned flow并验证遮挡",
      ],
    ),
    "经典aperture problem的线性toy，不是RAFT网络推理。",
  ),
  "multi-object-tracking": define(
    "multi-object-tracking",
    "Motion 和appearance冲突时，ID配对怎样改变？",
    "两tracks、两detections。Motion cost偏好交叉，appearance偏好同ID；权重w做同尺度凸组合。",
    C(
      "Appearance weight w",
      0,
      1,
      0.05,
      0.5,
      "先motion-only baseline，检查各cost的量纲和validation ID switches后再加appearance。",
    ),
    ({ x }) => {
      const mo = [
          [0.8, 0.1],
          [0.2, 0.7],
        ],
        ap = [
          [0.1, 0.9],
          [0.8, 0.2],
        ],
        c = mo.map((r, i) => r.map((v, j) => (1 - x) * v + x * ap[i][j])),
        d = c[0][0] + c[1][1],
        cr = c[0][1] + c[1][0];
      return {
        stages: [
          M(
            "Motion cost",
            "预测位置近不一定是同一个identity。",
            "Cmotion",
            ["T1", "T2"],
            ["D1", "D2"],
            mo,
            "cost",
          ),
          M(
            "Appearance cost",
            "appearance也可能受domain/illumination影响。",
            "Cappearance",
            ["T1", "T2"],
            ["D1", "D2"],
            ap,
            "cost",
          ),
          M(
            "Weighted costs",
            "两种证据尺度在此人为对齐。",
            "C=(1−w)M+wA",
            ["T1", "T2"],
            ["D1", "D2"],
            c,
            "cost",
          ),
          S(
            "Global pairing",
            "比较两种one-to-one排列；tie选diagonal。",
            "argmin(diagonal,cross)",
            ["diagonal", "cross"],
            [d, cr],
            "cost",
          ),
        ],
        outcomes: [
          metric("Best cost", Math.min(d, cr)),
          metric("Cross assignment", cr < d ? 1 : 0),
        ],
      };
    },
    "遮挡时需要unmatched/lifecycle规则；不应因为solver总能配对就强行连接不可信objects。",
    D(
      [
        "Crossing后ID互换",
        "比较motion与appearance各分量及gate",
        "调权前查特征可靠性和遮挡",
      ],
      [
        "False tracks长期存在",
        "检查birth/confirm/max_age策略",
        "在完整sequence上评估ID与fragmentation",
      ],
    ),
    "只做两对象单帧data association；不模拟完整tracker或校准identity probability。",
  ),
  "stereo-depth-geometry": define(
    "stereo-depth-geometry",
    "同样1pixel disparity误差，在远处会放大多少？",
    "Rectified stereo，f=800px、baseline B=.1m；disparity d>1。",
    C(
      "Disparity d (px)",
      2,
      40,
      2,
      8,
      "先核rectification、disparity缩放与baseline单位；远处小disparity对噪声敏感。",
    ),
    ({ x }) => {
      const z = 80 / x,
        zplus = 80 / (x + 1),
        zminus = 80 / (x - 1);
      return {
        stages: [
          S(
            "Geometry constants",
            "fB有pixel·meter单位。",
            "f=800px;B=.1m",
            ["fB"],
            [80],
            "px·m",
          ),
          S(
            "Depth",
            "越小disparity对应越大depth。",
            `Z=fB/d=80/${x}`,
            ["depth"],
            [z],
            "m",
          ),
          S(
            "One-pixel uncertainty",
            "分别算d±1，不用对称区间掩盖nonlinearity。",
            "Zlow=80/(d+1);Zhigh=80/(d−1)",
            ["lower", "estimate", "upper"],
            [zplus, z, zminus],
            "m",
          ),
          S(
            "Sensitivity",
            "局部derivative给小误差的一阶近似。",
            "|dZ/dd|=80/d²",
            ["linear 1px", "upper exact error"],
            [80 / x ** 2, zminus - z],
            "m",
          ),
        ],
        outcomes: [
          metric("Depth", z, "m"),
          metric("Sensitivity", 80 / x ** 2, "m/px"),
        ],
      };
    },
    "confidence/left-right检查应排除occlusion和textureless areas；不能把invalid disparity直接转成极大depth。",
    D(
      [
        "深度差固定倍数",
        "检查baseline单位和整数disparity scale",
        "统一m/mm与实现的fixed-point输出",
      ],
      ["边界飞点", "检查occlusion与匹配支持", "使用有效mask并做独立depth标定"],
    ),
    "理想rectified geometry，不估计真实视差或相机标定误差。",
  ),
  "point-cloud-learning": define(
    "point-cloud-learning",
    "Max pooling 怎样保持排列不变，又丢掉什么？",
    "四个points经固定shared feature φ(x)=ReLU(x)得到[.2,.8,.4,a]；比较max与mean。",
    C(
      "Fourth point feature a",
      0,
      1.5,
      0.1,
      0.6,
      "先检查尺度/中心化与sampling；max对未成为winner的point变化可完全不敏感。",
    ),
    ({ x }) => {
      const v = [0.2, 0.8, 0.4, x],
        mx = Math.max(...v),
        mn = sum(v) / 4;
      return {
        stages: [
          S(
            "Shared point features",
            "同一函数作用于所有points，顺序不是位置编码。",
            "φ=[.2,.8,.4,a]",
            ["p1", "p2", "p3", "p4"],
            v,
            "feature",
          ),
          S(
            "Permute",
            "交换point顺序，不能改变集合汇总。",
            "permutation [4,2,1,3]",
            ["p4", "p2", "p1", "p3"],
            [x, 0.8, 0.2, 0.4],
            "feature",
          ),
          S(
            "Symmetric pooling",
            "max/mean都对permutation invariant，但保留信息不同。",
            "max(v); mean(v)",
            ["max", "mean"],
            [mx, mn],
            "feature",
          ),
          S(
            "Winner contribution",
            "max只依赖当前最大特征；重复point不会改变max。",
            "winner_i=1 if v_i=max",
            ["p1", "p2", "p3", "p4"],
            v.map((a) => (a === mx ? 1 : 0)),
            "winner",
          ),
        ],
        outcomes: [metric("Pooled max", mx), metric("Pooled mean", mn)],
      };
    },
    "需要local geometry时比较PointNet++/graph neighborhood；invariance本身不能保证对rotation/scale鲁棒。",
    D(
      [
        "改变顺序输出变化",
        "核是否用了非对称操作或错误batch axis",
        "做permutation测试并使用shared map+pool",
      ],
      [
        "小结构被忽略",
        "检查采样是否保留rare points和max winners",
        "比较局部聚合与多尺度sampling",
      ],
    ),
    "单feature pooling机制，不运行PointNet，不能以winner解释整个对象的因果重要性。",
  ),
  "nerf-gaussian-splatting": define(
    "nerf-gaussian-splatting",
    "前面的density变大，后面颜色还有多少贡献？",
    "两段ray：Δ=1，colors=[1,.2]，第二段density=1；背景color=0。",
    C(
      "Front density σ₁",
      0,
      3,
      0.1,
      1,
      "density与step length要成对理解；调sampling spacing后应重算alpha，不能直接沿用opacity。",
    ),
    ({ x }) => {
      const a1 = 1 - Math.exp(-x),
        a2 = 1 - Math.exp(-1),
        t2 = 1 - a1,
        w = [a1, t2 * a2],
        parts = [w[0], w[1] * 0.2],
        bg = t2 * (1 - a2);
      return {
        stages: [
          S(
            "Density → opacity",
            "连续density积分成segment opacity。",
            "α=1−exp(−σΔ)",
            ["front alpha", "back alpha"],
            [a1, a2],
            "opacity",
          ),
          S(
            "Transmittance",
            "后段看到前面透过的光。",
            "T1=1;T2=1−α1",
            ["T1", "T2"],
            [1, t2],
            "transmittance",
          ),
          S(
            "Contribution weights",
            "权重不是单独alpha；深度顺序重要。",
            "wi=Tiαi",
            ["front", "back", "background"],
            [...w, bg],
            "weight",
          ),
          S(
            "Composite",
            "本例one-channel color，背景0。",
            `C=${fmt(parts[0])}+${fmt(parts[1])}`,
            ["front color", "back color", "total"],
            [...parts, sum(parts)],
            "color",
          ),
        ],
        outcomes: [
          metric("Rendered color", sum(parts)),
          metric("Background transmission", bg),
        ],
      };
    },
    "NeRF density integration与3DGS projected alpha来源不同，compositing相似不等于表示/训练相同。",
    D(
      [
        "颜色过暗/过亮",
        "核premultiplied alpha及depth排序",
        "对两层fixture手算检查weights守恒",
      ],
      [
        "透明物体或floaters",
        "检查view coverage与geometry约束",
        "不能仅靠加density掩盖重建错误",
      ],
    ),
    "固定两段ray compositing，不训练radiance field或rasterize Gaussians。",
  ),
  "video-understanding": define(
    "video-understanding",
    "Sampling stride 怎样改变事件覆盖和attention预算？",
    "32frame视频；事件只发生在frames[10,11,12]；采样从frame0开始、固定stride s。",
    C(
      "Frame stride s",
      1,
      8,
      1,
      4,
      "先依据事件持续时间选sampling span与stride；短动作可能被稀疏采样完全错过。",
    ),
    ({ x }) => {
      const sampled = Array.from(
          { length: Math.ceil(32 / x) },
          (_, i) => i * x,
        ),
        hits = sampled.filter((i) => i >= 10 && i <= 12).length,
        n = sampled.length;
      return {
        stages: [
          S(
            "Temporal sampling",
            "stride决定看到哪些frames，clip length和span不相同。",
            `indices=0,${x},2×${x},…`,
            ["sampled", "omitted"],
            [n, 32 - n],
            "frames",
          ),
          L(
            "Observed timeline",
            "1表示采到frame；事件仅10–12。",
            "sample at multiples of s",
            Array.from({ length: 32 }, (_, i) => i),
            Array.from({ length: 32 }, (_, i) => (i % x === 0 ? 1 : 0)),
            "frame",
            "sampled",
          ),
          S(
            "Event coverage",
            "有sample命中不等于已理解动作方向与顺序。",
            "hits=count(10≤index≤12)",
            ["event sampled", "event missed"],
            [hits, 3 - hits],
            "frames",
          ),
          S(
            "Attention work",
            "若每frame16patch tokens，joint score矩阵按总tokens平方。",
            "tokens=16N; pairs=(16N)²",
            ["sampled clip", "all32"],
            [(16 * n) ** 2, (16 * 32) ** 2],
            "pairs",
          ),
        ],
        outcomes: [
          metric("Sampled frames", n),
          metric("Event hits", hits),
          metric("Attention pairs", (16 * n) ** 2),
        ],
      };
    },
    "在线任务不能读未来frames；验证train/test按video/subject切分，避免相邻clips泄漏。",
    D(
      [
        "短事件漏检",
        "看stride和事件长度，而非只看总帧数",
        "降低stride或多offset采样并测成本",
      ],
      [
        "静态背景就能分类",
        "做frame order/background控制",
        "增加时序任务与主体级split",
      ],
    ),
    "只计sampling与logical attention pairs；未运行video model，不预测accuracy或latency。",
  ),
  "document-ai-ocr": define(
    "document-ai-ocr",
    "OCR文字都对了，reading order还会怎样错？",
    "四行boxes：left列x=[10,12],right列x=[110,112]；y=[10,30,10,30]，正确column order A,B,C,D。用x cutoff分列。",
    C(
      "Column boundary x",
      0,
      140,
      10,
      60,
      "先判断layout是单列还是多列；阈值只适用于此toy，同一策略不能覆盖表格/浮动图。",
    ),
    ({ x }) => {
      const items = [
          { t: "A", x: 10, y: 10 },
          { t: "B", x: 12, y: 30 },
          { t: "C", x: 110, y: 10 },
          { t: "D", x: 112, y: 30 },
        ],
        ordered = [...items].sort(
          (a, b) =>
            Number(a.x >= x) - Number(b.x >= x) || a.y - b.y || a.x - b.x,
        ),
        ranks = items.map((o) => ordered.findIndex((z) => z.t === o.t) + 1);
      let inv = 0;
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++) if (ranks[i] > ranks[j]) inv++;
      return {
        stages: [
          M(
            "Detected boxes",
            "文字内容固定正确，错误来自结构恢复。",
            "(x,y)",
            ["A", "B", "C", "D"],
            ["x", "y"],
            items.map((a) => [a.x, a.y]),
            "pixel",
          ),
          S(
            "Column assignment",
            "按cutoff分组，不以confidence代替layout。",
            `column=1[x≥${x}]`,
            ["A", "B", "C", "D"],
            items.map((a) => Number(a.x >= x)),
            "column",
          ),
          S(
            "Read order",
            "先column再top-to-bottom；此规则适合已知双列文档。",
            ordered.map((a) => a.t).join(" → "),
            ["A", "B", "C", "D"],
            ranks,
            "read rank",
          ),
          S(
            "Ordering error",
            "与真实column order比较inversion pairs。",
            "wrong ordered pairs / 6",
            ["correct pairs", "inversions"],
            [6 - inv, inv],
            "pairs",
          ),
        ],
        outcomes: [
          metric("Order inversions", inv),
          metric(
            "Right-column assigned count",
            items.filter((a) => a.x >= x).length,
          ),
        ],
      };
    },
    "抽字段前保存OCR boxes、reading order与schema evidence；数字/单位错误要回到image crop验证。",
    D(
      [
        "摘要混合两列",
        "检查reading order而非只看CER",
        "先layout segmentation再拼文本",
      ],
      [
        "表格单元格串行错位",
        "核row/column和merged cells",
        "用cell结构评估并保留坐标引用",
      ],
    ),
    "固定OCR text及boxes的layout排序toy；不是OCR识别模型或通用document parser。",
  ),
  "feature-pyramids-small-objects": define(
    "feature-pyramids-small-objects",
    "8pixel对象到feature map上还剩几格？",
    "256×256 input、256channels、FP32；选择feature stride=2^e，假定整除。",
    C(
      "Stride exponent e",
      1,
      5,
      1,
      3,
      "先看最小object的feature extent；减stride提高空间细节但增加activation。",
    ),
    ({ x }) => {
      const s = 2 ** x,
        h = 256 / s,
        extent = 8 / s,
        bytes = h * h * 256 * 4;
      return {
        stages: [
          S(
            "Downsample",
            "input pixels与feature cells不是同一单位。",
            `stride=${s}; H=256/${s}`,
            ["input", "feature"],
            [256, h],
            "axis length",
          ),
          S(
            "Object footprint",
            "亚cell对象不意味着完全不可检测，但定位困难。",
            `8px/${s}=${fmt(extent)} cells`,
            ["object extent"],
            [extent],
            "feature cells",
          ),
          S(
            "Activation budget",
            "同channels下空间area决定tensor大小。",
            "bytes=H²×256×4",
            ["current", "stride4"],
            [bytes / 2 ** 20, 16],
            "MiB",
          ),
          S(
            "FPN fusion",
            "top-down需resize到lateral相同H/W才能相加；不是concat。",
            `lateral & upsampled=[256,${h},${h}]`,
            ["lateral C", "top-down C", "sum C"],
            [256, 256, 256],
            "channels",
          ),
        ],
        outcomes: [
          metric("Object extent", extent, "cells"),
          metric("Activation", bytes / 2 ** 20, "MiB"),
        ],
      };
    },
    "小对象差先分开查input resolution、feature stride、assignment和labels；更大RF不等于更精细定位。",
    D(
      [
        "FPN add shape错",
        "打印lateral和upsampled维度",
        "显式对齐H/W/C及odd-size rounding",
      ],
      [
        "小目标低召回",
        "统计object/stride与positive targets",
        "比较更高resolution层和采样规则",
      ],
    ),
    "只算shape、footprint与单tensor storage，不估测完整FPN质量或总GPU内存。",
  ),
  "box-regression-losses": define(
    "box-regression-losses",
    "两个框不相交时，GIoU怎样继续提供方向？",
    "Target=[0,0,2,2]；prediction=[d,0,d+2,2]，仅水平平移。",
    C(
      "Horizontal shift d",
      0,
      4,
      0.1,
      3,
      "先统一xyxy坐标与面积约定；距离尺度不同会改变L1但IoU保持scale invariance。",
    ),
    ({ x }) => {
      const a = [0, 0, 2, 2],
        b = [x, 0, x + 2, 2],
        r = iou(a, b),
        enc = 2 * (x + 2),
        g = r.value - (enc - r.union) / enc,
        di = r.value - (x * x) / ((x + 2) ** 2 + 4);
      return {
        stages: [
          M(
            "Boxes",
            "Continuous xyxy，无inclusive +1。",
            "target=[0,0,2,2]",
            ["target", "prediction"],
            ["x1", "y1", "x2", "y2"],
            [a, b],
            "coordinate",
          ),
          S(
            "Areas",
            "intersection在d≥2变为0。",
            "I=max(0,2−d)×2;U=8−I",
            ["intersection", "union", "enclosure"],
            [r.inter, r.union, enc],
            "area",
          ),
          S(
            "Similarity scores",
            "GIoU惩罚enclosure空白，DIoU惩罚中心距离。",
            "GIoU=IoU−(C−U)/C",
            ["IoU", "GIoU", "DIoU"],
            [r.value, g, di],
            "score",
          ),
          S(
            "Training losses",
            "1−score才是此处最小化的loss。",
            "L=1−score",
            ["IoU loss", "GIoU loss", "DIoU loss"],
            [1 - r.value, 1 - g, 1 - di],
            "loss",
          ),
        ],
        outcomes: [metric("GIoU loss", 1 - g), metric("IoU", r.value)],
      };
    },
    "先让matching指向正确GT，再选择box loss；错误匹配不会因换GIoU自动修好。",
    D(
      [
        "Loss非有限",
        "检查x2>x1,y2>y1与coordinate scale",
        "拒绝invalid boxes并核clipping",
      ],
      [
        "不相交时IoU loss不动",
        "看是否落在零overlap平坦区",
        "比较GIoU/DIoU并检查有限差分方向",
      ],
    ),
    "可手算的平移矩形，不含classification、matching或真实优化器。",
  ),
  "dense-visual-correspondence": define(
    "dense-visual-correspondence",
    "Cosine最近邻与第二名的gap怎样随feature转动？",
    "Query单位vector=(cosθ,sinθ)，候选为0°、45°、90°；这是patch descriptors的二维toy。",
    C(
      "Query angle θ (degrees)",
      0,
      90,
      5,
      30,
      "先L2 normalize并检查patch坐标；similarity高不能自动当match probability。",
    ),
    ({ x }) => {
      const q = [Math.cos((x * Math.PI) / 180), Math.sin((x * Math.PI) / 180)],
        cs = [
          [1, 0],
          [Math.SQRT1_2, Math.SQRT1_2],
          [0, 1],
        ],
        scores = cs.map((c) => dot(q, c)),
        sorted = [...scores].sort((a, b) => b - a),
        winner = scores.indexOf(sorted[0]);
      return {
        stages: [
          S(
            "Query descriptor",
            "单位norm使dot product等于cosine。",
            "q=[cosθ,sinθ]",
            ["q0", "q1"],
            q,
            "feature",
          ),
          M(
            "Candidates",
            "Global CLS与dense patch tokens用途不同。",
            "candidate descriptors",
            ["A0°", "B45°", "C90°"],
            ["f0", "f1"],
            cs,
            "feature",
          ),
          S(
            "Similarity",
            "pairwise matrix是候选证据，不是验证后的对应。",
            "S_j=qᵀc_j",
            ["A", "B", "C"],
            scores,
            "cosine",
          ),
          S(
            "Ambiguity margin",
            "top1−top2变小意味着此descriptor下歧义增大。",
            `winner=${winner};gap=${fmt(sorted[0] - sorted[1])}`,
            ["top1", "top2", "gap"],
            [sorted[0], sorted[1], sorted[0] - sorted[1]],
            "cosine",
          ),
        ],
        outcomes: [
          metric("Winner index", winner),
          metric("Similarity margin", sorted[0] - sorted[1]),
          metric("Cosine to A", scores[0]),
        ],
      };
    },
    "先用mutual nearest neighbor与几何验证筛选；若跨域feature不可靠，先验证descriptor而非盲调阈值。",
    D(
      [
        "Feature map漂亮但配对错",
        "检查repeat textures与坐标回映",
        "保存候选margin并用landmarks评估",
      ],
      [
        "reshape失败",
        "分清CLS/register/patch tokens",
        "只将真正patch tokens按网格reshape",
      ],
    ),
    "二维descriptor geometry，不运行DINOv2，也不证明生物图像可自动注册。",
  ),
  "keypoint-heatmaps-pose": define(
    "keypoint-heatmaps-pose",
    "Soft-argmax 的温度怎样移动预测坐标？",
    "1D位置[0,1,2,3]，logits=[0,2,1,0]；soft-argmax为概率加权坐标。",
    C(
      "Heatmap temperature T",
      0.2,
      2,
      0.1,
      1,
      "先核heatmap target σ、stride与温度；输出subpixel不自动意味着精确。",
    ),
    ({ x }) => {
      const logits = [0, 2, 1, 0],
        p = softmax(logits.map((a) => a / x)),
        parts = p.map((a, i) => a * i),
        mu = sum(parts),
        variance = sum(p.map((a, i) => a * (i - mu) ** 2));
      return {
        stages: [
          S(
            "Heatmap logits",
            "位置1具有最高logit，但其它位置仍有质量。",
            "z=[0,2,1,0]",
            ["0", "1", "2", "3"],
            logits,
            "logit",
          ),
          S(
            "Spatial softmax",
            "温度影响分布尖锐程度。",
            "p=softmax(z/T)",
            ["0", "1", "2", "3"],
            p,
            "probability",
          ),
          S(
            "Coordinate contributions",
            "均值可落在没有peak的位置，特别是多峰时。",
            "μ=Σi·p_i",
            ["0p0", "1p1", "2p2", "3p3"],
            parts,
            "coordinate contribution",
          ),
          S(
            "Decoded coordinate",
            "Hard argmax固定1；soft结果随温度变化。",
            `μ=${fmt(mu)}; Var=${fmt(variance)}`,
            ["argmax", "soft-argmax"],
            [1, mu],
            "coordinate",
          ),
        ],
        outcomes: [
          metric("Soft coordinate", mu),
          metric("Spatial variance", variance),
        ],
      };
    },
    "把heatmap坐标乘stride再undo crop/resize；left/right flip还需交换语义labels。",
    D(
      [
        "总差半个pixel",
        "核pixel-center/align convention与stride",
        "做人工单peak坐标往返测试",
      ],
      [
        "预测落在两peak之间",
        "检查heatmap是否多峰",
        "报告ambiguity或多候选，别把均值当唯一证据",
      ],
    ),
    "单轴四格heatmap，不训练pose模型；variance不是已校准的定位误差。",
  ),
};
