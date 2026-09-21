import type { CodeLab, CodeLabStep, CodeMode, StudioDimensions } from "./types";

const attentionSteps: CodeLabStep[] = [
  {
    id: "input",
    title: "输入与形状",
    english: "Input & shape",
    summary: "先固定 B、T、D 与 head 数，任何 reshape 都从这里推导。",
    why: "明确 batch、序列长度和表示宽度，避免把 token 轴与特征轴交换。",
    input: "token ids 或上一层表示",
    output: "x: [B,T,D]",
    parameter: "0",
    commonError: "把 batch-first 与 sequence-first API 混用。",
    lines: { scratch: [1, 5], pytorch: [1, 5], production: [1, 7] },
  },
  {
    id: "qkv",
    title: "Q/K/V 投影",
    english: "Q/K/V projections",
    summary: "三组线性层把同一表示映射为查询、键和值。",
    why: "Q/K 决定匹配，V 决定被汇总的内容；三者形状相同但角色不同。",
    input: "x: [B,T,D]",
    output: "q,k,v: [B,T,D]",
    parameter: "3D²（不含 bias）",
    commonError: "把 V 当成 attention score，或漏掉独立投影。",
    lines: { scratch: [6, 10], pytorch: [6, 10], production: [8, 13] },
  },
  {
    id: "split",
    title: "重排与分头",
    english: "Split heads",
    summary: "把 D 拆成 H×Dh，再把 head 轴移到矩阵乘法需要的位置。",
    why: "每个 head 在 Dh 维子空间中独立计算注意力。",
    input: "[B,T,D]",
    output: "[B,H,T,Dh]",
    parameter: "D = H×Dh",
    commonError: "reshape 后忘记 transpose，导致 T 与 H 轴错位。",
    lines: { scratch: [11, 14], pytorch: [11, 14], production: [14, 18] },
  },
  {
    id: "scores",
    title: "缩放点积",
    english: "Scaled dot product",
    summary: "QKᵀ 产生每个 query 对每个 key 的分数，并除以 √Dh。",
    why: "缩放限制大维度点积的方差，避免 softmax 过早饱和。",
    input: "q,k: [B,H,T,Dh]",
    output: "scores: [B,H,T,T]",
    parameter: "约 2BHT²Dh FLOPs",
    commonError: "除以 √D 而不是 √Dh，或转置了错误的轴。",
    lines: { scratch: [15, 17], pytorch: [15, 17], production: [19, 22] },
  },
  {
    id: "softmax",
    title: "Mask 与 Softmax",
    english: "Mask & normalize",
    summary: "先屏蔽不可见位置，再沿 key 轴归一化。",
    why: "mask 决定信息可见性；softmax 把分数转成和为 1 的权重。",
    input: "scores: [B,H,T,T]",
    output: "weights: [B,H,T,T]",
    parameter: "mask 必须能 broadcast",
    commonError: "softmax 轴选成 query 轴，或在低精度中使用不安全的负无穷。",
    lines: { scratch: [18, 21], pytorch: [18, 21], production: [23, 28] },
  },
  {
    id: "output",
    title: "加权输出",
    english: "Weighted output",
    summary: "权重乘 V，再合并 heads 并做输出投影。",
    why: "每个 query 得到一个上下文向量，最终恢复到模型宽度 D。",
    input: "weights 与 v",
    output: "y: [B,T,D]",
    parameter: "输出投影 D²",
    commonError: "合并 head 前没有把 T 轴换回正确位置。",
    lines: { scratch: [22, 27], pytorch: [22, 27], production: [29, 35] },
  },
];

