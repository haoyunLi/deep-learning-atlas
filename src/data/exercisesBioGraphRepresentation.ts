import type { Exercise } from "./exerciseTypes";

export const bioGraphRepresentationExercises: Record<string, Exercise[]> = {
  "bio-graph-construction": [
    {
      id: "bio-graph-construction-mechanism",
      kind: "mechanism",
      question:
        "同一 section 的 A/B/C 坐标为 0/3/10 μm，使用无 self-loop 的 radius graph，R=4。另一 donor 的 D 坐标也是 0 μm。哪些 physical edges 合法？",
      options: [
        "A—B 与 A—D；坐标相同就相邻",
        "只有 A—B；D 属于不同 donor/section，C 在 radius 外",
        "A—B 与 B—C；每个 cell 必须至少有一个邻居",
        "A—C；只要 expression 相似就属于 physical edge",
      ],
      answer: 1,
      explanation:
        "同一有效 coordinate system 内，A—B 距离3≤4；B—C距离7、A—C距离10都超出radius。D的局部坐标不能与另一donor直接比较。C isolated 是radius规则的合法结果，不能为连通而偷偷改成kNN。",
    },
    {
      id: "bio-graph-construction-decision",
      kind: "decision",
      question:
        "预测新 donor 的 cell identity 时，physical GNN 在 tissue boundary 出错，而 feature-only MLP 较好。最有信息量的下一步是什么？",
      options: [
        "把 radius 调到最大，让所有 cells 相互帮助",
        "把测试 donor 的真实 labels 加进 graph，确保同类相连",
        "只汇报 interior cells，boundary cells 当作 noise 删除",
        "固定 split/features，比较 physical、feature 与双分支 graph，并分层检查 boundary error",
      ],
      answer: 3,
      explanation:
        "错误可能来自 physical proximity 与 cell identity 的关系不一致，尤其 boundary 存在 heterophily。控制其他变量后比较 graph prior 才能定位原因；不要通过 test labels 建图或删除困难区域制造改进。",
    },
  ],
  "bio-gcn-propagation": [
    {
      id: "bio-gcn-propagation-mechanism",
      kind: "mechanism",
      question:
        "两个相连 nodes 的 feature=[0,10]。GCN teaching operator 使用 A+I、symmetric normalization、W=I、无 activation。再取 0.8x+0.2Sx，一步 output 是什么？",
      options: [
        "[1,9]；Sx=[5,5]，residual 保留部分 boundary contrast",
        "[0,10]；有 self-loop 就不会混合",
        "[4,6]；0.8 表示邻居占比",
        "[5,5]；residual 与 self-loop 完全相同",
      ],
      answer: 0,
      explanation:
        "带self-loop后degree=[2,2]，S每项为1/2，所以Sx=[5,5]。0.8[0,10]+0.2[5,5]=[1,9]，contrast从10降到8。Self-loop使自身可参与；residual显式控制保留自身的比例，作用不同。",
    },
    {
      id: "bio-gcn-propagation-decision",
      kind: "decision",
      question:
        "GCN 从2层加到6层后 map 更连续，但 rare-type recall 与独立 section accuracy 都下降。哪项应优先做？",
      options: [
        "采用6层，因为连续性说明去噪更好",
        "继续加层；任何性能下降都说明receptive field不足",
        "检查错误边和每层表示变化，比较减层、self-feature skip与boundary分层表现",
        "用smoothed values当独立raw counts做DE，证明新domain",
      ],
      answer: 2,
      explanation:
        "连续性是graph mixing偏好的结果，并不是独立biological证据。需要区分oversmoothing、错误邻域、优化问题等；rare states和held-out表现已经提示目前的平滑可能过度。Smoothed observations也改变了相关结构与测量分布。",
    },
  ],
  "bio-gat-attention": [
    {
      id: "bio-gat-attention-mechanism",
      kind: "mechanism",
      question:
        "同一 target 的 logits=[ln2,0,0]、messages=[1,4,0]，τ=1。哪项同时正确描述 attention 与 contribution？",
      options: [
        "weights=[2,1,1]，总message=6",
        "第一条edge权重最高，所以它的contribution必定最大",
        "weights=[0.5,0.25,0.25]，第二条contribution=1最大，总message=1.5",
        "三个messages先平均，所以output恒为5/3",
      ],
      answer: 2,
      explanation:
        "Softmax denominator=2+1+1=4。Contributions=[0.5×1,0.25×4,0.25×0]=[0.5,1,0]。最高attention未必贡献最大；还要考虑投影后message的方向与大小。",
    },
    {
      id: "bio-gat-attention-decision",
      kind: "decision",
      question:
        "在第二张 section 中，同类edge的attention从0.5降到0.3，但该target的degree明显增加。可以直接说signaling变弱了吗？",
      options: [
        "不能；先核候选邻域、logits、message contributions与独立biology证据",
        "可以；attention就是跨组织统一的interaction strength",
        "可以；softmax已消除所有degree影响",
        "只需增加heads，便能把attention变成causal effect",
      ],
      answer: 0,
      explanation:
        "Attention denominator取决于同一target的候选neighbors。增加邻居可能在原logit不变时降低原edge权重；不同heads/graphs还存在其他差异。它可提供计算解释线索，但单独不能证明signaling或causal effect变化。",
    },
  ],
  "bio-graphsage-sampling": [
    {
      id: "bio-graphsage-sampling-mechanism",
      kind: "mechanism",
      question:
        "一个cell有20个neighbors，其中1个是rare informative neighbor。Uniform without replacement采5个，单次miss probability是多少？",
      options: [
        "1/20=5%",
        "5/20=25%",
        "0；每个epoch最终都会看到它",
        "15/20=75%",
      ],
      answer: 3,
      explanation:
        "该rare neighbor被抽中的概率是5/20，未被抽中为1−5/20=15/20。多轮训练可能增加累计看到它的机会，但当前单次aggregation仍有75%的概率缺少它，也不保证单次推理稳定。",
    },
    {
      id: "bio-graphsage-sampling-decision",
      kind: "decision",
      question:
        "训练 GraphSAGE 后想证明能推广到新 donors，哪种 evaluation 最符合这个结论？",
      options: [
        "在同一donor内随机拆cells，test labels不进loss就足够",
        "整donor/section graph留出；training-fitted preprocessing后在新图推理，并检查sampling波动",
        "用所有donors fit PCA与encoder，再把测试labels隐藏后称完全inductive",
        "不需要evaluation，GraphSAGE名字中的inductive已保证跨donor成功",
      ],
      answer: 1,
      explanation:
        "Inductive architecture提供处理新nodes的函数，但不保证特定biological shift下的泛化。独立donor/section、合法preprocessing与清楚的数据可见范围才对应new-donor问题；sampling policy也应与实际部署一致。",
    },
  ],
  "bio-count-vae": [
    {
      id: "bio-count-vae-mechanism",
      kind: "mechanism",
      question:
        "Count VAE固定ρ=[0.2,0.8]和θ_gene1=4。Library s从10变20时，gene1的mean、variance分别怎样变化？",
      options: [
        "mean 2→4，variance 3→8；因为Var=μ+μ²/θ",
        "mean 2→4，variance 2→4；NB variance始终等于mean",
        "mean不变，variance 3→6；library只影响noise",
        "mean 2→4，因此已证明cell state改变",
      ],
      answer: 0,
      explanation:
        "μ=sρ，所以2→4；variance分别是2+4/4=3与4+16/4=8。ρ保持相同，这个toy变化可完全由library scale解释；不能单靠counts增大就推断cell state变化。",
    },
    {
      id: "bio-count-vae-decision",
      kind: "decision",
      question:
        "所有young donors都在batch A，所有old donors都在batch B。scVI得到良好mixing，下一步应如何解释age signal？",
      options: [
        "Mixing漂亮证明batch已去除且age完整保留",
        "KL越小就越能分开age与batch",
        "增加latent dimensions即可创造缺少的对照",
        "当前design无法区分age与batch；需交叉覆盖样本或限制结论，并单独验证biology",
      ],
      answer: 3,
      explanation:
        "Perfect confounding属于identifiability/design问题。Decoder加入batch、latent混合或更好likelihood都不能替代缺失的对照。需要能区分两因素的额外数据/假设，并明确证据范围。",
    },
  ],
  "bio-contrastive-design": [
    {
      id: "bio-contrastive-design-mechanism",
      kind: "mechanism",
      question:
        "Single-positive InfoNCE的exp(s/τ)为positive=2、negatives=1和1。再加入一个值为2的false negative，loss如何变化？",
      options: [
        "ln2→0，因为多一个相似cell有助于prediction",
        "ln2→ln3，因为positive probability从2/4降到2/6",
        "不变；false negative自动从denominator排除",
        "ln2→ln6，因为positive不应留在denominator",
      ],
      answer: 1,
      explanation:
        "原loss=−log(2/4)=ln2；加入false negative后loss=−log(2/6)=ln3。Objective把该cell当negative，所以优化会推远它。这展示pair specification的问题，不能把loss变大直接解释成biology变差。",
    },
    {
      id: "bio-contrastive-design-decision",
      kind: "decision",
      question:
        "目标是保留同cell type中的activation gradient。把所有同type cells都设positive后gradient消失，训练loss却降低。最合理的修改是什么？",
      options: [
        "继续扩大positive集合，loss越低越好",
        "用test activation labels直接筛positive，保证最终指标",
        "重新定义positive不变量，比较可信same-cell轻扰动views并用held-out donors检查gradient保留",
        "把所有neighbor都当negative，必然恢复真实trajectory",
      ],
      answer: 2,
      explanation:
        "原positive规则鼓励整个type内表示趋同，可能删除任务需要的activation差异。应先修pair/augmentation hypothesis，再独立验证；不能靠test labels调设计，也没有一种negative规则自动恢复真实biology。",
    },
  ],
};
