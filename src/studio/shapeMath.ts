import type { ShapeDefinition, ShapeStage, StudioDimensions } from "./types";

function integer(value: number, fallback = 1) {
  return Number.isFinite(value) ? Math.max(1, Math.round(value)) : fallback;
}

function stage(
  id: string,
  label: string,
  operation: string,
  input: string,
  output: string,
  why: string,
  parameters: string,
  commonErrors: string[],
  error?: string,
): ShapeStage {
  return {
    id,
    label,
    operation,
    input,
    output,
    why,
    parameters,
    commonErrors,
    error,
  };
}

const cnn: ShapeDefinition = {
  id: "cnn",
  label: "卷积网络",
  english: "CNN",
  defaults: { B: 2, Cin: 3, H: 32, W: 32, Cout: 16, K: 3, S: 1, P: 1 },
  fields: [
    { key: "B", label: "Batch B", min: 1, max: 16, step: 1 },
    { key: "Cin", label: "输入通道 Cin", min: 1, max: 64, step: 1 },
    { key: "H", label: "高度 H", min: 4, max: 256, step: 1 },
    { key: "W", label: "宽度 W", min: 4, max: 256, step: 1 },
    { key: "Cout", label: "输出通道 Cout", min: 1, max: 128, step: 1 },
    { key: "K", label: "卷积核 K", min: 1, max: 11, step: 1 },
    { key: "S", label: "步幅 S", min: 1, max: 4, step: 1 },
    { key: "P", label: "填充 P", min: 0, max: 6, step: 1 },
  ],
  makeError: (values) => ({ ...values, K: integer(values.H) + 2, P: 0 }),
  repair: (values) => ({ ...values, K: 3, S: 1, P: 1 }),
  stages: (values) => {
    const B = integer(values.B);
    const Cin = integer(values.Cin);
    const H = integer(values.H);
    const W = integer(values.W);
    const Cout = integer(values.Cout);
    const K = integer(values.K);
    const S = integer(values.S);
    const P = Math.max(0, Math.round(values.P || 0));
    const hRaw = (H + 2 * P - K) / S + 1;
    const wRaw = (W + 2 * P - K) / S + 1;
    const valid =
      hRaw >= 1 &&
      wRaw >= 1 &&
      Number.isInteger(hRaw) &&
      Number.isInteger(wRaw);
    const error = valid
      ? undefined
      : hRaw < 1 || wRaw < 1
        ? `卷积核 K=${K} 大于补零后的输入；输出空间尺寸不再为正数。`
        : `(H+2P−K)/S 与 (W+2P−K)/S 必须为整数；当前得到 ${hRaw.toFixed(2)} × ${wRaw.toFixed(2)}。`;
    const Hout = Math.max(0, Math.floor(hRaw));
    const Wout = Math.max(0, Math.floor(wRaw));
    return [
      stage(
        "input",
        "图像批次",
        "读取 NCHW 张量",
        `pixels: [${B},${Cin},${H},${W}]`,
        `x: [${B},${Cin},${H},${W}]`,
        "通道轴决定每个卷积核的深度。",
        "0",
        ["把 NHWC 输入直接交给 NCHW 模型。"],
      ),
      stage(
        "padding",
        "边界扩展",
        `四周补 ${P} 个像素`,
        `[${B},${Cin},${H},${W}]`,
        `[${B},${Cin},${H + 2 * P},${W + 2 * P}]`,
        "padding 控制边界信息和输出分辨率。",
        "0",
        ["训练与部署的 padding 规则不一致。"],
      ),
      stage(
        "convolution",
        "滑窗卷积",
        `K=${K}, S=${S}`,
        `[${B},${Cin},${H + 2 * P},${W + 2 * P}]`,
        valid ? `[${B},${Cout},${Hout},${Wout}]` : "无法构造合法输出",
        "每个输出位置聚合 Cin×K×K 个输入。",
        `${Cout * Cin * K * K + Cout} parameters`,
        ["忽略 stride 造成的整除条件。", "把 Cout 与空间尺寸混淆。"],
        error,
      ),
      stage(
        "head",
        "读出",
        "Global average pool",
        valid ? `[${B},${Cout},${Hout},${Wout}]` : "上游错误",
        `[${B},${Cout}]`,
        "池化去掉空间轴，保留每个通道的总体响应。",
        "0",
        ["分类任务中直接 flatten 巨大特征图导致参数暴涨。"],
        error ? "先修复卷积输出尺寸。" : undefined,
      ),
    ];
  },
};

