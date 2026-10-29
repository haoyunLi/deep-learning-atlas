import type { Lesson } from "./lessons";

export const biologyBridgeLessons: Lesson[] = [
  {
    id: "motif-pwm-scoring",
    source: {
      label: "Grant et al., FIMO (2011)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3065696/",
    },
    supplementarySources: [
      {
        label: "MEME Suite FIMO documentation",
        url: "https://meme-suite.org/meme/doc/fimo.html",
      },
    ],
    title: "PWM：一段 DNA 像某个 TF motif，证据有多强？",
    englishTitle:
      "Position Weight Matrices, Background Models and Motif Scanning",
    category: "sequence",
    level: "进阶",
    duration: "16 分钟",
    icon: "▥",
    summary:
      "把 DNA motif 变成逐位置的 likelihood-ratio score，理解 background、pseudocount、reverse complement 与多重检验怎样改变结论。",
    intuition:
      "同样看到 AT，在 A/T 本来就很多的区域里不算稀奇，在 G/C 很多的区域里则更意外。PWM 把这种比较写成数值：这段 DNA 在 motif 模型下出现的可能性，相对 background 模型高了多少？先读懂这个比较，再看它为什么还不能证明 TF 正在结合。",
    core: "从 aligned binding-site sequences 得到每个位置的 A/C/G/T counts，加入按 background 分配的 total pseudocount，再转为位置概率矩阵。对一段等长 DNA，累加 log2[p_j(base)/q(base)] 得到 motif 相对 zero-order background 的 log-likelihood ratio。位置独立是模型假设；motif score 不是 TF occupancy、TF activity 或 binding 的 posterior probability。FIMO 还根据 background 下的 score 分布计算 P value，并处理大量扫描位置的 multiple testing。",
    equation: "p_j(b)=(n_jb+αq_b)/(N_j+α); S(s)=Σ_j log2[p_j(s_j)/q(s_j)]",
    mechanicsSteps: [
      "先固定 genome assembly、region coordinates、motif version 与 strand convention；一条 peak 的 coordinate 不是 motif 本身。",
      "将已对齐的 sequences 按位置计数。教学两位置 counts 为[8,1,1,0]和[0,1,1,8]，列顺序均为 A,C,G,T，每位置 N=10。",
      "选 zero-order background q。均匀 q=.25，total pseudocount α=1 时，第一位置 P(A)=8.25/11=.75，第二位置 P(T)=.75。",
      "对 AT 逐位置求 ratio=.75/.25=3，因此 S=log2(3)+log2(3)=3.1699 bits。分数是两个生成模型的相对支持，不是3.17%的概率。",
      "若 background G/C fraction=.8，则 q_A=q_T=.1；重新加 pseudocount并评分。同一个 AT 会更不符合这个 background，因此其相对分数提高。不能改变 background 后仍沿用旧 P value。",
      "在每个候选位置扫描 motif 及适用的 reverse-complement orientation。相同 region 中多个 hits 需要保留 coordinates和strand；不能只保存最高分而忘记搜索空间。",
      "用 score 的 null distribution得到位置层面的 P value，再按扫描集合评估 q value；改变 peak set、motif set或两条strand都会改变检验集合。",
      "将 motif hit 与 cell-type-specific accessibility、TF availability、binding assay和perturbation证据结合。相似 motif 的 TF family可能无法仅凭序列区分。",
    ],
    whenToUse: [
      "有候选 regulatory regions，想筛选哪些 TF families 具有 sequence compatibility。",
      "比较 SNV 前后同一 motif 的 score变化，形成待验证的 regulatory variant hypothesis。",
    ],
    limits: [
      "PWM通常忽略位置间依赖、DNA shape、cofactor和chromatin context；强 motif hit 不能证明实际 binding。",
      "一个 motif可能对应多个TF；TF transcript较高、ATAC peak开放和motif出现是不同层面的证据。",
      "P value取决于background和搜索定义；它不是该位点具有生物功能的概率。",
    ],
    howToUse: [
      "先确认FASTA与peaks使用同一genome build，排查off-by-one坐标和chr命名。",
      "从与研究物种和TF相关的curated motif库开始，记录库版本及TF-to-motif映射。",
      "选择与问题相符的background区域，检查GC差异；用matched background做sensitivity analysis。",
      "同时记录score、P/q value、坐标、strand、accessibility和表达背景，不只输出一个TF名字。",
      "先在已知positive和sequence-shuffled negative上验证方向，再扩展到全部候选regions。",
    ],
    example:
      "同样的AT在uniform background中为3.1699 bits；改变GC背景会改变其相对罕见性。对variant做reference/alternate扫描时，固定motif与background，比较Δscore，再询问该region是否在目标cell type开放。",
    settings: [
      {
        name: "background q",
        start: "从目标物种/区域的A,C,G,T频率或明确的matched background开始。",
        adjust:
          "hits随GC变化而大幅改变时，比较GC-matched background并重新计算null。",
      },
      {
        name: "total pseudocount α",
        start: "按所用工具文档记录total count如何分到四个bases；toy使用α=1。",
        adjust:
          "zero counts或小N使结果不稳定时评估smoothing，但不要把不同约定的数值直接比较。",
      },
      {
        name: "threshold and search family",
        start: "预先声明使用score、P value还是q value及扫描范围。",
        adjust:
          "扩展motifs/regions/strands后重新处理multiple testing；不继承旧q threshold的解释。",
      },
      {
        name: "orientation and sequence window",
        start:
          "核对reference orientation和reverse complement，保留完整hit coordinates。",
        adjust:
          "reference/alternate比较异常时先核坐标与strand，再改window长度。",
      },
    ],
    modifications: [
      "用dinucleotide background或更丰富的sequence model处理依赖，但要重估对应null。",
      "将sequence分支与ATAC、histone marks等context features组合，并做held-out chromosome/region evaluation。",
    ],
    pitfalls: [
      "把PWM当P值矩阵，或把bits直接解释成binding probability。",
      "TF family共享motif却只报告单一TF。",
      "用同一组positive peaks同时学习motif、选择threshold和评价泛化。",
    ],
    compareTo: [
      "naive-bayes",
      "transformer",
      "regulon-tf-activity",
      "enhancer-gene-abc",
    ],
    tuning: [
      "先检查background mismatch，再放宽motif threshold；否则可能只是富GC区域系统性抬高某类motif。",
      "α控制small-count smoothing。沿用工具已说明的pseudocount convention，并对稀疏motif做敏感性分析；本教学α=1不是通用推荐。",
      "候选hits太多时区分更严格q value、限制candidate regions和减少重复motifs各自改变的假设。",
      "不能为得到想要的TF而反复改变background或筛选集合且不报告。",
    ],
  },
  {
    id: "enhancer-gene-abc",
    source: {
      label: "Fulco et al., Activity-by-Contact (2019)",
      url: "https://www.nature.com/articles/s41588-019-0538-0",
    },
    supplementarySources: [
      {
        label: "ABC model implementation",
        url: "https://github.com/broadinstitute/ABC-Enhancer-Gene-Prediction",
      },
    ],
    title: "ABC：远处的 enhancer 应该连到哪个 gene？",
    englishTitle: "Activity-by-Contact and Enhancer–Gene Linking",
    category: "frontiers",
    level: "进阶",
    duration: "17 分钟",
    icon: "↔",
    summary:
      "把 enhancer activity 与 promoter contact 合成相对贡献，逐步理解候选集合、分母、距离及功能验证的关系。",
    intuition:
      "一个 enhancer 像有音量的发言者，contact 则描述它与某个 promoter 接触的机会。声音大却接触很少，或接触很多却几乎没有 activity，乘积都可能不高。ABC 再把这个乘积放到同一 gene 的全部候选 elements 中比较，因此其他候选也会影响它的相对分数。",
    core: "ABC 先计算每个 element 的 activity A 与 element–gene contact C 的乘积，再除以同一 gene 的候选乘积总和。原始模型结合 chromatin accessibility 与 H3K27ac 估计 activity；实际输入和默认设置需按实现版本核对。因此，ABC score 表示给定候选集合中的 relative regulatory input，而不是每个 cell 中已测得的调控比例。Nearest gene、3D contact 和 functional target 分别描述距离、接触与功能证据，不能互相替代。",
    equation: "w_eg=A_e C_eg; ABC_eg=w_eg/Σ_e′∈candidate(g) A_e′C_e′g",
    mechanicsSteps: [
      "固定gene/promoter、候选elements、坐标版本和cell context；先明确分母包含哪些候选。",
      "对三个候选E1,E2,E3给定activity=[4,2,1]、contact=[.1,.2,.4]。这里activity是toy输入，不模拟assay normalization。",
      "逐元素相乘得到weights=[.4,.4,.4]。E3虽然activity最低，但较高contact补偿了这一点。",
      "对同一gene求total=1.2，三个ABC scores均为1/3。归一化没有把每个element的activity独立转换成probability。",
      "仅把E2 contact改为.1，weights=[.4,.2,.4]、total=1，因此scores=[.4,.2,.4]。E1 numerator没变，但score从1/3增至.4。",
      "改变candidate window、过滤策略或加入promoter会改变分母；比较不同运行结果时同时检查candidate universe。",
      "对不同genes分别归一化，某个enhancer可能连多个genes；不能把对不同gene的scores直接相加当全局概率。",
      "用independent CRISPRi/CRISPRa、reporter或其他functional证据检查候选link；不同assay保留的chromatin/context不同，结论不能机械等同。",
    ],
    whenToUse: [
      "结合accessibility、histone或contact数据，对candidate enhancer–gene links进行可解释排序。",
      "在Spatial/Single-cell研究中，为开放region与表达gene之间构建有来源的候选prior，而不是仅按最近gene连接。",
    ],
    limits: [
      "Activity和contact都依赖测量质量与cell composition；bulk信号可能混合不同cell types。",
      "ABC的归一化相对贡献是假设，不是对每个cell独立测得的causal coefficient。",
      "CRISPRi等validation也有targeting效率、off-target和context限制；一个negative结果不总是无功能。",
    ],
    howToUse: [
      "按目标cell context选择相匹配的accessibility/activity/contact数据，记录是否跨context借用。",
      "用明确的candidate regions、gene set和coordinate build建立一致输入表。",
      "保留A、C、A×C和分母，便于追踪score改变来自哪个环节。",
      "以nearest-gene和distance-only作为简单baselines，比较同一held-out functional验证集合。",
      "记录TP/FP代价和验证预算，选择能实际检验的candidate links，并报告candidate universe。",
    ],
    example:
      "本课实验固定 E1 的 activity 和 contact，只把 E2 contact 从 .2 改为 .1：E1 score 由 1/3 增至 .4，原因是分母变小。Bio/CS 的关联实验改为增删第三个候选，使用另一组 synthetic inputs；两例数值不同，但都在检验“分子不变，分母改变”这一机制。",
    tuning: [
      "先检查coordinate和候选集合，再调score threshold；系统性错配不是阈值能修复的。",
      "比较activity/contact替代输入时保持candidate universe固定，以免把分母变化误判为新assay效果。",
      "阈值取决于版本、context与validation目标；不要把文献某数据集cutoff当普遍真值。",
      "跨cell type比较时同时展示raw numerator和normalized score，区分activity变化与竞争变化。",
    ],
    settings: [
      {
        name: "candidate universe",
        start:
          "按使用的ABC版本定义window及promoter inclusion，并记录完整candidate list。",
        adjust: "窗口改变后重算全部scores；先检查是否丢失已知distal targets。",
      },
      {
        name: "activity construction",
        start: "记录accessibility/H3K27ac等输入与normalization；toy直接给定A。",
        adjust: "缺少某assay时用实现支持的替代方案并单独验证，不能默认为等价。",
      },
      {
        name: "contact input",
        start:
          "优先检查目标context数据是否有足够分辨率；借用contact或distance approximation时标记。",
        adjust:
          "极低coverage或跨context transfer时评估不确定性与简单distance baseline。",
      },
      {
        name: "score threshold",
        start:
          "在独立functional-validation subset上按precision/recall目标选择。",
        adjust:
          "改变candidate universe或模型版本后重新校准，保留未用于选阈值的test。",
      },
    ],
    modifications: [
      "用single-cell multiome关联补充cell-context-specific候选，但注意稀疏性和donor-level泛化。",
      "将候选links作GNN prior，并通过edge ablation及held-out perturbation检验，而非仅展示attention。",
    ],
    pitfalls: [
      "把最近gene当作天然ground truth。",
      "删除低分elements后不重新计算分母。",
      "把ABC score差直接称作causal enhancer effect或enhancer活性差。",
    ],
    compareTo: [
      "motif-pwm-scoring",
      "regulon-tf-activity",
      "bio-graph-construction",
      "causal-graphs-identifiability",
    ],
  },
  {
    id: "regulon-tf-activity",
    source: {
      label: "Aibar et al., SCENIC (2017)",
      url: "https://www.nature.com/articles/nmeth.4463",
    },
    supplementarySources: [
      {
        label: "decoupler 1.9.2 WMEAN definition",
        url: "https://decoupler.scverse.org/en/v1.9.2/generated/decoupler.run_wmean.html",
      },
    ],
    title: "Regulon：TF 的 RNA 不变，activity 能改变吗？",
    englishTitle: "Gene Regulatory Networks, Regulons and Signed TF Activity",
    category: "frontiers",
    level: "高级",
    duration: "18 分钟",
    icon: "⌘",
    summary:
      "把 network inference、motif pruning 与 target-based activity scoring 分成三步，理解 TF expression、binding 和 activity 各自提供什么证据。",
    intuition:
      "想知道一位调度者是否在发挥作用，除了看他是否在场，还要看相关任务有没有朝预期方向变化。TF transcript 记录 TF 自身的 RNA；regulon score 则整合一组 targets 的变化。两种读数回答不同问题，因此不必同步升降。",
    core: "先区分三个对象：GRN inference 提出 TF–target 候选 edges；一个 regulon 包含一个 TF 及其候选 targets；activity scoring 则整合这些 targets 在某个 sample 或 cell 中的信号。SCENIC 依次使用 co-expression、motif enrichment 和 AUCell 完成候选构建、筛选与评分。本课为了逐项手算，另外采用 signed WMEAN-style raw score：Σw_gz_g/Σ|w_g|。正 weight 表示预期 activation，负 weight 表示预期 repression。这个实验用于解释符号和分母，不复现 AUCell，也不把 target score 当作已测得的 TF protein activity。",
    equation:
      "a_TF=Σ_g w_TF,g z_g / Σ_g |w_TF,g|; inferred edge ≠ established causal regulation",
    mechanicsSteps: [
      "先确定network来源：curated prior、co-expression推断或paired multiome推断；保留edge confidence和是否有direction/sign证据。",
      "Co-expression模块可能由cell state、cell composition或共同上游产生；SCENIC的motif pruning增加sequence支持，但仍不是perturbation证明。",
      "对toy给定targets z=[2,1,−1]和signed weights=[1,1,−1]；这些z是明确的对比统计，不是raw UMI counts。",
      "逐target计算signed contributions=[2,1,1]。Repressed target下降提供正向activity evidence；忽略sign会反转该target的解释。",
      "用Σ|w|=3归一化得到raw activity score=4/3。不能用Σw=1替代本课定义的分母，或把该值当probability。",
      "保持TF自身transcript readout固定，只改变第三target的z。若z3=2，则score=(2+1−2)/3=1/3；这个变化来自targets而非TF自身RNA。",
      "对不同regulons检查target overlap、coverage和shared genes；两个高score可能只是共同targets，不一定表示两个独立mechanisms。",
      "对donors、conditions和independent perturbation data评估稳定性；报告target支持和alternative explanations，而不是只给一个TF排名。",
    ],
    whenToUse: [
      "已有可信TF–target prior，想比较condition或cell state中的coordinated target response。",
      "需要将TF transcript、motif evidence和target activity分开解释，再选择后续validation。",
    ],
    limits: [
      "Prior network的物种、cell context、sign与confidence不匹配会造成有方向的偏差。",
      "SCENIC/AUCell、VIPER、linear-model score与WMEAN有不同定义，数值与threshold不应混用。",
      "Target expression可能受多TF或通路影响；高activity score不是唯一可识别的调控原因。",
    ],
    howToUse: [
      "先核gene IDs、orthologue映射、target overlap和network来源，保留过滤前后target数。",
      "选择合适的input层：normalized expression、ranks或contrast statistics必须符合所用方法。",
      "把network inference与activity estimation的训练/验证范围分开记录，避免用test outcomes选择regulon。",
      "用TF perturbation、held-out donor或orthogonal protein/binding证据评价，保留简单gene-set baseline。",
      "检查每个高score由哪些targets驱动，比较去除单一dominant target后的稳定性。",
    ],
    example:
      "保持 TF 自身 RNA 不变，把带负 weight 的 target 从 z=−1 调到 z=2，signed score 就从 1.333 降到 .333。变化来自 targets 的组合，而不是 TF RNA。关联的 Bio/CS 实验先解释 motif 证据；本课在此基础上进一步计算 target-based score，两者不在同一个测量层。",
    tuning: [
      "先选择符合输入与network的score定义，再比较threshold；不要为制造二峰分布强行二值化。",
      "按method要求设置minimum target coverage，并报告缺失targets；toy只有3targets用于手算，不是默认生物分析门槛。",
      "比较不同prior confidence、target sets与seed的稳定性，尤其在稀疏Single-cell中。",
      "先在donor-level聚合或恰当hierarchical模型中比较condition，避免把大量cells当独立replicates。",
    ],
    settings: [
      {
        name: "network/sign convention",
        start: "明确+weight和−weight的生物含义，并保留prior来源。",
        adjust:
          "Sign错误或context不符时先更换/过滤prior，而非翻转结论所需的符号。",
      },
      {
        name: "input representation",
        start:
          "按score方法选择ranks、normalized expression或contrast statistics。",
        adjust:
          "跨assay比较时不要把raw counts直接替代原定义输入；重新验证scale和gene coverage。",
      },
      {
        name: "minimum target coverage",
        start: "按实现文档设门槛，并显示实际matched targets。",
        adjust:
          "低coverage造成不稳定时过滤该regulon或补充测量；不要用任意零值填补未测量基因。",
      },
      {
        name: "continuous score / activity threshold",
        start: "先保留continuous scores和分布，明确threshold的用途。",
        adjust:
          "跨batch或condition移动threshold前检查分布变化来源，避免把技术噪声二值化成状态。",
      },
    ],
    modifications: [
      "用TF–region–gene三层evidence补充regulon，区分motif、accessibility和expression关联。",
      "加入perturbation-aware或causal模型时，明确干预变量、时间与识别假设，不能直接把correlation edge改名causal。",
    ],
    pitfalls: [
      "将高TF expression直接等价为高activity。",
      "把AUCell score称作TF binding probability。",
      "忽略negative regulator targets的符号，或把共享targets重复计作独立证据。",
    ],
    compareTo: [
      "random-forest",
      "motif-pwm-scoring",
      "enhancer-gene-abc",
      "perturbation-generalization",
    ],
  },
  {
    id: "ligand-receptor-inference",
    source: {
      label: "Efremova et al., CellPhoneDB (2020)",
      url: "https://pubmed.ncbi.nlm.nih.gov/32103204/",
    },
    supplementarySources: [
      {
        label: "CellPhoneDB analysis documentation",
        url: "https://cellphonedb.readthedocs.io/en/stable/RESULTS-DOCUMENTATION.html",
      },
    ],
    title: "Ligand–Receptor：一个高分 interaction 到底证明什么？",
    englishTitle:
      "Ligand–Receptor Complexes, Permutation Nulls and Communication Evidence",
    category: "classical",
    level: "高级",
    duration: "19 分钟",
    icon: "⇄",
    summary:
      "先由 cell-type expression 与 receptor complex 计算候选 interaction，再写清 null hypothesis，区分表达特异性、统计显著性与真实通信。",
    intuition:
      "两间房里分别有发射机和接收机，只能说明具备候选通信条件。如果接收机缺少必需部件、信号无法到达，或发射机没有工作，就不能断言发生了通信。LR analysis 先依据表达筛选候选，再用空间、protein、下游 response 和干预证据逐层检验。",
    core: "这里的 LR 指 Ligand–Receptor；在其他课程中，同一缩写还可能指 learning rate 或 Logistic Regression。CellPhoneDB-style analysis 先将表达数据与 interaction database 对齐，再检查成员表达比例，并用最低表达的必需 subunit 表示 heteromeric complex 的瓶颈。随后，以 ligand 和 receptor 的 cluster means 计算 interaction mean，通过 cell-label shuffling 构建 specificity null。本课用六个可交换的 synthetic cells 枚举全部 20 种三对三划分，只复算 complex、score 和 null 三步。得到的 P value 回答该表达分配在指定 null 下是否极端；数据库筛选、多重检验、空间建模和 condition 差异需要各自的方法。",
    equation:
      "R_complex=min(mean(R1),mean(R2)); T=(mean(L_sender)+R_complex,receiver)/2; p_exact=#{permuted T≥observed T}/20",
    mechanicsSteps: [
      "先确定sender/receiver cell identities、interaction database和gene/protein ID映射。Ligand与receptor有时包含多个必需subunits，不能只查其中一个gene。",
      "Toy六个cells中，前3个为sender：L=4、R1=R2=0；后3个为receiver：L=0、R1=4、R2=r。所有数字是同尺度synthetic normalized expression。",
      "Observed sender ligand mean=4；receiver complex=min(4,r)。默认r=2时complex=2，因此interaction mean T=(4+2)/2=3。",
      "固定三sender/三receiver的group sizes，枚举六个cells选三作为sender的全部C(6,3)=20种划分；每次用相同公式重算。",
      "默认r=2时，仅真实的全sender-to-all receiver划分达到T=3，因此exact upper-tail p=1/20=.05。这里包括observed arrangement，不使用Monte Carlo加一修正。",
      "改变r观察complex瓶颈与score；r超过R1=4时，增大r不会提高complex，但改变可检测性或其他生物因素仍可能影响真实系统。",
      "Permutation需要exchangeability；真实多donor/多batch数据不能随意打乱所有cells来检验condition effect。Cell-type specificity与between-condition differential interaction是不同estimands。",
      "结合表达比例、subunit completeness、空间可达性、下游response和perturbation验证；Spatial邻接也只是辅助限制，不自动建立方向或causality。",
    ],
    whenToUse: [
      "用Single-cell或Spatial表达对已知LR数据库中的候选communication routes进行优先级排序。",
      "需要解释复杂receptor、cell-type specificity和permutation P value各自贡献了什么证据。",
    ],
    limits: [
      "RNA不等于分泌、蛋白定位、binding、receptor activation或下游functional response。",
      "Cell abundance、annotation granularity、dissociation和dropout会改变group means及表达比例。",
      "若多个cells来自同一donor，naive cell-label permutation不能替代donor-level condition inference。",
      "空间接近不保证signal有效；endocrine、diffusion、contact-dependent机制有不同reach假设。",
    ],
    howToUse: [
      "先确认species、gene ID、database版本、interaction direction与complex组成。",
      "按cell type和donor检查expression fraction、group size、low-count participants及是否缺失必需subunit。",
      "把expression threshold、score定义、permutation scheme和multiple-testing family写进分析记录。",
      "保留observed score与null分布；不要只交一张显著edge网络。",
      "若比较conditions，按独立donors或实验units定义对比与uncertainty，并检查cell abundance差异。",
      "选高优先级候选后用spatial/protein/downstream和perturbation证据形成验证链。",
    ],
    example:
      "默认六个 cells 的例子得到 T=3、exact p=.05，它比较的是 cell-label 分配。Bio/CS 的关联实验则用四个 paired donors 的 16 种 sign flips 比较 condition 差异；检验单位和 null 不同，不能直接对照两边的 p 值。两者都没有单独证明 ligand 分泌或 receptor activation。",
    tuning: [
      "低表达edge太多时先看expression fraction与complex completeness，再调P-value cutoff。",
      "Annotation从粗到细会改变group means与检验数量；比较多个合理granularities并保留稀有群支持量。",
      "Permutation次数影响Monte Carlo分辨率和误差；exact toy20种排列的最小非零p=.05，不应报告p=0。",
      "Spatial radius需对应units与生物signal机制；先做预注册范围或sensitivity分析，不能只选最好看的网络。",
    ],
    settings: [
      {
        name: "expression fraction filter",
        start:
          "按实现文档和assay detection检查门槛；CellPhoneDB文档常用.1作为起点。",
        adjust:
          "低coverage或rare cell type时评估missingness与样本量，不把任意缺测填成表达。",
      },
      {
        name: "complex aggregation",
        start: "核对每个必需subunit，并明确使用min、geometric mean或其他方法。",
        adjust: "不同工具的complex规则不等价；比较时保持数据与database一致。",
      },
      {
        name: "permutation unit",
        start:
          "先说明null与exchangeable units；本toy仅六个独立synthetic cells。",
        adjust:
          "多donor、batch或空间结构存在时改为尊重设计的null，或用donor-level统计。",
      },
      {
        name: "score / P value / multiplicity",
        start:
          "同时保留effect-like score与null tail，记录测试的pair×cell-type集合。",
        adjust: "扩展候选集合后重新处理multiple testing；显著不等于强效应。",
      },
      {
        name: "spatial reach",
        start: "明确coordinates单位、scale、2D/3D与signal类型。",
        adjust:
          "Boundary crossing或registration不确定时做radius/adjacency sensitivity并检查组织结构。",
      },
    ],
    modifications: [
      "把LR evidence与receiver TF/regulon response连接，但清楚标记数据库路径与观测证据的区别。",
      "在Spatial数据中添加distance或tissue barrier限制，比较有无空间prior的candidate stability。",
    ],
    pitfalls: [
      "把LR P value称作真实通信发生概率。",
      "只看一个receptor subunit，忽略其他必需成员。",
      "用同donor的大量cells制造虚假的condition-level样本量。",
      "将不同工具的score绝对值直接横向比较。",
    ],
    compareTo: [
      "regulon-tf-activity",
      "bio-graph-construction",
      "hierarchical-bootstrap",
      "causal-graphs-identifiability",
    ],
  },
  {
    id: "perturbation-generalization",
    source: {
      label: "Roohani et al., GEARS (2023)",
      url: "https://www.nature.com/articles/s41587-023-01905-6",
    },
    supplementarySources: [
      {
        label: "GEARS implementation",
        url: "https://github.com/snap-stanford/GEARS",
      },
    ],
    title: "Perturbation prediction：预测新组合与重复已有条件不是同一道题",
    englishTitle:
      "Perturbation Prediction, Additive Baselines and Held-Out Contexts",
    category: "adaptation",
    level: "高级",
    duration: "19 分钟",
    icon: "Δ",
    summary:
      "从可复算的 additive baseline 出发，逐步加入 interaction residual 和 context shift，区分对新 cells、新 perturbations、新 combinations 与新 context 的预测。",
    intuition:
      "知道单独按 A、单独按 B 的后果，还不能确定同时按 A 和 B 会怎样。在培养皿里学到的关系，换到完整组织中也可能变化。因此，评估前先说清楚：新的究竟是 cell、perturbation、组合，还是实验环境？",
    core: "Perturbation prediction 的输入是未干预状态、context 与 intervention，目标是干预后的 expression 或 distribution。以 GEARS 为例，它利用 gene 关系 prior 和 GNN，并区分组合中零个、一个或两个 genes 未在训练中被单独 perturb 的情况。理解复杂模型前，本课先计算 additive baseline：把两个 single perturbations 相对 control 的变化相加，再检查 double perturbation 的实际结果偏离多少。实验进一步加入 context shift，说明新组合与新环境是两种不同的外推问题；它不训练 GEARS，也不模拟完整 cell。",
    equation:
      "ŷ_AB,c=y_0,c+Δ_A,c+Δ_B,c; r_AB,c=y_AB,c−ŷ_AB,c; unseen cells ≠ unseen perturbations ≠ unseen context",
    mechanicsSteps: [
      "先定义prediction target：单gene readout、gene vector、cell distribution还是condition mean，并说明control与time point。",
      "Toy控制表达vector y0=[10,10]，单A effect=[−2,1]、单B effect=[1,−3]；这些是给定condition means，不包含cell-level噪声。",
      "从单扰动计算ΔA、ΔB，并得到additive double prediction=[9,8]。所有fit/normalization只使用训练conditions。",
      "Held-out double的真实response在toy中设为[9+δ,8−δ]。默认δ=2时true=[11,6]；interaction residual=[2,−2]。",
      "本例两个 readouts 的误差分别为 δ 和 −δ，因此 MSE=mean([δ²,δ²])=δ²=4。这里直接检查误差与变化方向；在真实高维 expression 中，还要避免大量未变化 genes 掩盖少数关键 targets 的预测错误。",
      "另加context shift c到held-out response：[9+δ+c,8−δ+c]。此时source-context baseline的MSE=δ²+c²，明确两个误差来源。",
      "Random cell split可能在train和test中都出现同一个perturbation/context。若目标是新组合，必须hold out整个combination；若目标是新gene或新donor/context，再加相应分组切分。",
      "比较no-change、additive和更复杂模型，并在预定义genes、independent conditions和donors上报告effect与uncertainty；不要用test DE gene selection反复调参。",
    ],
    whenToUse: [
      "在实验预算有限时排序候选perturbations或combinations，并明确预测可支持的后续实验范围。",
      "需要评估foundation model、GNN或conditional generative model是否真正超过简单baselines。",
    ],
    limits: [
      "未观察过的perturbation或context可能不在训练支持范围；good interpolation不等于可迁移causal model。",
      "Guide assignment、target engagement、dose、time、cell viability和selection都会影响observed response。",
      "In vitro模型的有效预测不能单独证明in vivo机制、效应大小或应用效果。",
    ],
    howToUse: [
      "记录intervention identity、guide/multiplicity、target engagement、control、time和independent replicate。",
      "先实现no-change与additive baselines，并验证expression与delta metrics的量纲。",
      "按部署问题构造held-out perturbation、combination、donor、cell type或context split。",
      "所有feature selection、gene-set定义和normalization在training/validation范围内固定；test只用于最终评价。",
      "检查DE/delta方向、interaction residual、distribution coverage及独立unit上的uncertainty。",
      "对高价值预测做新实验；把预测用作experiment selection，而不是替代mechanistic validation。",
    ],
    example:
      "仅A和B的单扰动数据支持additive预测[9,8]，但double真实[11,6]时MSE=4。加入共同context shift c=1后true=[12,7]、MSE=5；更多同context的cells不会自动解决该外推误差。",
    tuning: [
      "先定义holdout目标和baselines，再调embedding大小或GNN depth；否则评估任务可能比预期容易。",
      "Loss同时关注绝对expression与delta时记录权重和gene集合，避免高表达背景掩盖response错误。",
      "对graph prior检查证据来源和test information，做无graph/简单graph消融。",
      "出现跨context失效时检查biology、assay和intervention有效性，再判断是否适合domain adaptation。",
    ],
    settings: [
      {
        name: "split unit",
        start:
          "明确要预测new cell、new perturbation、new combination或new context。",
        adjust:
          "Random-row结果过好时检查同condition/guide是否跨split；升级到目标所需的group holdout。",
      },
      {
        name: "baseline and outcome scale",
        start:
          "同时保留no-change和additive baseline，明确counts/log expression/delta。",
        adjust:
          "绝对correlation高但delta差时增加change-direction和interaction-sensitive诊断。",
      },
      {
        name: "control and target engagement",
        start: "按context/time匹配control，并检查实际perturbation是否生效。",
        adjust:
          "未生效guides或强viability selection出现时，区分measurement与prediction失败。",
      },
      {
        name: "loss / evaluation gene set",
        start: "预先固定genes与metric，对independent units报告结果。",
        adjust:
          "换gene set后重新解释metric；避免test上选DEgenes再把结果当未使用的评估。",
      },
      {
        name: "model capacity / graph prior",
        start: "从可解释baseline与小模型开始，保存prior版本与构图来源。",
        adjust:
          "只在held-out任务有增益时增加复杂度，做feature/edge ablation并检查leakage。",
      },
    ],
    modifications: [
      "将预测uncertainty与实验成本结合做Active Learning，但要验证uncertainty与误差是否相关。",
      "用context-conditioned模型表达cell type、donor和environment差异，并分别评估observed与unseen context。",
    ],
    pitfalls: [
      "把随机留下的cells称作zero-shot gene perturbation。",
      "把in vitro成功直接当作in vivo有效性。",
      "只报告all-gene correlation，忽略delta方向或small perturbed gene subset。",
    ],
    compareTo: [
      "gnn",
      "transfer-learning-strategies",
      "domain-shift",
      "causal-graphs-identifiability",
      "regulon-tf-activity",
    ],
  },
  {
    id: "variant-mixture-inference",
    source: {
      label: "Carter et al., ABSOLUTE (2012)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4383288/",
    },
    supplementarySources: [
      {
        label: "Niknafs et al., expected VAF model (2023)",
        url: "https://www.nature.com/articles/s41591-022-02163-w",
      },
    ],
    title: "VAF：为什么 25% variant reads 不等于 25% cells？",
    englishTitle:
      "Allele-Count Likelihoods, Purity, Copy Number and Identifiability",
    category: "classical",
    level: "高级",
    duration: "18 分钟",
    icon: "◐",
    summary:
      "沿 cell mixture → DNA copies → sequencing reads 建立概率模型，逐步区分 VAF、cell fraction、variant 来源与 identifiability。",
    intuition:
      "把不同人带来的积木混在一起，某种颜色占四分之一，并不意味着四分之一的人带了它：每人可能带不同数量的积木。同样，VAF 按 reads 计数，其背后反映 allele copies 的混合；要推到 cell fraction，还必须知道每类 cell 贡献多少 DNA copies。",
    core: "先固定一个候选生成模型：背景群不含 variant，两群内部各自具有一致的局部 copy number，且测序无 bias。此时 expected VAF 为 p=ρfm/[ρC_T+(1−ρ)C_N]。ρ 是目标 cell 群比例，f 是其中携带 variant 的比例，m 是携带者的 mutant copy multiplicity，C_T/C_N 是两群的总 copy 数。再用 Binomial(k|n,p) 描述有限 read depth 的抽样。这样就把 cell composition、DNA 分母和 read sampling 分开了。Somatic/Germline 与 Inherited/De novo 属于不同分类维度；单一 VAF 或 likelihood ratio 都不足以独立判定来源。",
    equation:
      "p=ρfm/[ρC_T+(1−ρ)C_N]; k|n,p~Binomial(n,p); log LR=k log(p/p0)+(n−k)log[(1−p)/(1−p0)]",
    mechanicsSteps: [
      "先明确数据单位：k是alternate reads，n是总有效reads；VAF=k/n。过滤、mapping bias和duplicate处理都会影响有效观测。",
      "构建diploid toy：C_T=C_N=2、m=1、f=1，background无variant。ρ=.5时，每个混合cell贡献的总copies期望为2，mutant copies期望为.5，因此p=.25。",
      "在n=20、k=5时observed VAF=.25；Binomial模型描述同一p下不同抽样可能得到不同k，不能把恰好5/20当无误差的p。",
      "比较somatic-mixture candidate p=.25与一个明确的balanced-diploid candidate p0=.5：log LR=5log(.5)+15log(1.5)≈2.6162。这是两个给定模型的likelihood比较，不是variant为somatic的posterior。",
      "改变ρ或C_T会改变expected VAF。例如ρ=.5、C_T=4时p=.5/[.5×4+.5×2]=1/6，保持f=1并不保持VAF=.25。",
      "即使copy数固定为2，(ρ=.5,f=1)和(ρ=1,f=.5)都给p=.25；单一locus的allele fraction无法同时识别这些未知量。",
      "Germline heterozygosity在无CN改变、无bias、各cell都相同等条件下常接近.5；LOH、CN改变、mosaicism和assay bias可打破这个简化。",
      "用matched normal、family/lineage信息、copy-number profile、multiple loci和appropriate assays联合分析；模型结果是带假设的推断，不是个人诊断。",
    ],
    whenToUse: [
      "理解bulk DNA或mixed-cell测序中VAF与cell mixture的关系，检查为何直接把VAF当cell fraction会错。",
      "为mixture models、Bayesian inference与identifiability建立可复算的生物例子。",
    ],
    limits: [
      "公式依赖局部copy状态、multiplicity和background无variant等假设；复杂subclonal CN需要更完整模型。",
      "Binomial假设reads在给定p下独立同分布；overdispersion、mapping bias和sampling design会破坏它。",
      "Somatic/germline、inherited/de novo、clonal/subclonal是不同轴，不能从单一VAF阈值互相替换。",
    ],
    howToUse: [
      "明确DNA还是RNA assay、locus坐标、reference/alternate allele及有效read过滤。",
      "把purity/cell fraction与DNA fraction区分，并整理局部copy-number/multiplicity假设。",
      "先用simple diploid模型手算expected VAF，再加入有证据支持的复杂度。",
      "展示likelihood或uncertainty随depth和model assumptions变化，避免仅报告单点cell fraction。",
      "结合matched normal和independent loci检查备选解释，并用适当专业流程解释真实variant。",
    ],
    example:
      "5/20 alternate reads 与 p=.25 相容；但目标群占一半且全部携带 variant，与纯目标群中只有一半 cells 携带 heterozygous variant，都能给出同样的 p。增加 read depth 可以减少 sampling uncertainty，却不能区分这两种生成机制。Bio/CS 先解释 lineage 和 DNA-copy 分母，本课再加入 finite-depth likelihood。",
    settings: [
      {
        name: "copy-number model",
        start:
          "从明确的diploid/no-bias教学假设开始；真实数据使用局部allele-specific CN证据。",
        adjust:
          "VAF与预期偏离时查LOH、CN和multiplicity，不先强行归为subclone。",
      },
      {
        name: "purity ρ / cell fraction f",
        start: "将两个变量分别定义并记录外部估计来源。",
        adjust:
          "两者同时未知时展示nonidentifiability，增加independent measurement而非只靠优化器。",
      },
      {
        name: "read depth and likelihood",
        start: "保留k与n；toy用Binomial作为透明baseline。",
        adjust:
          "低depth、duplicate或overdispersion时重估uncertainty及assumption，而非只比较k/n。",
      },
      {
        name: "normal/background model",
        start: "明确background是否无variant及matched normal的组织来源。",
        adjust:
          "可能mosaicism、contamination或sample mismatch时重建候选模型；不要把.5固定为所有germline情况。",
      },
    ],
    modifications: [
      "加入多loci与共享clone fraction的hierarchical model，但检查label switching与multiple equally good solutions。",
      "在计数模型里加入allelic bias或overdispersion，并用independent controls校验。",
    ],
    pitfalls: [
      "把VAF=.25写成25%的cells有variant。",
      "把log LR直接当posterior或diagnostic confidence。",
      "增加read depth后以为purity和subclone fraction必然都可识别。",
      "将RNA allelic imbalance直接等同DNA somatic variant fraction。",
    ],
    compareTo: [
      "bayesian-updating",
      "count-likelihoods",
      "hierarchical-partial-pooling",
      "causal-graphs-identifiability",
    ],
    tuning: [
      "先确认copy number和purity定义，再调clonal threshold；错误分母会系统性偏移结论。",
      "低depth时保留宽uncertainty，不用更多数值小数位假装更精确。",
      "观察超出Binomial的变异时考虑技术bias、read dependence或Beta-Binomial等模型，而不是机械增加clone数。",
      "比较多个credible model assumptions，报告哪些变量可由数据识别、哪些来自prior或外部测量。",
    ],
  },
];
