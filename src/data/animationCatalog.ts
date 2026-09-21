// Lightweight directory metadata; validate-animations checks this against live labs.
export const animationCatalog: Record<string, { label: string; hint: string }> =
  {
    "neural-networks": {
      label: "第一条连接的权重 w",
      hint: "在 w=0.5 附近拖动，观察 ReLU 何时开始传递信号。",
    },
    "loss-functions": {
      label: "预测残差 r = ŷ − y",
      hint: "拖过 ±1，观察 Huber 由二次段切换到线性段。",
    },
    backpropagation: {
      label: "当前权重 w",
      hint: "试试 w=1.5：预测等于目标，loss 与梯度同时归零。",
    },
    "gradient-descent": {
      label: "Learning rate η",
      hint: "比较 η=0.1、1、1.5、2.2 的三次更新轨迹。",
    },
    adamw: {
      label: "Weight decay λ",
      hint: "这里学习率刻意放大为 0.2，方便看清独立收缩项。",
    },
    regularization: {
      label: "L2 强度 λ",
      hint: "对比 λ=0、1、5；图中纵轴随目标范围缩放。",
    },
    "expectation-maximization": {
      label: "初始均值间距 |μ₂−μ₁|",
      hint: "中心靠近时责任度更模糊；拉开后边缘点的归属更明确。",
    },
    knn: {
      label: "邻居数量 k",
      hint: "试 1、3、5：新增邻居能改变多数票与预测类别。",
    },
    "k-means": {
      label: "簇数量 K",
      hint: "比较同一批数据分成 2、3、4 组时的粒度与 inertia。",
    },
    "gaussian-mixture-model": {
      label: "Component A 标准差 σ₁",
      hint: "观察 A 变宽后，x=0.5 的 posterior 如何变化。",
    },
    pca: {
      label: "投影方向 θ",
      hint: "把方向转到接近显示的 PCA 最优角，再与垂直方向比较。",
    },
    svm: {
      label: "Hinge 惩罚系数 C",
      hint: "从 C=0.1 往上拖，观察实际最优 w 与 margin 的变化。",
    },
    "logistic-regression": {
      label: "权重 w",
      hint: "比较 w 较小时的犹豫概率与 w 增大后的高置信度。",
    },
    cnn: {
      label: "窗口位置 Window index",
      hint: "0–8 按从左到右、从上到下选择窗口；公式和输出会实时重算。",
    },
    resnet: {
      label: "残差比例 α",
      hint: "观察每个坐标如何从原值变化；α=0 时完全沿 shortcut 输出。",
    },
    unet: {
      label: "示意 skip 振幅",
      hint: "缩放蓝色细节信号；不改变 concatenation 的通道数。",
    },
    rnn: {
      label: "递归权重 w",
      hint: "固定 x=[1,0,0,0]，每次实时重算 4 个 hidden states。",
    },
    "lstm-gru": {
      label: "Forget gate fₜ",
      hint: "fₜ 越大保留越多旧记忆；新写入项保持不变。",
    },
    transformer: {
      label: "上下文模式 0=双向 / 1=因果",
      hint: "切换遮罩，观察 attention 矩阵中哪些连接被禁用。",
    },
    bert: {
      label: "被遮位置 Mask index",
      hint: "0–4 对应“这 / 只 / 猫 / 喜欢 / 鱼”；左右上下文随位置变化。",
    },
    "gpt-language-model": {
      label: "采样温度 Temperature",
      hint: "固定 logits=[2,1,0]；概率条和固定随机抽样结果一起变化。",
    },
    vit: {
      label: "Patch 指数 e（P=2ᵉ）",
      hint: "e=0/1/2 对应 P=1/2/4，实时显示 token 数与 attention 配对数。",
    },
    gnn: {
      label: "传播层数 / hops",
      hint: "比较目标节点数值和被高亮的可达范围；每层包含 self-loop。",
    },
    "transfer-lora": {
      label: "LoRA rank r",
      hint: "改变中间维度；α 固定为 1，所以同时包含 α/r 缩放。",
    },
    "prediction-heads": {
      label: "类别数 C",
      hint: "固定 feature 与确定性权重公式，重算当前类别集的 logits 和 softmax。",
    },
    "attention-heads": {
      label: "Head 指数 e（heads=2ᵉ）",
      hint: "e=0/1/2/3 对应 1/2/4/8 heads；所有选项都整除 d_model=8。",
    },
    "reinforcement-learning": {
      label: "折扣系数 γ",
      hint: "γ 越大，远期 reward 在同一条轨迹中占比越大。",
    },
    "multi-armed-bandit": {
      label: "探索率 ε",
      hint: "随机分支在全部三个 arm 中均匀抽样，包含当前最优 arm。",
    },
    "q-learning": {
      label: "学习率 α",
      hint: "α=0 保留旧估计，α=1 直接移到这次 Bellman target。",
    },
    sarsa: {
      label: "这次采样的下一动作 a′",
      hint: "0、1、2 分别选择图中的 a′1、a′2、a′3；模拟不同采样结果。",
    },
    dqn: {
      label: "折扣系数 γ",
      hint: "改变未来 Q 的权重；观察 Bellman target 与平方误差一起变化。",
    },
    reinforce: {
      label: "这条轨迹回报 G",
      hint: "固定 baseline b=1；G 越过 1 时，policy gradient 的方向翻转。",
    },
    "actor-critic": {
      label: "Critic 当前估计 V(s)",
      hint: "当 V(s) 超过 target=3.7 时，TD advantage 变负，Actor 转为降低该动作概率。",
    },
    sac: {
      label: "熵系数 α",
      hint: "本例 log π=-0.8 固定，熵项为 0.8α；它与 twin-Q 最小值一起构成 soft target。",
    },
    "reward-model": {
      label: "奖励分差 Δr",
      hint: "正分差支持 chosen；负分差表示 reward model 当前把 rejected 排得更高。",
    },
    dpo: {
      label: "DPO 系数 β",
      hint: "固定 πθ 和 πref；β 缩放 reference-relative gap，观察 sigmoid 与 loss。",
    },
    "contrastive-learning": {
      label: "负样本距离 d−",
      hint: "负对距离超过 margin=1.5 后，该负对的 hinge 项变为 0；正对仍有拉近损失。",
    },
    infonce: {
      label: "温度 τ",
      hint: "固定 similarity 下，低 τ 使 softmax 更尖锐；高 τ 使候选概率更接近。",
    },
    "triplet-loss": {
      label: "间隔 margin m",
      hint: "本例距离平方差为 0.8；m>0.8 才产生正损失，m≤0.8 时约束已满足。",
    },
    "autoencoder-vae": {
      label: "潜变量标准差 σ",
      hint: "固定均值 μ=0.8 与同一 ε=0.6，只改变分布的宽度。",
    },
    gan: {
      label: "生成器输出 G(z)",
      hint: "固定 D(x)=sigmoid(x)，查看同一个生成值怎样改变 D 与 G 的损失。",
    },
    clip: {
      label: "温度 τ",
      hint: "降低 τ 会让同一组相似度的 softmax 更尖锐，观察正例概率和负例竞争。",
    },
    "cohort-design": {
      label: "结局观察期 horizon",
      hint: "拖动预测日之后的观察窗口，看哪些已记录事件被计入标签。",
    },
    "data-leakage": {
      label: "特征截断时间 cutoff",
      hint: "预测发生在第 0 天；把 cutoff 移到右边，观察未来信息何时被误纳入。",
    },
    "calibration-uncertainty": {
      label: "温度 T",
      hint: "T>1 通常降低最大 softmax 概率；正温度不会改变类别排序。",
    },
  };
export const legacyAnimationIds: readonly string[] = [
  "attention",
  "diffusion",
  "ppo",
];
export const handCalculationLessonIds: readonly string[] = [
  "knn",
  "expectation-maximization",
  "attention",
  "ppo",
  "cohort-design",
];
export const mechanismCount =
  Object.keys(animationCatalog).length + legacyAnimationIds.length;
export function animationKind(id: string) {
  return animationCatalog[id]
    ? "parameter"
    : legacyAnimationIds.includes(id)
      ? "visual"
      : "steps";
}
