# AI / ML / CV / Agent depth audit and release

Scope: reviewed the baseline catalogue of 233 course IDs/summaries and the neighboring complete lessons described in the three domain audit notes. Expanded to 251 courses rather than duplicating architecture introductions. This is not a claim that every old formula has been independently rederived or every browser page manually exercised.

## Implemented

18 courses, 36 authored questions, 18 numerical three-stage lesson figures. Six new computed labs (nine SVG plots): HMM, Kalman Filter, Hungarian Assignment, Image Geometry, MCTS, Beam/Grammar. New courses cover detailed algorithms, starting configurations, adjustment signals, conditions, tradeoffs and failure cases. Existing courses received the specific corrections recorded in the ML/CV/Agent notes plus reciprocal links. Three CV courses now expose supplementary primary references as named links instead of long raw URLs in prose.

The animation directory now recognizes 17 cross-lesson labs (six new, eleven existing) alongside the existing 53 inline parameter labs. Course IDs, website URL and browser study-state format are preserved.

## Numerical and build validation

Full `npm run build` passes on Node22: 251 courses, 1364 mechanism steps, 615 stated limits, 804 setting entries, 502 questions, course links, route handling, local-storage recovery, existing sandboxes and SVG renders. New domain validators check 2217 ML, 49 CV and 42 Agent arithmetic assertions plus checkpoint fixtures; the new lab validator checks 6571 numerical assertions with independent path/permutation enumeration, precision-form fusion, coordinate round trips, seeded MCTS backup and Beam distributions. Synthetic fixtures do not establish trained-model performance.

## Browser verification

In-app browser, localhost, desktop1280 and mobile390: all six labs opened; HMM/Kalman/assignment controls recomputed outputs and reset steps; Hungarian cost .41 versus greedy1.1; weight1 produced .3/.3. Geometry Stretch+No flip showed the correct inverse boundary. MCTS advanced through phases and paused. Beam width2 gave By=.36; width1 gave Ax=.306; grammar changed the distribution and prediction feedback worked. Directory search HMM + parameter filter linked directly to its numerical lab. The new Hungarian course rendered its two questions and primary references.

Mobile lab plots scroll locally at660px while the390px page stays inside its viewport. A raw reference URL initially caused a course-page overflow; named source links plus prose wrapping fixed the verified page to390/390. The six lab route SSR checks and all-course exercise SSR checks complement these manual interactions; they are not a browser test of all251 course routes. No console errors/warnings observed in the tested lab tab.

## Finish review

One detector run across six changed UI targets returned no findings. Independent screenshot/source review requested that final Beam rows retain pruned candidates. Fixed: By/Ax remain kept and Ay/Bx remain visibly pruned. Review artifacts are local under `.impeccable/review/`. Existing white/navy reading style and reduced-motion/manual controls remain. Review does not substitute for a screen-reader test. Final independent disposition: **PASS**, both material fixes resolved; build completion was subsequently confirmed by the parent.

| Review item | Verdict |
| --- | --- |
| Beam pruning visibility | Resolved |
| CV lesson mobile overflow | Resolved |
| Design contract | PASS |
| Remaining material findings | None in reviewed scope |
| Full build | Passed (parent verification) |

## Remaining limits

The full course corpus remains eagerly included in the main bundle (about575kB gzip), so Vite reports its existing size warning. Heavy labs remain lazy loaded; no new package dependencies were added. Scientific sources are papers/official implementations; settings are explicitly examples or validated starting points, not universal best defaults. Potential future topics are listed in the domain notes rather than represented as completed work.