const rnn: ShapeDefinition = {
  id: "rnn",
  label: "循环网络",
  english: "RNN / GRU / LSTM",
  defaults: { B: 3, T: 12, D: 32, H: 64, L: 10 },
  fields: [
    { key: "B", label: "Batch B", min: 1, max: 16, step: 1 },
    { key: "T", label: "Padding 长度 T", min: 1, max: 128, step: 1 },
    { key: "D", label: "输入宽度 D", min: 1, max: 256, step: 1 },
    { key: "H", label: "Hidden H", min: 1, max: 512, step: 1 },
    { key: "L", label: "真实长度 L", min: 1, max: 128, step: 1 },
  ],
  makeError: (values) => ({ ...values, L: integer(values.T) + 3 }),
  repair: (values) => ({
    ...values,
    L: Math.min(integer(values.L), integer(values.T)),
  }),
  stages: (values) => {
    const B = integer(values.B);
    const T = integer(values.T);
    const D = integer(values.D);
    const H = integer(values.H);
    const L = integer(values.L);
    const error =
      L > T
        ? `真实长度 L=${L} 不能超过 padding 后的序列轴 T=${T}。`
        : undefined;
    return [
      stage(
        "input",
        "序列批次",
        "batch first 输入",
        `tokens: [${B},${T}]`,
        `x: [${B},${T},${D}]`,
        "每个 token 映射为 D 维向量。",
        "词表大小 × D",
        ["API 期待 [T,B,D] 时未 transpose。"],
      ),
      stage(
        "pack",
        "有效长度",
        "去掉 padding 计算",
        `[${B},${T},${D}], lengths: [${B}]`,
        error ? "无效 packed sequence" : `packed: ΣLᵢ × ${D}`,
        "padding 不应改变 hidden state 或 loss。",
        "0",
        [
          "lengths 留在 GPU，而 API 要求 CPU。",
          "排序要求与 enforce_sorted 设置不一致。",
        ],
        error,
      ),
      stage(
        "recurrent",
        "循环更新",
        "hₜ=f(xₜ,hₜ₋₁)",
        error ? "上游错误" : `packed: ΣLᵢ × ${D}`,
        error ? "无法计算" : `states: [${B},${T},${H}]`,
        "hidden state 把过去压缩为固定宽度状态。",
        `约 ${3 * (D * H + H * H + H)} GRU parameters`,
        ["误把最后一个 padding 位置当作最后状态。", "长序列未做梯度裁剪。"],
        error ? "先修复长度张量。" : undefined,
      ),
      stage(
        "head",
        "逐 token 读出",
        "Linear(H→K)",
        `[${B},${T},${H}]`,
        `[${B},${T},K]`,
        "序列标注保留时间轴；序列分类则选择有效末状态或池化。",
        "H×K+K",
        ["任务是序列分类却对每个 padding token 计算 loss。"],
      ),
    ];
  },
};

