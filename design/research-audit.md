# Research learning audit

## Scope

Reviewed the existing course registry, practice navigation, generic step guide, animation catalog, glossary, validators and README. Examined the new 8 lessons and 3 research paths for scientific assumptions and source alignment. This is not a claim that every statement in all legacy lessons has received an independent paper review.

## Implemented findings

- Added Count Likelihoods, Pseudobulk, Nested Group Validation, Elastic Net, scVI, Spatial Assignment, Optimal Transport and MIL: 8 lessons and 16 authored questions.
- Added 12 terms, including Independent Unit, Estimand, Identifiability and Assignment Entropy.
- Connected Spatial bin-to-cell, Pathway/Age and Methylation/Age to question, input/output, baseline, settings, ablation, evaluation and interpretation. Spatial is the user-confirmed default.
- Added 4 numerical parameter diagrams and a donor fingerprint memorization counterexample. All examples are synthetic and do not claim to reproduce the user's research.
- Distinguished fractional weighted expression from observed integer raw counts; heuristic Gibbs weights from EM responsibilities; entropy from calibrated confidence; model prediction from biological mechanism.
- Mapped Elastic Net symbols explicitly to scikit-learn/glmnet settings.
- Made generic course steps manual. Kept playback for real mechanisms and honored reduced motion.
- Restored the existing MAML sandbox to the practice directory and corrected stale coverage counts.
- Added separately saved, editable project protocols with Markdown export and storage-unavailable feedback.

## Validation

Production build checks all 177 lesson IDs/fields/comparison links, 354 questions, 124 glossary entries, 53 parameter labs and 56 mechanism diagrams. Scientific numeric checks cover NB PMF mass/mean/variance, composition arithmetic, Elastic Net coordinates, Gibbs normalization/symmetry/entropy and independent donor split predictions. SVG sweeps render all slider stops. Browser checks cover project selection, parameter response, stages, answer feedback, draft persistence/export content, manual course guides and responsive layouts.

The final production build passed. Final desktop and mobile review confirmed the compact research entry, expandable background, adjacent mobile Input/Output columns, inline SVG playback controls, visible computed readouts and dynamic accessible diagram names. At a 390px mobile viewport the page remained 390px wide while the 720px diagram scrolled locally. For the Spatial example at α=1, visible and accessible outputs agreed: costs 0.90/0.10, Gibbs weights 0.039/0.961 and entropy 0.165 nats. The reviewer resolved all five findings and reported no material regressions.

## Further opportunities

- Separate legacy course-detail data from the initial catalog bundle; the current production build still reports a large initial course-content chunk.
- Add real, permissioned benchmark datasets with fixed split manifests and runnable notebooks. Current examples demonstrate mechanisms; they are not benchmark evidence.
- Extend the spatial examples to candidate recall, registration error and unbalanced/partial OT, preserving separate output contracts.
- Add patient-level bootstrap and matched gene-set permutation experiments, with enough independent units to make the uncertainty demonstration meaningful.
