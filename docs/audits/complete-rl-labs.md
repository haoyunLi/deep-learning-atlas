# Representation, RL, adaptation and Agent computed-lab audit

Date: 2026-10-29. Scope: all **62** assigned lessons formerly missing the shared computed lab. Entry point: `src/data/completeLabs/rl.ts`.

Every entry supplies one numeric control, exactly four progressive stages, finite computed metrics and a bar/matrix chart at every stage, a parameter-dependent numeric outcome, two use-case/tradeoff explanations, two tuning notes, two symptom/check/action diagnostic entries, an explicit scope boundary, and a primary source. All inputs are labeled **Synthetic teaching fixture**. This package generates no empirical accuracy, training curve, model benchmark, or real service execution claims.

The shared UI owned by the main task provides four-step playback, current/reference comparison, a common comparison scale, data tables and JSON export. This audit records the data and computation contract; browser rendering/deployment validation belongs to the main integration audit.

## Validation completed

- `node scripts/validate-complete-rl.mjs`: **62 independent default numeric fixtures**, **1,083 slider positions**, finite-chart/shape/uniqueness checks, and cross-family invariants pass.
- Strict standalone TypeScript check of `src/data/completeLabs/rl.ts` and all imported modules passes.
- Prettier applied to this package and its validator only.
- All 62 assigned lesson IDs were checked against `/tmp/atlas-complete-rl.json` during authoring. The committed validator is self-contained and does **not** depend on that temporary assignment file.
- Expected values use hand-reduced formulas/constants independently of lab helpers. Examples: DDQN target 1.9, TD3 target .479, EWC optimum 2/3, FixMatch masked loss −ln(.56)/3, prequential MSE 7/32, and checkpoint failure-window duplicate count 1.
- Boundary/invariant checks include softmax sum and contrastive gradient sum, BYOL endpoints, VICReg epsilon, SupCon mean-of-logs, zero-discount DDQN, TRPO identity/symmetry, TD3 minimum, CQL logsumexp, IS unit-weight ESS, Meta-SGD query optimum, simultaneous fine-tuning updates, FixMatch total-batch denominator, predict-before-update scoring, schema/policy separation, pass@k versus pass^k, and atomic-idempotency recovery assumptions.

## Coverage and mechanism manifest

| Lesson ID | Computed ingredient | Default first outcome |
|---|---|---:|
| simclr | NT-Xent logits, softmax, score gradients | 0.0850972464 loss |
| moco | EMA parameter lag, normalized key, contrastive lookup | 1.2727922061 lag |
| byol | Normalized regression between unit vectors | 1 loss |
| barlow-twins | Cross-correlation diagonal and off-diagonal penalties | .009 loss |
| mae | Visible patch count, attention-pair count, masked mean error | 4 pairs |
| vicreg | Unbiased batch variance, epsilon, two-view variance hinge | 14.6411255835 penalty |
| dino | Teacher centering, sharpening and cross-entropy | .5238786718 CE |
| supervised-contrastive | Positive target mass and mean positive log loss | .7426991533 loss |
| zero-shot-learning | Candidate cosine scaling, softmax, confidence vs rank | .6215004043 probability |
| few-shot-learning | K-shot support centers and fixed-query classification | .5 probability |
| linear-probe | Frozen features and one logistic-head update | .5759394199 BCE |
| prototypical-networks | Support prototype, query residual, squared distance | .9996646499 probability |
| vision-language-models | Scalar text-to-visual cross-attention | 1.9310555426 output |
| two-tower-retrieval | Inner-product scoring and candidate margin | 0 margin |
| multiple-instance-learning | Attention-normalized bag pooling | 5/3 feature |
| manifold-embeddings | UMAP-style local edge strength and k-neighbor support | 1.9715142579 mass |
| double-dqn | Online argmax selection, target-network evaluation | 1.9 target |
| dueling-dqn | Mean-centered advantages plus state value | 10/3 Q |
| rainbow-dqn | Discounted n-step reward plus bootstrap component | 4.807 target |
| trpo | Importance-ratio surrogate and old-to-new policy KL | .0204109973 KL |
| ddpg | Deterministic policy-gradient chain and actor ascent | .1 parameter |
| td3 | Perturbed target action, twin-critic minimum and bootstrap | .479 target |
| model-based-rl | Horizon-dependent model state and return bias | −2.94 error |
| muzero | Fixed-coefficient PUCT prior/visit bonus | .6577708764 score |
| behavior-cloning | Demonstration action likelihood and logit gradient | ln(2) BCE |
| offline-rl | Unsupported greedy-action Q and dataset support | 2 estimated Q |
| cql | Discrete logsumexp-minus-data-Q conservative term | ln(1+e) penalty |
| decision-transformer | Return-to-go conditioning update | 4 remaining RTG |
| rlhf | Expected toy reward minus exact discrete KL penalty | 1.5036276215 objective |
| off-policy-evaluation | Propensity ratios, IS, SNIS and ESS | .5 IS estimate |
| imitation-learning | Expert/learner roll-in expected state-label coverage | 10 expected labels |
| safe-rl-pomdp | Bayes belief update and expected action-cost constraint | 8 cost |
| contextual-bandits-linucb | Ridge mean, directional uncertainty, selected-arm update | .1 score difference |
| matching-networks | Support-level attention aggregated by class labels | .6710670777 probability |
| relation-networks | Learned scalar relation head, MSE and head gradient | .0723294881 MSE |
| siamese-triplet | Squared-distance margin hinge and active anchor gradient | .16 loss |
| meta-sgd-anil | Support update, query loss and meta-gradient to step size | 2 query loss |
| learned-optimizers | Stateful update policy unroll and outer objective | .753992 loss |
| hypernetworks-meta-gradients | Generated weight, downstream loss and generator chain rule | 0 loss |
| memory-augmented-meta-learning | Content addressing and weighted external-memory read | 5 value |
| meta-reinforcement-learning | Bayesian history-state fast-adaptation baseline | .5 posterior mean |
| cross-domain-few-shot | Feature-scale-induced metric shift and known-scale correction | .2314752165 probability |
| transfer-learning-strategies | Head-only versus simultaneous head/backbone update | .72 loss |
| domain-adaptation-dann | Feature-side gradient reversal and task/domain weighting | .96 parameter |
| domain-generalization-irm | Per-environment dummy-classifier gradient penalty | 2.25 objective |
| continual-learning | Exact quadratic EWC regularized optimum | 2/3 parameter |
| multi-task-learning | Shared-task gradient conflict and weighted update | 0 x-gradient |
| automl-hpo-nas | DARTS operation relaxation and discretization gap | 0 relaxed loss |
| curriculum-self-paced | Exact binary self-paced selection subproblem | 2 examples |
| test-time-adaptation | Entropy gradient, confidence reinforcement and unlabeled limit | .5417756247 entropy |
| semi-supervised-self-training | Weak confidence mask and strong-view pseudo-label CE | .1932728318 loss |
| online-learning-drift | Predict-before-update EMA stream and prequential scoring | 7/32 MSE |
| bayesian-optimization | Given-posterior GP-UCB exploration/acquisition | 1 acquisition |
| agent-workflows | Routing branch counts, execution and validation cost | 17 s |
| tool-calling-contracts | Numeric schema checks followed by separate policy enforcement | 5 rows |
| react-agent-loop | Action budget truncation, observations and verified status | 4 s |
| agent-memory-context | Exact three-item context knapsack with system reservation | 10 toy utility |
| agent-evaluation | Independent-trial pass@k, pass^k and stop-on-success call cost | .512 probability |
| agent-security-boundaries | Requested/allowed capability intersection and blocked count | 2 actions |
| multi-agent-orchestration | Independent-job waves, coordination overhead and join | 12.5 s |
| model-context-protocol | Lifecycle message counts, discovery and host tool policy | 2 tools |
| agent-state-checkpoints | Crash window, persisted receipt, replay and idempotency | 1 duplicate effect |

