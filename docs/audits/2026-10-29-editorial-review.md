# AI/ML editorial coherence review — 2026-10-29

## Scope actually reviewed

- All 257 lesson IDs, titles, categories and level labels across 12 categories.
- All 18 concept paths, including every description, step and transition rationale.
- The six Biology bridge lessons and their six four-stage labs in detail, checking the relationship between prose examples, controls, stage explanations, numerical results and cross-site reading.
- Representative entry/mechanism/setup passages from 19 older lessons: Neural Networks, Backpropagation, Gradient Descent, Model Evaluation, EM, OLS, CNN, CV Preprocessing, Attention, HMM, Diffusion, Contrastive Learning, RL, PPO, GNN, MAML, Agent Workflows, Tool Calling and Agent Checkpoints. This was a targeted prose sample, not a line-by-line editorial certification of all 257 lessons.

## Findings and changes

The existing concept paths generally provide coherent progressions; the large category catalog remains a reference library rather than one prerequisite sequence. Advanced entries can precede basic ones within a category, so sequential navigation should be interpreted accordingly. This observation was reported to the parent reviewer rather than changing catalog order.

The newest Biology lessons used substantially denser mixed-language noun strings than the introductory material. Twenty selected summary, intuition, core and example passages were rewritten into connected Chinese sentences while retaining English scientific names. Changes explain what is held fixed, what is observed, what is inferred, and why the next operation follows.

All 24 new lab stage headings now use Chinese action phrases with English method names, and 34 input/explanation/control/boundary passages make the four-stage calculation explicit. No calculation function, control range, input value, source URL or exercise answer was changed. In particular:

- PWM's GC control no longer says the fixed reference is recomputed: the current result changes while the fixed comparison retains its parameters.
- The LR experiment explicitly explains why its exact P value stays at 1/20 throughout the allowed slider range, even when the interaction score changes: the observed allocation remains the unique maximum.
- The two-gene Perturbation example directly discusses residuals rather than suggesting that its two-component correlation illustrates a high-dimensional evaluation pitfall. The latter is now stated separately for real high-dimensional expression.
- ABC explains that the Bio/CS experiment uses different synthetic inputs and a different parameter change to teach the same denominator mechanism.
- LR distinguishes the AI site's 20 cell-label allocations from the Biology site's 16 paired-donor sign flips. Matching numbers or P values across the two examples is not expected.
- TF activity and VAF examples explain what the linked Bio/CS lesson contributes before returning to the algorithmic calculation.

The six Biology concept-path transitions now explicitly connect DNA observation → motif compatibility → candidate gene linking → target response → intercellular candidates → Perturbation prediction and experimental validation. The deployment path's final leakage step is described as a whole-workflow recheck rather than implying it should first be considered after deployment.

## Verification

`node scripts/validate-biology-bridge.mjs` passes: six lessons, twelve exercises, six labs, 190 parameter cases, 760 rendered charts, six cross-site mappings and the complete concept path. `validate-content.mjs` verifies all 257 lessons; `validate-experience.mjs` checks study-state recovery, glossary/search aliases and route behavior. Parent-level production build and browser checks are performed separately after integration.

## Navigation and final integration

Fixed the main continuity defect: conceptual paths previously entered lessons without route context, and the footer followed global category order (for example VAF to CNN). Route-aware navigation now covers all 18 concept paths and 4 AI journeys, keeps supported reading-focus flags and returns to the selected route at its endpoint. Invalid or nonmember paths fall back to explicitly labelled catalogue navigation. The homepage category selector is labelled 按领域浏览.

The complete production build passed, including 22-route/162-step regression checks. Browser checks followed VAF → PWM → ABC; compared the two distinct next steps from Neural Networks in different routes; checked the Perturbation endpoint and invalid-context fallback; and verified readable route context at 390px with no page overflow. Existing lesson IDs and progress records were preserved.