const attention: ShapeDefinition = {
  id: "attention",
  label: "多头注意力",
  english: "Multi-head attention",
  defaults: { B: 2, T: 16, D: 64, H: 8, Dh: 8 },
  fields: [
    { key: "B", label: "Batch B", min: 1, max: 16, step: 1 },
    { key: "T", label: "Tokens T", min: 1, max: 256, step: 1 },
    { key: "D", label: "模型宽度 D", min: 8, max: 512, step: 8 },
    { key: "H", label: "Heads H", min: 1, max: 32, step: 1 },
    { key: "Dh", label: "Head 宽度 Dh", min: 1, max: 128, step: 1 },
  ],
  makeError: (values) => ({ ...values, Dh: integer(values.Dh) + 1 }),
  repair: (values) => {
    const D = integer(values.D);
    const H = integer(values.H);
    return D % H === 0 ? { ...values, Dh: D / H } : { ...values, H: 1, Dh: D };
  },
  stages: (values) => {
    const B = integer(values.B);
    const T = integer(values.T);
    const D = integer(values.D);
    const H = integer(values.H);
    const Dh = integer(values.Dh);
    const error =
      D !== H * Dh
        ? `D 必须等于 H × Dh；当前 ${D} ≠ ${H} × ${Dh} = ${H * Dh}。`
        : undefined;
    return [
      stage(
        "projection",
        "Q/K/V 投影",
        "3 × Linear(D→D)",
        `x: [${B},${T},${D}]`,
        `q,k,v: [${B},${T},${D}]`,
        "三种表示共享输入，但学习不同角色。",
        `${3 * (D * D + D)} parameters`,
        ["把 qkv 合并投影切在错误轴上。"],
      ),
      stage(
        "split",
        "拆分 heads",
        "reshape + transpose",
        `[${B},${T},${D}]`,
        error ? "无法 reshape" : `[${B},${H},${T},${Dh}]`,
        "每个 head 独立在 Dh 维空间比较 token。",
        "0",
        ["reshape 前后元素总数不同。", "忘记把 H 轴移到 T 前面。"],
        error,
      ),
      stage(
        "scores",
        "注意力分数",
        "QKᵀ / √Dh",
        error ? "上游错误" : `[${B},${H},${T},${Dh}] × [${B},${H},${Dh},${T}]`,
        error ? "无法计算" : `[${B},${H},${T},${T}]`,
        "每个 query 对所有 key 产生一个分数。",
        `约 ${2 * B * H * T * T * Dh} FLOPs`,
        ["除以 √D 而不是 √Dh。", "矩阵转置落在 batch 或 head 轴。"],
        error ? "先让 D=H×Dh。" : undefined,
      ),
      stage(
        "merge",
        "聚合并合并",
        "softmax(scores)V",
        error ? "上游错误" : `[${B},${H},${T},${T}] × [${B},${H},${T},${Dh}]`,
        error ? "无法计算" : `[${B},${T},${D}]`,
        "每个 head 聚合内容，再恢复模型宽度。",
        `${D * D + D} output parameters`,
        ["softmax 沿 query 轴计算。", "合并 head 前没有 transpose。"],
        error ? "先修复 head 维度。" : undefined,
      ),
    ];
  },
};

const unet: ShapeDefinition = {
  id: "unet",
  label: "U-Net",
  english: "Encoder–decoder",
  defaults: { B: 2, C: 1, H: 128, W: 128, base: 32, depth: 4 },
  fields: [
    { key: "B", label: "Batch B", min: 1, max: 8, step: 1 },
    { key: "C", label: "输入通道 C", min: 1, max: 8, step: 1 },
    { key: "H", label: "高度 H", min: 16, max: 512, step: 1 },
    { key: "W", label: "宽度 W", min: 16, max: 512, step: 1 },
    { key: "base", label: "基础通道", min: 8, max: 128, step: 8 },
    { key: "depth", label: "下采样层数", min: 1, max: 6, step: 1 },
  ],
  makeError: (values) => ({ ...values, H: integer(values.H) + 1 }),
  repair: (values) => {
    const factor = 2 ** integer(values.depth);
    return {
      ...values,
      H: Math.ceil(integer(values.H) / factor) * factor,
      W: Math.ceil(integer(values.W) / factor) * factor,
    };
  },
  stages: (values) => {
    const B = integer(values.B);
    const C = integer(values.C);
    const H = integer(values.H);
    const W = integer(values.W);
    const base = integer(values.base);
    const depth = integer(values.depth);
    const factor = 2 ** depth;
    const valid = H % factor === 0 && W % factor === 0;
    const error = valid
      ? undefined
      : `H 与 W 必须能被 2^depth=${factor} 整除；当前 ${H}×${W} 会让 skip connection 对不齐。`;
    const hb = Math.floor(H / factor);
    const wb = Math.floor(W / factor);
    return [
      stage(
        "input",
        "像素与标签",
        "读取同空间分辨率",
        `image: [${B},${C},${H},${W}]`,
        `mask: [${B},${H},${W}]`,
        "分割标签对应每个像素。",
        "0",
        ["图像增强后没有用同一几何变换处理 mask。"],
      ),
      stage(
        "encoder",
        "编码器金字塔",
        `${depth} 次 block + pool`,
        `[${B},${C},${H},${W}]`,
        valid
          ? `[${B},${base * factor},${hb},${wb}]`
          : `近似 [${B},${base * factor},${hb},${wb}]`,
        "分辨率下降，通道增加，并保存每层 skip。",
        "随 depth 约四倍增长",
        ["奇数尺寸在 pool 时被向下取整。"],
        error,
      ),
      stage(
        "decoder",
        "解码与跳接",
        "upsample + concat(skip)",
        valid ? `[${B},${base * factor},${hb},${wb}]` : "skip 尺寸冲突",
        valid ? `[${B},${base},${H},${W}]` : "concat 失败",
        "skip 恢复编码器压缩掉的边界细节。",
        "concat 后通道数相加",
        ["把通道相加误当成 concat。", "转置卷积产生一像素偏差。"],
        error,
      ),
      stage(
        "head",
        "像素分类头",
        "1×1 convolution",
        valid ? `[${B},${base},${H},${W}]` : "上游错误",
        `[${B},K,${H},${W}]`,
        "每个像素映射为 K 类 logits。",
        "base×K+K",
        ["CrossEntropy 前错误地先做 softmax。"],
        error ? "先 pad/crop 到可整除尺寸，再记录逆变换。" : undefined,
      ),
    ];
  },
};