## Source and interpretation audit

Primary sources are stored per entry in `rlSources.ts`. Source checks during this task included Double DQN, Dueling DQN, TD3, CQL, Decision Transformer, LinUCB, Barlow Twins, VICReg, Prototypical Networks, IRM, Tent, FixMatch, EWC, DANN, Meta-SGD, RL², GP-UCB, Self-Paced Learning, the original POMDP belief-state treatment, JSON Schema, Anthropic's workflow discussion, τ-bench, pinned MCP 2025-06-18 specification, and current LangGraph checkpointer documentation.

Source alignment was corrected where a broad lesson's original first citation did not match the ingredient now calculated:

- `few-shot-learning`: prototype baseline cites [Prototypical Networks](https://arxiv.org/abs/1703.05175), not GPT in-context learning.
- `bayesian-optimization`: UCB fixture cites [GP-UCB](https://arxiv.org/abs/0912.3995), not a source specifically motivating another acquisition function.
- `curriculum-self-paced`: the binary threshold subproblem cites [Self-Paced Learning](https://papers.nips.cc/paper_files/paper/2010/hash/e57c6b956a6521b28495f2886ca0977a-Abstract.html).
- `safe-rl-pomdp`: belief update cites [Kaelbling, Littman and Cassandra](https://www.cassandra.org/arc/papers/aij98.pdf); the simple cost budget is a declared toy, not a CPO implementation.

## Explicit simplifications retained

These are targeted mechanism labs, not full training implementations. Boundaries are present in the UI for each lesson:

- Rainbow illustrates its n-step ingredient; MuZero illustrates fixed-coefficient PUCT; TD3 illustrates noisy target/minimum target, without delayed actor training.
- MAE uses fixed reconstruction errors; UMAP-style graph uses fixed local scale and no embedding optimization. BYOL angle is a diagnostic variable, not a production hyperparameter.
- MoCo parameter vectors proxy encoder outputs. Meta-RL uses a Bayesian count-memory baseline, not a trained RL² RNN. Learned Optimizer uses a transparent EMA update policy, not a learned LSTM. Meta-SGD lab demonstrates the inner-step meta-gradient, not an ANIL benchmark.
- DARTS does not perform full bilevel training. Tent updates a scalar logit proxy rather than normalization parameters. IRM and EWC use fully declared scalar risk/importance assumptions.
- Every Agent operation remains local and deterministic. Trial independence in the evaluation lab, additive memory utility, exact task durations, known routing labels and atomic external idempotency are explicit assumptions. No live tools are invoked and no real-world reliability claim is inferred.
- Source links explain the ingredient; none of the synthetic numbers are attributed to published benchmarks. Single-cell/Spatial guidance highlights donor/domain split, rare-state loss, confounding, leakage and provenance where relevant.
