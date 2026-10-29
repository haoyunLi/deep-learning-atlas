# Computed ML labs: numerical and content audit

Date: 2026-10-29. Scope: all 54 assigned previously text-only courses in the ML, training, probability, generative and graph group. This document describes the lesson data and independent numerical validation. Root integration owns the shared player, accessibility, browser checks, and publication.

## Implementation contract

`src/data/completeLabs/ml.ts` combines 20 training/evaluation labs, 18 classical/inference labs, and 16 generative/graph/reasoning labs. Each has one genuine numeric control, four progressive computed stages, explanatory formulas, chart values, numeric outcomes, two use cases, two tuning recommendations, two symptom/check/action diagnoses, a primary source, and an explicit synthetic-model boundary. Terminology remains English inside Chinese explanations.

The charts expose actual computed quantities: probabilities, transport matrices, graph messages, finite data, solver trajectories, losses, and deterministic queue times. They are not fitted performance curves or claims of real training benchmarks. Four-step playback animates calculation disclosure; it does not claim each stage is a training epoch.

## Independent fixtures

`node scripts/validate-complete-ml.mjs` passes **54 independent expected-outcome fixtures, 813 slider states, and 3,252 stage charts**. Expected values are separately authored constants, fractions, or closed-form references; the validator does not import production math helpers. Every control tick is exercised, including limits. All examples have one control, so tick sweeps cover the full finite control grid.

| Course | Actual mechanism exposed | Independent default check |
|---|---|---|
| Learning Paradigms | Supervised, consistency, and policy-gradient signals | RL updated θ = 0.5377540669 |
| Model Evaluation | Threshold → confusion counts → F1 | Accuracy .75; F1 .8 |
| Domain Shift | Changed subgroup mixture → risk | Target risk .25 |
| External Validation | Prevalence → expected confusion counts → PPV | PPV 2/3; FP 80/1000 |
| Class Imbalance | Weighted BCE optimum shifts probability | Weighted optimum 3/7 |
| BatchNorm | Batch mean/biased variance versus fixed running statistics | Batch variance 1.25 |
| LayerNorm | Independent per-token feature statistics | Token1/2 first output −1.224742575 |
| LR Schedules | Linear warmup then cosine decay | η .0691341716 |
| Gradient Clipping | Global vector norm and radial rescaling | Norm 2; update norm .2 |
| Mixed Precision | FP16 subnormal rounding before/after scaling | Restored gradient 43·2⁻³² |
| LM Evaluation | Target-token probabilities → mean NLL → perplexity | PPL 2.5 |
| Deep Ensembles | Predictive entropy minus mean member entropy | Disagreement .1284965047 nats |
| Conformal Prediction | Finite-sample corrected order statistic | q .6; set size 1 |
| Quantization | Symmetric signed integer quantization | MSE 13/9800 |
| Distillation/Pruning | Temperature-scaled distillation KL and logit gradient | Scaled KL .2966066133 |
| Model Serving | Exact finite FCFS multi-server scheduling | Mean latency 325 ms |
| Nested Group Validation | Inner selection and untouched outer errors | Outer .2; selection gap .06 |
| Hierarchical Bootstrap | Exhaustive 4⁴ donor-resampling distribution | Bootstrap SD √(15/8) |
| Proper Scoring Rules | Expected Brier and Log Loss under true event rate | .25; log(2) |
| Label Shift | Prior-ratio weighted posterior correction | Posterior 8/11 |
| Random Forest | Mean of fixed independent tree outputs | Ensemble .56; member variance .0344 |
| XGBoost | Second-order regularized leaf objective and split gain | Leaf 4/3; gain −1/6 |
| Matrix Factorization | Partial latent dot products plus bias | Rating 3.6; error² .04 |
| Learning to Rank | Sorting, relevance gains, and logarithmic discount | NDCG .9558305893 |
| Survival Analysis | Kaplan–Meier risk sets and censoring | Survival 8/15 |
| Treatment Effects | Horvitz–Thompson inverse propensity weighting | ATE 0; ESS 4 |
| Optimal Transport | Exact symmetric entropy-regularized 2×2 coupling | Cross-mass 1/(1+e²) |
| Bayesian Updating | Beta prior plus Bernoulli sufficient statistics | Predictive 9/14; variance 3/196 |
| Gaussian Processes | One-observation RBF posterior mean and variance | Mean .4162121471 |
| MCMC/HMC | One leapfrog proposal and Metropolis energy correction | ΔH −3/32; acceptance 1 |
| Importance Sampling | Proposal weights, estimator variance, population ESS | Variance .64; ESS fraction 25/34 |
| OLS | Centered covariance, coefficient, residuals | Slope 1.5; MSE 1/18 |
| Naive Bayes | Additive word-count smoothing and normalized posterior | Posterior .25 |
| Boosting Families | Squared-error residual fitting with shrinkage | MSE 98/75 |
| DBSCAN | Radius neighborhoods, core status, connectivity and noise | 1 cluster; 3 noise points |
| Anomaly Detection | Score threshold and review burden | 3 alerts; recall 2/3 |
| Partial Pooling | Normal–Normal precision-weighted posterior | Mean 24/7; variance 12/7 |
| Quantile Regression | Exact pinball objective on finite candidate grid | Minimum 17/16; five minimizers |
| EBM | Boltzmann masses, partition function, expected energy | Expected energy .4247896174 |
| DDPM | Forward marginal and noise-error amplification | Reconstruction error² .04 |
| DDIM | η-dependent variance and one reverse step | σ² 0; x_s 1.2274811517 |
| Latent Diffusion | Explicit toy codec compression bottleneck | Reconstruction MSE .25 |
| Flow Matching | Conditional straight path and velocity derivative | x_t .5; next state 1 |
| scVI | Library-offset NB mean, dispersion and count likelihood | NLL −log(16/243) |
| MoE | Top-k router selection and normalized expert sum | Output (2e−1)/(e+1) |
| GCN | Self-loops, symmetric degree normalization, messages | A .5; B 1/√6 |
| GraphSAGE | Sampled mean, self concatenation, linear update | Output 2; mean deviation −2.5 |
| GAT | LeakyReLU logits → neighborhood Softmax → weighted values | Output 3.9333094416 |
| Neural ODE | Actual Euler integration of x′=−x | x(1)=.32768 |
| PGM | CPT factorization, evidence marginalization, posterior | Posterior 4/13 |
| Causal Graphs | Observational selection versus graph intervention | Observed difference .6; true ATE 0 |
| Knowledge Graphs | Bounded transitive reachability | Two reachable nodes from A; seven total pairs |
| VI/ELBO | Exact joint mass, approximate posterior, ELBO–KL identity | ELBO log(.4); gap log(1.25) |
| Bayes Decisions | Posterior expected cost, threshold and review action | Threshold .4; minimum risk .8 |

