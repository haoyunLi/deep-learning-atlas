import type { CompleteLabMap, CompleteLab } from "./types";
import { define, C, S, M, L, D, fmt, metric, softmax, sum } from "./cvHelpers";
function attentionLab(
  id: "encoder-models" | "decoder-models" | "encoder-decoder",
): CompleteLab {
  const causal = id === "decoder-models",
    cross = id === "encoder-decoder";
  return define(
    id,
    cross
      ? "Target query 怎样读取 encoder memory？"
      : causal
        ? "Causal mask 怎样阻止未来 token 泄漏？"
        : "Bidirectional attention 怎样使用左右 context？",
    cross
      ? "固定3个source keys=[1,0,−1]、values=[2,4,8]；target scalar query可调，单head d_k=1。"
      : "固定3个tokens的keys=[1,0,−1]、values=[2,4,8]；query位于第二个token，单head d_k=1。",
    C(
      "Query scalar q",
      -2,
      2,
      0.25,
      1,
      "先核Q/K/V shape和mask；改变q观察同一套固定权重如何重分配context。",
    ),
    ({ x }) => {
      const raw = [x, 0, -x],
        p = causal ? [...softmax(raw.slice(0, 2)), 0] : softmax(raw),
        parts = p.map((a, i) => a * [2, 4, 8][i]);
      return {
        stages: [
          S(
            "Query–key scores",
            "本例d_k=1，所以缩放因子为1。",
            `qKᵀ/√d=[${raw.map((a) => fmt(a)).join(",")}]`,
            ["key1", "key2", "key3"],
            raw,
            "logit",
          ),
          M(
            causal
              ? "Causal visibility"
              : cross
                ? "Cross-attention visibility"
                : "Bidirectional visibility",
            causal
              ? "第二个query只可读positions1、2。第3位的−∞ mask在图中用visibility0表示。"
              : cross
                ? "Target query可以读全部source keys；target自己的self-attention仍必须causal。"
                : "Encoder允许读取两侧context；padding依旧需要mask。",
            causal ? "allowed=[1,1,0]" : "allowed=[1,1,1]",
            ["query"],
            ["key1", "key2", "key3"],
            [[1, 1, causal ? 0 : 1]],
            "visible",
          ),
          S(
            "Normalize visible scores",
            "Softmax仅在有效keys上归一化；masked权重严格为0。",
            `α=softmax(scores+mask)=[${p.map((a) => fmt(a)).join(",")}]`,
            ["α1", "α2", "α3"],
            p,
            "weight",
          ),
          S(
            "Read values",
            "输出是value的加权和；不是选中最高score后丢掉其它value。",
            `y=2α1+4α2+8α3=${fmt(sum(parts))}`,
            ["α1V1", "α2V2", "α3V3"],
            parts,
            "value contribution",
          ),
        ],
        outcomes: [
          metric("Attention output", sum(parts)),
          metric("Future/source3 weight", p[2]),
        ],
      };
    },
    cross
      ? "翻译等条件生成先验证source padding mask，再单独检查target causal mask；source和target长度不必相同。"
      : causal
        ? "训练使用shifted targets，核第t位只预测t+1；mask错误造成低训练loss却无法生成。"
        : "分类/检索可利用完整输入；用于forecasting时不能让未来观测进入encoder。",
    D(
      [
        "训练好但推理崩溃",
        "检查padding、causal mask方向与label shift",
        "打印一个3token的visibility matrix逐格核对",
      ],
      [
        "Attention只盯住一个token",
        "检查QK尺度和softmax饱和",
        "核√d缩放、normalization与特殊token位置",
      ],
    ),
    "这是固定scalar Q/K/V的单head运算，未运行BERT/GPT/Transformer；attention权重不是解释的因果证明。",
  );
}
export const cvLanguageLabs: CompleteLabMap = {
  "encoder-models": attentionLab("encoder-models"),
  "decoder-models": attentionLab("decoder-models"),
  "encoder-decoder": attentionLab("encoder-decoder"),
  "bidirectional-rnn": define(
    "bidirectional-rnn",
    "同一个位置怎样同时接收过去与未来？",
    "输入[1,0,2,0]；简化linear recurrent cell，forward h_t=a h_(t−1)+x_t，backward从右向左，边界state=0。",
    C(
      "Recurrent coefficient a",
      0,
      0.9,
      0.1,
      0.5,
      "a大时记忆衰减慢；这里没有gate/nonlinearity，真实模型仍需检查gradient和有效context。",
    ),
    ({ x }) => {
      const input = [1, 0, 2, 0],
        f: number[] = [],
        b: number[] = [];
      for (let i = 0; i < 4; i++) f[i] = x * (f[i - 1] ?? 0) + input[i];
      for (let i = 3; i >= 0; i--) b[i] = x * (b[i + 1] ?? 0) + input[i];
      return {
        stages: [
          S(
            "Sequence",
            "固定同一输入，同时运行两个相反方向的state更新。",
            "x=[1,0,2,0]",
            ["t1", "t2", "t3", "t4"],
            input,
            "input",
          ),
          L(
            "Forward recurrence",
            "第二位只能从第一位继承state。",
            `h→_t=${fmt(x)}h→_(t−1)+x_t`,
            [1, 2, 3, 4],
            f,
            "time",
            "forward state",
          ),
          L(
            "Backward recurrence",
            "第二位也接收到第三位的信号；这就是需要完整序列的原因。",
            `h←_t=${fmt(x)}h←_(t+1)+x_t`,
            [1, 2, 3, 4],
            b,
            "time",
            "backward state",
          ),
          M(
            "Concatenate",
            "真实BiRNN通常concat两个direction的features，不是自动求平均。",
            `z2=[${fmt(f[1])},${fmt(b[1])}]`,
            ["forward", "backward"],
            ["t1", "t2", "t3", "t4"],
            [f, b],
            "state",
          ),
        ],
        outcomes: [
          metric("Position2 past", f[1]),
          metric("Position2 future", b[1]),
        ],
      };
    },
    "离线sequence labeling可用双向context；实时forecasting不能使用未来方向，需改causal结构或明确延迟窗口。",
    D(
      [
        "线上结果异常好而不可复现",
        "检查是否把未来观测喂给backward branch",
        "以预测时刻可见信息重新切分数据",
      ],
      [
        "长度变化导致结果漂移",
        "检查padding进入recurrence以及最后state选择",
        "使用正确length mask/packed sequence并核边界",
      ],
    ),
    "linear toy用于展示信息方向，不模拟LSTM/GRU gate，也不表示分类准确率。",
  ),
  seq2seq: define(
    "seq2seq",
    "Teacher forcing 与 free-running 输入为什么逐渐不同？",
    "目标序列[1,2,3,4]；decoder toy为ŷ_t=previous_input+1+b，起始input=0。Teacher forcing用真实前一项，rollout用自己上一预测。",
    C(
      "Decoder bias b",
      0,
      1,
      0.1,
      0.2,
      "先在teacher forcing与free-running两种模式报告误差；本例b是固定model bias，不是训练hyperparameter。",
    ),
    ({ x }) => {
      const truth = [1, 2, 3, 4],
        teacher = truth.map((a) => a + x),
        roll = truth.map((a) => a * (1 + x)),
        err = roll.map((a, i) => a - truth[i]);
      return {
        stages: [
          S(
            "Ground-truth history",
            "Training可读取真实前一token，但部署没有这个输入。",
            "y=[1,2,3,4]",
            ["t1", "t2", "t3", "t4"],
            truth,
            "value",
          ),
          S(
            "Teacher-forced predictions",
            "每一步都重新锚定真实history，单步误差固定为b。",
            `ŷ_t=y_(t−1)+1+${fmt(x)}`,
            ["t1", "t2", "t3", "t4"],
            teacher,
            "prediction",
          ),
          L(
            "Autoregressive rollout",
            "前一步误差成为下一步输入的一部分。",
            `ŷ_t=ŷ_(t−1)+1+b=t(1+b)`,
            [1, 2, 3, 4],
            roll,
            "step",
            "prediction",
          ),
          S(
            "Error accumulation",
            "比较同一固定decoder，训练输入方式不同即可产生不同误差。",
            "e_t=t·b",
            ["e1", "e2", "e3", "e4"],
            err,
            "absolute error",
          ),
        ],
        outcomes: [
          metric("Rollout final error", 4 * x),
          metric("Teacher-forced final error", x),
        ],
      };
    },
    "先保证BOS/EOS、padding与target shift一致；需要长输出时单独测试rollout长度，beam search不能消除model bias。",
    D(
      [
        "训练loss低但长输出漂移",
        "比较teacher-forced与free-running metrics",
        "按长度分组分析并检查训练/部署input mismatch",
      ],
      [
        "重复或提前结束",
        "检查EOS比例、maximum length和decoding设置",
        "先greedy检查一个短样本，再比较beam/length penalty",
      ],
    ),
    "线性decoder的确定性误差传播，不模拟token级translation，也不声称scheduled sampling总能改进。",
  ),
  tcn: define(
    "tcn",
    "Dilated causal blocks 怎样扩展可见 history？",
    "每个block有2层kernel3 causal convolutions，block dilations=1,2,4,…；stride1，residual不额外扩大RF。",
    C(
      "Residual blocks L",
      1,
      5,
      1,
      3,
      "先让theoretical RF覆盖任务需要的lookback；长度够不代表模型能有效使用所有history。",
    ),
    ({ x }) => {
      const levels = Array.from({ length: x }, (_, i) => i),
        d = levels.map((i) => 2 ** i),
        inc = d.map((a) => 4 * a),
        rf = levels.map((i) => 1 + 4 * (2 ** (i + 1) - 1)),
        r = rf[rf.length - 1];
      return {
        stages: [
          S(
            "Dilation schedule",
            "每个block内两层共享该dilation。",
            "d_l=2^l",
            levels.map((i) => `block${i + 1}`),
            d,
            "steps",
          ),
          S(
            "History per block",
            "每层增加(k−1)d；两层合计4d。",
            "ΔR=2×(3−1)d",
            levels.map((i) => `block${i + 1}`),
            inc,
            "steps",
          ),
          L(
            "Receptive field",
            "包含当前位置；只能看过去，不能看未来。",
            `R=1+4(2^${x}−1)=${r}`,
            levels.map((i) => i + 1),
            rf,
            "blocks",
            "RF positions",
          ),
          S(
            "Causal boundary",
            "最后一个位置t=128可见t−R+1到t；不足部分需left padding。",
            `oldest=128−${r}+1`,
            ["oldest input index", "current input index"],
            [128 - r + 1, 128],
            "time index",
          ),
        ],
        outcomes: [
          metric("Theoretical RF", r, "steps"),
          metric("Lookback", r - 1, "steps"),
        ],
      };
    },
    "核实际实现每block的conv层数、dilation reset与padding；扩大RF时用固定forecast horizon的validation比较。",
    D(
      [
        "预测泄漏未来",
        "检查padding/crop后t是否读到t+1",
        "用future perturbation测试早期输出不变",
      ],
      [
        "RF很大却学不到长期关系",
        "检查有效gradient、输入scale和数据窗口",
        "对比short/long lookback与更简单baseline",
      ],
    ),
    "精确计数指定2-convolution block的theoretical RF；不表示所有TCN变体配置，也不估计预测性能。",
  ),
  word2vec: define(
    "word2vec",
    "Negative samples 增加时，SGNS loss 的哪部分变化？",
    "固定positive dot product=1，每个negative dot product=−1；K个相同分数的negative仅用于手算sum-reduced目标。",
    C(
      "Negative count K",
      1,
      8,
      1,
      3,
      "常见实现K和negative sampling distribution都要调；先核loss是sum还是mean，避免混淆学习率尺度。",
    ),
    ({ x }) => {
      const p = 1 / (1 + Math.exp(-1)),
        term = Math.log1p(Math.exp(-1));
      return {
        stages: [
          S(
            "Dot products",
            "模型希望positive score上升、negative scores下降。",
            "s+=1,s−=−1",
            ["positive", "each negative"],
            [1, -1],
            "logit",
          ),
          S(
            "Logistic probabilities",
            "σ(s+)和σ(−s−)均为σ(1)，分别对应正确方向。",
            `σ(1)=${fmt(p)}`,
            ["positive correct", "negative correct"],
            [p, p],
            "probability",
          ),
          S(
            "Loss contributions",
            "负例项逐个相加；这里K变大自然增大总loss，不能直接跨K比较。",
            `L=−logσ(1)−${x}logσ(1)`,
            ["positive loss", "negative sum"],
            [term, x * term],
            "loss",
          ),
          S(
            "Score gradients",
            "每个negative梯度相同，sum-reduced负例梯度总量随K增加。",
            "∂L/∂s+=σ(1)−1;Σ∂L/∂s−=Kσ(−1)",
            ["positive score", "negative scores sum"],
            [p - 1, x * (1 - p)],
            "gradient",
          ),
        ],
        outcomes: [
          metric("SGNS sum loss", (x + 1) * term),
          metric("Negative gradient sum", x * (1 - p)),
        ],
      };
    },
    "窗口大小决定局部语法/主题context；subsampling高频词与negative分布必须记录，embedding维度增加前先查语料覆盖。",
    D(
      [
        "更大K的loss更大",
        "核sum/mean reduction与样本数",
        "按相同规范报告per-term loss并用下游验证选K",
      ],
      [
        "近邻被高频词占据",
        "检查tokenization、词频和sampling distribution",
        "验证subsampling/最低词频设置",
      ],
    ),
    "只算SGNS目标及score梯度，不训练embedding，也不把negative样本当真实负语义关系。",
  ),
  roberta: define(
    "roberta",
    "Dynamic masking 怎样增加同一文本被监督的位置覆盖？",
    "20token文本，每次独立以p=.15选择MLM监督位置；这里只计算选择概率，不模拟80/10/10 replacement或训练。",
    C(
      "Repeated presentations T",
      1,
      8,
      1,
      4,
      "先核训练实现是否每次重新sample mask；重复读取次数不是epochs的通用替代，数据packing也会改变暴露次数。",
    ),
    ({ x }) => {
      const never = 0.85 ** x,
        ever = 1 - never,
        ts = Array.from({ length: x }, (_, i) => i + 1);
      return {
        stages: [
          S(
            "One presentation",
            "每个位置本次被选中概率相同；expected count不是每次精确3个。",
            "E[selected]=20×.15=3",
            ["selected", "unselected"],
            [3, 17],
            "expected positions",
          ),
          L(
            "Never selected",
            "独立重采样时，连续T次都不被选中的概率相乘。",
            `P(never)=.85^${x}`,
            ts,
            ts.map((t) => 0.85 ** t),
            "presentations",
            "probability",
          ),
          S(
            "Ever supervised",
            "至少一次被选中是never的补集。",
            `P(ever)=1−.85^${x}=${fmt(ever)}`,
            ["ever", "never"],
            [ever, never],
            "probability",
          ),
          S(
            "Coverage versus fixed mask",
            "若同一fixed mask反复使用，expected coverage一直3；dynamic coverage逐步增加。",
            "E[covered]=20(1−.85^T)",
            ["fixed mask", "dynamic mask"],
            [3, 20 * ever],
            "expected positions",
          ),
        ],
        outcomes: [
          metric("Expected covered positions", 20 * ever),
          metric("Never selected probability", never),
        ],
      };
    },
    "更多覆盖不自动等于更好模型；比较mask rate时保持训练token预算并核特殊token、whole-word或span规则。",
    D(
      [
        "重复epoch但mask不变",
        "查看data collator采样是否在cache之前",
        "记录同一sample不同迭代的mask positions",
      ],
      [
        "训练loss异常低",
        "检查被mask token是否泄漏在input或label alignment",
        "手工展示一个input/label样本并核ignore index",
      ],
    ),
    "独立Bernoulli masking的期望计算；真实batch可能固定mask数量，未模拟完整RoBERTa recipe或accuracy。",
  ),
  t5: define(
    "t5",
    "Span corruption 如何同时改变 encoder 与 decoder 长度？",
    "20个原始tokens，固定masked总数为6；安排为互相隔开的spans，每span最多s个tokens，每span在encoder用一个sentinel替代。",
    C(
      "Maximum span length s",
      1,
      6,
      1,
      2,
      "先使用checkpoint的span corruption recipe；改变span长度会改变target长度与任务难度，必须重核sentinel格式。",
    ),
    ({ x }) => {
      const n = Math.ceil(6 / x),
        sizes = Array.from({ length: n }, (_, i) => Math.min(x, 6 - i * x)),
        enc = 14 + n,
        target = 6 + n + 1 + 1;
      return {
        stages: [
          S(
            "Masked span partition",
            "最后一个span可以短于s；本例固定6个masked tokens以隔离长度效应。",
            `spans=ceil(6/${x})=${n}`,
            sizes.map((_, i) => `span${i + 1}`),
            sizes,
            "tokens",
          ),
          S(
            "Encoder compression",
            "14个未mask tokens加每span一个sentinel。",
            `encoder=20−6+${n}=${enc}`,
            ["retained", "sentinels"],
            [14, n],
            "tokens",
          ),
          S(
            "Decoder target",
            "目标只含被删除tokens、每span起始sentinel、一个final sentinel，再加EOS。",
            `target=6+${n}+1+1=${target}`,
            ["content", "start sentinels", "final sentinel", "EOS"],
            [6, n, 1, 1],
            "tokens",
          ),
          S(
            "Attention budget",
            "仅计dense attention score entries，不计heads/layers；真实packing/padding另算。",
            "encoder²+target²+encoder×target",
            ["encoder self", "decoder self matrix", "cross"],
            [enc ** 2, target ** 2, enc * target],
            "score entries",
          ),
        ],
        outcomes: [
          metric("Encoder tokens", enc),
          metric("Target tokens", target),
        ],
      };
    },
    "T5各implementation是否保留final sentinel需核实际preprocessor；sentinel ID、EOS与decoder input shift必须和checkpoint一致。",
    D(
      [
        "目标全是sentinel或输出错位",
        "打印corrupted input和target tokens",
        "逐段核sentinel次序与decoder shift",
      ],
      [
        "训练预算意外增加",
        "检查span数量导致target length变化",
        "按实际source/target长度bucket并计padding开销",
      ],
    ),
    "采用论文式final sentinel+EOS的明确toy约定；不是所有T5 preprocessing变体的逐token复现，也不测生成质量。",
  ),
  bart: define(
    "bart",
    "BART infilling 为什么仍要重建整段原文？",
    "原始8token序列；把一个连续span替换为单个MASK，decoder target为完整8tokens再加EOS。",
    C(
      "Removed span length",
      1,
      6,
      1,
      3,
      "先固定noise recipe再比较span length；BART reconstruction target包含未损坏tokens，不能套用T5 target长度。",
    ),
    ({ x }) => {
      const enc = 8 - x + 1,
        target = 9;
      return {
        stages: [
          S(
            "Original sequence",
            "固定8tokens；改变的是被破坏span长度。",
            "N=8",
            ["kept", "removed"],
            [8 - x, x],
            "tokens",
          ),
          S(
            "Replace span",
            "不论span包含几token，在encoder里都由一个MASK替代。",
            `input length=8−${x}+1=${enc}`,
            ["kept", "MASK"],
            [8 - x, 1],
            "tokens",
          ),
          S(
            "Full reconstruction",
            "Decoder负责整段原文，并不是只预测被删除的span。",
            "target=8 original+1 EOS",
            ["original content", "EOS"],
            [8, 1],
            "tokens",
          ),
          S(
            "Cross-attention shape",
            "每个target位置可读取整个corrupted input；target self-attention依然causal。",
            `cross matrix: ${target}×${enc}`,
            ["source positions", "target positions", "cross entries"],
            [enc, target, enc * target],
            "count",
          ),
        ],
        outcomes: [
          metric("Corrupted input tokens", enc),
          metric("Cross-attention entries", enc * target),
        ],
      };
    },
    "训练目标若改成只恢复masked spans已换任务；调noise强度需看reconstruction难度和下游validation，不用本例长度推断性能。",
    D(
      [
        "输出直接复制且不修复",
        "核noise是否真正写入encoder input",
        "展示破坏前后样本并检查labels仍为完整原文",
      ],
      [
        "Decoder loss错位",
        "核BOS/EOS与shift-right",
        "对短序列手工核每步输入/target对应关系",
      ],
    ),
    "单span text infilling的长度计算；未模拟sentence permutation等其它BART corruption，也不运行checkpoint。",
  ),
  "in-context-learning": define(
    "in-context-learning",
    "Context 示例如何在没有 weight update 时改变输出？",
    "三个固定示例positions=[0,1,2]、labels=[0,0,1]；toy attention scores=−(query−position)²，values=labels。",
    C(
      "Query position",
      0,
      2,
      0.1,
      1,
      "本例通过一个固定attention reader展示context读取；真实ICL应改变示例顺序/内容并验证，不能从这个kernel推断LLM准确率。",
    ),
    ({ x }) => {
      const pos = [0, 1, 2],
        dist = pos.map((a) => (x - a) ** 2),
        scores = dist.map((a) => -a),
        p = softmax(scores),
        parts = p.map((a, i) => a * [0, 0, 1][i]);
      return {
        stages: [
          S(
            "Context examples",
            "示例label作为value留在context，参数没有optimizer更新。",
            "values=[0,0,1]",
            ["example0", "example1", "example2"],
            [0, 0, 1],
            "label",
          ),
          S(
            "Query similarity",
            "这里手工定义distance kernel，让中间计算可检查。",
            `score_i=−(${fmt(x)}−position_i)²`,
            ["example0", "example1", "example2"],
            scores,
            "score",
          ),
          S(
            "Read attention",
            "Softmax不是硬nearest neighbor；多个示例都可贡献。",
            "α=softmax(scores)",
            ["example0", "example1", "example2"],
            p,
            "weight",
          ),
          S(
            "Label mixture",
            "同一固定计算规则通过context提供label信息。",
            `y=Σα_i label_i=${fmt(sum(parts))}`,
            [
              "example0 contribution",
              "example1 contribution",
              "example2 contribution",
            ],
            parts,
            "label contribution",
          ),
        ],
        outcomes: [
          metric("Toy label1 score", sum(parts)),
          metric("Example0 attention", p[0]),
        ],
      };
    },
    "实际few-shot提示从少量代表性示例起，固定template并做order/label-balance消融；不得把test label放进demonstrations。",
    D(
      [
        "示例顺序一变结果大变",
        "检查position bias与示例覆盖",
        "用多个顺序评估并报告方差",
      ],
      [
        "Few-shot效果过好",
        "检查demonstration与test的重复/近重复",
        "按sample或patient分组去重后再测",
      ],
    ),
    "这是attention-based label reading的合成类比，不是ICL形成机制的完整理论或真实LLM运行；权重固定、无gradient step。",
  ),
  "chain-of-thought-prompting": define(
    "chain-of-thought-prompting",
    "把计算步骤写出来，哪些环节可以被逐项验证？",
    "原价100，先discount d%，再对折后金额加10% tax；另比较错误shortcut：直接从110减去d。",
    C(
      "Discount d (%)",
      0,
      40,
      5,
      20,
      "先定义运算顺序和单位；算术步骤可交给calculator验证，文字reasoning的流畅度不是正确性的证据。",
    ),
    ({ x }) => {
      const after = 100 * (1 - x / 100),
        tax = 0.1 * after,
        total = after + tax,
        wrong = 110 - x;
      return {
        stages: [
          S(
            "Extract quantities",
            "把percentage写成比例；tax的base是折后金额。",
            `discount fraction=${x}/100`,
            ["discount fraction", "tax fraction"],
            [x / 100, 0.1],
            "fraction",
          ),
          S(
            "First operation",
            "折扣先作用在原价100。",
            `subtotal=100(1−${x}/100)=${fmt(after)}`,
            ["original", "discount amount", "subtotal"],
            [100, x, after],
            "currency",
          ),
          S(
            "Second operation",
            "Tax取subtotal的10%，不是原价的10%。",
            `tax=.1×${fmt(after)}=${fmt(tax)}`,
            ["subtotal", "tax", "total"],
            [after, tax, total],
            "currency",
          ),
          S(
            "Verify alternative",
            "直接减d的shortcut忽略折扣同时减少tax；可以用独立calculator检测。",
            `error=(110−d)−110(1−d/100)=.1d`,
            ["verified total", "wrong shortcut", "error"],
            [total, wrong, wrong - total],
            "currency",
          ),
        ],
        outcomes: [
          metric("Verified total", total),
          metric("Shortcut error", wrong - total),
        ],
      };
    },
    "适合可分解且可验证的算术/程序任务；对事实检索优先核证据，对高风险结论需要外部validation而非只要求更多reasoning文字。",
    D(
      [
        "步骤很完整但答案错",
        "逐步核单位、前提和运算顺序",
        "用独立calculator或tests验证关键中间值",
      ],
      [
        "多次输出一致仍不可信",
        "检查是否重复同一错误假设",
        "引入独立证据或不同验证路径",
      ],
    ),
    "展示可验证的任务分解，不调用LLM、不模拟其内部chain of thought，也不保证生成的reasoning忠实于内部过程。",
  ),
};
