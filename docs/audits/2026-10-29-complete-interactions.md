# Every-course mechanism interactions: release audit

Date: 2026-10-29. Scope: close the registered mechanism-interaction gaps in Deep Learning Atlas while preserving its course IDs, existing content, bilingual teaching style and white/navy reading surface.

## Coverage and implementation

This pass adds **170 course-specific numerical labs: 54 ML, 54 CV/sequence and 62 representation/RL/adaptation/Agent labs**. Each has four computed stages, giving **680 new stages**, with a parameter control, intermediate quantities, usage and tuning guidance, symptom/check/action troubleshooting, a primary source and an explicit synthetic-example boundary. The three domain audits provide the mechanism manifest and scientific limitations: [ML](complete-ml-labs.md), [CV](complete-cv-labs.md), [RL and Agents](complete-rl-labs.md).

All **251 courses** now connect to a registered mechanism calculation or animation. The coverage validator accepts a new complete lab, an existing parameter lab, a linked cross-course lab, a legacy mechanism animation or a hand-calculation sandbox. This is a registry-and-implementation coverage result: it does not mean all courses received a new lab, all 251 pages were manually exercised, or every historical scientific statement was independently rederived. Shared labs can serve multiple courses; overlapping lab counts must not be added as unique-course counts.

The shared player supports fixed-reference comparison, stage selection, parameter changes that retain the selected stage, reset, three playback speeds and JSON export. Bars and lines share current/reference axes; matrices share a magnitude scale and distinguish the two parameter sets by panel. Exact current and reference tables retain full labels and values. The comparisons describe the stated synthetic calculations, not trained-model performance or an automatic ranking of methods.

## Independent numerical and build evidence

Three separately authored domain validators use independently specified expected values and mechanism invariants, alongside their control sweeps:

| Validator | Independent expectations | Parameter states checked |
| --- | --- | ---: |
| `validate-complete-ml.mjs` | 54 default fixtures | 813 |
| `validate-complete-cv.mjs` | 98 expected-value assertions across 54 courses | 916 |
| `validate-complete-rl.mjs` | 62 default fixtures and 5 rendered-formula fixtures | 1,083 |

The shared `validate-complete-labs.mjs` additionally passes **3,662 calculation invocations**, **2,724 comparison-chart renders** and **170 initial player server renders**, covering each slider tick, initial values and joint extrema. It checks four-stage shape, finite numerical/chart output, responsive parameter outcomes, source/catalogue consistency, control semantics and zero uncovered courses under the definition above. These counts overlap the domain sweeps and are not a count of distinct independent scientific proofs. Server rendering does not establish live browser behavior or screen-reader usability.

The complete `npm run build` passed, including TypeScript, existing course/exercise/lab validators, all four new validators and Vite production bundling. The verified log is `/tmp/atlas-complete-build.log`; its final Vite line reports `built in 1.18s`. The build validates 251 lessons and 502 exercises. Vite retains a large-chunk warning: the main JavaScript bundle is approximately 583 kB gzip. This warning did not fail the build.

## Review corrections

- Restricted the AMP scaling exponent to **0..12**, keeping the example within the FP16 subnormal range where its constant spacing assumption applies.
- Rendered Kaplan–Meier survival as a step function and corrected DDIM variance units.
- Corrected the callback use of `map(fmt)` that passed array indices as formatting precision; five rendered-formula fixtures now guard the affected output.
- Clarified that a transactional outbox still needs consumer idempotency to prevent duplicate external effects.
- Corrected the matrix legend: blue means nonnegative and orange means negative in both current/reference panels. Added complete reference data tables alongside current data.

## Browser evidence

The integration browser review used localhost at **1440 × 1000 desktop** and **390 × 844 mobile**. The reviewed pages stayed within their viewport; wide numerical figures and tables scroll locally. Keyboard range adjustment recomputed the selected stage without changing that stage. LayerNorm matrix inspection confirmed that changing token 1 left token 2 unchanged. These are sampled browser checks, not a manual test of all 170 lab routes.

Runtime playback reached stage 4 and stopped, with the control returning to Play. Manual stage 2 displayed its line chart; reset restored stage 1 and that tested lab's default parameter value of 5. Directory search for Speculative Decoding returned one matching entry with its actual control metadata.

A downloaded JSON file parsed successfully and contained current and reference parameter sets and four-stage calculation results for both. The inspected download reflected default values following development hot reload; preservation of a particular nondefault chosen parameter in the exported file is **not** established by that check.

## Remaining verification

**Public deployment and verification of this release on the public URL are pending.** The build and browser evidence above apply to the local implementation. Hidden-tab/offscreen pauses, each playback speed, Reduced Motion behavior, nondefault-value export fidelity and a full screen-reader pass have not been established by the recorded browser checks; implementation and server-render checks should not be substituted for those runtime observations.