## Family-level checks and boundaries

- Normalization: LayerNorm rows have zero mean and token2 is unchanged when token1 changes. GCN matrices remain symmetric; GCN rows are deliberately **not** assumed to sum to one. GAT, EBM and selected MoE gates normalize correctly. OT row and column marginals equal .5.
- Probabilistic inference: probabilities remain in [0,1]; GP latent variances remain nonnegative; HMC acceptance stays in [0,1]; causal joint mass sums to one and its intervention effect remains zero. VI verifies `log evidence − ELBO = KL` and becomes tight at q=.8.
- Numerical training: clipping never exceeds the chosen bound. AMP exponent is restricted to **0..12**, so scaled 1e−8 stays strictly below 2⁻¹⁴ and the constant 2⁻²⁴ spacing is valid throughout. The demo assumes preserved subnormals; it does not emulate FP16 normal binades, overflow, stochastic rounding or every GPU mode.
- Evaluation: label-shift identity at unchanged prior, zero ensemble disagreement for identical members, Brier optimum at the true rate, and empty conformal sets at some thresholds are checked. Conformal is a finite synthetic calibration example, not evidence of clinical or dataset-specific coverage.
- Classical learning: full-rank factorization, collinear OLS, unit residual fitting, isolated DBSCAN points, and full-neighbor GraphSAGE each have separate exact limit checks. The RF fixture averages precomputed tree probabilities; it does not train trees or estimate correlation effects.
- Dynamics: DDPM error² equals `.04(1−ᾱ)/ᾱ`; DDIM variance equals `3η²/14`; latent-codec identity reconstructs perfectly; flow endpoints match −2 and 3. The Flow Matching step shortens near t=1 rather than extrapolating beyond the training path. Neural ODE compares numerical error to an analytic solution, not predictive accuracy.
- Count models: scVI observed library size is restricted to 3..12 for the y=3 fixture. Its NB chart shows counts 0..10 and explicitly leaves tail mass unplotted. Fixed ρ, one gene and illustrative fixed KL are labeled; there is no claim to perform whole-model scVI integration.
- Sampling/uncertainty: donor-bootstrap spread stays constant as cell count increases; only the deliberately naive iid uncertainty shrinks. All 256 donor resamples are enumerated, then displayed in 29 bins. GraphSAGE uses a fixed prefix sample for reproducibility; its observed deviation is not called statistical bias.
- Scope-sensitive examples: latent diffusion uses a clearly labeled block-mean codec; MoE uses explicitly renormalized top-k gates; KG reachability requires a declared compositional relation; review in the decision lab assumes perfect handling at fixed cost. None generalizes these restrictions to full production systems.