const gnn: ShapeDefinition = {
  id: "gnn",
  label: "图神经网络",
  english: "Message passing GNN",
  defaults: { N: 12, E: 30, D: 16, H: 32, maxIndex: 11 },
  fields: [
    { key: "N", label: "节点 N", min: 1, max: 256, step: 1 },
    { key: "E", label: "边 E", min: 0, max: 1024, step: 1 },
    { key: "D", label: "输入宽度 D", min: 1, max: 256, step: 1 },
    { key: "H", label: "Hidden H", min: 1, max: 512, step: 1 },
    { key: "maxIndex", label: "最大节点索引", min: 0, max: 256, step: 1 },
  ],
  makeError: (values) => ({ ...values, maxIndex: integer(values.N) + 2 }),
  repair: (values) => ({
    ...values,
    maxIndex: Math.max(0, integer(values.N) - 1),
  }),
  stages: (values) => {
    const N = integer(values.N);
    const E = Math.max(0, Math.round(values.E || 0));
    const D = integer(values.D);
    const H = integer(values.H);
    const maxIndex = Math.max(0, Math.round(values.maxIndex || 0));
    const error =
      maxIndex >= N
        ? `edge_index 含节点 ${maxIndex}，但 N=${N} 时合法索引只到 ${N - 1}。`
        : undefined;
    return [
      stage(
        "input",
        "节点与边",
        "读取稀疏图",
        `x: [${N},${D}]`,
        `edge_index: [2,${E}]`,
        "节点特征和连接关系分开存储。",
        "0",
        ["把边表写成 [E,2] 却未转置。", "节点 ID 未重新映射到连续整数。"],
        error,
      ),
      stage(
        "message",
        "沿边发消息",
        "mₑ=W·x_src",
        error ? "非法 edge_index" : `x[src]: [${E},${D}]`,
        error ? "索引越界" : `messages: [${E},${H}]`,
        "每条边复制源节点表示并变换。",
        `${D * H + H} parameters`,
        ["有向图错误地补了反向边。", "漏掉 self-loop。"],
        error,
      ),
      stage(
        "aggregate",
        "按目标节点聚合",
        "segment mean(messages,dst)",
        error ? "上游错误" : `[${E},${H}]`,
        error ? "无法聚合" : `[${N},${H}]`,
        "无论节点度数多大，都得到固定宽度表示。",
        "O(EH)",
        ["sum 聚合让高阶节点数值尺度过大。", "孤立节点没有 self 分支。"],
        error ? "先校验所有 src/dst 索引。" : undefined,
      ),
      stage(
        "update",
        "节点更新",
        "Norm + activation + head",
        error ? "上游错误" : `[${N},${H}]`,
        error ? "无法计算" : `logits: [${N},K]`,
        "输出粒度与节点标签一一对应。",
        "H×K+K",
        ["随机拆边导致实体或时间泄漏。"],
        error ? "先修复图结构。" : undefined,
      ),
    ];
  },
};

export const shapeDefinitions: ShapeDefinition[] = [
  cnn,
  rnn,
  attention,
  unet,
  gnn,
];
export const shapeDefinitionById = new Map(
  shapeDefinitions.map((definition) => [definition.id, definition]),
);

export function firstShapeError(
  definition: ShapeDefinition,
  values: StudioDimensions,
) {
  return definition.stages(values).find((item) => item.error)?.error;
}
