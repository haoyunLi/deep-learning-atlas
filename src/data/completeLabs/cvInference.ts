import type { CompleteLabMap } from "./types";
import { define, C, S, M, L, D, fmt, metric, softmax, sum } from "./cvHelpers";
export const cvInferenceLabs: CompleteLabMap = {
  tokenization: define(
    "tokenization",
    "BPE 的一次 merge 怎样改变 token 边界和序列长度？",
    "固定文本ababab；从字符tokens开始，每轮取频率最高的相邻pair，greedy non-overlapping merge；最多2轮。",
    C(
      "BPE merges",
      0,
      2,
      1,
      1,
      "这里只学习tiny vocabulary；真实推理必须使用checkpoint原配tokenizer，不能临时重学merge规则。",
    ),
    ({ x }) => {
      let tokens = ["a", "b", "a", "b", "a", "b"];
      const lengths = [6];
      let chosen = "none",
        count = 0;
      for (let r = 0; r < x; r++) {
        const counts = new Map<string, number>();
        for (let i = 0; i < tokens.length - 1; i++) {
          const k = tokens[i] + "|" + tokens[i + 1];
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
        const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
        chosen = best[0];
        count = best[1];
        const [a, b] = chosen.split("|"),
          next: string[] = [];
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i] === a && tokens[i + 1] === b) {
            next.push(a + b);
            i++;
          } else next.push(tokens[i]);
        }
        tokens = next;
        lengths.push(tokens.length);
      }
      return {
        stages: [
          S(
            "Initial pair counts",
            "在字符序列中ab出现3次、ba出现2次。",
            "ababab → a|b|a|b|a|b",
            ["a+b", "b+a"],
            [3, 2],
            "adjacent pair count",
          ),
          S(
            "Selected merge history",
            "相邻pair计数可重叠，实际replacement不能重叠；第二轮ab|ab计数2但只替换1处。",
            `rounds=${x}; last pair=${chosen}; observed count=${count}`,
            ["performed merges", "last pair occurrences"],
            [x, count],
            "count",
          ),
          S(
            "New token boundaries",
            "Bar宽度数值是该token覆盖的字符数，连接后仍为原始字符串。",
            `tokens=[${tokens.join(",")}]`,
            tokens.map((t, i) => `${i + 1}:${t}`),
            tokens.map((t) => t.length),
            "characters/token",
          ),
          L(
            "Length and attention cost",
            "这里只计dense attention的N² score entries；tokenizer变化也改变embedding IDs，不能直接套入旧checkpoint。",
            `N=${tokens.length}; N²=${tokens.length ** 2}`,
            Array.from({ length: lengths.length }, (_, i) => i),
            lengths.map((n) => n * n),
            "merge rounds",
            "attention score entries",
          ),
        ],
        outcomes: [
          metric("Token count", tokens.length),
          metric("Score entries", tokens.length ** 2),
        ],
      };
    },
    "比较tokenizer时用同一原始文本，报告characters/bytes per token及领域术语拆分；token数少不自动代表模型质量好。",
    D(
      [
        "同一句话token IDs对不上",
        "检查tokenizer版本、special tokens和normalization",
        "加载与checkpoint同源的tokenizer并做round-trip测试",
      ],
      [
        "医学/基因术语碎片很多",
        "统计真实领域文本的token length与截断比例",
        "对比领域tokenizer但重新评估/训练兼容模型",
      ],
    ),
    "真实执行这个六字符fixture的BPE pair counting/merge；未重现byte-level、Unicode normalization或生产vocabulary。",
  ),
  "positional-encoding": define(
    "positional-encoding",
    "RoPE 为什么能把 relative distance 写进 dot product？",
    "单个2D frequency pair，q=k=[1,0]；query position=0，key position=Δ，angular frequency=.25 rad/position。",
    C(
      "Relative position Δ",
      0,
      8,
      1,
      2,
      "不同frequency pairs共同编码位置；context extension不能只凭这一对rotation曲线决定scale。",
    ),
    ({ x }) => {
      const theta = 0.25 * x,
        c = Math.cos(theta),
        s = Math.sin(theta);
      return {
        stages: [
          S(
            "Relative phase",
            "只有这一对frequency，angle随相对位置线性增加。",
            `θ=.25×${x}=${fmt(theta)}`,
            ["q angle", "k angle"],
            [0, theta],
            "radians",
          ),
          M(
            "Rotation matrix",
            "正交rotation保持vector norm。",
            "Rθ=[[cosθ,−sinθ],[sinθ,cosθ]]",
            ["row1", "row2"],
            ["column1", "column2"],
            [
              [c, -s],
              [s, c],
            ],
            "coefficient",
          ),
          S(
            "Rotate key",
            "同一个content vector在不同position转向不同方向。",
            `Rθ[1,0]=[${fmt(c)},${fmt(s)}]`,
            ["rotated k1", "rotated k2"],
            [c, s],
            "coordinate",
          ),
          S(
            "Relative dot product",
            "qᵀk原本为1；rotation后score取决于relative phase，同时norm仍为1。",
            "(R0q)ᵀ(RΔk)=cos(.25Δ)",
            ["unrotated score", "rotated score", "rotated squared norm"],
            [1, c, c * c + s * s],
            "value",
          ),
        ],
        outcomes: [
          metric("Rotated score", c),
          metric("Key second coordinate", s),
        ],
      };
    },
    "使用pretrained RoPE时核base、dimension pairing、position IDs和cache offset；改变scaling需用长context retrieval等验证。",
    D(
      [
        "Cached generation与full forward不一致",
        "检查新增token的position offset",
        "逐token比较同一prefix的logits并修正position IDs",
      ],
      [
        "长context分数突然变差",
        "检查训练context范围与RoPE scaling配置",
        "分distance评估，不能只扩大maximum length",
      ],
    ),
    "单frequency pair的精确rotation，不模拟完整multihead attention，也不表示长context效果。",
  ),
  "autoregressive-inference": define(
    "autoregressive-inference",
    "Temperature 怎样改变 next-token probability 与一次采样？",
    "同一prefix的三个固定logits=[2,1,0]，使用inverse-CDF sampling，固定uniform draw u=.65；仅改变temperature。",
    C(
      "Temperature T",
      0.2,
      2,
      0.1,
      1,
      "先用greedy或T=1基线；降低T会更集中但不保证事实正确，比较结果时固定其它decoding参数。",
    ),
    ({ x }) => {
      const z = [2, 1, 0].map((a) => a / x),
        p = softmax(z),
        cdf = p.map((_, i) => sum(p.slice(0, i + 1))),
        sample = cdf.findIndex((a) => 0.65 < a),
        entropy = -sum(p.map((a) => a * Math.log(a)));
      return {
        stages: [
          S(
            "Temperature scaling",
            "logits先除T；T不是概率的线性缩放。",
            `z/T=[${z.map((a) => fmt(a)).join(",")}]`,
            ["A", "B", "C"],
            z,
            "scaled logit",
          ),
          S(
            "Next-token distribution",
            "Softmax重新归一化，低分token并不会必然变为零。",
            "p=softmax(z/T)",
            ["A", "B", "C"],
            p,
            "probability",
          ),
          S(
            "Cumulative probability",
            "固定u可以隔离parameter effect；不同seed还会造成采样差异。",
            `CDF; draw=.65; chosen index=${sample}`,
            ["A cumulative", "B cumulative", "C cumulative"],
            cdf,
            "cumulative probability",
          ),
          S(
            "Uncertainty summary",
            "Entropy度量分布分散程度，不是事实可靠度。",
            `H=−Σp logp=${fmt(entropy)}`,
            ["entropy", "maximum entropy log3"],
            [entropy, Math.log(3)],
            "nats",
          ),
        ],
        outcomes: [
          metric("Entropy", entropy, "nats"),
          metric("Sample token index", sample),
        ],
      };
    },
    "若需要结构化输出，应加schema/grammar约束和validation；top-p/top-k再改变support时要记录与temperature的组合顺序。",
    D(
      [
        "回答重复或多样性不足",
        "核T、top-p、repetition penalty和prompt",
        "逐个变量调整并保留固定seed对照",
      ],
      [
        "采样后出现无效JSON",
        "检查是否只有prompt要求而没有输出约束",
        "使用支持的schema约束并验证/重试",
      ],
    ),
    "只算一个固定prefix的下一token分布；没有真实LM或长序列生成，entropy不能当accuracy。",
  ),
  "kv-cache": define(
    "kv-cache",
    "Context 加倍时，KV Cache 的哪一维随之增长？",
    "B=1、4layers、8KV heads、head dimension16、FP16每值2bytes；存全部prefix的K和V，不计weights/activations。",
    C(
      "Context length exponent e",
      4,
      12,
      1,
      6,
      "L=2^e；按实际KV heads、dtype、batch和layers估算，再用runtime memory profiler确认。",
    ),
    ({ x }) => {
      const len = 2 ** x,
        one = len * 8 * 16,
        total = 2 * 4 * one * 2;
      return {
        stages: [
          S(
            "Cache shape",
            "每层K与V分别具有[B,Hkv,L,D]的逻辑shape；实现layout可以不同。",
            `[1,8,${len},16]`,
            ["batch", "KV heads", "positions", "head dimension"],
            [1, 8, len, 16],
            "dimension",
          ),
          S(
            "One tensor",
            "只一个layer的一份K，不包括V。",
            `values=1×8×${len}×16=${one}`,
            ["K values", "V values"],
            [one, one],
            "elements/layer",
          ),
          S(
            "All layers and dtype",
            "乘2(K/V)、4layers、2bytes。",
            `bytes=2×4×${one}×2=${total}`,
            ["one layer MiB", "four layers MiB"],
            [total / 4 / 2 ** 20, total / 2 ** 20],
            "MiB",
          ),
          S(
            "Append one token",
            "KV Cache避免重算旧K/V；新query仍读取已有context。",
            "increment=2×4×8×16×2=2048 bytes/token",
            ["current cache", "one extra token"],
            [total, total + 2048],
            "bytes",
          ),
        ],
        outcomes: [
          metric("KV cache", total / 2 ** 20, "MiB"),
          metric("Context tokens", len),
        ],
      };
    },
    "长context服务先核batch并发与cache allocation策略；quantized/offloaded/sliding-window cache会改变公式适用范围和latency。",
    D(
      [
        "估算远小于实际VRAM",
        "检查weights、temporary activations、allocator与padding",
        "把KV预算单独报告，再实测peak allocated/reserved",
      ],
      [
        "Cache开启后输出不一致",
        "核attention mask长度、position IDs及旧cache复用",
        "用同一prefix比较cached/full-forward logits",
      ],
    ),
    "只计算未压缩全长KV的logical bytes；不估算总VRAM、allocator overhead或tokens/second。",
  ),
  "grouped-query-attention": define(
    "grouped-query-attention",
    "GQA 共用K/V为什么能减少cache？",
    "固定8query heads、4layers、context64、head dimension16、FP16、batch1；KV head数=2^e，必须整除query heads。",
    C(
      "KV-head exponent e",
      0,
      3,
      1,
      1,
      "Hkv=2^e；这是architecture选择，不是任意checkpoint推理时可直接修改的开关。",
    ),
    ({ x }) => {
      const h = 2 ** x,
        groups = 8 / h,
        bytes = 2 * 4 * 64 * h * 16 * 2,
        baseline = 2 * 4 * 64 * 8 * 16 * 2,
        mapping = Array.from({ length: 8 }, (_, i) => Math.floor(i / groups));
      return {
        stages: [
          S(
            "Query/KV counts",
            "Query heads保持8，只减少独立的K/V projections。",
            `Hq=8,Hkv=${h},group size=${groups}`,
            ["query heads", "KV heads", "queries per KV"],
            [8, h, groups],
            "heads",
          ),
          S(
            "Shared-key assignment",
            "每组query仍有自己的query vector，读取同一份K/V。",
            `KVgroup(q)=floor(q/${groups})`,
            mapping.map((_, i) => `q${i}`),
            mapping,
            "KV group index",
          ),
          S(
            "Cache storage",
            "缓存按Hkv存储，不应该为了broadcast永久复制成Hq份。",
            `bytes=2×4×64×${h}×16×2`,
            ["MHA baseline", "current GQA"],
            [baseline / 2 ** 20, bytes / 2 ** 20],
            "MiB",
          ),
          S(
            "Capacity tradeoff",
            "比率只说明KV存储；query attention计算和质量不能按同一比率推断。",
            `ratio=Hkv/Hq=${fmt(h / 8)}`,
            ["cache retained", "cache saved"],
            [h / 8, 1 - h / 8],
            "fraction",
          ),
        ],
        outcomes: [
          metric("KV cache", bytes / 2 ** 20, "MiB"),
          metric("Queries per KV head", groups),
        ],
      };
    },
    "选择支持的GQA/MQA checkpoint；若从MHA转换需要projection处理与适配训练，验证quality和kernel实际memory行为。",
    D(
      [
        "Hkv减少但VRAM不降",
        "检查是否repeat物化K/V及其它memory主项",
        "使用支持GQA的kernel并单独profile缓存",
      ],
      [
        "直接改head数无法load weights",
        "核projection shape与checkpoint架构",
        "使用匹配checkpoint或明确的conversion/training流程",
      ],
    ),
    "精确cache和group mapping预算，不模拟GQA training，不声称等比例加速或相同accuracy。",
  ),
  "retrieval-augmented-generation": define(
    "retrieval-augmented-generation",
    "Top-k 增大时，证据覆盖与context成本如何变化？",
    "固定ranked documents d1…d5，relevant=[0,1,0,0,1]，lengths=[120,80,200,100,60]tokens；两个gold evidence docs已知。",
    C(
      "Retrieved top-k",
      1,
      5,
      1,
      2,
      "先用retrieval Recall@k与context预算定位问题；不能用更多检索片段替代证据质量和citation verification。",
    ),
    ({ x }) => {
      const lens = [120, 80, 200, 100, 60],
        rel = [0, 1, 0, 0, 1],
        kept = rel.slice(0, x),
        hit = sum(kept),
        tokens = sum(lens.slice(0, x));
      return {
        stages: [
          S(
            "Ranked evidence",
            "排名固定，便于单独观察top-k截断效果。",
            "gold docs=d2,d5",
            ["d1", "d2", "d3", "d4", "d5"],
            rel,
            "gold relevance",
          ),
          S(
            "Retrieve prefix",
            "被取入context的文档未必相关。",
            `selected=d1…d${x}`,
            Array.from({ length: x }, (_, i) => `d${i + 1}`),
            lens.slice(0, x),
            "tokens",
          ),
          S(
            "Retrieval metrics",
            "Recall分母是全部2份gold docs；precision分母是取回k份。",
            `Recall=${hit}/2;Precision=${hit}/${x}`,
            ["Recall@k", "Precision@k"],
            [hit / 2, hit / x],
            "fraction",
          ),
          S(
            "Context cost",
            "还需加system prompt、query和generation budget；本例仅相加document tokens。",
            `evidence tokens=${lens.slice(0, x).join("+")}=${tokens}`,
            ["relevant tokens", "irrelevant tokens"],
            [
              sum(lens.slice(0, x).map((n, i) => n * kept[i])),
              sum(lens.slice(0, x).map((n, i) => n * (1 - kept[i]))),
            ],
            "tokens",
          ),
        ],
        outcomes: [
          metric("Evidence recall", hit / 2),
          metric("Document context tokens", tokens),
        ],
      };
    },
    "低Recall先核chunking、embedding和hybrid retrieval，再调reranker/top-k；检索已正确而回答错时检查grounding和citation，不只继续增k。",
    D(
      [
        "答案缺关键依据",
        "检查gold evidence是否进入retrieved set",
        "先修retriever召回，再检查context截断",
      ],
      [
        "有引用但不支持结论",
        "逐条核claim与quoted passage",
        "加入citation entailment核查和拒答路径",
      ],
    ),
    "真实计算固定ranking的retrieval metrics与token成本；不调用retriever/LLM，不把Recall等同answer correctness。",
  ),
  "time-series-forecasting": define(
    "time-series-forecasting",
    "Forecast horizon 改变时，怎样公平比较基线误差？",
    "训练历史[1,2,3,4]，origin固定在t4；trend baseline预测[5,6,7,8]，last-value baseline全为4。未来观测[5,4,7,6]只用于事后评分。",
    C(
      "Evaluation horizon H",
      1,
      4,
      1,
      2,
      "先固定prediction origin与可用features；H不同是不同任务，不能只挑最低误差的horizon报告。",
    ),
    ({ x }) => {
      const future = [5, 4, 7, 6].slice(0, x),
        pred = [5, 6, 7, 8].slice(0, x),
        err = pred.map((a, i) => Math.abs(a - future[i])),
        base = future.map((a) => Math.abs(4 - a));
      return {
        stages: [
          L(
            "Available history",
            "此时只能看到t≤4，scaling与feature fit也必须停在这里。",
            "xtrain=[1,2,3,4]",
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            "time",
            "observed value",
          ),
          S(
            "Forecast before reveal",
            "trend slope取最后两点的差1；不读取未来来拟合。",
            `ŷ_(4+h)=4+h, h=1…${x}`,
            pred.map((_, i) => `h${i + 1}`),
            pred,
            "prediction",
          ),
          S(
            "Reveal future errors",
            "只有评估阶段才引入未来labels。",
            "absolute error=|forecast−observed|",
            err.map((_, i) => `h${i + 1}`),
            err,
            "absolute error",
          ),
          S(
            "Compare baselines",
            "两模型使用同一origin、同一horizon和同一未来labels。",
            `MAEtrend=${fmt(sum(err) / x)};MAElast=${fmt(sum(base) / x)}`,
            ["trend MAE", "last-value MAE"],
            [sum(err) / x, sum(base) / x],
            "MAE",
          ),
        ],
        outcomes: [
          metric("Trend MAE", sum(err) / x),
          metric("Last-value MAE", sum(base) / x),
        ],
      };
    },
    "真实项目使用rolling-origin跨多个时间起点评估，并按horizon分别汇总；seasonal数据先加seasonal-naive，空间/患者依赖要额外分组。",
    D(
      [
        "随机split远好于线上",
        "核lookahead与跨时间重复",
        "改rolling-origin并在每fold内fit preprocessing",
      ],
      [
        "长horizon误差快速扩大",
        "比较direct/recursive策略及seasonal baseline",
        "按horizon分析bias与interval coverage",
      ],
    ),
    "一个origin的确定性baseline手算，不是充分的forecast backtest；未来values仅评分，未用于拟合。",
  ),
};