## Source review

Each lab links to a primary paper, author textbook/notes, or official implementation documentation. Fixture numbers are original synthetic examples, never copied benchmark scores. The more implementation-sensitive mechanisms were checked against:

- [PyTorch BatchNorm1d](https://docs.pytorch.org/docs/2.9/generated/torch.nn.BatchNorm1d.html), [LayerNorm](https://docs.pytorch.org/docs/2.9/generated/torch.nn.LayerNorm.html), [AMP examples](https://docs.pytorch.org/docs/2.9/notes/amp_examples.html), and [weighted BCE](https://docs.pytorch.org/docs/2.9/generated/torch.nn.BCEWithLogitsLoss.html): normalization axes, biased training variance, loss scaling, unscale before clipping, positive-class weighting. BN uses fixed supplied running moments for the inference comparison and does not update them.
- [scikit-learn ensembles](https://scikit-learn.org/stable/modules/ensemble.html), [Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html), [DBSCAN](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html), [QuantileRegressor](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.QuantileRegressor.html), and [lifelines KaplanMeierFitter](https://lifelines.readthedocs.io/en/latest/fitters/univariate/KaplanMeierFitter.html): residual fitting, smoothed counts, inclusion of self in min_samples, pinball loss, and right-censored survival.
- [GPML Chapter 2](https://gaussianprocess.org/gpml/chapters/RW2.pdf) and [Stan HMC manual](https://mc-stan.org/docs/reference-manual/mcmc.html): conditional Gaussian posterior and leapfrog/Metropolis mechanics.
- [DDPM](https://arxiv.org/abs/2006.11239), [DDIM equations 12/16 and Appendix D.3](https://arxiv.org/html/2010.02502), [Flow Matching](https://arxiv.org/abs/2210.02747), [latent diffusion](https://arxiv.org/abs/2112.10752), and [scVI documentation](https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html): cumulative alpha notation, variance allocation, conditional paths, codec separation, and NB library offset.
- [GCN equation 8](https://arxiv.org/html/1609.02907), [GraphSAGE](https://arxiv.org/abs/1706.02216), [GAT equations 2–4](https://arxiv.org/html/1710.10903), [sparse MoE](https://arxiv.org/html/1701.06538), and [Neural ODE](https://arxiv.org/abs/1806.07366): normalized graph operators, sampled neighborhoods, attention nonlinearity and weighted messages, sparse gates, and integration.
- [VI review](https://arxiv.org/abs/1601.00670), [conformal guide](https://arxiv.org/abs/2107.07511), [Stanford Bayesian networks](https://ermongroup.github.io/cs228-notes/representation/directed/), and [Pearl causal overview](https://ftp.cs.ucla.edu/pub/stat_ser/r350.pdf): ELBO identity, corrected empirical quantiles, joint factorization, and intervention semantics.

Sources were aligned to the specific sandbox mechanism: the survival sandbox cites Kaplan–Meier documentation, the class-imbalance sandbox cites weighted BCE, and the boosting sandbox cites residual-based gradient boosting. The original broader lesson references remain untouched.

## Remaining integration work

This audit establishes mathematical/data validity for this 54-lab group. Shared component rendering, baseline axis consistency, responsive layout, reduced-motion behavior, full-site build, GitHub publication and live verification belong to the root integration audit and are not claimed as completed here.
