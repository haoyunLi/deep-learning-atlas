import type { Lesson } from "./lessons";

export const bioGraphRepresentationLessons: Lesson[] = [
  {
    id: "bio-graph-construction",
    source: {
      label:
        "Squidpy: radius-based spatial graph construction and library grouping",
      url: "https://squidpy.readthedocs.io/en/stable/api/squidpy.gr.spatial_neighbors_radius.html",
    },
    title: "Spatial Graph Design：一条 edge 究竟代表什么？",
    englishTitle: "Physical Graphs, Feature Graphs and Biological Evaluation",
    category: "frontiers",
    level: "进阶",
    duration: "26 分钟",
    icon: "⌘",
    summary:
      "先决定谁可以向谁传消息，再选 GNN；用 physical distance、feature similarity 与 donor/section 边界拆开三种经常混淆的关系。",
    intuition:
      "两个 cells 的 RNA 很像，可能来自相隔很远的 liver zones；两个紧挨着的 cells，也可能分别是 hepatocyte 和 macrophage。Physical graph 回答‘谁在附近’，feature graph 回答‘谁的测量相似’。如果把两种关系混成一个按钮，后面的网络很难知道自己应该学 cell identity、tissue domain，还是 cell interaction。",
    core: "输入为 X:[N,G]、coordinates:[N,2] 或 [N,3]、donor/section IDs 与 graph specification；输出为 edge_index:[2,E] 和可选 edge features:[E,F_e]。Physical graph 在同一有效坐标系统内按 radius、kNN 或 contact 建边；feature graph 在训练流程定义的 PCA/latent 空间建边。Physical proximity 不直接证明 signaling，expression similarity 也不等于空间接触。Graph design 是可被 ablation 检验的假设。",
    equation:
      "Aᵢⱼ=1[sectionᵢ=sectionⱼ]·1[0<‖rᵢ−rⱼ‖₂≤R]; feature-kNN: j∈TopK(−d(zᵢ,zⱼ)); A_physical ≠ A_feature",
    mechanicsSteps: [
      "先写 node unit 和 target：cell、spot、bin、gene 各代表不同对象。Spot mixture 的 domain classification 与 bin-to-cell assignment 需要不同 output head；改变 node unit 也会改变距离与邻居的生物意义。",
      "建立 coordinate contract：pixel 还是 μm、是否同一 section、是否经过 registration。两张切片都存在坐标 (10,10)，不代表它们物理重叠；先按 section 分组，再计算 physical edges。",
      "手算同一 section 的 A=(0,0)、B=(3,0)、C=(10,0)，单位 μm。Radius R=4 只连接 A—B，C isolated；R=8 增加 B—C，A—C 仍不连。R 从 4 到 8 改变的是可传消息的组织尺度。",
      "同一组 coordinates 用 k=1 时，C 会把 B 当最近邻，尽管距离为 7。Symmetrized kNN 因而得到 A—B—C；mutual kNN 只保留双方互选的 A—B。固定 k 不提供最大 physical distance 保证。",
      "再给 A/B/C 一个单维 expression feature [0,10,0.1]。Feature kNN 会优先连接 A—C，和 physical radius graph 不同。实际 feature distance 需记录 normalization、genes、PCA dimensions；不能直接让高 UMI depth 决定邻居。",
      "把 source、target、distance、section 写进 edge audit。检查 self-loops、重复边、方向、孤立节点、degree histogram、跨 section edge count；用 H&E/segmentation overlay 检查是否跨空洞或不合理 tissue boundary。",
      "在相同 donor/section evaluation 上比较 feature-only MLP、physical-only GNN、feature-only GNN、dual-graph model。额外做 edge removal 或 degree-aware shuffled-edge control；性能变化才帮助判断 graph prior 是否有用。",
      "Inductive new-donor evaluation 中，feature selection/scaling/PCA 只 fit development donors；test section 按预先确定规则独立建图。若任务明确做 transductive integration，必须声明哪些 test features 和 cross-sample edges 已参与训练。",
    ],
    whenToUse: [
      "Spatial domain、local niche 或 boundary prediction：先检验具有物理尺度解释的 graph，再判断局部上下文是否优于单节点特征。",
      "Single-cell annotation/representation：feature graph 可描述 expression neighborhood，但不用于声称 dissociated cells 之间真实接触。",
      "优点是把空间假设显式化；同一组 X 可以更换 graph 做 controlled comparison，错误边也能被直接画出来检查。",
    ],
    limits: [
      "Coordinates 缺单位、section IDs 或 registration 不可靠时，先修 metadata；增加 GAT heads 无法修复坐标错误。",
      "Radius graph 在不同 cell density 下 degree 差异很大；kNN 可强行穿过组织空白或 rare-cell boundary，不能只按平均 degree 选图。",
      "Cross-donor physical edges 通常无意义；经验证的 serial-section registration 或明确的 integration graph 可以另建 typed edges，但要单独评估，不冒充同切片接触。",
      "Graph similarity 与相邻细胞的共同 marker 可以来自 tissue composition；没有 perturbation、配体受体证据或独立验证时，不能升级为 causal communication。",
    ],
    howToUse: [
      "保存 node IDs、donor IDs、section IDs、coordinate unit、target definition，先在一小块 tissue 上人工检查十几条边。",
      "比较 radius 与 kNN 候选，并记录 symmetrization、self-loop、edge weight 的具体规则；官方 Squidpy mode-specific builders 提供不同建图方式，按安装版本核对参数。",
      "Physical graph 在每个 section 内独立构建；feature graph 的 preprocessing 放进 training folds。对 integration relation 使用不同 edge type 和单独标识。",
      "按 boundary/interior、rare/common cell types 和 degree 分组汇报 error；单一平均 accuracy 可能掩盖 boundary 被抹平。",
      "先固定 features/model 改 graph，再固定 graph 改 model；把每次变化对应的 validation 结果与图一起保存。",
    ],
    tuning: [
      "Radius 候选由测得的 cell diameter、spot pitch 和问题尺度推导，例如 1、1.5、2 倍中位 cell diameter；这些是实验候选，不是组织通用值。",
      "k 可用 4/8/16 做敏感性比较，同时约束 maximum physical distance；图太密时先看长边与 boundary error，再加正则。",
      "Feature graph 可比较 20/50 个 training-fitted PCs；改变 PCs 也会改变图，需和 GNN depth 的影响分开记录。",
      "Distance kernel bandwidth 过大接近等权，过小接近只保留最近邻；检查实际权重分布，不只记录一个 σ 数字。",
    ],
    settings: [
      {
        name: "graph relation / section key",
        start:
          "明确 physical、feature 或 contact；physical edges 按 section 隔离。",
        adjust:
          "需要跨样本 integration 时新增 relation type 与验证协议，不能只删除 section 限制。",
      },
      {
        name: "radius / maximum distance",
        start: "先看 μm 距离分布与 tissue overlay，再选多个生物尺度候选。",
        adjust:
          "孤立节点多时检查 density 与测量缺口；不为连通性强行跨越组织空白。",
      },
      {
        name: "k / mutual vs union",
        start: "比较 k=4/8/16；记录 directed kNN 如何转成 undirected edges。",
        adjust:
          "Mutual 图可能更稀疏；union 图更易保留单向长边，结合 coverage 与误差选择。",
      },
      {
        name: "edge features / self-loops",
        start: "保留 distance 与 relation ID；确认模型是否自行加入 self-loop。",
        adjust:
          "用 contact length 或 morphology 前先检查缺失值、单位和测试时可获得性。",
      },
    ],
    modifications: [
      "Dual-graph model 为 physical 与 expression relations 分别聚合后 fusion，便于通过移除一支检查信息来源。",
      "Boundary-aware graph 可依据已验证 segmentation/contact 限制边；避免用待预测的 ground-truth labels 构图造成 target leakage。",
      "Bin-to-cell 可采用 bipartite candidate graph；bin 与 cell 不属于同一 node type，需使用相应 message/assignment head。",
    ],
    pitfalls: [
      "把两个 donors 的局部坐标直接 concatenate 后建 radius graph，会创造不存在的近邻。",
      "先用所有 donors 学 PCA 再宣称完全 inductive test，会低估 preprocessing 接触 holdout 的影响。",
      "Spatial autocorrelation 使相邻 spots 的随机 split 很乐观；跨 donor/section 目标必须对应跨 donor/section evaluation。",
    ],
    example:
      "教学场景：同一 section 的三个 cells 在 x=0、3、10 μm，feature=0、10、0.1。R=4 physical graph 只传 A↔B；feature kNN 让 A↔C 更接近；二者没有谁天然正确，取决于你预测 local niche 还是 cell identity。加入另一 donor 的 D=(0,0) 时，physical graph 仍不应出现 A↔D。这是 graph specification 检查，不是真实实验结果。",
    compareTo: [
      "gnn",
      "gcn",
      "bio-gcn-propagation",
      "bio-gat-attention",
      "bio-contrastive-design",
    ],
  },
  {
    id: "bio-gcn-propagation",
    source: {
      label:
        "Kipf & Welling: Semi-Supervised Classification with Graph Convolutional Networks",
      url: "https://arxiv.org/abs/1609.02907",
    },
    title: "Spatial GCN：平滑何时降噪，何时抹掉 boundary？",
    englishTitle: "GCN Propagation, Self-Loops and Boundary Preservation",
    category: "frontiers",
    level: "高级",
    duration: "27 分钟",
    icon: "◉",
    summary:
      "把 GCN propagation 当可检查的矩阵运算：追踪自身与邻居的贡献，区分 normalization、residual 和反复传播的后果。",
    intuition:
      "如果相邻 spots 属于同一 tissue domain，互相借信息可能降低测量噪声；如果一条边跨过 tumor–immune boundary，同样的操作会把真实差异混掉。关键不是‘GNN 能不能平滑’，而是你希望保留的信号是否在这张图上变化缓慢。",
    core: "X:[N,F] 经 S=D̃^(−1/2)(A+I)D̃^(−1/2) 传播，再乘共享 W:[F,F′]，输出 H:[N,F′]。Degree normalization 影响每条边的数值贡献；self-loop 只保证自身可参与，不保证自身占最大权重。本课以固定 W=I、无 activation 的 teaching operator 隔离 graph mixing，再讨论 trainable GCN；toy mixing 不能代表完整训练后的必然性能。",
    equation:
      "H′=σ(SHW); S=D̃⁻¹ᐟ²(A+I)D̃⁻¹ᐟ²; residual mix H′=αH+(1−α)SH (teaching operator)",
    mechanicsSteps: [
      "先给每条 edge 解释：同一 section 的 physical neighborhood；输入可用 training-fitted PCA/normalized features。不要把 raw-count NB likelihood 与这里的连续 feature propagation 混为一谈。",
      "检查 A 的 diagonal，再只加一次 I。对相连的两个 nodes，A+I=[[1,1],[1,1]]，带 self-loop 的 degree=[2,2]，所以 S 的四个元素均为 1/2。",
      "用两点 marker feature [0,10] 手算一层 Sx=[5,5]：原来 10 的 boundary contrast 消失。若 [0,10] 来自不同 cell types，这可能是错误；若来自同类型的测量噪声，混合可能有用，需要外部证据判断。",
      "Self-loop 并未避免上述混合。加入 α=0.8 的 residual teaching operator 后，0.8[0,10]+0.2[5,5]=[1,9]，contrast 保留为 8。连续 t 次此 operator，contrast 为 10×0.8^t；t=3 时为 5.12。",
      "再检查不规则 degree：路径 A—B—C 加 self-loop 后 degree=[2,3,2]。中心接收两端的系数都是 1/√6，自身是 1/3；当 x=[1,1,1] 时中心约为 1.150，端点约为 0.908。Symmetric normalization 不是 row-stochastic average。",
      "恢复 W 和 activation；若 X:[400,20]、W:[20,32]，得到 [400,32]，每层扩大一跳 receptive field。两层可接触两跳，但这不表示覆盖固定 μm 距离；physical reach 取决于 graph。",
      "训练时只对规定 train nodes 算监督 loss，记录 full-graph/transductive 或 separate-graph/inductive protocol。Label mask 不能替代 donor split；同 donor 的邻居依赖仍在。",
      "绘制 depth 增加时的 boundary error、rare-type recall、node-feature variation 与 held-out donor loss。Simple linear repeated propagation 的趋同可解释 oversmoothing 风险，但训练失败也可能来自错误边、oversquashing、优化或 batch confounding。",
    ],
    whenToUse: [
      "图可信且相邻节点的目标通常相关，想建立比 MLP 多一点局部上下文的透明 baseline。",
      "Spatial domain representation 或具有连续空间梯度的 denoising；同时具备独立 marker/morphology 来检查保留了什么。",
      "优点是固定 propagation weights 容易手算、速度通常优于同宽多头 attention，适合先确定 graph 本身是否值得用。",
    ],
    limits: [
      "Boundary 上的 heterophily 会使同一种平滑操作损失有用差异；‘图更连续’不能单独作为 biological quality 指标。",
      "不要把 smoothed counts 当成独立原始 observations 做常规 DE；传播引入相关性并改变测量分布，scientific testing 需要适配的设计。",
      "深层网络可能 oversmooth；残差只减缓某些信息丢失，不能修复错误 cross-donor edges 或保证 rare states 保留。",
      "Symmetric normalization 在不规则图上不保持 constant vector；不能把每个输出的绝对数值解释成 conserved molecule count。",
    ],
    howToUse: [
      "固定 donor/section split，用同一 features 和 head 比较 MLP、1-layer、2-layer GCN，先建立可解释的最小 ablation。",
      "打印一个目标节点的所有 incoming coefficients，核对 edge orientation、degree 和 self-loop；用小图手算结果验证框架设置。",
      "按 node type/boundary/degree 汇报 error，并对照 raw marker map；单看 UMAP 或 overall accuracy 不够。",
      "深度增加后表现变差时，依次检查 graph validity、distance reach、embedding variation、training/validation loss，再决定 residual、dropout 或减层。",
      "部署到新 section 时重新构建允许的 adjacency；不复用旧图的 cached normalization，保存 preprocessing 与 graph specification。",
    ],
    tuning: [
      "Depth 候选 0/1/2/3 对应 MLP 与不同 hop 范围；只有验证收益与 boundary preservation 一起改善才增加传播。",
      "Residual α=0/0.5/0.8 可作为教学敏感性候选；α 越大越保留自特征，也越少使用邻居。真实 residual block 需匹配维度并记录实现。",
      "Hidden width 16/32/64 和 dropout 0/0.2/0.4 可做小规模比较；它们不能代替 graph radius 的生物选择。",
      "Weighted graph 的 degree 应为含 self-loop 的权重和；修改 kernel bandwidth 后必须重算 normalization。",
    ],
    settings: [
      {
        name: "normalization / add_self_loops",
        start: "用一份明确 A 与一次 self-loop 处理，手算 2-node case。",
        adjust:
          "框架自动处理时避免预处理再重复加入；有向或 signed graph 另核公式。",
      },
      {
        name: "propagation depth",
        start: "对比 0/1/2/3 layers，保存每层 tissue map。",
        adjust:
          "Boundary contrast 丢失时减层或缩小图；远处信息不足时先核真实 physical reach。",
      },
      {
        name: "residual strength",
        start: "α=0/0.5/0.8 是候选，明确 identity path 与 projection。",
        adjust: "提高 α 保留自身并减弱 mixing；仍需按 held-out donors 选取。",
      },
      {
        name: "cached adjacency",
        start: "仅固定 adjacency 的 full-graph setting 才考虑缓存。",
        adjust:
          "换 section、采样子图或动态边时关闭或重建缓存，防止使用旧 degree。",
      },
    ],
    modifications: [
      "将 raw/self features 与 propagated features concatenate，让 head 同时看到局部差异与邻域 context。",
      "对于不同关系使用 separate branches；例如 contact 与 expression edges 分别归一化，不假定它们可直接相加。",
      "需要 feature-dependent weighting 时比较 GAT；大图预算不足时比较 GraphSAGE，并保持 evaluation protocol 一致。",
    ],
    pitfalls: [
      "看到相邻节点变相似就宣称发现新的 tissue domain；这是模型的 inductive bias，必须用独立证据验证。",
      "把 oversmoothing 与 oversquashing 当同义词：前者是表示失去区分，后者是大量远处消息受有限容量/图瓶颈压缩。",
      "把 high-frequency biological boundary 全当作 noise，可能获得平滑漂亮却错误的 map。",
    ],
    example:
      "教学 boundary：[0,10] 经含 self-loop 的 GCN mixing 变 [5,5]；同样的 mixing 加 α=0.8 residual 变 [1,9]，三步后 contrast 为 5.12。这个数值演示说明 self-loop 与 residual 功能不同；是否值得保留 contrast，要由 cell identity、histology 或 held-out biological target 来决定。",
    compareTo: [
      "gcn",
      "bio-graph-construction",
      "bio-gat-attention",
      "bio-graphsage-sampling",
    ],
  },
  {
    id: "bio-gat-attention",
    source: {
      label: "PyTorch Geometric: GATConv equations, heads and edge features",
      url: "https://pytorch-geometric.readthedocs.io/en/latest/generated/torch_geometric.nn.conv.GATConv.html",
    },
    title: "Spatial GAT：attention 高，是否表示生物作用强？",
    englishTitle:
      "Graph Attention, Neighborhood Competition and Interpretation",
    category: "frontiers",
    level: "高级",
    duration: "26 分钟",
    icon: "✣",
    summary:
      "把 edge logits、softmax denominator、heads 与 message contribution 分开算；理解 attention 为什么随邻居数量和 temperature 改变。",
    intuition:
      "一个 macrophage 给邻近 hepatocyte 多大 attention，是在当前候选邻居中分配多少模型权重。换一组候选邻居，即使两者的 expression 不变，权重也可能改变。它像一份局部预算，不能直接读成细胞之间的 signaling 强度。",
    core: "GAT 先在允许的 edges 上为 projected node features 打分，再对同一 target 的 incoming edges 做 softmax，最后加权相加 messages。多头给出多组可学习表示。Temperature τ 是本课用于解释 softmax 敏感性的显式扩展；标准 PyG GATConv 并没有独立 temperature 参数，实际要改 scoring/softmax implementation，而不是传一个不存在的参数。",
    equation:
      "eᵢⱼ=LeakyReLU(aᵀ[Whᵢ∥Whⱼ]); αᵢⱼ=exp(eᵢⱼ/τ)/Σₖ∈N⁺(i)exp(eᵢₖ/τ); mᵢ=ΣⱼαᵢⱼWhⱼ",
    mechanicsSteps: [
      "先固定 physical graph、edge direction 与 self-loop；每个 target 只能从候选 incoming neighbors 接收消息。GAT 不会自动为 graph 漏掉的 cell 增加一条边。",
      "将每个 source feature 投影成 message v_j=Wh_j，并计算 logit e_ij。Distance/contact 等 edge features 可以参与某些实现的 scoring；先确认单位和 self-loop edge feature 如何生成。",
      "教学例：三个候选（可含 self）logits=[ln2,0,0]，messages=[1,4,0]。τ=1 时 exponentials=[2,1,1]，denominator=4，attention=[0.5,0.25,0.25]。",
      "计算实际 contribution=[0.5×1,0.25×4,0.25×0]=[0.5,1,0]，总 message=1.5。最高 attention 的第一条边贡献不是最大；attention 与 message magnitude 必须一起看。",
      "保持 logits 不变，把 τ 调为 2，attention≈[0.4142,0.2929,0.2929]，message≈1.5858。较高 τ 在固定 logits 下更均匀；训练后 logits 也会适应，因此不能把这个 toy 变化当训练效果保证。",
      "恢复 τ=1，加入一个与第二个候选具有相同 logit=0、message=4 的新邻居。Denominator 变5，weights=[0.4,0.2,0.2,0.2]，message=2；原第一条 edge 的 logit 未变，attention 却从0.5降至0.4。",
      "每 head 重复计算。4 heads×8 channels、concat=True 输出 [N,32]；concat=False 通常平均得到 [N,8]。与单头32维比较时要控制总 width，否则收益可能来自参数量。",
      "可视化 raw logits、normalized weights、message contributions 与 edge perturbation 后 prediction change。比较不同 seeds、degree 和 sections 的稳定性；这些是解释线索，不能单靠 attention map 认定 causal cell–cell interaction。",
    ],
    whenToUse: [
      "Physical graph 已合理，但不同 neighbors 的信息质量不同，需要在固定候选集内学 feature-dependent weighting。",
      "希望比较 GCN 固定 coefficients 与 GAT 学习 coefficients 是否改善 boundary/rare-type prediction，并且有足够 validation donors。",
      "优点是可以检查每条边的计算路径，多头可提供不同局部表示；适合以数值追踪展示 message passing。",
    ],
    limits: [
      "Attention 是局部归一化权重；不同 degree、head 或 graph 下的 α 不能直接作为同尺度 biological strength 比较。",
      "经典 GAT 的 additive scoring 有排序表达限制；需要更灵活 query-dependent ranking 时可比较 GATv2，但更灵活不等于更可解释。",
      "多头随 E×heads 增加 attention 存储/计算；密集 Spatial graph 可能先受 memory 限制。",
      "Feature correlation、batch、模型重参数化和 graph prior 都可能影响权重；没有独立机制证据时，不把 edge attention 当 ligand–receptor effect。",
    ],
    howToUse: [
      "先让 MLP、GCN、GAT 使用相同 features、donor split、graph 和近似总 width，再比较性能与成本。",
      "从一个 target 的完整 incoming edge list 抽出 logits/weights/messages，验证 local softmax sum 与输出数值。",
      "记录 heads、concat、attention dropout、self-loop 与 edge_dim；核对 output shape，避免将 heads 误当 output classes。",
      "用 edge deletion、feature masking 和 relation-specific ablation 检查 prediction sensitivity，同时检查 perturbation 是否仍符合 data distribution。",
      "保存按 degree、boundary 和 donor 分层的 performance，检查同一结论在多个 seeds 与 graph radius 下是否成立。",
    ],
    tuning: [
      "Heads 可比较 1/2/4，同时固定总 hidden width 32；例如每头32/16/8维，避免容量变化与多头机制混淆。",
      "Attention dropout 候选 0/0.1/0.3 是训练随机删减消息的设置；推理要 eval mode，训练时 dropout 后 weights 未必再和为1。",
      "Temperature 教学候选 0.5/1/2 用于理解尖锐度；若实现扩展，记录插入位置并联合监测 logit scale 与 gradient，不宣称 τ 有 universal optimum。",
      "先确定 radius/k 的候选集，再调 attention；候选集过宽时可能让网络花容量抵消不合理 edges。",
    ],
    settings: [
      {
        name: "heads / out_channels / concat",
        start: "总 hidden width 32 下比较 1×32、2×16、4×8。",
        adjust:
          "输出层需要类别数维时核对 concat/average 和 head projection，不靠猜测 shape。",
      },
      {
        name: "attention dropout",
        start: "小范围比较 0/0.1/0.3，区分 feature dropout。",
        adjust:
          "Rare neighbors 容易被漏掉时减弱随机性，验证阶段固定 eval mode。",
      },
      {
        name: "edge features / self-loop features",
        start: "只添加部署时可获得且有定义的 distance/contact features。",
        adjust:
          "Distance 单位改变先重新 scaling；明确 self-loop 的 distance=0 与其他属性填充值。",
      },
      {
        name: "temperature extension",
        start: "教学 τ=1 对应原 softmax；τ 不是标准 GATConv 独立选项。",
        adjust:
          "需要实验时修改并验证 softmax 代码，记录版本，与原模型做 controlled comparison。",
      },
    ],
    modifications: [
      "GATv2 改变 scoring 运算顺序以增加 query-conditioned ranking 表达能力；可读其原论文 https://arxiv.org/abs/2105.14491，再用相同 biological protocol 比较。",
      "为 physical/feature relation 采用独立 attention，再 fusion；分别检查关系是否依赖 batch 或 label leakage。",
      "加入自身 feature skip path，帮助 head 保留 boundary information；attention 不能取代 graph validity 与独立验证。",
    ],
    pitfalls: [
      "将整张图的 edges 一起 softmax，会让一个 target 的权重受无关 nodes 影响；必须按 target neighborhood 分组。",
      "用 attention 最大的 edge 直接命名关键 signaling pathway，忽略 message 值与候选邻域。",
      "把训练 dropout 后 attention sum 不等于1当必然 bug；先区分 pre-dropout normalized α 与实际 stochastic coefficients。",
    ],
    example:
      "教学 target 接收 [1,4,0]，weights=[0.5,0.25,0.25]，得到1.5。第二条 edge 的 contribution=1，比 attention 最高的第一条 contribution=0.5更大。加入一个同值邻居后 output=2而第一条 α 降到0.4，说明局部竞争可以改变 attention，而无需任何真实 biological interaction 改变。",
    compareTo: [
      "gat",
      "bio-graph-construction",
      "bio-gcn-propagation",
      "attention-heads",
    ],
  },
  {
    id: "bio-graphsage-sampling",
    source: {
      label: "PyTorch Geometric: Scaling GNNs via Neighbor Sampling",
      url: "https://pytorch-geometric.readthedocs.io/en/latest/tutorial/neighbor_loader.html",
    },
    title: "Large Spatial Graphs：GraphSAGE 抽到谁，遗漏了谁？",
    englishTitle: "Neighbor Sampling, Rare Niches and Inductive GraphSAGE",
    category: "frontiers",
    level: "高级",
    duration: "27 分钟",
    icon: "⋈",
    summary:
      "从 seed loss 到 sampled computation graph，逐步算 rare-neighbor miss probability、memory 上界与 sampling variance，区分可迁移架构和真正的跨 donor 验证。",
    intuition:
      "一个目标 cell 周围有很多 neighbors，每次只问其中几个能节省计算；但稀有 immune neighbor 恰好可能一直没被问到。Sampling 决定模型每次看到什么证据，不能只当 memory 优化的透明开关。",
    core: "GraphSAGE 用共享 aggregator 从自身 features 与邻居 summary 生成表示，所以可应用于 feature/graph semantics 相容的新 nodes。NeighborLoader 从 seed nodes 向外采样计算依赖，forward 则从外向内；监督 loss 通常只对 seed nodes。Inductive architecture 不等于已完成 inductive evaluation，new-donor holdout 必须同时隔离 learned preprocessing、training features 和 labels。",
    equation:
      "mᵢ=mean{hⱼ:j∈sample(N(i),s)}; h′ᵢ=σ(W_self hᵢ+W_neigh mᵢ); P(miss rare)=C(d−r,s)/C(d,s) (without replacement)",
    mechanicsSteps: [
      "把 seed nodes 定义为当前 batch 需要计算 supervised loss 的 cells；其 sampled neighbors 只是提供 context。记录 seed IDs 与 local-to-global mapping，不能默认 batch 内所有 nodes 都拥有合法训练标签。",
      "以每 seed 第一跳采8、第二跳每节点采4为例，未去重时最多访问1+8+32=41个 node positions；256 seeds 上界为10,496。邻域重叠可降低 unique nodes，但还需计入 edges、activations、optimizer 和 multi-head memory。",
      "GraphSAGE mean aggregator 先算邻居均值，再用独立 self/neigh linear terms 或等价 concat projection。为了更新 seed 的第二层，先计算一跳节点的第一层表示，所以 computation 顺序与向外采样顺序相反。",
      "手算一个 boundary cell 的四个 neighbors feature=[0,0,10,10]。均匀无放回抽2个共有6种组合，sample mean=0/5/10的概率为1/6、4/6、1/6；expected mean=5，但 variance=25/3≈8.333。",
      "非线性使 expected output 不等于 full-neighborhood output：若 head 为 ReLU(mean−6)，上述 sampled outputs=0/0/4，期望2/3；完整邻域 mean=5时 output=0。Mean estimator 无偏不代表整个 neural prediction 无偏。",
      "Rare-niche case：20个 neighbors 中只有1个重要 rare neighbor，无放回采5个时 miss probability=15/20=0.75。采10个仍有0.5 miss probability；增加 epochs 增加看到它的机会，但不保证每次 prediction 稳定。",
      "训练时重新采样并 shuffle seeds；验证可固定 sampled graphs 保证可比，也可多次采样报告 prediction variation，或在可承受小图用 full-neighbor inference 比较。Sampling variation 不等于 calibrated biological uncertainty。",
      "最后把整个 donor/section graph 留出，用 training-fitted features 和同一建图规则生成新图。评估 rare-niche recall、degree-stratified error 与推理时间；random cell split 不能回答 new-donor generalization。",
    ],
    whenToUse: [
      "Large single-cell feature graph 或高分辨率 Spatial graph 无法 full-batch training，需要控制每批计算依赖。",
      "未来会接收新 donor/section，且 node features、gene order、graph relations 可保持可比。",
      "优点是 mini-batch training 可扩展，共享函数不依赖训练节点 ID；fanout 提供直接的计算预算控制。",
    ],
    limits: [
      "Rare informative neighbors 易被漏采；uniform sampling 的平均性能可能掩盖 rare-type 或 boundary 的退化。",
      "多层采样依赖数按 fanout 乘积增长，限制 seed batch size 并不使每层成本固定。",
      "在新 assay/panel 上 feature semantics 已变化时，inductive aggregator 不会自动解决 domain shift。",
      "Stratified sampling 若改变邻居组成，也改变 naive mean 的目标；需要明确设计或合适 weighting，不能一边过采样一边声称仍是原始 uniform neighborhood mean。",
    ],
    howToUse: [
      "先在小的 development section 做 full-neighbor baseline，确定可接受的 approximation error，再扩到全数据。",
      "把 input_nodes 限定为 train seeds，核对 batch seed prefix/mapping 后只对 seeds 算 loss；neighbors 可见性遵守既定 protocol。",
      "给每个 hop 配置 fanout，与模型层数一致；检查实际 sampled nodes/edges 和 peak memory，而不只看配置值。",
      "固定 validation cases 比较 fanout、repeat inference 与 full-neighbor outputs，尤其检查 rare neighbors 与高 degree nodes。",
      "用独立 donor/section graph 检验可迁移性，保存 gene preprocessing、sampler seed、replacement 与 inference policy。",
    ],
    tuning: [
      "两跳 fanout [8,4]、[16,8] 是预算候选；同时看 memory、rare-neighbor recall 和 prediction stability，不照搬 citation-network 设置。",
      "Seed batch size 可比较128/256，先观察 graph overlap 和 sampled-edge count；它不是本次 GPU 实际处理的 node 总数。",
      "Inference 可比较一次 sampling、多次 averaging 和 full-neighbor；averaging 减少采样波动，但不消除模型偏差或 donor shift。",
      "Mean 聚合适合简单稳定基线；max/pooling 可能保留稀有大信号，也更受异常值影响，需以 biological holdout 验证。",
    ],
    settings: [
      {
        name: "seed batch / loss mask",
        start: "例如256 train seeds；loss 仅索引这些 seeds 的合法 labels。",
        adjust:
          "检查 sampled neighbors 是否意外进入监督 loss，特别是 transductive held-out nodes。",
      },
      {
        name: "fanout / number of hops",
        start: "两层比较[8,4]与[16,8]，记录实际 unique nodes/edges。",
        adjust:
          "Rare neighbors 常被漏掉时增 fanout 或重新设计 sampling，不只增 hidden width。",
      },
      {
        name: "replace / sampling distribution",
        start: "本课手算采用 uniform without replacement；实现中显式记录。",
        adjust:
          "有放回会产生重复 samples；加权或分层 sampling 需重述估计目标。",
      },
      {
        name: "evaluation sampling",
        start: "固定一个可重复 protocol，并在小图比对 full-neighbor output。",
        adjust:
          "波动大时多次采样并报告分布；不能把 sampler variance 直接叫 posterior uncertainty。",
      },
    ],
    modifications: [
      "有可靠 relation labels 时可按 relation 分层采样，并清楚区分 weighted estimator 与有意改变的 aggregator。",
      "Graph partition/subgraph training 可在预算内保留更完整局部结构，但 partition boundary 也可能切掉重要邻居。",
      "结合 self-feature skip path，使缺少 rare context 时仍能依赖目标自身信息；用缺邻居 stress test 检查鲁棒性。",
    ],
    pitfalls: [
      "把256 seeds说成只处理256 cells，忽略依赖邻居与多层 activations。",
      "每 epoch training loss很稳就忽略 rare cell 的 sampling miss；总体平均可掩盖重要 minority failure。",
      "论文称 GraphSAGE inductive，就跳过 new-donor split；架构性质与实验验证是两个不同命题。",
    ],
    example:
      "教学 neighborhood 有20个 cells，其中1个携带关键 niche signal。Uniform sampling5个时75%的单次聚合看不到它。增加 fanout到10把 miss降至50%，但成本上升。你可以比较成本、rare-niche recall 与采样波动，决定是否需要 relation-aware sampling；不能由这组概率直接推断某真实 tissue 的最优 fanout。",
    compareTo: [
      "graphsage",
      "bio-graph-construction",
      "bio-gcn-propagation",
      "bio-gat-attention",
    ],
  },
  {
    id: "bio-count-vae",
    source: {
      label: "scvi-tools: scVI generative process, library scale and inference",
      url: "https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html",
    },
    title: "Count VAE Debugging：从一条 NB likelihood 追到 ELBO",
    englishTitle: "Count VAE Likelihood, Library Offset and ELBO Diagnostics",
    category: "generative",
    level: "高级",
    duration: "30 分钟",
    icon: "◈",
    summary:
      "在 scVI 概览之后，逐项核对 count unit、library scale、NB inverse dispersion 和 KL；用数值区分 depth effect、overdispersion 与真实 biological change。",
    intuition:
      "同一 cell state 多测一倍 UMIs，counts 可能整体提高；模型不应把这种变化全部当成新 cell type。Count VAE 让 library scale 解释总量，让 latent state 解释相对表达结构，再用 likelihood 表达测量波动。但分工是否正确仍取决于设计和假设。",
    core: "本课固定 observed library s、NB observation 与 diagonal-Gaussian q(z|x) 的教学模型；不声称等于所有 scVI settings。输入 raw integer counts X:[N,G]、batch/covariates 与 gene order；encoder 输出 [N,K] 的 mean/log-variance，decoder 给 normalized expression ρ 与 positive inverse dispersion θ，μ=sρ。训练 maximize ELBO=expected log-likelihood−KL。ZINB、latent library 和其他 configuration 会改变目标中的项。",
    equation:
      "μ_ng=s_nρ_ng; Var(x_ng)=μ_ng+μ_ng²/θ_g; P_NB(0)=(θ/(θ+μ))^θ; KL(q||N(0,I))=½Σ_k(m_k²+v_k−log v_k−1)",
    mechanicsSteps: [
      "检查 count layer：非负 integer UMI counts、固定 gene order、明确 panel 与 assay。Normalized/log/scaled values 不能直接当同一种 count likelihood 的 observations；features用于画图与模型输入 layer 应分开记录。",
      "用同一表达比例ρ=[0.2,0.8]、library s=10得到μ=[2,8]；s=20得到μ=[4,16]。这是总测量规模变化；ρ相同不代表每 cell 的真实 RNA absolute abundance已被识别。",
      "NB采用mean μ与inverse dispersion θ。Gene1在μ=2、θ=4时variance=2+4/4=3，P(0)=(4/6)^4≈0.1975；library翻倍使μ=4时variance=8、P(0)=1/16。Zero probability会随depth自然改变。",
      "同一μ=2把θ从4降到1，variance从3增到6，P(0)从约0.1975增到1/3。更小inverse dispersion表示更大overdispersion，不是更少噪声；θ→∞时接近Poisson。",
      "Encoder的posterior参数不是直接的gene means。若K=2、m=[1,0]、v=[1,1]，对standard Normal prior的KL=0.5；若m=[0,0]、v=[1,1]，KL=0。Reparameterization z=m+sqrt(v)⊙ε把sampling接入梯度。",
      "若该cell的expected log-likelihood为−12、KL=0.5，则ELBO=−12.5，negative ELBO loss=12.5。Warmup中KL weight β=0.2时weighted objective=−12.1；这不是同一个β=1的ELBO，不能直接用变化中的total数值比较模型fit。",
      "分别记录reconstruction、KL及按gene/depth/batch分层的posterior predictive checks。KL≈0可能是posterior collapse，也可能数据无需很多latent信息；需结合decoder是否忽略z、下游held-out performance与capacity判断。",
      "最后做biological confounding audit：若young全在batch A、old全在batch B，decoder加batch covariate也无法仅靠这些数据识别age和batch的独立效应。Latent mixing、likelihood提升和真实age mechanism是不同证据。",
    ],
    whenToUse: [
      "scVI或其他Count VAE训练异常、latent由library size主导、rare states丢失时，用逐项数值检查定位原因。",
      "需要理解NB/ZINB与library conditioning如何影响representation、decoded expression及posterior predictive checks。",
      "优点是likelihood与latent regularization可以拆开诊断；比只看一条total loss曲线更容易发现单位与目标缩放错误。",
    ],
    limits: [
      "没有spike-ins或额外假设时，library adjustment不自动恢复absolute transcript abundance；relative-expression变化与总RNA变化需区别。",
      "本课β=1目标只写observed library与一个z的KL；latent library模型还需相应variational项，不能照抄缺项公式。",
      "NB能产生很多zeros；zeros多本身不证明存在额外zero-inflation机制，选择likelihood应看assay与predictive fit。",
      "Count VAE不会自动解决donor pseudoreplication、perfect confounding、spatial segmentation或跨panel不兼容。",
    ],
    howToUse: [
      "从一个mini-batch打印count min/max、integer check、library totals、gene order与batch/donor cross-table；先核数据单位。",
      "固定一小批cells，手算一两个genes的μ、variance与P(0)，对照模型返回distribution parameters，确认θ的参数化。",
      "记录negative log-likelihood与KL的reduction：按gene求和还是平均、按cell平均还是总和；两项尺度改变会改变有效regularization。",
      "比较NB/ZINB、latent capacity和KL schedule时，在相同held-out cells/genes/units上评价，并补充new-donor biological validation。",
      "保存model version、likelihood、dispersion mode、observed/latent library与covariates；API spellings按安装版本确认，不能从概念名称推测参数字符串。",
      "用于age或disease预测时，representation training的数据可见范围必须与inductive/transductive声明一致；最终统计推断以donor/design为单位。",
    ],
    tuning: [
      "Latent K可比较10/20/40；看rare-state与new-donor表现，不把更高reconstruction fit自动等同于更好biology。",
      "Dispersion共享方式先从较少参数开始比较gene与gene-batch候选；小batch或低count genes的参数可能不稳定。",
      "KL warmup可作为训练策略候选，记录weight曲线；不要只追求更小KL或更小total loss，需检查decoder对z的利用。",
      "Library offset错误通常先表现为depth-dependent residual；先修s/ρ定义再提高decoder容量，避免网络记忆测量错误。",
    ],
    settings: [
      {
        name: "count layer / feature order",
        start: "明确raw-count layer与固定gene list，保留原始counts用于检查。",
        adjust:
          "出现非integer、负值或新panel缺gene时先修输入contract，不靠更换loss隐藏问题。",
      },
      {
        name: "library treatment",
        start: "显式选择observed size或latent library，写清s的单位。",
        adjust:
          "外部size factors改变ρ含义时重新核decoder constraints；不要假定所有设置均sum-to-one。",
      },
      {
        name: "inverse dispersion θ",
        start: "采用Var=μ+μ²/θ，记录gene或gene-batch共享方式。",
        adjust:
          "低count下不稳定时减少参数并检查predictive calibration，别把更小θ误读为更低variance。",
      },
      {
        name: "KL schedule / reductions",
        start: "报告β与reconstruction/KL两项尺度；标准ELBO对应β=1。",
        adjust:
          "Loss突变先查schedule和sum/mean；posterior collapse需结合z敏感性与validation诊断。",
      },
    ],
    modifications: [
      "有可信cell labels时比较scANVI；有protein或其他modality时用对应observation model，不把不同单位直接当RNA counts。",
      "Spatial mixture inference需要显式mixture/abundance模型；单cell decoder提供reference并不自动产生bin-to-cell assignment。",
      "将frozen latent与raw-feature/PCA baseline接同一donor-level head，判断复杂representation是否真有额外价值。",
    ],
    pitfalls: [
      "只比较不同gene sets上的total ELBO：观察维度和求和尺度不同，数值不能直接排名。",
      "把近零KL一律诊断为bug，或把大KL一律解释为更多biology；两者都需要上下文与独立验证。",
      "在同一模型里移除batch即可声称保留disease；完全confounded设计无法由算法创造缺失的对照。",
    ],
    example:
      "教学cell在两gene panel中ρ=[0.2,0.8]、s=10，decoder mean=[2,8]。第一gene θ=4，variance=3、P(0)≈0.1975。只把s翻倍，mean变[4,16]、第一gene variance=8，不能据此说cell state变了。若reconstruction log-likelihood=−12和KL=0.5，ELBO=−12.5；这些可手算的量是检查实现的入口，不是实际数据的测量结论。",
    compareTo: [
      "scvi",
      "count-likelihoods",
      "autoencoder-vae",
      "bio-contrastive-design",
    ],
  },
  {
    id: "bio-contrastive-design",
    source: {
      label:
        "Chuang et al.: Debiased Contrastive Learning — false-negative sampling",
      url: "https://arxiv.org/abs/2007.00224",
    },
    title: "Biological Contrastive Learning：该拉近谁，又不该推远谁？",
    englishTitle: "Biological Positives, Augmentations and False Negatives",
    category: "representation",
    level: "高级",
    duration: "29 分钟",
    icon: "↔",
    summary:
      "把positive definition当生物假设，把negative sampling当实验设计；逐步计算InfoNCE并检查augmentation是否抹掉要学的phenotype。",
    intuition:
      "同一个cell的两种轻微测量扰动可以希望靠近；两个不同donors的同类型cells也可能相似；紧邻的tumor与immune cells却不应被强迫成为同一identity。Contrastive loss只执行你给它的‘相同/不同’规则，不会自行判断哪条规则符合biology。",
    core: "输入为observations与pair/augmentation specification；encoder f输出representation h，projection head g输出用于contrastive loss的z，通常L2 normalize后比较similarity。Positive与negative相对于学习target定义，不能等同于‘同barcode’与‘不同barcode’。本课使用单positive InfoNCE教学公式；Supervised Contrastive Learning与GraphST的具体objectives不同，不把本公式冒充所有biological contrastive methods。",
    equation:
      "ℓ_i=−log[exp(s(z_i,z_p)/τ)/(exp(s(z_i,z_p)/τ)+Σ_n exp(s(z_i,z_n)/τ))]; h=f(x), z=normalize(g(h))",
    mechanicsSteps: [
      "先明确target：cell identity、continuous state、niche或cross-modal alignment。Positive只应保留该target需要的不变量；同cell type并不意味着age、activation或perturbation state可以被删去。",
      "为同一cell生成两份views时，明确augmentation机制。Count thinning可写x′_g~Binomial(x_g,p)，expected library变为p×s；这是教学measurement perturbation，不能保证极低counts下marker仍可见。",
      "对Spatial views区分nearby与same identity：local context可以帮助domain任务，却可能混合boundary两侧的不同types。距离是positive候选线索，不是同类ground truth；section边界与registration仍需检查。",
      "Encoder产生h:[B,D]，projection head产生z:[B,d]并normalize。Loss作用在z，而downstream可以比较h与z；head不是最终cell-type classifier，也不意味着每个dimension对应特定gene program。",
      "手算scaled similarities s/τ=[ln2,0,0]，其中第一项为positive，其余为两个negatives。Exponentials=[2,1,1]，positive probability=2/4=0.5，loss=ln2≈0.6931。",
      "若再加入一个与positive同生物state的cell却标为negative，且scaled score=ln2，denominator变6，positive probability=1/3，loss=ln3≈1.0986。优化会把这个false negative推开；loss增大不意味着原representation的biology更差。",
      "删除该false negative会改变denominator与training objective；若已有可靠labels，可考虑multiple positives或SupCon。不能用test labels筛negative；pseudo-label错误也可能把不同states过度拉近。",
      "训练后冻结encoder，按held-out donors做linear probe/retrieval，并检查rare-state recall、batch predictability与neighborhood stability。更低contrastive loss、更均匀embedding或更漂亮UMAP都不能单独证明生物信息保留。",
    ],
    whenToUse: [
      "标签有限但能构造可信views或matched modalities，希望先学representation再接小型head。",
      "有明确spatial context任务，能独立检验positive relation对domain与boundary的影响。",
      "优点是pair规则直接表达希望保留的不变性，并可用augmentation ablation检查模型究竟依赖什么。",
    ],
    limits: [
      "Augmentation会决定信息被保留或丢弃；对image有效的强crop/color jitter，不能未经验证直接转成gene masking或coordinate扰动。",
      "大量同类型cells使random negatives更容易包含false negatives；更大batch不保证每个biological target都受益。",
      "把同type跨donor cells全设positive可能抹掉donor phenotype；把同donor全设positive又可能学到batch identity。",
      "False-negative修正依赖目标与假设；unknown states、label noise和continuous trajectories使‘真正negative’本身不总明确。",
    ],
    howToUse: [
      "写一张pair specification：anchor、positive理由、negative来源、不能改变的biology、可能的shortcut；先让几十个实际pairs可视化。",
      "建立无augmentation、轻augmentation和单项augmentation对比；监测key markers、library size与rare-state coverage。",
      "实现denominator时排除anchor自身，保留positive；有多个positives时使用明确multi-positive objective，不随意套单positive公式。",
      "让mini-batch包含多个development donors，检查positive/negative是否被batch或panel轻易区分；test donors不参与调pair策略。",
      "比较frozen h、projection z与PCA/scVI baseline，用相同donor-levelprobe、retrieval labels和held-out protocol。",
      "阅读实际biological方法时逐项核objective。例如GraphST的clustering模块使用spot–local-summary与corrupted graph关系，不能简单说它就是相邻cells上的SimCLR。",
    ],
    tuning: [
      "Temperature候选0.1/0.2/0.5需与normalized similarity、batch composition一起比较；更小τ在固定scores下更重视hard examples，也可能强化false negatives。",
      "Count thinning retention p=0.8/0.9可作为小范围候选；低UMI或targeted panel上应更谨慎，检查是否擦掉定义state的少数markers。",
      "Negative数目和来源比单纯batch size更关键；固定训练预算时比较donor-balanced sampling与naive random sampling。",
      "Projection dimension32/64与shallow head是可比较候选；同时评价encoder h与z，避免只追求contrastive空间的training指标。",
    ],
    settings: [
      {
        name: "positive definition",
        start:
          "先定义需要保留的target，再选same-cell views或可信matched pairs。",
        adjust:
          "若rare/continuous states消失，审查positive是否过宽；不要只调learning rate。",
      },
      {
        name: "negative pool / exclusions",
        start: "记录来自哪些donors/types，显式排除anchor自身。",
        adjust:
          "发现false negatives时比较multi-positive或masking策略，不能使用test labels做清洗。",
      },
      {
        name: "temperature / normalization",
        start: "明确L2 normalization与τ候选0.1/0.2/0.5。",
        adjust:
          "先检查similarity分布及gradient，再调τ；raw dot product的scale还受embedding norm影响。",
      },
      {
        name: "augmentation strength",
        start:
          "单项轻度扰动并保留原view；thinning需更新library interpretation。",
        adjust:
          "Marker缺失、boundary混合或phenotype probe变差时减弱或更换augmentation。",
      },
      {
        name: "encoder vs projection head",
        start: "保存h与z，downstream用同一head分别评估。",
        adjust:
          "训练loss改善而h无益时检查shortcut、pair design与head capacity。",
      },
    ],
    modifications: [
      "可信class labels可用于SupCon多positive学习，参考原论文 https://arxiv.org/abs/2004.11362；生物应用还需保护class内有意义的continuous state。",
      "RNA–protein或RNA–image matched observations可用cross-modal contrastive objective；matching error与不同resolution应进入quality checks。",
      "GraphST为Spatial context提供具体方法实例：https://www.nature.com/articles/s41467-023-36796-3；其不同任务模块的pair definitions与loss要分别读，不能将generic toy公式视为复现。",
    ],
    pitfalls: [
      "将每个不同barcode都当真正negative，会把同state cells不必要地推开。",
      "把所有spatial neighbors当same-type positives，可能牺牲cell boundary来换取更低loss。",
      "用更低训练loss断言representation更好，忽略negative数量变化本身就改变loss基线。",
    ],
    example:
      "教学InfoNCE原分母2+1+1，positive probability=0.5；加入scaled score同为ln2的false negative后，分母变6、loss从ln2增为ln3。这个变化完全可由pair design造成。对于Single-cell任务，正确问题是该cell究竟应与anchor在目标state上相近，及这种信息是否在training data中可信可用。",
    compareTo: [
      "contrastive-learning",
      "supervised-contrastive",
      "bio-graph-construction",
      "bio-count-vae",
    ],
  },
];
