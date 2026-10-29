import {
  type CompleteLabMap,
  metric,
  line,
  matrix,
  fmt,
  mean,
  sum,
  softmax,
} from "./types";
import { make, control, stage, entropy, sq, range } from "./mlHelpers";
export const mlSystemsLabs: CompleteLabMap = {
  "energy-based-models": make(
    "energy-based-models",
    "Energy 差距怎样变成 probability？",
    "三个离散state的energy固定为[0,1,2]，完整枚举partition function。",
    control(
      "Temperature T",
      0.2,
      3,
      0.2,
      1,
      "越小越偏向最低energy；T不是训练学习率。",
    ),
    (T) => {
      const E = [0, 1, 2],
        w = E.map((e) => Math.exp(-e / T)),
        Z = sum(w),
        p = w.map((v) => v / Z),
        contributions = p.map((v, i) => v * E[i]);
      return {
        stages: [
          stage(
            "设定energy landscape",
            "Energy相对差异决定偏好；同时平移所有energy不改变归一化概率。",
            "E=[0,1,2]",
            ["state0", "state1", "state2"],
            E,
            "energy",
          ),
          stage(
            "转换unnormalized mass",
            "Temperature缩放energy difference，再取指数。",
            `w=exp(−E/${fmt(T)}); Z=${fmt(Z)}`,
            ["w0", "w1", "w2"],
            w,
            "mass",
          ),
          stage(
            "计算partition function",
            "这里只有三个state，所以能够精确求和；高维模型通常难以如此枚举。",
            `p_i=w_i/Z; Σp=${fmt(sum(p))}`,
            ["p0", "p1", "p2"],
            p,
            "probability",
          ),
          stage(
            "观察集中程度",
            "降低Temperature会降低本例的expected energy，并使概率更集中。",
            `E_p[E]=Σp_i E_i=${fmt(sum(contributions))}; H=${fmt(entropy(p))}`,
            ["contribution0", "contribution1", "contribution2"],
            contributions,
            "energy",
          ),
        ],
        outcomes: [
          metric("Expected energy", sum(contributions)),
          metric("Entropy", entropy(p), "nats"),
        ],
      };
    },
    {
      use: [
        "需要表达兼容程度而不直接定义normalized likelihood时考虑EBM。",
        "离散且state space很小时可精确枚举，作为sampling近似的校验基线。",
      ],
      tune: [
        "从T=1与原energy scale开始；若概率过尖，比较T增大后entropy和calibration。",
        "训练时单独调negative-sampling步数；negative energy很低但samples不混合时延长chain并检查多起点。",
      ],
      fail: [
        [
          "probability总和不为1",
          "检查是否除以同一partition function。",
          "用log-sum-exp归一化并核对Σp=1。",
        ],
        [
          "samples一直卡在一个mode",
          "检查energy barrier、proposal scale和多chain轨迹。",
          "改变sampler、tempering或更长mixing；不能只看训练loss。",
        ],
      ],
      limit: "精确三state Boltzmann分布；没有学习energy、MCMC训练或图像生成。",
    },
  ),
  ddpm: make(
    "ddpm",
    "噪声预测误差为何会在低signal时被放大？",
    "x₀=2，固定噪声ε=.5；错误noise predictor输出εhat=.3。只计算一个forward marginal及x₀反推。",
    control(
      "Cumulative alpha ᾱ",
      0.1,
      0.9,
      0.1,
      0.5,
      "ᾱ是保留signal的比例，不是单步β。",
    ),
    (a) => {
      const signal = Math.sqrt(a) * 2,
        noise = Math.sqrt(1 - a) * 0.5,
        xt = signal + noise,
        exact = (xt - Math.sqrt(1 - a) * 0.5) / Math.sqrt(a),
        wrong = (xt - Math.sqrt(1 - a) * 0.3) / Math.sqrt(a),
        err = sq(wrong - 2);
      return {
        stages: [
          stage(
            "拆开signal与noise",
            "两项系数平方和为1；这里只固定一个噪声draw，便于公平比较。",
            `signal=√${fmt(a)}×2; noise=√(1−${fmt(a)})×.5`,
            ["signal", "noise"],
            [signal, noise],
            "value",
          ),
          stage(
            "Forward marginal",
            "DDPM可以直接从x₀采样指定t，无需逐步模拟所有前向步骤。",
            `x_t=√ᾱ x₀+√(1−ᾱ)ε=${fmt(xt)}`,
            ["x₀", "x_t"],
            [2, xt],
            "value",
          ),
          stage(
            "用预测noise反推x₀",
            "固定prediction error .2；减去的noise量不足使重建偏高。",
            `x₀hat=(x_t−√(1−ᾱ)εhat)/√ᾱ=${fmt(wrong)}`,
            ["true ε", "predicted ε"],
            [0.5, 0.3],
            "noise",
          ),
          stage(
            "量化重建误差",
            "相同noise error被√((1−ᾱ)/ᾱ)放大，低signal时间段尤其敏感。",
            `x₀hat−x₀=.2√((1−ᾱ)/ᾱ)=${fmt(wrong - 2)}`,
            ["truth", "oracle reconstruction", "imperfect reconstruction"],
            [2, exact, wrong],
            "value",
          ),
        ],
        outcomes: [
          metric("Reconstruction squared error", err),
          metric("Noisy x_t", xt),
        ],
      };
    },
    {
      use: [
        "需要高质量、多mode生成且接受迭代sampling成本时考虑Diffusion。",
        "调试noise prediction时先做固定seed的forward/reconstruction单元检查。",
      ],
      tune: [
        "先沿用经验证的noise schedule与prediction target；按t分桶看loss，不盲改β范围。",
        "本沙盘从ᾱ=.5比较.1与.9；实际改sampling步数时重新比较质量和latency。",
      ],
      fail: [
        [
          "低noise loss但sample差",
          "检查ε、x₀或v prediction与scheduler配置是否一致。",
          "统一training target、normalization和inference scheduler。",
        ],
        [
          "重建出现巨大值",
          "检查ᾱ很小时的除法、dtype与noise residual。",
          "使用稳定scheduler实现并诊断分时间段误差。",
        ],
      ],
      limit:
        "单维forward与x₀估计的精确代数；没有训练denoiser或实现完整reverse Markov chain，误差不是图像质量指标。",
    },
  ),
  ddim: make(
    "ddim",
    "DDIM 的 η 如何在确定性和随机性之间移动？",
    "固定ᾱ_t=.4、ᾱ_s=.7、x_t=1、εhat=.2、z=1；计算一个从t到s的reverse step。",
    control(
      "Stochasticity η",
      0,
      1,
      0.1,
      0,
      "η=0时此step确定；固定z让参数对比可复算。",
    ),
    (eta) => {
      const at = 0.4,
        as = 0.7,
        eps = 0.2,
        x0 = (1 - Math.sqrt(1 - at) * eps) / Math.sqrt(at),
        sigma = eta * Math.sqrt(((1 - as) / (1 - at)) * (1 - at / as)),
        signal = Math.sqrt(as) * x0,
        direction = Math.sqrt(1 - as - sigma * sigma) * eps,
        random = sigma,
        xs = signal + direction + random;
      return {
        stages: [
          stage(
            "从x_t预测clean signal",
            "先用当前noise prediction计算同一个x₀hat。",
            `x₀hat=(1−√.6×.2)/√.4=${fmt(x0)}`,
            ["x_t", "x₀hat"],
            [1, x0],
            "value",
          ),
          stage(
            "计算可注入noise",
            "σ同时取决于η和跳步两端的ᾱ，不能直接把η当σ。",
            `σ=η√[(.3/.6)(1−.4/.7)]=${fmt(sigma)}`,
            ["injected variance", "remaining variance"],
            [sigma * sigma, 0.3 - sigma * sigma],
            "variance",
          ),
          stage(
            "平衡三个方向",
            "随机variance增加时，沿预测ε方向的系数相应减少。",
            `x_s=√.7 x₀hat+√(.3−σ²)εhat+σz`,
            ["signal", "predicted-noise direction", "random draw"],
            [signal, direction, random],
            "value",
          ),
          stage(
            "执行reverse step",
            "相同x_t与predictor下，η改变这一次step；不代表η越大质量越好。",
            `x_s=${fmt(signal)}+${fmt(direction)}+${fmt(random)}=${fmt(xs)}`,
            ["input x_t", "output x_s"],
            [1, xs],
            "value",
          ),
        ],
        outcomes: [
          metric("Reverse-step x_s", xs),
          metric("Injected variance", sigma * sigma),
        ],
      };
    },
    {
      use: [
        "希望使用较少sampling steps或可重复latent trajectory时尝试DDIM。",
        "需要研究seed与stochasticity影响时固定模型与起始noise，再比较η。",
      ],
      tune: [
        "从η=0建立deterministic基线；再比较.5与1，固定相同seed和step schedule。",
        "从模型建议的step数开始逐渐减少；出现细节损失时增加steps而非仅改η。",
      ],
      fail: [
        [
          "square root出现NaN",
          "检查reverse方向ᾱ_s应大于ᾱ_t，且σ²≤1−ᾱ_s。",
          "复用scheduler时间索引并核对跳步公式。",
        ],
        [
          "相同seed仍不一致",
          "检查η>0时新增noise draw和随机算子。",
          "固定所有generator或用η=0排查。",
        ],
      ],
      limit:
        "固定noise draw的一维DDIM一步；不模拟模型学习、整段trajectory或真实sample diversity。",
    },
  ),
  "latent-diffusion": make(
    "latent-diffusion",
    "空间压缩节省多少位置，又丢掉哪些细节？",
    "八个signal values=[0,1,0,1,2,3,2,3]；用block mean encoder和repeat decoder模拟可解释的压缩瓶颈。",
    control(
      "Compression exponent e",
      0,
      3,
      1,
      1,
      "block size f=2^e；这是toy codec，不是训练后的VAE。",
    ),
    (e) => {
      const x = [0, 1, 0, 1, 2, 3, 2, 3],
        f = 2 ** e,
        z = range(8 / f).map((i) => mean(x.slice(i * f, (i + 1) * f))),
        reconstruction = x.map((_, i) => z[Math.floor(i / f)]),
        errors = x.map((v, i) => sq(v - reconstruction[i]));
      return {
        stages: [
          stage(
            "观察原signal",
            "相邻0/1与2/3代表fine detail，较大尺度上还有低/高区块。",
            "x=[0,1,0,1,2,3,2,3]",
            x.map((_, i) => `x${i}`),
            x,
            "value",
          ),
          stage(
            "编码到较少位置",
            "同一block内的信息被平均，latent长度随压缩增大而减少。",
            `z_j=mean(block_j); f=${f}; positions=${z.length}`,
            z.map((_, i) => `z${i}`),
            z,
            "value",
          ),
          stage(
            "Decode回原长度",
            "重复block mean无法恢复encoder已经丢掉的差异。",
            "xhat_i=z_floor(i/f)",
            reconstruction.map((_, i) => `xhat${i}`),
            reconstruction,
            "value",
          ),
          stage(
            "量化压缩损失",
            "真实latent diffusion先依赖autoencoder保留任务相关细节，再在latent上学习生成。",
            `MSE=${fmt(mean(errors))}; 1D positions ratio=1/${f}`,
            errors.map((_, i) => `error${i}`),
            errors,
            "squared error",
          ),
        ],
        outcomes: [
          metric("Reconstruction MSE", mean(errors)),
          metric("Latent positions", z.length),
        ],
      };
    },
    {
      use: [
        "高分辨率生成受pixel-space计算成本限制时考虑latent diffusion。",
        "科研图像先验证codec是否保留细胞边界或微小病灶，再评估生成。",
      ],
      tune: [
        "本例从f=2比较4、8；真实模型选择已有codec的compression factor并测reconstruction。",
        "先固定codec调denoiser；若codec就丢失关键细节，增加sampling steps无法修复。",
      ],
      fail: [
        [
          "图像大结构正确但小目标消失",
          "独立检查encoder→decoder reconstruction及small-object metrics。",
          "换更细latent或更合适codec，再训练diffusion。",
        ],
        [
          "换VAE后颜色或scale异常",
          "检查latent scaling factor与training normalization。",
          "使用与checkpoint匹配的codec和scaling。",
        ],
      ],
      limit:
        "Block mean是明确的toy codec；没有声称它等同VAE，也未估计真实模型FLOPs、image quality或memory。",
    },
  ),
  "flow-matching": make(
    "flow-matching",
    "给定一条 path，velocity target 从哪里来？",
    "一对endpoints：noise x₀=−2、data x₁=3；使用straight conditional path x_t=(1−t)x₀+t x₁。",
    control(
      "Time t",
      0,
      1,
      0.05,
      0.5,
      "从noise端移到data端，观察position与velocity的区别。",
    ),
    (t) => {
      const xt = -2 + 5 * t,
        dt = Math.min(0.1, 1 - t),
        next = xt + dt * 5,
        times = range(21).map((i) => i / 20);
      return {
        stages: [
          stage(
            "选择endpoint coupling",
            "此处只给一对端点；真实training会对许多noise/data pairs采样。",
            "x₀=−2; x₁=3",
            ["noise endpoint", "data endpoint"],
            [-2, 3],
            "position",
          ),
          stage(
            "构造interpolated state",
            "t决定在path上的位置，而不是model的学习率。",
            `x_t=(1−${fmt(t)})×(−2)+${fmt(t)}×3=${fmt(xt)}`,
            ["current x_t"],
            [xt],
            "position",
            line(
              times,
              times.map((s) => -2 + 5 * s),
              "time",
              "position",
            ),
          ),
          stage(
            "求conditional velocity",
            "对t求导，straight path的velocity在本例恒为5。",
            "u_t=dx_t/dt=x₁−x₀=5",
            ["target velocity", "example predicted velocity"],
            [5, 4],
            "position/time",
          ),
          stage(
            "一步Euler更新",
            "正确velocity将state向终点推进；最后一步缩短到t=1，终点处step为0。",
            `Δt=min(.1,1−t)=${fmt(dt)}; x_next=x_t+Δt×5=${fmt(next)}; velocity MSE=1`,
            ["current", "Euler next"],
            [xt, next],
            "position",
          ),
        ],
        outcomes: [
          metric("Interpolated x_t", xt),
          metric("Euler next position", next),
        ],
      };
    },
    {
      use: [
        "希望通过velocity regression学习continuous generative dynamics时考虑Flow Matching。",
        "研究不同path/coupling对training target难度的影响时，先画conditional trajectories。",
      ],
      tune: [
        "从uniform t和标准straight path基线开始；按t分桶查看velocity error。",
        "推理先用论文/实现默认solver设置，再减少steps比较integration error与sample质量。",
      ],
      fail: [
        [
          "生成方向反了",
          "检查t=0/1对应noise还是data，以及sampler积分方向。",
          "用两个已知端点做单步符号测试。",
        ],
        [
          "增加solver steps仍有偏差",
          "比较velocity prediction error与integration error。",
          "改善模型或path；solver只能降低数值误差。",
        ],
      ],
      limit:
        "一条已知conditional path及Euler arithmetic；真实边缘velocity需要对conditional paths学习，图不代表learned flow或生成效果。",
    },
  ),
  scvi: make(
    "scvi",
    "相同表达比例为何会产生不同count likelihood？",
    "一个gene的ρ=.2、Negative Binomial dispersion θ=2，观测y=3；observed library size ℓ≥3可调。",
    control(
      "Library size ℓ",
      3,
      12,
      1,
      5,
      "保持biological proportion固定，只改count depth。",
    ),
    (l) => {
      const rho = 0.2,
        mu = l * rho,
        theta = 2,
        ps = range(11).map(
          (y) => (y + 1) * sq(theta / (theta + mu)) * (mu / (theta + mu)) ** y,
        ),
        p = ps[3],
        nll = -Math.log(p),
        variance = mu + (mu * mu) / theta;
      return {
        stages: [
          stage(
            "分开proportion与depth",
            "Decoder proportion与library size相乘得到count mean；ρ本身不随depth变。",
            `μ=ℓρ=${l}×.2=${fmt(mu)}`,
            ["proportion ρ", "library size ℓ", "count mean μ"],
            [rho, l, mu],
            "value",
          ),
          stage(
            "指定count dispersion",
            "NB variance高于Poisson mean；θ越小额外dispersion越大。",
            `Var(Y)=μ+μ²/θ=${fmt(variance)}`,
            ["mean", "variance"],
            [mu, variance],
            "count moments",
          ),
          stage(
            "计算观测count的probability",
            "θ=2时组合系数为y+1；图只显示0..10，tail未画出。",
            `P(Y=3)=4(2/(2+μ))²(μ/(2+μ))³=${fmt(p)}`,
            ["P(y=3)"],
            [p],
            "probability",
            line(range(11), ps, "count y", "NB probability"),
          ),
          stage(
            "形成reconstruction objective",
            "Count likelihood衡量该depth下观测的合理性；完整ELBO还需latent KL与其他genes。",
            `NLL=−log P(Y=3)=${fmt(nll)}; illustrative KL=.1`,
            ["NB NLL", "fixed KL", "illustrative negative ELBO"],
            [nll, 0.1, nll + 0.1],
            "nats",
          ),
        ],
        outcomes: [
          metric("NB reconstruction NLL", nll, "nats"),
          metric("Count mean", mu),
        ],
      };
    },
    {
      use: [
        "Single-cell raw counts需要count-aware latent representation和batch covariates时考虑scVI。",
        "优先在有donor/batch信息的设计下评估integration，同时保留真实biology。",
      ],
      tune: [
        "先保留raw integer counts并从官方默认NB/ZINB配置开始；比较held-out likelihood和biological conservation。",
        "从n_latent=10或20的小范围试验开始；增加维度时检查donor leakage与batch-associated axes。",
      ],
      fail: [
        [
          "latent被测序深度主导",
          "检查raw counts layer、library size与batch_key是否正确。",
          "修正输入注册并按depth、donor分层诊断。",
        ],
        [
          "不同condition被过度混合",
          "检查condition与batch是否完全confounded及rare cell type保留情况。",
          "减少不合理covariate correction，使用独立donor验证。",
        ],
      ],
      limit:
        "仅scVI NB decoder的单gene片段；固定ρ与KL，没有训练encoder、batch correction或生物差异检验。",
    },
  ),
  "mixture-of-experts": make(
    "mixture-of-experts",
    "Top-k routing 怎样改变实际参与计算的experts？",
    "一个token的router logits=[2,1,0]，三个expert输出=[2,−1,4]；选top-k后重新归一化权重。",
    control(
      "Active experts k",
      1,
      3,
      1,
      2,
      "这个toy使用renormalized top-k，具体MoE实现可能采用其他gate约定。",
    ),
    (k) => {
      const logits = [2, 1, 0],
        p = softmax(logits),
        mass = sum(p.slice(0, k)),
        gate = p.map((v, i) => (i < k ? v / mass : 0)),
        out = [2, -1, 4],
        terms = gate.map((v, i) => v * out[i]),
        y = sum(terms);
      return {
        stages: [
          stage(
            "Router为token打分",
            "这不是每个expert都执行的dense layer；先决定计算路径。",
            "router logits=[2,1,0]",
            ["expert1", "expert2", "expert3"],
            logits,
            "logit",
          ),
          stage(
            "选择top-k",
            "保留最大的k个router scores，未选择的expert gate设为0。",
            `k=${k}; retained mass=${fmt(mass)}`,
            ["probability1", "probability2", "probability3"],
            p,
            "probability",
          ),
          stage(
            "对selected gates归一化",
            "本例g_i=p_i/selected mass；实际实现需核对是否renormalize。",
            `g=${gate.map((v) => fmt(v)).join(", ")}; Σg=1`,
            ["gate1", "gate2", "gate3"],
            gate,
            "weight",
          ),
          stage(
            "聚合expert outputs",
            "Expert2输出为负，因此增加它可使结果下降；更多experts不自动更好。",
            `y=Σg_i E_i=${fmt(y)}`,
            ["contribution1", "contribution2", "contribution3"],
            terms,
            "output",
          ),
        ],
        outcomes: [metric("Routed output", y), metric("Active experts", k)],
      };
    },
    {
      use: [
        "模型容量需要增长但希望每token只激活部分参数时考虑sparse MoE。",
        "已有足够training与communication infrastructure时比较MoE与同active compute的dense baseline。",
      ],
      tune: [
        "从实现默认top-k开始；如从k=1到2，记录active FLOPs、latency和quality。",
        "从默认capacity factor和load-balancing coefficient开始；expert overflow高时查看token counts再调整。",
      ],
      fail: [
        [
          "少数experts承接几乎全部tokens",
          "检查router entropy、per-expert load和auxiliary balancing loss。",
          "调整balancing/initialization，并排查数据路由偏置。",
        ],
        [
          "理论FLOPs少却更慢",
          "检查all-to-all通信、batch size与expert placement。",
          "测真实端到端latency并优化并行划分。",
        ],
      ],
      limit:
        "单token、三expert的renormalized top-k算例；不是Switch top-1精确实现，没有capacity、load balancing或分布式时间模型。",
    },
  ),
  gcn: make(
    "gcn",
    "加self-loop后，邻居与自身各占多少weight？",
    "三节点path A—B—C，scalar features=[1,0,0]；W=1，采用symmetric degree normalization。",
    control(
      "Self-loop weight α",
      0,
      2,
      0.25,
      1,
      "标准GCN常取α=1；滑动观察degrees同时变化。",
    ),
    (a) => {
      const A = [
          [a, 1, 0],
          [1, a, 1],
          [0, 1, a],
        ],
        d = A.map(sum),
        N = A.map((row, i) => row.map((v, j) => v / Math.sqrt(d[i] * d[j]))),
        x = [1, 0, 0],
        messages = N.map((row) => row.map((v, j) => v * x[j])),
        y = messages.map(sum);
      return {
        stages: [
          stage(
            "构造含self-loop的adjacency",
            "Self-loop不只是加一个message，它还会改变每个node的degree。",
            `Atilde=A+${fmt(a)}I`,
            ["degree A", "degree B", "degree C"],
            d,
            "degree",
            matrix(["A", "B", "C"], ["A", "B", "C"], A, "edge weight"),
          ),
          stage(
            "对两端degree归一化",
            "GCN的symmetric normalization一般不是row-stochastic；不要强制每行和等于1。",
            "S_ij=Atilde_ij/√(d_i d_j)",
            ["S_AA", "S_AB", "S_BA"],
            [N[0][0], N[0][1], N[1][0]],
            "weight",
            matrix(
              ["to A", "to B", "to C"],
              ["from A", "from B", "from C"],
              N,
              "normalized edge",
            ),
          ),
          stage(
            "形成neighbor messages",
            "只有A的input feature非零，所以本轮所有非零message来自A。",
            "message_i←j=S_ij x_j",
            ["A←A", "B←A", "C←A"],
            messages.map((row) => row[0]),
            "message",
          ),
          stage(
            "聚合与update",
            "本例W=1且非负，ReLU不会进一步改值；下一层才可传播到C。",
            `h'=ReLU(Sx)=[${y.map((v) => fmt(v)).join(",")}]`,
            ["A output", "B output", "C output"],
            y,
            "feature",
          ),
        ],
        outcomes: [
          metric("A retained feature", y[0]),
          metric("B received feature", y[1]),
        ],
      };
    },
    {
      use: [
        "Spatial graph中邻接有合理空间含义、局部平滑有价值时试GCN。",
        "Node classification可从1–2层GCN与无graph MLP对照开始。",
      ],
      tune: [
        "从self-loop=1、2层开始；邻居跨组织边界时先调graph构建半径或k。",
        "Hidden width从32/64比较；层数增加时监测node embedding variance和oversmoothing。",
      ],
      fail: [
        [
          "输出几乎相同",
          "检查层数、graph连通度以及每层feature variance。",
          "减少层数/邻居范围，增加residual并保留MLP baseline。",
        ],
        [
          "验证极高但新切片崩溃",
          "检查同donor或相邻spatial tiles是否跨split。",
          "按donor/slide切分并重新构造每个split的graph。",
        ],
      ],
      limit:
        "一层scalar GCN的精确message passing；无学习、不含bias/dropout，不据此推断真实Spatial annotation accuracy。",
    },
  ),
  graphsage: make(
    "graphsage",
    "Fanout 改变后，看到的邻居信息有何不同？",
    "Self feature=2，四个neighbor features=[1,3,5,9]；为可复算固定按列表前k个采样，Mean aggregator后W=[.5,.5]。",
    control(
      "Fanout k",
      1,
      4,
      1,
      2,
      "真实GraphSAGE常随机采样；这里固定顺序以展示一次sample。",
    ),
    (k) => {
      const neighbors = [1, 3, 5, 9],
        chosen = neighbors.slice(0, k),
        m = mean(chosen),
        out = Math.max(0, 0.5 * 2 + 0.5 * m),
        full = mean(neighbors);
      return {
        stages: [
          stage(
            "限定本次receptive field",
            "Fanout决定本层读取哪些邻居；被遗漏的高feature node本次没有message。",
            `selected=[${chosen.join(",")}]`,
            neighbors.map((_, i) => `neighbor${i + 1}`),
            neighbors,
            "feature",
          ),
          stage(
            "对sample求mean",
            "Mean aggregator对已选邻居置换不敏感，但sample本身可以不代表全部邻居。",
            `m=(Σselected)/${k}=${fmt(m)}`,
            ["sampled mean", "full-neighbor mean"],
            [m, full],
            "feature",
          ),
          stage(
            "拼接self与neighbor summary",
            "GraphSAGE保留self和neighbor的独立位置，而非先混成同一个mean。",
            "concat=[self, mean neighbors]",
            ["self", "neighbor summary"],
            [2, m],
            "feature",
          ),
          stage(
            "可学习变换与activation",
            "本例固定W便于手算；真实training会学习怎样使用两类信息。",
            `h'=ReLU(.5×2+.5×${fmt(m)})=${fmt(out)}`,
            ["self contribution", "neighbor contribution", "output"],
            [1, 0.5 * m, out],
            "feature",
          ),
        ],
        outcomes: [
          metric("Node output", out),
          metric("Sample-mean deviation", m - full),
        ],
      };
    },
    {
      use: [
        "大graph全邻居聚合太贵，或需要处理新nodes时考虑GraphSAGE。",
        "Spatial大切片按邻居sample训练时，要检验rare populations是否常被漏采。",
      ],
      tune: [
        "两层可从fanout[10,10]做资源基线；邻域异质性高时比较[15,10]并测variance。",
        "本例k=2到4对比full aggregate；真实数据多seed重采样估计sampling variance。",
      ],
      fail: [
        [
          "同一node预测抖动",
          "检查inference是否仍随机采样和fanout过小。",
          "增加fanout或固定/枚举inference neighbors并记录seed。",
        ],
        [
          "显存增长远超预期",
          "检查多层fanout乘积和重复neighbor materialization。",
          "减小fanout/batch，使用高效采样loader。",
        ],
      ],
      limit:
        "固定ordered sample、scalar Mean aggregator的一层算例；sample deviation不是随机采样的统计bias估计，未模拟训练。",
    },
  ),
  gat: make(
    "gat",
    "LeakyReLU 与 Softmax 怎样分配neighbor attention？",
    "三个incoming edges的pre-activation scores=[−2,0,1]，neighbor values=[1,3,5]；只改变LeakyReLU negative slope。",
    control(
      "Negative slope λ",
      0,
      1,
      0.1,
      0.2,
      "固定scores与values以隔离attention计算；通常从实现默认.2开始。",
    ),
    (slope) => {
      const raw = [-2, 0, 1],
        scores = raw.map((v) => (v < 0 ? slope * v : v)),
        a = softmax(scores),
        values = [1, 3, 5],
        messages = a.map((v, i) => v * values[i]),
        out = sum(messages);
      return {
        stages: [
          stage(
            "得到edge compatibility scores",
            "完整GAT会从transformed node features学习这些scores；本例把它们固定。",
            "e_raw=[−2,0,1]",
            ["edge1", "edge2", "edge3"],
            raw,
            "score",
          ),
          stage(
            "应用LeakyReLU",
            "只有负score受到negative slope影响；λ=0会把该项压到0。",
            `e=LeakyReLU_λ(raw)=[${scores.map((v) => fmt(v)).join(",")}]`,
            ["activated1", "activated2", "activated3"],
            scores,
            "score",
          ),
          stage(
            "在同一node的邻居中Softmax",
            "每个target node单独归一化；不是对全graph的edges求一个Softmax。",
            `α=softmax(e); Σα=${fmt(sum(a))}`,
            ["attention1", "attention2", "attention3"],
            a,
            "weight",
          ),
          stage(
            "加权聚合values",
            "Score决定weight，value决定传递内容；attention大不等同因果重要。",
            `h'=Σα_j v_j=${fmt(out)}`,
            ["message1", "message2", "message3"],
            messages,
            "feature",
          ),
        ],
        outcomes: [
          metric("Attention output", out),
          metric("Edge1 attention", a[0]),
        ],
      };
    },
    {
      use: [
        "不同neighbors的重要性应由features决定时，比较GAT与固定weight的GCN。",
        "Spatial boundaries处可研究attention变化，但需独立检验邻接是否合理。",
      ],
      tune: [
        "先用negative_slope=.2与少量heads（如4）基线；重点调hidden width、dropout和graph。",
        "Heads增加时保持总output width可比；监测GPU memory和head redundancy。",
      ],
      fail: [
        [
          "attention近乎one-hot且训练不稳",
          "检查logit magnitude、learning rate和是否按邻域softmax。",
          "降低learning rate、检查feature scaling，再比较dropout。",
        ],
        [
          "attention看似解释但不稳",
          "检查不同seed、feature扰动和edge ablation。",
          "报告稳定性，避免直接当作causal explanation。",
        ],
      ],
      limit:
        "固定scores的单head GAT聚合片段；没有learned projections、训练、多heads或self-loop构造。",
    },
  ),
  "neural-odes": make(
    "neural-odes",
    "更多solver steps解决的是哪一种误差？",
    "已知ODE dx/dt=−x，x(0)=1；用fixed-step Euler积分到t=1，与精确解exp(−t)比较。",
    control(
      "Euler steps N",
      1,
      20,
      1,
      5,
      "提高N减小step h=1/N，但不会修复错误vector field。",
    ),
    (N) => {
      const h = 1 / N,
        t = range(N + 1).map((i) => i * h),
        x = t.map((_, i) => (1 - h) ** i),
        truth = Math.exp(-1),
        end = x[N],
        error = Math.abs(end - truth);
      return {
        stages: [
          stage(
            "定义连续vector field",
            "Neural ODE将dx/dt参数化；本例直接给出已知field以分离solver error。",
            "f(x,t)=−x; x(0)=1",
            ["initial state", "initial derivative"],
            [1, -1],
            "value",
          ),
          stage(
            "选择discretization",
            "同一连续方程可用不同steps求解；Euler不是唯一solver。",
            `h=1/${N}=${fmt(h)}; x₁=1−h`,
            ["step size", "first updated state"],
            [h, 1 - h],
            "value",
          ),
          stage(
            "逐步累积updates",
            "每次用当前x计算slope；图展示所有真实Euler中间状态。",
            "x_(n+1)=x_n+h(−x_n)=(1−h)x_n",
            ["terminal approximation"],
            [end],
            "state",
            line(t, x, "time", "Euler state"),
          ),
          stage(
            "与解析解核对",
            "此差异只有numerical integration error；真实训练还包括model error与measurement error。",
            `x(1)=exp(−1); absolute error=${fmt(error)}`,
            ["Euler", "exact"],
            [end, truth],
            "state",
          ),
        ],
        outcomes: [
          metric("Terminal absolute error", error),
          metric("Euler terminal state", end),
        ],
      };
    },
    {
      use: [
        "观测time不规则、连续动力学假设合理时考虑Neural ODE。",
        "先用已知ODE或简单baseline验证solver，再训练复杂vector field。",
      ],
      tune: [
        "本例N=5比较10/20；实际adaptive solver从默认rtol/atol开始，收紧时测NFE和误差。",
        "记录forward/backward solver配置；梯度不稳时比较direct differentiation与adjoint。",
      ],
      fail: [
        [
          "solver极慢",
          "检查stiff dynamics、过严tolerance和vector field尺度。",
          "使用适合stiffness的solver或约束field，再测NFE。",
        ],
        [
          "增加steps依然预测错",
          "用高精度solver比较同一field的输出。",
          "若已收敛，应改model/data而不是继续增加steps。",
        ],
      ],
      limit:
        "解析线性ODE与Euler数值误差；不是训练Neural ODE，也不宣称所有ODE都随step数单调改善。",
    },
  ),
  "probabilistic-graphical-models": make(
    "probabilistic-graphical-models",
    "Bayesian network 如何把局部概率变成posterior？",
    "Binary hidden state D prior=.1；evidence E的P(E=1|D=0)=.2，P(E=1|D=1)可调。",
    control(
      "Evidence sensitivity",
      0.5,
      0.95,
      0.05,
      0.8,
      "只改一个conditional probability table entry；prior固定。",
    ),
    (a) => {
      const joint = [
          [0.9 * 0.8, 0.9 * 0.2],
          [0.1 * (1 - a), 0.1 * a],
        ],
        positive = [joint[0][1], joint[1][1]],
        Z = sum(positive),
        post = positive.map((v) => v / Z);
      return {
        stages: [
          stage(
            "写局部factor",
            "D→E指定joint factorization，不代表仅凭observations就证明causality。",
            `P(D,E)=P(D)P(E|D); P(E=1|D=1)=${fmt(a)}`,
            ["P(D=0)", "P(D=1)"],
            [0.9, 0.1],
            "probability",
          ),
          stage(
            "枚举joint table",
            "每格先乘prior与对应conditional probability；四格总和为1。",
            "joint[d,e]=prior[d]×CPT[e|d]",
            ["total joint mass"],
            [sum(joint.flat())],
            "probability",
            matrix(["D=0", "D=1"], ["E=0", "E=1"], joint, "joint probability"),
          ),
          stage(
            "施加evidence E=1",
            "选择与evidence一致的column，再对hidden state求和得到evidence probability。",
            `P(E=1)=.18+.1×${fmt(a)}=${fmt(Z)}`,
            ["D0 evidence mass", "D1 evidence mass"],
            positive,
            "mass",
          ),
          stage(
            "归一化为posterior",
            "高sensitivity仍可能对应较低posterior，因为prior较小且false positives存在。",
            `P(D=1|E=1)=.1a/(.18+.1a)=${fmt(post[1])}`,
            ["posterior D0", "posterior D1"],
            post,
            "probability",
          ),
        ],
        outcomes: [
          metric("Posterior P(D=1|E=1)", post[1]),
          metric("Evidence probability", Z),
        ],
      };
    },
    {
      use: [
        "变量关系与conditional independence可明确描述时使用PGM。",
        "需要对缺失变量marginalize并解释evidence如何更新belief时，先做小graph。",
      ],
      tune: [
        "先列出各CPT的state顺序并检查每列/行的条件归一化；本例从sensitivity=.8开始。",
        "大graph选exact inference前检查treewidth；代价太高再评估VI或sampling误差。",
      ],
      fail: [
        [
          "posterior不归一化",
          "检查evidence selection后是否重新求normalizer。",
          "显式列举小state space，核对joint与marginal。",
        ],
        [
          "加入edge后得出因果结论",
          "检查edge来自设计假设还是仅相关数据。",
          "单独声明causal assumptions，并考虑confounding。",
        ],
      ],
      limit:
        "二变量Bayesian network精确枚举；不是clinical decision工具，也没有causal identification或结构学习。",
    },
  ),
  "causal-graphs-identifiability": make(
    "causal-graphs-identifiability",
    "Observed difference 为什么不等于 intervention effect？",
    "U~Bernoulli(.5)，P(T=1|U=1)=q、P(T=1|U=0)=1−q，Y=U；graph U→T、U→Y，没有T→Y。",
    control(
      "Selection strength q",
      0.1,
      0.9,
      0.1,
      0.8,
      "q=.5时T与U独立；其他值产生confounding。",
    ),
    (q) => {
      const joint = [
          [0.5 * q, 0.5 * (1 - q)],
          [0.5 * (1 - q), 0.5 * q],
        ],
        obs = [1 - q, q],
        intervention = [0.5, 0.5];
      return {
        stages: [
          stage(
            "指定结构与assignment",
            "Y完全由U决定；改变T不会在本结构里改变Y。",
            `Y=U; P(T=1|U=1)=${fmt(q)}`,
            ["U0 prior", "U1 prior"],
            [0.5, 0.5],
            "probability",
          ),
          stage(
            "构造observational joint",
            "Rows为U，columns为T；treatment groups包含不同U composition。",
            "P(U,T)=P(U)P(T|U)",
            ["total mass"],
            [sum(joint.flat())],
            "probability",
            matrix(["U=0", "U=1"], ["T=0", "T=1"], joint, "joint probability"),
          ),
          stage(
            "Condition on observed T",
            "Conditioning保留U→T的selection，所以两组Y mean可以不同。",
            `E[Y|T=1]−E[Y|T=0]=q−(1−q)=${fmt(2 * q - 1)}`,
            ["observed T0 mean", "observed T1 mean"],
            obs,
            "outcome mean",
          ),
          stage(
            "执行do(T)而非condition",
            "Intervention切断U→T；两组仍继承相同U prior，因此ATE=0。",
            "E[Y|do(T=1)]−E[Y|do(T=0)]=.5−.5=0",
            ["do T0 mean", "do T1 mean"],
            intervention,
            "outcome mean",
          ),
        ],
        outcomes: [
          metric("Observed difference", 2 * q - 1),
          metric("True intervention effect", 0),
        ],
      };
    },
    {
      use: [
        "从association提出intervention问题时，先明确causal graph与target estimand。",
        "Spatial邻近关系或cell abundance相关不自动意味着作用方向，可用此例检查逻辑。",
      ],
      tune: [
        "从q=.5无confounding基线再调.8；真实研究不能通过调超参数消除未测confounding。",
        "选择adjustment set前检查backdoor paths；避免控制collider或treatment后变量。",
      ],
      fail: [
        [
          "observational effect很大却不复现",
          "检查selection、未测confounders与intervention环境。",
          "重新定义识别假设，寻找randomization或合理的设计支持。",
        ],
        [
          "多加covariates反而偏差更大",
          "检查是否加入collider/mediator以及positivity。",
          "按causal graph选择adjustment，而非盲目全部控制。",
        ],
      ],
      limit:
        "已知structural causal model的精确counterexample；真实数据中U可能未测，不能据本例宣称effect可识别。",
    },
  ),
  "knowledge-graphs-reasoning": make(
    "knowledge-graphs-reasoning",
    "多跳规则推理能得到哪些新facts？",
    "Directed chain A→B→C→D→E；关系定义为可组合的reachability。限定path length≤h，计算transitive closure。",
    control(
      "Maximum hops h",
      1,
      4,
      1,
      2,
      "只有声明transitive的关系才可用该规则；普通关联不能自动传递。",
    ),
    (h) => {
      const names = ["A", "B", "C", "D", "E"],
        A = range(5).map((i) => range(5).map((j) => Number(j === i + 1))),
        closure = range(5).map((i) =>
          range(5).map((j) => Number(j > i && j - i <= h)),
        ),
        counts = range(h).map((n) => 4 - n),
        reachable = closure[0],
        total = sum(closure.flat());
      return {
        stages: [
          stage(
            "读取显式facts",
            "Adjacency只记录四条已给边；不存在的edge先理解为未知或未提供。",
            "A→B, B→C, C→D, D→E",
            ["explicit facts"],
            [4],
            "facts",
            matrix(names, names, A, "direct fact"),
          ),
          stage(
            "应用已声明的composition rule",
            "Reach(a,b)∧Edge(b,c)⇒Reach(a,c)；按path length分层推理。",
            `allowed path lengths=1..${h}`,
            range(h).map((i) => `${i + 1} hops`),
            counts,
            "reachable pairs",
          ),
          stage(
            "累积bounded closure",
            "每对nodes只计一次；这里无cycles，因此路径长度正好是index difference。",
            `closure(i,j)=1[0<j−i≤${h}]`,
            ["all reachable pairs"],
            [total],
            "facts",
            matrix(names, names, closure, "reachable within budget"),
          ),
          stage(
            "查询从A能到哪里",
            "Reachability是逻辑关系，不是effect、semantic similarity或confidence score。",
            `A reachable count=${sum(reachable)}`,
            names.map((n) => `A→${n}`),
            reachable,
            "reachable indicator",
          ),
        ],
        outcomes: [
          metric("Reachable nodes from A", sum(reachable)),
          metric("Total derived-or-direct pairs", total),
        ],
      };
    },
    {
      use: [
        "已有结构化entities与明确relation semantics，需要可追踪多跳证据时使用KG reasoning。",
        "科研文献graph可保留每条fact的provenance，再区分逻辑推导与模型预测。",
      ],
      tune: [
        "先限制h=1或2并审查推理路径；增加h时检查spurious paths和查询成本。",
        "对每种relation单独定义composition规则；不要把所有edges视为同一transitive关系。",
      ],
      fail: [
        [
          "多跳结论明显不成立",
          "检查关系是否真的transitive，entity identifiers是否合并错误。",
          "删除不成立的rule并保留可审查的path provenance。",
        ],
        [
          "找不到edge就判断为false",
          "检查知识库采用open-world还是closed-world assumption。",
          "把缺失标记unknown，除非有明确否定证据。",
        ],
      ],
      limit:
        "五节点chain的确定性bounded reachability；不是trainedKG embedding、实体链接、概率推理或LLM factuality评测。",
    },
  ),
  "variational-inference-elbo": make(
    "variational-inference-elbo",
    "ELBO 与 posterior gap 可以同时手算吗？",
    "Binary latent z的joint masses p(x,z)=[.4,.1]，因此evidence=.5；approximate q(z)=[q,1−q]。",
    control(
      "Variational mass q(z=0)",
      0.05,
      0.95,
      0.05,
      0.5,
      "q=.8时恰好等于exact posterior；这不是optimization learning rate。",
    ),
    (q0) => {
      const joint = [0.4, 0.1],
        Z = 0.5,
        exact = [0.8, 0.2],
        q = [q0, 1 - q0],
        terms = q.map((v, i) => v * Math.log(joint[i] / v)),
        elbo = Math.min(Math.log(Z), sum(terms)),
        kl = Math.max(0, sum(q.map((v, i) => v * Math.log(v / exact[i])))),
        loge = Math.log(Z);
      return {
        stages: [
          stage(
            "从joint masses开始",
            "Joint不是posterior；总和是observed x的evidence。",
            "p(x,z)=[.4,.1]; p(x)=.5",
            ["joint z0", "joint z1"],
            joint,
            "probability mass",
          ),
          stage(
            "得到exact reference",
            "这个小例子能够精确求posterior，用于审查VI近似；大模型通常做不到。",
            "p(z|x)=[.4/.5,.1/.5]=[.8,.2]",
            ["exact z0", "exact z1", "approximate z0", "approximate z1"],
            [...exact, ...q],
            "probability",
          ),
          stage(
            "逐项计算ELBO",
            "每项包含joint log density与variational entropy contribution。",
            `ELBO=Σq log(p(x,z)/q)=${fmt(elbo)}`,
            ["ELBO term z0", "ELBO term z1"],
            terms,
            "nats",
          ),
          stage(
            "核对gap identity",
            "KL≥0保证ELBO不超过log evidence；q匹配posterior时gap=0。",
            `log p(x)−ELBO=${fmt(loge - elbo)}=KL(q||posterior)`,
            ["log evidence", "ELBO", "KL gap"],
            [loge, elbo, kl],
            "nats",
          ),
        ],
        outcomes: [
          metric("ELBO", elbo, "nats"),
          metric("Posterior KL gap", kl, "nats"),
        ],
      };
    },
    {
      use: [
        "Posterior难以解析、MCMC成本高时用VI做可优化近似。",
        "scVI等latent models中，用ELBO拆分reconstruction与KL检查学习目标。",
      ],
      tune: [
        "本例从q=.5移到.8核对optimum；真实VI先从简单family检查ELBO与gradient。",
        "逐步增大variational family表达力；若mean合理但uncertainty过窄，比较更灵活family或MCMC小样本参考。",
      ],
      fail: [
        [
          "ELBO超过已知log evidence",
          "检查KL符号、log density normalization和Monte Carlo误差。",
          "用本例或可解析模型校验objective；区分估计noise与数学期望。",
        ],
        [
          "ELBO提高但posterior预测失真",
          "检查family限制、local optimum和model misspecification。",
          "做posterior predictive checks及多initializations。",
        ],
      ],
      limit:
        "Binary latent的精确枚举ELBO；不模拟Monte Carlo梯度、amortization、连续density或实际scVI训练。",
    },
  ),
  "bayes-decision-thresholds": make(
    "bayes-decision-thresholds",
    "Probability 应怎样转换成有cost的行动？",
    "固定p(Y=1|x)=.4；False Positive cost=2，False Negative cost可调；另有cost=.8且假定完美处理的review选项。",
    control(
      "False Negative cost C_FN",
      1,
      10,
      0.5,
      3,
      "Cost来自应用后果；不是为了调高metric而随意挑选。",
    ),
    (c) => {
      const p = 0.4,
        negative = p * c,
        positive = (1 - p) * 2,
        review = 0.8,
        threshold = 2 / (2 + c),
        risks = [negative, positive, review],
        best = Math.min(...risks);
      return {
        stages: [
          stage(
            "保留uncertainty",
            "Posterior probability是输入，action还取决于cost；本例p保持不变。",
            "P(Y=1|x)=.4; P(Y=0|x)=.6",
            ["class0 probability", "class1 probability"],
            [0.6, 0.4],
            "probability",
          ),
          stage(
            "计算两种自动action风险",
            "Negative action只在Y=1时承担FN cost，Positive只在Y=0时承担FP cost。",
            `R(negative)=.4×${fmt(c)}=${fmt(negative)}; R(positive)=.6×2=1.2`,
            ["negative risk", "positive risk"],
            [negative, positive],
            "expected cost",
          ),
          stage(
            "导出cost-sensitive threshold",
            "只有两种自动action且正确分类cost为0时，此threshold才直接适用。",
            `predict positive if p≥C_FP/(C_FP+C_FN)=${fmt(threshold)}`,
            ["posterior p", "automatic-action threshold"],
            [p, threshold],
            "probability",
          ),
          stage(
            "把review作为第三action比较",
            "本例review无分类错误、固定cost=.8；真实review也可能有错或容量限制。",
            `min risk=min(${fmt(negative)},1.2,.8)=${fmt(best)}`,
            ["negative", "positive", "review"],
            risks,
            "expected cost",
          ),
        ],
        outcomes: [
          metric("Automatic-action threshold", threshold),
          metric("Minimum expected cost with review", best),
        ],
      };
    },
    {
      use: [
        "False Positive与False Negative后果不同，应从calibrated probabilities与cost定义decision。",
        "允许abstention或人工复核时，将review作为独立action并计入资源成本。",
      ],
      tune: [
        "先与domain专家定义cost单位；本例C_FN=3与C_FP=2对照等cost情形。",
        "在独立validation评估calibration、review rate与capacity；阈值确定后冻结再做test。",
      ],
      fail: [
        [
          "调threshold后线上cost仍高",
          "检查population shift、calibration和cost估计是否变化。",
          "分subgroup验证并更新calibration/decision policy，不只优化accuracy。",
        ],
        [
          "review队列爆满",
          "检查实际review capacity和error rate是否违反完美review假设。",
          "加入capacity constraint、等待成本与review误差重新优化。",
        ],
      ],
      limit:
        "固定且假定calibrated的单样本概率与显式cost matrix；不是医疗建议，未建模review capacity、calibration uncertainty或伦理权重。",
    },
  ),
};
