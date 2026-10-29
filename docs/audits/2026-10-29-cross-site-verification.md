# Cross-site release verification — 2026-10-29

Scope: bridge experimental models, lineage, regulation, communication and causal testing into the existing Biology and AI/ML curricula. Existing biology content was updated from origin/main in an isolated worktree; unrelated changes in the older checkout were preserved.

## Content and calculation checks

- Biology: 24 courses, 245 chapters, 1,089 sections, 364 source entries and 779 complete glossary terms. All audit and `scripts/test-*.mjs` commands pass. New material has 8 chapters / 48 sections / 48 worked steps / 8 original figures and 6 four-stage labs. The six labs pass independent fixtures, 1,963 parameter states and domain checks.
- AI/ML: `npm run build` passes all validators, TypeScript and Vite. 257 lessons and 514 exercises are registered. The new six labs have 190 parameter-state checks and 760 rendered charts; the full Complete Lab collection has 176 experiments and 3,861 calculation states. Existing calculators/animations remain part of the all-course coverage definition.
- Independent scientific review corrected Somatic variant classification, strict Necessity versus partial contribution, fixed Kd descriptions, and the distinct LR nulls: 20 cell-label partitions in the AI toy versus 16 paired-donor sign flips in the biology toy. No toy scores are described as biological causal probabilities.

## Browser checks

- All 8 new biology chapters and 6 new AI lessons loaded with their figures and correct routes. Mobile checks at 390px showed no document-level horizontal overflow; full-size quantitative figures and tables scroll locally.
- PWM GC .5 to .8 changed score 4.6231 to 7.8155 bits while retaining the selected stage. Biology ABC candidate removal changed E1 .4706 to .6154; the prediction feedback explained the denominator.
- Donor example n=4,m=20 produced SE=1.0548 versus naive .4031. Germ-only diploid progenitors at carrier fraction .5 gave VAF .25. R2=0 with free ligand20 gave capacity0, occupancy.8 and bound0.
- Biology LR distance scale100 produced mean contrast1.8462 and exact p=.25; default scale40 produced p=.625. AI ABC contact .1 produced [.4,.2,.4] with the original reference retained.
- Search checks covered `invivo`, `LR` and `enhanse`. English display names remained correct.
- Browser work found and fixed range change coercion and mobile header spacing. Reset restores keyboard focus; playback respects hidden/offscreen/reduced-motion state. No new console errors followed the fixes.

## Design-check limits

The AI mechanical detector returned no findings. Biology detector ran once in degraded regex mode because optional parser modules were unavailable; this is not a complete contrast/selector audit. Its non-token warnings were reviewed: the 3px underline is on square navigation links, and width/height transitions apply to SVG quantitative geometry rather than HTML layout. Intentional local tokens are documented in DESIGN.md; control border contrast was increased. Desktop/mobile visual review supplements the limited detector. Vite reports the existing large main-chunk advisory; production build succeeds.

Public deployment and exact commit evidence are checked separately after pushing. These validations establish website behavior and toy arithmetic, not empirical validation on biological datasets.
