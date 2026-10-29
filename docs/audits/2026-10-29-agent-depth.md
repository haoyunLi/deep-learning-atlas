# Agent / Reasoning / LM application audit — 2026-10-29

Scope: scanned IDs, English titles and summaries of the 233 existing lessons, then read full `multi-armed-bandit`, `muzero`, `autoregressive-inference`, `agent-workflows`, `tool-calling-contracts` and `model-serving-monitoring` objects. Existing A*, RRF, retry reliability, ReAct, memory, MCP, Agent evaluation and security lessons were checked against the proposed additions. This is a source/content audit, not a claim that all 233 browser pages were exercised by this subagent.

## Six nonduplicative depth lessons

| New ID | Gap and relation to existing lessons | Independent fixture |
| --- | --- | --- |
| `mcts-uct-search` | MuZero names MCTS but lacked selection/expansion/simulation/backup arithmetic. Distinguishes computational exploration from final root action. | Root visits10; A:N8,W4.8; B:N2,W.8. UCT c1 selectsB; return.9 makes B:N3,W1.7,Q.566667. |
| `contextual-bandits-linucb` | Existing bandit only mentions contextual extension. Adds directional uncertainty, ridge statistics and logged-propensity support. | A=diag(4,1),b=[2,0] versus unobserved arm; x=[1,0],α1.2 scores1.1/1.2. |
| `beam-search-decoding` | Existing autoregressive lesson already explains temperature/top-k/top-p well; this adds sequence search, finished candidates and scoring conventions. | Greedy Ax=.306 versus beam2 By=.36; logP/L flips short/long ranking. |
| `grammar-constrained-decoding` | Existing tool contracts validate requests after generation; this explains generation-time grammar masks and their distribution effects. | [.1,.2,.6,.1] becomes [1/3,2/3,0,0]; local masking differs from globally conditioning on valid completion. |
| `speculative-decoding` | Previously one sentence under autoregressive modifications. Adds exact acceptance/residual accounting and conditional cost model. | p=[.5,.3,.2],q=[.2,.5,.3]; accepted mass [.2,.3,.2]+.3×[1,0,0]=p. |
| `agent-state-checkpoints` | Workflow/checkpoint and idempotency existed separately; missing the crash-between-external-commit-and-local-confirmation trace. | Receipt recovery12s/1effect versus new-key restart21s/2effects; CAS revision7→8 rejects stale7. |

All six have nine mechanics steps, at least four how-to actions and four settings with starting configurations/change signals, at least three uses/limits/modifications/pitfalls, two authored exercises and one three-stage figure. Configurations are teaching starting points, not universal production defaults.

## Existing-course changes for the integrator

1. `multi-armed-bandit`: the phrase “没有会影响下一步的 state” can be misread as banning observed context. Prefer “不建模 action 对未来 state/reward opportunity 的长期影响；每轮仍可有可观测 context”. Add `contextual-bandits-linucb` and `mcts-uct-search` as follow-on links. UCB bonus must not be logged as selection propensity; deterministic argmax can have zero support for other actions.
2. `muzero`: link `mcts-uct-search` before MuZero's learned-model steps. Clarify that UCT is a pedagogical base rule, while policy-prior search such as PUCT is not the identical formula. Original four-step overview should remain recognizable; the new lesson supplies the arithmetic rather than duplicating MuZero training.
3. `autoregressive-inference`: retain its correct temperature/top-p/prefill details. Add the three new decoding links to `compareTo` or a next-lesson entry. Its source currently uses a moving `main` docs URL; a verified versioned example is `https://huggingface.co/docs/transformers/v4.53.0/en/generation_strategies` (historical teaching reference, not latest). Never claim speculative decoding produces identical strings for the same seed; the exact algorithm preserves the specified target distribution, subject to implementation/numerics.
4. `tool-calling-contracts`: link `grammar-constrained-decoding` for generation-time constraints and `agent-state-checkpoints` for the external-commit recovery gap. Keep schema validity, semantic correctness, authorization and actual execution as distinct checks.
5. `agent-workflows` / `agent-memory-context` / `agent-reliability-budgets`: link `agent-state-checkpoints`. Persisted task state, conversational memory and external effect receipts are different objects. A checkpoint alone cannot promise arbitrary cross-service exactly-once effects.
6. `model-serving-monitoring`: only four mechanism steps and no explicit numerical latency breakdown. A future focused enhancement could sum queue/preprocess/inference/postprocess/network times and compare p95/p99 across versions. Do not treat drift alone as measured quality loss; existing wording already gets this boundary right.
7. `planning-search-astar`: connect MCTS as a comparison, while preserving A*'s known-cost/heuristic conditions. Search improvement is not training; simulator bias is not removed merely by increasing search budget.

## Primary sources verified with web tools

- Kocsis & Szepesvári (2006), [author-hosted UCT paper](https://sites.ualberta.ca/~szepesva/papers/ecml06.pdf): sampled planning, UCB-style tree selection, count statistics, finite-horizon/discounted conditions. The toy c=1 convention is declared; no finite-budget optimality claim.
- Li et al. (2010), [author-hosted LinUCB paper](https://www.schapire.net/papers/www10.pdf), Algorithm1: disjoint ridge matrices, directional confidence score, chosen-arm-only update. Extra epsilon randomization is explicitly an extension.
- Wu et al. (2016), [GNMT Section7](https://arxiv.org/html/1609.08144v2): beam scoring, length normalization and coverage. Our `logP/L^α` teaching score is distinguished from GNMT's `(5+L)^α/6^α` and from runtime-specific conventions.
- [Transformers v4.53.0 generation strategies](https://huggingface.co/docs/transformers/v4.53.0/en/generation_strategies): versioned beam/greedy/sampling description; not claimed current default or latest version.
- Scholak et al. (2021), [PICARD paper](https://aclanthology.org/2021.emnlp-main.779/): incremental parsing rejects invalid tokens; actual paper restricts top-k and preserves allowed token scores. Our full-vocabulary masked-sampling example is explicitly not a faithful reproduction of PICARD's beam-scoring implementation.
- Leviathan et al. (2023), [ICML paper](https://proceedings.mlr.press/v202/leviathan23a.html) and [algorithm PDF](https://proceedings.mlr.press/v202/leviathan23a/leviathan23a.pdf): min(1,p/q), positive residual correction, block verification and conditional speed model. Figures do not claim real device speed.
- [LangGraph official Checkpointers](https://docs.langchain.com/oss/python/langgraph/checkpointers), accessed2026-10-29: graph-state snapshots at super-step boundaries, pending writes and resumption. The older durable-execution URL now redirects to Persistence. No unverified SDK signatures are taught; toy state/effect names are application designs.

## Validation and integration

- Run `node scripts/validate-agent-depth.mjs`: six-course coverage,12 quiz items, six figures, minimum field lengths,42 independent numerical checks, crash/receipt and CAS fixtures.
- Add the three exports to the site's existing lesson/exercise/figure registries and include the validator in build.
- Recommended lesson sequence: bandit→LinUCB; A* / bandit→MCTS→MuZero; autoregressive→beam→grammar→speculative; workflow / tool contract→checkpoint recovery.
- Numerical fixtures, timestamps and counts above are synthetic or source-access metadata, not experimental model results.