const attention: CodeLab = {
  lessonId: "attention",
  title: "Attention：从公式到可靠实现",
  english: "Attention from equations to robust code",
  dimensions: { B: 2, T: 4, D: 64, H: 8, bytes: 4 },
  steps: attentionSteps,
  variants: {
    scratch: {
      label: "From scratch",
      note: "只使用数组运算，把每个 reshape 和归一化轴写出来。",
      code: `B, T, D, H = 2, 4, 64, 8
Dh = D // H
x = randn(B, T, D)
assert D % H == 0

Wq, Wk, Wv = init(D, D), init(D, D), init(D, D)
q = x @ Wq
k = x @ Wk
v = x @ Wv

def split_heads(t):
    return t.reshape(B, T, H, Dh).transpose(0, 2, 1, 3)
q, k, v = map(split_heads, (q, k, v))

scores = q @ k.transpose(0, 1, 3, 2)
scores = scores / sqrt(Dh)

causal = upper_triangle(T, value=-inf)
scores = scores + causal
weights = stable_softmax(scores, axis=-1)

context = weights @ v
context = context.transpose(0, 2, 1, 3).reshape(B, T, D)
Wo = init(D, D)
y = context @ Wo
assert y.shape == (B, T, D)`,
    },
    pytorch: {
      label: "PyTorch",
      note: "使用显式 Linear 和 reshape，便于逐步检查 autograd。",
      code: `import math
import torch
B, T, D, H = 2, 4, 64, 8
Dh = D // H
x = torch.randn(B, T, D, requires_grad=True)

Wq = torch.nn.Linear(D, D, bias=False)
Wk = torch.nn.Linear(D, D, bias=False)
Wv = torch.nn.Linear(D, D, bias=False)
q, k, v = Wq(x), Wk(x), Wv(x)

def split_heads(t):
    return t.view(B, T, H, Dh).transpose(1, 2)
q, k, v = map(split_heads, (q, k, v))

scores = q @ k.transpose(-2, -1) / math.sqrt(Dh)
mask = torch.ones(T, T, dtype=torch.bool).triu(1)
scores = scores.masked_fill(mask, torch.finfo(scores.dtype).min)
weights = torch.softmax(scores, dim=-1)

context = (weights @ v).transpose(1, 2).contiguous()
context = context.view(B, T, D)
out = torch.nn.Linear(D, D, bias=False)(context)
out.square().mean().backward()
assert x.grad is not None`,
    },
    production: {
      label: "Production",
      note: "补上输入契约、低精度安全、dropout、缓存接口与测试断言。",
      code: `class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, heads, dropout=0.0):
        super().__init__()
        if d_model % heads:
            raise ValueError("d_model must be divisible by heads")
        self.heads, self.dh = heads, d_model // heads
        self.qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.out = nn.Linear(d_model, d_model, bias=False)
        self.dropout = dropout

    def forward(self, x, mask=None, cache=None):
        B, T, D = x.shape
        q, k, v = self.qkv(x).chunk(3, dim=-1)
        def split(t):
            return t.view(B, T, self.heads, self.dh).transpose(1, 2)
        q, k, v = map(split, (q, k, v))

        if cache is not None:
            k = torch.cat((cache[0], k), dim=-2)
            v = torch.cat((cache[1], v), dim=-2)
        scores = q @ k.transpose(-2, -1) * self.dh ** -0.5
        if mask is not None:
            scores = scores.masked_fill(~mask, torch.finfo(scores.dtype).min)
        weights = torch.softmax(scores.float(), dim=-1).to(q.dtype)
        weights = F.dropout(weights, self.dropout, self.training)

        y = (weights @ v).transpose(1, 2).contiguous().view(B, T, D)
        y = self.out(y)
        if not torch.isfinite(y).all():
            raise FloatingPointError("non-finite attention output")
        return y, (k, v)`,
    },
  },
  productionChecks: [
    "验证 D % H == 0，并测试 B=1、T=1 与非连续张量。",
    "mask 明确 True/False 语义、shape 与 broadcast 方向。",
    "混合精度下在 float32 做 softmax，再转回原 dtype。",
    "训练时检查梯度有限；推理时验证 KV cache 长度单调增加。",
  ],
};

