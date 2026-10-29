import type { Exercise } from "./exerciseTypes";

export const biologyBridgeExercises: Record<string, Exercise[]> = {
  "motif-pwm-scoring": [
    {
      id: "motif-pwm-scoring-mechanism",
      kind: "mechanism",
      question:
        "Uniform background q=.25、total pseudocount α=1 后，AT 两位置 motif probability 都为.75。其 score 是什么？",
      options: [
        "3.1699 bits，是 motif 相对 background 的 log-likelihood ratio",
        "0.75，是 TF binding 的 posterior probability",
        "3.1699%，是 binding frequency",
        "只要 sequence 相同，background 不会影响 score",
      ],
      answer: 0,
      explanation:
        "S=2log2(.75/.25)=2log2(3)=3.1699 bits。它不是 binding probability，也不是经过多重检验的 P/q value。",
    },
    {
      id: "motif-pwm-scoring-decision",
      kind: "decision",
      question:
        "新 region set 的 GC composition 不同，某 TF motif hits 激增。下一步最有解释力的检查是什么？",
      options: [
        "把所有 hits 都标记成 causal targets",
        "只提高 TF expression threshold",
        "固定 candidate universe，比较合理的 matched background 并重新评估 null 与 multiple testing",
        "丢弃所有 low-score regions，沿用旧 q values",
      ],
      answer: 2,
      explanation:
        "Background 改变会改变 relative score 与 null。还要区分 sequence compatibility、accessibility、TF expression 与实际 binding；不能只靠调阈值维持原来的结论。",
    },
  ],
  "enhancer-gene-abc": [
    {
      id: "enhancer-gene-abc-mechanism",
      kind: "mechanism",
      question:
        "A=[4,2,1]、C=[.1,.2,.4]，三个 ABC scores 均为1/3。只把E2 contact减到.1，E1 score变成多少？",
      options: [
        "仍为1/3，因为E1自身没变",
        ".4，因为分母从1.2变为1",
        ".2，因为E2减半",
        "1，因为E1离gene最近",
      ],
      answer: 1,
      explanation:
        "新的weights=[.4,.2,.4]、sum=1，所以E1score=.4。它的numerator没有增加；这是相对贡献的分母效应。",
    },
    {
      id: "enhancer-gene-abc-decision",
      kind: "decision",
      question:
        "两个实验使用不同candidate windows，E1 ABC score上升。可以立即声称什么？",
      options: [
        "E1 causal effect增大",
        "E1 activity assay信号一定变强",
        "每个cell的contact概率增加",
        "只能说给定两套输入和candidate universe后relative score不同，需要追查numerator与denominator",
      ],
      answer: 3,
      explanation:
        "ABC是以同一gene的candidate universe归一化的模型。窗口、其他elements和promoter inclusion都能改变分母，score差不能直接当functional effect。",
    },
  ],
  "regulon-tf-activity": [
    {
      id: "regulon-tf-activity-mechanism",
      kind: "mechanism",
      question:
        "Weights=[1,1,−1]，target statistics=[2,1,−1]。按本课L1-normalized signed score，结果是多少？",
      options: ["2/3", "4", "4/3", "0"],
      answer: 2,
      explanation:
        "Contributions=[2,1,1]，分母Σ|w|=3，所以score=4/3。负weight的target下降可提供正向evidence；这不是TF自身RNA或binding概率。",
    },
    {
      id: "regulon-tf-activity-decision",
      kind: "decision",
      question:
        "一个TF的RNA没有变化，但signed target score升高，最合适的解释是什么？",
      options: [
        "结果必错，因为activity必须与RNA同步",
        "Target pattern改变；检查prior、coverage和其他调控因素，再结合独立蛋白/功能证据",
        "直接证明该TF binding增加同样百分比",
        "可以把AUCell、WMEAN和TF RNA的threshold混用",
      ],
      answer: 1,
      explanation:
        "TF transcript、protein availability、binding与target-based activity处于不同层面。Target score是依赖network和输入的推断，可能受共享targets和context影响。",
    },
  ],
  "ligand-receptor-inference": [
    {
      id: "ligand-receptor-inference-mechanism",
      kind: "mechanism",
      question:
        "Observed sender L mean=4，receiver R1=4、R2=2。采用min complex和arithmetic interaction mean，T是多少；20种exact permutations仅1种达到它时p是多少？",
      options: [
        "T=8，p=.05",
        "T=3，p=.05",
        "T=3，p=0",
        "T=2，真实通信概率=.95",
      ],
      answer: 1,
      explanation:
        "Complex=min(4,2)=2，T=(4+2)/2=3，exact upper-tail p=1/20=.05。Observed arrangement也包含在枚举中；它不是communication probability。",
    },
    {
      id: "ligand-receptor-inference-decision",
      kind: "decision",
      question:
        "四个donors每人有很多cells，想比较treated与control的LR差异。用所有cell labels混洗得到小P value，能否替代donor-level对比？",
      options: [
        "能，因为cells越多独立sample size越大",
        "能，只要再加入Spatial coordinates",
        "不能；cell-type specificity null与paired donor condition-effect null回答不同问题",
        "不能，因此任何LR候选都无法学习",
      ],
      answer: 2,
      explanation:
        "需要先明确estimand和exchangeable units。Related cells不替代independent donors；可用设计相符的donor-level对比，再把LR、spatial及下游证据组合。",
    },
  ],
  "perturbation-generalization": [
    {
      id: "perturbation-generalization-mechanism",
      kind: "mechanism",
      question:
        "Control=[10,10]，ΔA=[−2,1]、ΔB=[1,−3]。Additive prediction=[9,8]；held-out truth=[11,6]。MSE是多少？",
      options: ["0，因为两个gene的signed errors相加为0", "2", "8", "4"],
      answer: 3,
      explanation:
        "Residual=[2,−2]，平方后均为4，MSE=(4+4)/2=4。相反方向的errors不会在MSE里相互抵消。",
    },
    {
      id: "perturbation-generalization-decision",
      kind: "decision",
      question:
        "模型在随机留出的cells上很好，但train/test含相同perturbations。目标是预测新gene combination及in vivo context，当前结果说明什么？",
      options: [
        "已经证明zero-shot组合和in vivo有效性",
        "只证明当前split定义下的预测；需完整combination/context holdout并比较简单baselines",
        "只需增加模型参数即可保证外推",
        "Gene embedding相似就可替代新实验",
      ],
      answer: 1,
      explanation:
        "Held-out cells、genes、combinations和contexts是不同任务。更多同条件cells不能替代新context证据；in vitro预测成功也不直接建立in vivo效应。",
    },
  ],
  "variant-mixture-inference": [
    {
      id: "variant-mixture-inference-mechanism",
      kind: "mechanism",
      question:
        "Diploid CN=2、每个carrier只有1个mutant copy。哪两种(ρ,f)组合都产生expected VAF=.25？",
      options: [
        "(.5,1)和(1,.5)",
        "(.25,1)和(1,.25)",
        "(.5,.5)和(1,1)",
        "只有(.25,1)",
      ],
      answer: 0,
      explanation:
        "在此简化下p=ρf/2。(.5,1)与(1,.5)均为.25；更多reads可降低sampling noise，却不能仅由同一个p区分这两个结构性解释。",
    },
    {
      id: "variant-mixture-inference-decision",
      kind: "decision",
      question:
        "5/20 alternate reads更支持给定p=.25模型而非p=.5模型。最稳妥的结论是什么？",
      options: [
        "Variant已被证明为somatic",
        "只有比较的两个模型的likelihood不同；来源解释还需prior、matched normal、CN、lineage及技术证据",
        "该样本25%的cells必然携带variant",
        "Depth增加后purity和subclone fraction一定分别可识别",
      ],
      answer: 1,
      explanation:
        "Likelihood ratio不是posterior，候选模型也未覆盖所有germline、mosaic、CN与bias情况。VAF的分母是allele reads/copies，不直接等于cells。",
    },
  ],
};
