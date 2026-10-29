# Biology methods bridge — 2026-10-29

Scope: reviewed the 251-course baseline for distinct computational connections to Model Systems, Somatic/Germline, TF, Enhancer and Ligand–Receptor concepts. The six additions connect biological questions to actual intermediate calculations rather than repeating general GNN, causal inference or Single-cell introductions. This audit does not establish exhaustive coverage of every biological method or independently verify every legacy lesson.

## Added lessons and numerical mechanisms

Each lesson has eight ordered mechanism steps, at least four settings with a starting point and an adjustment rule, usage, tuning, limitations, pitfalls, one mechanism exercise and one decision exercise. Each has a four-stage computed lab with one or two parameter controls.

| Lesson                        | Mechanism and default fixture                                                                                                                                                                                                     | Main decision boundary                                                                                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `motif-pwm-scoring`           | Counts `[8,1,1,0]` and `[0,1,1,8]`, uniform background and total pseudocount 1 give AT score `2 log2(3) = 3.169925` bits. Background GC and pseudocount controls recompute the matrix, likelihood ratios and sequence comparison. | A motif hit is sequence compatibility under a declared background, not proof that a particular TF binds or regulates a gene.                                                                      |
| `enhancer-gene-abc`           | Activity `[4,2,1]` times Contact `[.1,.2,.4]` gives three `.4` products and three `1/3` scores. Changing the second contact to `.1` gives `[.4,.2,.4]` normalized scores.                                                         | Relative scores depend on the candidate universe. Contact, accessibility and perturbation effect answer different questions.                                                                      |
| `regulon-tf-activity`         | Signed weights `[1,1,-1]` and target values `[2,1,-1]` produce signed mean `4/3` and unsigned mean `2/3`. Changing the repressive target to `2` lowers the signed score to `1/3`.                                                 | TF expression, inferred target activity and causal regulation are separate evidence. This is the explicitly versioned decoupler 1.9.2 WMEAN definition, not AUCell or a reconstruction of SCENIC. |
| `ligand-receptor-inference`   | Three ligand cells and three receptor cells yield interaction mean 3. Enumerating all 20 three-versus-three label assignments gives score frequencies `[1,9,9,1]` and exact upper-tail probability `.05`.                         | The cell-label null tests cell-type specificity under exchangeability. It does not test a donor-level treatment effect or prove physical signaling.                                               |
| `perturbation-generalization` | Control `[10,10]`, single perturbations `[8,11]` and `[11,7]` give additive prediction `[9,8]`. Interaction 2 and context shift 0 yield MSE 4; context shift 1 yields MSE 5.                                                      | Held-out cells, interventions, combinations and contexts are different generalization tasks. The toy does not train GEARS or demonstrate transfer from in vitro to in vivo.                       |
| `variant-mixture-inference`   | Purity `.5`, target copy number 2 and one altered copy per target cell give expected VAF `.25`. Binomial `n=20,k=5` log-likelihood ratio against `p=.5` is `5 ln(.5)+15 ln(1.5)`.                                                 | Reads are allele-copy samples, not cell counts. Copy number and purity can make distinct compositions observationally identical; VAF alone does not identify Somatic versus Germline.             |

All numerical inputs are authored synthetic teaching fixtures, not empirical results from the cited papers. Figure labels state units; ABC Activity and Contact are not placed on a shared numerical scale. The LR plot summarizes the exact enumerated null by score-bin counts. The Binomial figure marks discrete counts and does not imply a continuous density. Negative operands are parenthesized in displayed arithmetic.

## Cross-site learning path

The `biology-regulation-inference` concept path includes all six lessons. Validated connections lead to the Biology site's dedicated chapters and regulation lab:

| AI lesson                   | Biology chapter      | Lab anchor                     |
| --------------------------- | -------------------- | ------------------------------ |
| Motif PWM                   | `textbook.html#rb04` | `regulation-lab.html#motif`    |
| Enhancer ABC                | `textbook.html#rb05` | `regulation-lab.html#enhancer` |
| Regulon activity            | `textbook.html#rb04` | `regulation-lab.html#motif`    |
| Ligand–Receptor             | `textbook.html#rb07` | `regulation-lab.html#lr`       |
| Perturbation generalization | `textbook.html#rb08` | `regulation-lab.html#models`   |
| Variant mixture             | `textbook.html#rb03` | `regulation-lab.html#lineage`  |

The Biology LR lab has four paired donors and 16 sign flips; the AI LR lab has six synthetic cells and 20 label assignments. These intentionally address different statistical questions. Neither is presented as interchangeable replication. In this module LR means Ligand–Receptor; elsewhere it can mean learning rate or Logistic Regression.

## Primary sources and exact claim bounds

- [FIMO paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC3065696/) and [official FIMO documentation](https://meme-suite.org/meme/doc/fimo.html): position-wise log-likelihood scoring, zero-order background, and background-distributed motif pseudocount. The teaching score does not reproduce the software's P-value calculation or multiple-testing adjustment.
- [ABC paper](https://www.nature.com/articles/s41588-019-0538-0) and [official ABC repository](https://github.com/broadinstitute/ABC-Enhancer-Gene-Prediction): Activity-by-Contact and gene-specific candidate normalization. The fixture isolates that normalization, without pretending to reproduce raw assay preprocessing or calibrated enhancer thresholds.
- [SCENIC paper](https://www.nature.com/articles/nmeth.4463): coexpression inference, motif-based refinement and AUCell. [decoupler 1.9.2 WMEAN documentation](https://decoupler.scverse.org/en/v1.9.2/generated/decoupler.run_wmean.html) supports the signed-weight sum divided by the sum of absolute weights used here. This pinned definition is explicitly distinguished from current API variants and from AUCell.
- [CellPhoneDB protocol](https://pubmed.ncbi.nlm.nih.gov/32103204/) and [official output documentation](https://cellphonedb.readthedocs.io/en/stable/RESULTS-DOCUMENTATION.html): complex limiting subunit, cluster interaction means and label-permutation specificity. The toy omits database coverage, expression filtering, donor structure, spatial constraints and full multiple testing.
- [GEARS paper](https://www.nature.com/articles/s41587-023-01905-6) and [official implementation](https://github.com/snap-stanford/GEARS): graph-informed perturbation prediction and structured held-out perturbation evaluation. The lab is an additive baseline plus explicitly authored interaction/context errors, not an implementation of GEARS.
- [ABSOLUTE paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC4383288/) supports purity, ploidy and allelic copy-number interpretation. [Niknafs et al., Persistent mutation burden](https://www.nature.com/articles/s41591-022-02163-w.pdf), Methods, gives the expected VAF relation with purity, cellular fraction, multiplicity and tumor/normal copy number. The lab uses a deliberately restricted mixture and Binomial observation model; it does not emulate the full methods, assume all real counts are Binomial, or classify clinical variants.

## Validation evidence

`node scripts/validate-biology-bridge.mjs` checks six literal lessons, 12 exercises, six labs, 190 parameter states and 760 stage charts. It independently verifies closed-form fixtures, PWM normalization, ABC normalization, signed-score behavior, all 20 LR partitions, the limiting-subunit cap, perturbation residual MSE, Binomial mass and mean, and two distinct purity/copy-number combinations with equal VAF. It also checks all six cross-site destinations and the complete concept path. Finite numeric output is checked at every control tick and joint minimum/default/maximum combinations.

The parent integration review rendered all six labs at a 390-pixel mobile viewport without overflow or browser errors, and confirmed the changed ABC contact case. The full-site validator separately reported 257-course interaction coverage. Deployment and live URL verification belong to the release task and are not claimed by this module audit.