function compactLab(
  lessonId: string,
  title: string,
  english: string,
  operation: string,
  input: string,
  hidden: string,
  output: string,
  scratch: string,
  pytorch: string,
  production: string,
): CodeLab {
  const modes: CodeMode[] = ["scratch", "pytorch", "production"];
  const sourceByMode: Record<CodeMode, string> = {
    scratch,
    pytorch,
    production,
  };
  const linesFor = (stepIndex: number) =>
    Object.fromEntries(
      modes.map((mode) => {
        const count = sourceByMode[mode].split("\n").length;
        const start = Math.floor((stepIndex * count) / 4) + 1;
        const end = Math.max(start, Math.floor(((stepIndex + 1) * count) / 4));
        return [mode, [start, end]];
      }),
    ) as Record<CodeMode, [number, number]>;
  return {
    lessonId,
    title,
    english,
    dimensions: { B: 2, T: 8, D: 32, H: 4, bytes: 4 },
    steps: [
      {
        id: "input",
        title: "输入契约",
        english: "Input contract",
        summary: `固定 ${input} 的轴和 dtype。`,
        why: "所有后续运算都依赖输入轴的语义。",
        input,
        output: input,
        parameter: "0",
        commonError: "训练与推理使用不同的轴顺序。",
        lines: linesFor(0),
      },
      {
        id: "transform",
        title: operation,
        english: "Core transform",
        summary: `计算 ${hidden}。`,
        why: "这是该模型引入结构先验的核心一步。",
        input,
        output: hidden,
        parameter: "由宽度与层数决定",
        commonError: "广播成功但语义轴错误。",
        lines: linesFor(1),
      },
      {
        id: "output",
        title: "输出与目标",
        english: "Output & objective",
        summary: `把 ${hidden} 映射到 ${output}。`,
        why: "输出头必须与标签粒度和损失函数一致。",
        input: hidden,
        output,
        parameter: "head 参数",
        commonError: "输出形状与标签不一致。",
        lines: linesFor(2),
      },
      {
        id: "gradient",
        title: "反向检查",
        english: "Gradient check",
        summary: "检查 loss、梯度和参数更新量。",
        why: "能 forward 不代表训练路径完整。",
        input: "scalar loss",
        output: "finite gradients",
        parameter: "0",
        commonError: "忘记清梯度、detach 或误冻结参数。",
        lines: linesFor(3),
      },
    ],
    variants: {
      scratch: {
        label: "From scratch",
        note: "显式写出核心数组运算。",
        code: scratch,
      },
      pytorch: {
        label: "PyTorch",
        note: "使用常用模块实现可训练版本。",
        code: pytorch,
      },
      production: {
        label: "Production",
        note: "加入契约、监控和边界处理。",
        code: production,
      },
    },
    productionChecks: [
      "固定输入、输出和 mask 的 shape 契约。",
      "用单个小 batch 检查能否过拟合。",
      "记录参数量、峰值显存和目标设备延迟。",
      "对 NaN、空样本和极端长度写测试。",
    ],
  };
}

const cnn = compactLab(
  "cnn",
  "CNN：从卷积窗口到特征图",
  "Convolution from patches to feature maps",
  "滑窗卷积",
  "x: [B,Cin,H,W]",
  "feature: [B,Cout,Hout,Wout]",
  "logits: [B,K]",
  `patches = unfold(x, kernel=3, padding=1)\nweights = randn(Cout, Cin * 3 * 3)\nfeature = weights @ patches\nfeature = relu(feature)\npooled = feature.mean(axis=(-2, -1))\nlogits = pooled @ head\nloss = cross_entropy(logits, target)\nbackward(loss)`,
  `conv = nn.Conv2d(Cin, Cout, 3, padding=1)\nhead = nn.Linear(Cout, classes)\nfeature = F.relu(conv(x))\npooled = feature.mean(dim=(-2, -1))\nlogits = head(pooled)\nloss = F.cross_entropy(logits, target)\noptimizer.zero_grad(set_to_none=True)\nloss.backward(); optimizer.step()`,
  `class ConvClassifier(nn.Module):\n    def forward(self, x):\n        if x.ndim != 4:\n            raise ValueError("expected [B,C,H,W]")\n        x = self.preprocess(x)\n        feature = self.backbone(x)\n        logits = self.head(feature.mean((-2, -1)))\n        return logits\n# unit tests: odd sizes, batch=1, train/eval normalization`,
);

