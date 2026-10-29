export const mlSources: Record<string, { label: string; url: string }> = {
  "learning-paradigms": {
    label: "Murphy: Probabilistic Machine Learning—An Introduction",
    url: "https://probml.github.io/pml-book/book1.html",
  },
  "model-evaluation": {
    label: "scikit-learn: Cross-validation and model evaluation",
    url: "https://scikit-learn.org/stable/modules/cross_validation.html",
  },
  "domain-shift": {
    label:
      "Moreno-Torres et al.: A unifying view on dataset shift in classification (2012)",
    url: "https://www.sciencedirect.com/science/article/pii/S0031320311002901",
  },
  "external-validation": {
    label:
      "Riley et al.: External validation of clinical prediction models using big datasets (BMJ, 2016)",
    url: "https://www.bmj.com/content/353/bmj.i3140",
  },
  "class-imbalance": {
    label: "PyTorch: BCEWithLogitsLoss and positive-class weighting",
    url: "https://docs.pytorch.org/docs/2.9/generated/torch.nn.BCEWithLogitsLoss.html",
  },
  "batch-normalization": {
    label: "Ioffe & Szegedy, Batch Normalization (2015)",
    url: "https://arxiv.org/abs/1502.03167",
  },
  "layer-normalization": {
    label: "Ba, Kiros & Hinton, Layer Normalization (2016)",
    url: "https://arxiv.org/abs/1607.06450",
  },
  "learning-rate-schedules": {
    label: "PyTorch: CosineAnnealingLR",
    url: "https://docs.pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.CosineAnnealingLR.html",
  },
  "gradient-clipping": {
    label: "PyTorch: clip_grad_norm_",
    url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html",
  },
  "mixed-precision": {
    label: "PyTorch: Automatic Mixed Precision examples",
    url: "https://docs.pytorch.org/docs/stable/notes/amp_examples.html",
  },
  "language-model-evaluation": {
    label: "Liang et al., Holistic Evaluation of Language Models",
    url: "https://arxiv.org/abs/2211.09110",
  },
  "deep-ensembles": {
    label:
      "Lakshminarayanan et al.: Simple and Scalable Predictive Uncertainty Estimation (2016)",
    url: "https://arxiv.org/abs/1612.01474",
  },
  "conformal-selective-prediction": {
    label:
      "Angelopoulos & Bates: A Gentle Introduction to Conformal Prediction (2021)",
    url: "https://arxiv.org/abs/2107.07511",
  },
  quantization: {
    label:
      "Jacob et al.: Quantization and Training for Integer-Arithmetic-Only Inference (2017)",
    url: "https://arxiv.org/abs/1712.05877",
  },
  "distillation-pruning": {
    label: "Hinton et al.: Distilling the Knowledge in a Neural Network (2015)",
    url: "https://arxiv.org/abs/1503.02531",
  },
  "model-serving-monitoring": {
    label:
      "Sculley et al.: Hidden Technical Debt in Machine Learning Systems (2015)",
    url: "https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems",
  },
  "nested-group-validation": {
    label:
      "Cawley & Talbot: Over-fitting in model selection and selection bias (JMLR, 2010)",
    url: "https://www.jmlr.org/papers/v11/cawley10a.html",
  },
  "hierarchical-bootstrap": {
    label:
      "Saravanan et al.: Hierarchical bootstrap for multilevel data (2020)",
    url: "https://arxiv.org/abs/2007.07797",
  },
  "proper-scoring-rules": {
    label: "Gneiting & Raftery: Strictly Proper Scoring Rules",
    url: "https://sites.stat.washington.edu/raftery/Research/PDF/Gneiting2007jasa.pdf",
  },
  "label-shift-correction": {
    label: "Lipton, Wang & Smola: Detecting and Correcting for Label Shift",
    url: "https://proceedings.mlr.press/v80/lipton18a.html",
  },
  "random-forest": {
    label: "scikit-learn: Random forests and ensemble methods",
    url: "https://scikit-learn.org/stable/modules/ensemble.html#random-forests",
  },
  xgboost: {
    label: "Chen & Guestrin: XGBoost (2016)",
    url: "https://arxiv.org/abs/1603.02754",
  },
  "matrix-factorization": {
    label:
      "Koren et al.: Matrix Factorization Techniques for Recommender Systems (2009)",
    url: "https://datajobs.com/data-science-repo/Recommender-Systems-%5BNetflix%5D.pdf",
  },
  "learning-to-rank": {
    label: "Burges: From RankNet to LambdaRank to LambdaMART (2010)",
    url: "https://www.microsoft.com/en-us/research/publication/from-ranknet-to-lambdarank-to-lambdamart-an-overview/",
  },
  "survival-analysis": {
    label: "lifelines: KaplanMeierFitter and censored observations",
    url: "https://lifelines.readthedocs.io/en/latest/fitters/univariate/KaplanMeierFitter.html",
  },
  "causal-treatment-effects": {
    label: "Hernán & Robins: Causal Inference—What If (2020)",
    url: "https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/",
  },
  "optimal-transport": {
    label: "Cuturi: Sinkhorn Distances (NeurIPS, 2013)",
    url: "https://papers.nips.cc/paper/2013/hash/af21d0c97db2e27e13572cbf59eb343d-Abstract.html",
  },
  "bayesian-updating": {
    label: "Duke Statistics: Conjugate prior derivation",
    url: "https://www2.stat.duke.edu/~st118/sta250/conjug.pdf",
  },
  "gaussian-processes": {
    label: "Rasmussen & Williams: GPML, Chapter 2",
    url: "https://gaussianprocess.org/gpml/chapters/RW2.pdf",
  },
  "mcmc-hmc": {
    label: "Stan Reference Manual: MCMC Sampling",
    url: "https://mc-stan.org/docs/reference-manual/mcmc.html",
  },
  "importance-sampling": {
    label: "Owen: Monte Carlo theory, methods and examples, Chapter 9",
    url: "https://artowen.su.domains/mc/Ch-var-is.pdf",
  },
  "linear-regression-ols": {
    label: "scikit-learn: Ordinary Least Squares and Ridge",
    url: "https://scikit-learn.org/stable/modules/linear_model.html#ordinary-least-squares",
  },
  "naive-bayes": {
    label: "scikit-learn: Naive Bayes",
    url: "https://scikit-learn.org/stable/modules/naive_bayes.html",
  },
  "boosting-families": {
    label: "scikit-learn: Gradient Boosting and additive residual fitting",
    url: "https://scikit-learn.org/stable/modules/ensemble.html#gradient-boosting",
  },
  "dbscan-density": {
    label: "scikit-learn: DBSCAN and density-based clustering",
    url: "https://scikit-learn.org/stable/modules/clustering.html#dbscan",
  },
  "anomaly-detection": {
    label: "scikit-learn: Novelty and Outlier Detection",
    url: "https://scikit-learn.org/stable/modules/outlier_detection.html",
  },
  "hierarchical-partial-pooling": {
    label: "Stan User’s Guide: Hierarchical regression",
    url: "https://mc-stan.org/docs/stan-users-guide/regression.html#hierarchical-regression",
  },
  "quantile-regression": {
    label: "scikit-learn: QuantileRegressor",
    url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.QuantileRegressor.html",
  },
  "energy-based-models": {
    label: "Song & Kingma: How to Train Your Energy-Based Models",
    url: "https://arxiv.org/abs/2101.03288",
  },
  ddpm: {
    label: "Ho et al.: Denoising Diffusion Probabilistic Models (2020)",
    url: "https://arxiv.org/abs/2006.11239",
  },
  ddim: {
    label: "Song et al.: Denoising Diffusion Implicit Models (2021)",
    url: "https://arxiv.org/abs/2010.02502",
  },
  "latent-diffusion": {
    label:
      "Rombach et al.: High-Resolution Image Synthesis with Latent Diffusion Models (2022)",
    url: "https://arxiv.org/abs/2112.10752",
  },
  "flow-matching": {
    label: "Lipman et al.: Flow Matching for Generative Modeling (2023)",
    url: "https://arxiv.org/abs/2210.02747",
  },
  scvi: {
    label: "scvi-tools: scVI generative model and inference documentation",
    url: "https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html",
  },
  "mixture-of-experts": {
    label: "Outrageously Large Neural Networks: Sparsely-Gated MoE",
    url: "https://arxiv.org/abs/1701.06538",
  },
  gcn: {
    label: "Kipf & Welling: Graph Convolutional Networks (2017)",
    url: "https://arxiv.org/abs/1609.02907",
  },
  graphsage: {
    label:
      "Hamilton et al.: Inductive Representation Learning on Large Graphs (2017)",
    url: "https://arxiv.org/abs/1706.02216",
  },
  gat: {
    label: "Veličković et al.: Graph Attention Networks (2018)",
    url: "https://arxiv.org/abs/1710.10903",
  },
  "neural-odes": {
    label: "Chen et al.: Neural Ordinary Differential Equations (2018)",
    url: "https://arxiv.org/abs/1806.07366",
  },
  "probabilistic-graphical-models": {
    label: "Stanford CS228: Bayesian networks",
    url: "https://ermongroup.github.io/cs228-notes/representation/directed/",
  },
  "causal-graphs-identifiability": {
    label: "Pearl: Causal inference in statistics—An overview",
    url: "https://ftp.cs.ucla.edu/pub/stat_ser/r350.pdf",
  },
  "knowledge-graphs-reasoning": {
    label:
      "Hogan et al.: Knowledge Graphs — representation, queries and inference",
    url: "https://arxiv.org/abs/2003.02320",
  },
  "variational-inference-elbo": {
    label: "Blei, Kucukelbir & McAuliffe: Variational Inference",
    url: "https://arxiv.org/abs/1601.00670",
  },
  "bayes-decision-thresholds": {
    label: "scikit-learn: Tuning the decision threshold",
    url: "https://scikit-learn.org/stable/modules/classification_threshold.html",
  },
};
