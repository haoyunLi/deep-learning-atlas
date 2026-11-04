# Learning evidence: bounded recovery changes

Publication branch: `learning-honesty-2026-10-05`. Public-main baseline: `51b952c45739841ffb0e8f13bff197465b1e43f9`.

This change addresses CodeLab's validation claims and Arena's experimental bookkeeping. It preserves the existing course content, research paths, diagrams, and visual identity.

## One training step

The new `/studio/training` walkthrough connects an actual browser calculation through seven states: fixed parameters, forward computation, loss, output gradient, chain rule, simultaneous SGD, and a new forward computation. The model is `z=w*x`, `h=tanh(z)`, `prediction=v*h`, and `loss=0.5*(prediction-target)^2`, with one synthetic sample, no bias, and two scalar parameters. Both update gradients use the same old forward pass. It illustrates one sample's loss, not generalization or a complete training system.

Learners change input, either weight, target, or learning rate; make an initial prediction; and use manual steps or explicit play, pause, and replay. Parameter changes stop playback and reset the prediction. Presets contrast a decreasing-loss step, large-step overshoot, tanh saturation, and zero error. Original SVG paths, synchronized values, formulas, and an update table distinguish forward quantities from gradient propagation. Small nonzero gradients use scientific notation. Reduced-motion preference disables playback and retains manual controls. Narrow screens scroll only the graph/table regions.

The calculations and visual assets are original. Further primary-source guidance: [Stanford CS231n backpropagation notes](https://cs231n.github.io/optimization-2/) and [3Blue1Brown backpropagation calculus](https://www.3blue1brown.com/lessons/backpropagation-calculus/), alongside the D2L computational-graph chapter below. No third-party video or figure was embedded or copied.

### Sensitivity and step-size appraisal

The tanh plot now connects the current point and tangent to a small signed `delta-z` probe. It compares the actual change in h, the local linear approximation, and the secant slope; the probe changes only the gate input and performs no SGD update. The same numerical local derivative appears in the complete chain-rule product. Nonnegative local tanh sensitivity does not determine the full gradient's sign, which also depends on the upstream gradient and input.

A second plot shows `phi(eta)=L(w-eta*g_w, v-eta*g_v)` for eta from 0 to 2. All 81 points propose one update from the same old parameters and frozen gradient. They are not training history. The old-loss reference and selected step show why a sufficiently small step can decrease loss while a large step overshoots. The horizontal range stays fixed; the vertical scale starts at zero and its automatic adjustment is disclosed. Further guidance: [D2L gradient descent](https://d2l.ai/chapter_optimization/gd.html).

The user-approved Plot Is All You Need skill's installed appraisal guidance was applied to rendered original keyframes. Two self-produced gallery samples were viewed privately for zero-reference, panel, and directional-contribution conventions; no gallery image, plotting code, or research data was published. Its reviewed contact-sheet helper produced private comparisons from this site's own renders. No taste selection or gallery ingestion was recorded.

Playback flow now marks only the active forward/backward phase. Hidden-document events stop playback, and the queued timer independently checks visibility before advancing. Screen-reader status announcements remain polite during manual/paused steps and are disabled while playing. Rendered desktop/mobile checks cover every phase, probe convergence and saturation, sign reversal, exact selected loss, flat zero-gradient loss, phase-specific flow, hidden-page pause, and reduced-motion numerical equivalence.

## CodeLab

- The browser now describes its action as dimension validation and formula estimation. It performs no Python execution, numerical comparison, backward pass, or training test.
- All dimension inputs require finite positive integers within the teaching UI bounds. Byte width must be 1, 2, 4, or 8; attention's D must divide evenly across H heads. Invalid values suppress estimates.
- Attention estimates explicitly cover one dense self-attention layer without bias/cache/dropout. FLOPs count a multiply-add as two operations; activation storage includes Q/K/V, one attention matrix, and context. It excludes parameters, gradients, optimizer state, softmax/mask work, and other buffers, and is not measured peak memory.
- CNN/RNN/U-Net/GNN resource estimates are unavailable because their architectural dimensions are unspecified. MAML exposes the declared parameter count; compute and storage remain unavailable without the base model and support/query work.
- Deployment examples identify missing imports, helpers, data, and members. Dimension inputs do not rewrite displayed snippet constants. The deployment checklist lists tests still to run in the learner's environment.

## Arena

- The page discloses the exact update counts, tree-stump counts, k, learning rates, hidden width, and curve units used by the implementation. The scale slider changes these different quantities; it provides no equal-FLOP, equal-time, or equal-search guarantee.
- The tree examples disclose their single-level stump simplification. kNN displays its single validation point with an appropriate unit.
- Revealing test metrics requires a recorded model choice and validation-based reason. Exposure history is stored in the current browser and survives retraining or changing the setting scale. Each generated dataset key includes every generator input; the training scale does not affect the key.
- Previously revealed data stays marked as exposed after results are hidden again. Deterministic browser data is not securely isolated; clearing browser data or unavailable local storage limits persistence. A new synthetic seed does not substitute for external validation.

## Source comparison

Sources were reviewed during this recovery task; no figures, code, or assessment text were copied.

| Primary source | Relevant teaching practice | Applied change |
| --- | --- | --- |
| [Dive into Deep Learning: Forward Propagation, Backward Propagation, and Computational Graphs](https://d2l.ai/chapter_multilayer-perceptrons/backprop.html) | Forward and backward computations have concrete computational dependencies. | Separate dimension/formula estimates from evidence obtained by executing forward and backward calculations. |
| [Stanford CS231n Assignment 1, 2026](https://cs231n.github.io/assignments2026/assignment1/) | Implement and evaluate classifiers with distinct training, validation, and test roles. | Publish actual model settings and preserve the history of test exposure after validation-based selection. |

## Verification

- `npm run build` passed all repository validators, TypeScript, and Vite production compilation.
- Added regression checks cover invalid and non-finite dimensions, attention formulas/divisibility, missing architecture estimates, exact trainer settings/curve endpoints, stable exposure keys, and corrupted history.
- Training derivatives passed 450 central finite-difference comparisons across 225 parameter combinations. Additional checks cover simultaneous updates, loss decrease and overshoot, zero learning rate, zero error, saturation, and invalid input; seven Studio routes pass server-rendering checks.
- Publication previews passed Chrome browser checks for prediction locking, step/play/pause/replay behavior, slider resets, synchronized numerical examples, reduced-motion manual controls, narrow-screen overflow, and the earlier CodeLab/Arena interactions. Desktop and phone-width rendered figures were reviewed. The browser scripts and screenshots are retained in the separate local handoff workspace.
- Safari desktop interaction verified invalid D/H handling, unavailable CNN estimates, reason-gated test reveal, and retained exposure after retraining and reload. Phone-width review used Safari Responsive Design Mode at 375 × 812.
- Impeccable's detector ran once on the changed UI sources. It reported existing Atlas CSS warnings and token advisories; the new reason field's font-size advisory was resolved with the documented 13px control size. Existing unrelated styling was preserved.

The local Node runtime is 21.5.0, outside Vite's advertised Node range. The production build succeeded with that warning and the existing large-bundle warning; release CI should use the project's supported Node runtime. No Python/PyTorch tests or real model training were performed by CodeLab.