const rnn = compactLab(
  "rnn",
  "RNN：让 hidden state 沿时间传递",
  "Recurrent state, step by step",
  "循环状态更新",
  "x: [B,T,D]",
  "h: [B,T,H]",
  "logits: [B,T,K]",
  `h = zeros(B, H)\noutputs = []\nfor t in range(T):\n    h = tanh(x[:, t] @ Wx + h @ Wh + b)\n    outputs.append(h)\nstates = stack(outputs, axis=1)\nlogits = states @ Wo\nloss = masked_loss(logits, target, lengths)`,
  `rnn = nn.GRU(D, H, batch_first=True)\npacked = pack_padded_sequence(x, lengths.cpu(), batch_first=True)\npacked_out, h_last = rnn(packed)\nstates, _ = pad_packed_sequence(packed_out, batch_first=True)\nlogits = head(states)\nloss = masked_cross_entropy(logits, target, lengths)\nloss.backward()`,
  `def forward(self, x, lengths, state=None):\n    if lengths.max() > x.size(1):\n        raise ValueError("length exceeds padded sequence")\n    packed = pack_padded_sequence(x, lengths.cpu(), True, enforce_sorted=False)\n    out, state = self.rnn(packed, state)\n    out, _ = pad_packed_sequence(out, batch_first=True)\n    return self.head(out), state\n# clip gradient norm and test streaming-state reset`,
);

const unet = compactLab(
  "unet",
  "U-Net：保存细节，再逐层恢复",
  "Encoder, skip, decoder",
  "编码、跳接与解码",
  "x: [B,C,H,W]",
  "pyramid + skip features",
  "mask logits: [B,K,H,W]",
  `e1 = block(x)\ne2 = block(pool(e1))\nbottleneck = block(pool(e2))\nd2 = upsample(bottleneck)\nd2 = block(concat(d2, crop(e2)))\nd1 = upsample(d2)\nd1 = block(concat(d1, crop(e1)))\nlogits = conv1x1(d1, classes)\nloss = dice_ce(logits, mask)`,
  `e1 = self.enc1(x)\ne2 = self.enc2(self.pool(e1))\nz = self.bottleneck(self.pool(e2))\nd2 = self.dec2(torch.cat([self.up2(z), e2], dim=1))\nd1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))\nlogits = self.head(d1)\nloss = ce(logits, mask) + dice_loss(logits, mask)\nloss.backward()`,
  `def forward(self, x):\n    original = x.shape[-2:]\n    x, padding = pad_to_multiple(x, 4)\n    e1, e2, z = self.encode(x)\n    d2 = self.dec2(torch.cat((self.up2(z), align(e2)), 1))\n    d1 = self.dec1(torch.cat((self.up1(d2), align(e1)), 1))\n    return unpad(self.head(d1), padding, original)\n# verify image/mask interpolation modes and patient-level split`,
);

const gnn = compactLab(
  "gnn",
  "GNN：沿边收集邻居信息",
  "Message passing on edges",
  "消息传递与聚合",
  "nodes: [N,D], edges: [2,E]",
  "messages: [E,H] → nodes: [N,H]",
  "node logits: [N,K]",
  `src, dst = edges\nmessages = nodes[src] @ W_msg\naggregated = segment_mean(messages, dst, N)\nupdated = relu(nodes @ W_self + aggregated)\nlogits = updated @ W_out\nloss = cross_entropy(logits[train_nodes], labels[train_nodes])\nbackward(loss)`,
  `src, dst = edge_index\nmessages = self.msg(x[src])\naggregated = scatter_mean(messages, dst, dim=0, dim_size=x.size(0))\nh = F.relu(self.self_proj(x) + aggregated)\nlogits = self.head(h)\nloss = F.cross_entropy(logits[train_mask], y[train_mask])\nloss.backward()`,
  `def forward(self, x, edge_index):\n    validate_edge_index(edge_index, x.size(0))\n    src, dst = add_self_loops(edge_index, x.size(0))\n    msg = self.msg(x[src])\n    agg = scatter_mean(msg, dst, dim=0, dim_size=x.size(0))\n    return self.head(self.norm(self.self_proj(x) + agg))\n# split by time/entity, audit reverse edges and isolated nodes`,
);

const mamlBase = compactLab(
  "meta-learning-maml",
  "MAML：从 support 更新到 query meta-gradient",
  "MAML inner and outer loops",
  "任务内适配",
  "tasks × {support, query}",
  "adapted params θ′τ",
  "mean query loss across tasks",
  `theta = Parameter([0.2])\nouter_loss = 0\nfor task in task_batch:\n    support_loss = mse(predict(task.support_x, theta), task.support_y)\n    support_grad = grad(support_loss, theta, create_graph=True)\n    adapted = theta - inner_lr * support_grad\n    query_pred = predict(task.query_x, adapted)\n    outer_loss += mse(query_pred, task.query_y)\nouter_loss /= len(task_batch)\nmeta_grad = grad(outer_loss, theta)\ntheta -= outer_lr * meta_grad`,
  `theta = torch.nn.Parameter(torch.tensor([0.2]))\nouter_loss = 0.0\nfor support_x, support_y, query_x, query_y in tasks:\n    support_loss = F.mse_loss(model(support_x, theta), support_y)\n    (g,) = torch.autograd.grad(support_loss, theta, create_graph=True)\n    adapted = theta - inner_lr * g\n    query_loss = F.mse_loss(model(query_x, adapted), query_y)\n    outer_loss = outer_loss + query_loss\nouter_loss = outer_loss / len(tasks)\noptimizer.zero_grad(set_to_none=True)\nouter_loss.backward()\noptimizer.step()`,
  `def meta_step(self, task_batch):\n    query_losses = []\n    for task in task_batch:\n        support, query = validate_disjoint(task)\n        adapted = self.clone_parameters()\n        for _ in range(self.inner_steps):\n            loss = self.loss(support, adapted)\n            grads = torch.autograd.grad(loss, adapted, create_graph=not self.first_order)\n            adapted = tuple(p - self.inner_lr * g for p, g in zip(adapted, grads))\n        query_losses.append(self.loss(query, adapted))\n    outer = torch.stack(query_losses).mean()\n    assert torch.isfinite(outer)\n    return outer\n# split by task identity; log adaptation gain, gradient norm, time and memory`,
);

const maml: CodeLab = {
  ...mamlBase,
  dimensions: { B: 4, T: 10, D: 128, H: 2, bytes: 4 },
  steps: [
    {
      id: "input",
      title: "任务与数据边界",
      english: "Task and split contract",
      summary:
        "固定 task batch，并在每个任务内部隔离 support 与 query；元测试任务不能出现在训练中。",
      why: "query 提前进入 inner loop 会把适配后泛化变成同数据拟合。",
      input: "B tasks × {support[T], query[T]}",
      output: "互不重叠的 task episodes",
      parameter: "0",
      commonError: "先随机拆样本，再让同一任务或实体跨 meta split。",
      lines: { scratch: [1, 3], pytorch: [1, 4], production: [1, 4] },
    },
    {
      id: "transform",
      title: "Support inner loop",
      english: "Task-specific adaptation",
      summary: "从共享 θ 复制任务参数，只用 support loss 走 H 次更新得到 θ′τ。",
      why: "元学习优化的是一个容易被少量任务数据更新的共同起点。",
      input: "θ, supportτ, inner LR α",
      output: "adapted parameters θ′τ",
      parameter: "D 个共享参数；每个任务产生临时副本",
      commonError: "原地覆盖共享 θ，导致后一个任务从前一个任务的终点开始。",
      lines: { scratch: [4, 6], pytorch: [5, 7], production: [5, 9] },
    },
    {
      id: "output",
      title: "Query outer objective",
      english: "Post-adaptation evaluation",
      summary: "用每个任务适配后的 θ′τ 计算隔离 query loss，再跨任务求平均。",
      why: "outer objective 衡量少步适配后的新样本表现，而不是 support 拟合程度。",
      input: "θ′τ, queryτ",
      output: "mean query loss across B tasks",
      parameter: "0",
      commonError:
        "用 support loss 做 outer objective，或让 query 标签参与适配。",
      lines: { scratch: [7, 9], pytorch: [8, 10], production: [10, 11] },
    },
    {
      id: "gradient",
      title: "Meta-gradient 与更新",
      english: "Differentiate through adaptation",
      summary:
        "沿 inner updates 把 query loss 的梯度传回共享 θ，并执行 outer update。",
      why: "精确 MAML 保留 dθ′/dθ；FOMAML 则忽略这部分二阶依赖。",
      input: "mean query loss, outer LR β",
      output: "updated shared initialization θ",
      parameter: "二阶图开销随 H、D 与 task batch 增长",
      commonError: "意外 detach θ′，却仍把结果称为完整二阶 MAML。",
      lines: {
        scratch: [10, 11],
        pytorch: [11, 13],
        production: [12, 14],
      },
    },
  ],
  productionChecks: [
    "按 task identity 划分 meta-train、meta-val 与 meta-test，并验证 support/query 无交集。",
    "训练与部署保持相同 N-way、K-shot、inner steps 和可更新参数范围。",
    "分别记录适配前后 query 指标、任务间方差、梯度范数、时间和峰值显存。",
    "将二阶 MAML、FOMAML、ANIL、ProtoNet 与普通微调放在相同 episode 和预算下比较。",
  ],
};

export const codeLabs: CodeLab[] = [attention, cnn, rnn, unet, gnn, maml];
export const codeLabByLesson = new Map(
  codeLabs.map((lab) => [lab.lessonId, lab]),
);

export function codeLabMetrics(lab: CodeLab, values: StudioDimensions) {
  const B = values.B || 1,
    T = values.T || 1,
    D = values.D || 1,
    H = values.H || 1,
    bytes = values.bytes || 4;
  if (lab.lessonId === "attention") {
    const params = 4 * D * D;
    const flops = 8 * B * T * D * D + 4 * B * T * T * D;
    const activationBytes = B * (3 * T * D + H * T * T + T * D) * bytes;
    return {
      params,
      flops,
      activationBytes,
      gradient: "Q/K/V 与输出投影均应得到有限梯度",
    };
  }
  if (lab.lessonId === "meta-learning-maml") {
    const params = D;
    const flops = B * T * D * (6 * H + 4);
    const activationBytes = B * T * D * (H + 1) * bytes;
    return {
      params,
      flops,
      activationBytes,
      gradient: "query loss 应沿 H 次 inner update 回传到共享 θ",
    };
  }
  const params = D * D * 3;
  const flops = 2 * B * T * params;
  const activationBytes = B * T * D * bytes * 3;
  return {
    params,
    flops,
    activationBytes,
    gradient: "核心变换与输出 head 都应得到非空有限梯度",
  };
}

export function formatCount(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}G`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return String(Math.round(value));
}
