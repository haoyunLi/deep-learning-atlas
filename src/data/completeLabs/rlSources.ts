export const rlSources: Record<string, { label: string; url: string }> = {
  simclr: {
    label: "Chen et al.: A Simple Framework for Contrastive Learning",
    url: "https://arxiv.org/abs/2002.05709",
  },
  moco: {
    label: "He et al.: Momentum Contrast",
    url: "https://arxiv.org/abs/1911.05722",
  },
  byol: {
    label: "Grill et al.: Bootstrap Your Own Latent",
    url: "https://arxiv.org/abs/2006.07733",
  },
  "barlow-twins": {
    label: "Zbontar et al.: Barlow Twins",
    url: "https://arxiv.org/abs/2103.03230",
  },
  mae: {
    label: "He et al.: Masked Autoencoders Are Scalable Vision Learners",
    url: "https://arxiv.org/abs/2111.06377",
  },
  vicreg: {
    label: "Bardes et al.: VICReg",
    url: "https://arxiv.org/abs/2105.04906",
  },
  dino: {
    label:
      "Caron et al.: Emerging Properties in Self-Supervised Vision Transformers",
    url: "https://arxiv.org/abs/2104.14294",
  },
  "supervised-contrastive": {
    label: "Khosla et al.: Supervised Contrastive Learning",
    url: "https://arxiv.org/abs/2004.11362",
  },
  "zero-shot-learning": {
    label:
      "Radford et al.: Learning Transferable Visual Models From Natural Language Supervision",
    url: "https://arxiv.org/abs/2103.00020",
  },
  "few-shot-learning": {
    label:
      "Prototypical Networks for Few-shot Learning — prototype baseline used in this fixture",
    url: "https://arxiv.org/abs/1703.05175",
  },
  "linear-probe": {
    label:
      "Chen et al.: A Simple Framework for Contrastive Learning of Visual Representations",
    url: "https://arxiv.org/abs/2002.05709",
  },
  "prototypical-networks": {
    label: "Snell et al.: Prototypical Networks for Few-shot Learning",
    url: "https://arxiv.org/abs/1703.05175",
  },
  "vision-language-models": {
    label:
      "Alayrac et al.: Flamingo—A Visual Language Model for Few-Shot Learning (2022)",
    url: "https://arxiv.org/abs/2204.14198",
  },
  "two-tower-retrieval": {
    label:
      "Covington et al.: Deep Neural Networks for YouTube Recommendations (2016)",
    url: "https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/",
  },
  "multiple-instance-learning": {
    label:
      "Ilse, Tomczak & Welling: Attention-based Deep Multiple Instance Learning (ICML, 2018)",
    url: "https://proceedings.mlr.press/v80/ilse18a.html",
  },
  "manifold-embeddings": {
    label: "UMAP official parameter guide; t-SNE and UMAP original methods",
    url: "https://umap-learn.readthedocs.io/en/latest/parameters.html",
  },
  "double-dqn": {
    label: "van Hasselt et al., Double Q-Learning",
    url: "https://arxiv.org/abs/1509.06461",
  },
  "dueling-dqn": {
    label: "Wang et al., Dueling Networks",
    url: "https://arxiv.org/abs/1511.06581",
  },
  "rainbow-dqn": {
    label: "Hessel et al., Rainbow",
    url: "https://arxiv.org/abs/1710.02298",
  },
  trpo: {
    label: "Schulman et al., TRPO",
    url: "https://arxiv.org/abs/1502.05477",
  },
  ddpg: {
    label: "Lillicrap et al., DDPG",
    url: "https://arxiv.org/abs/1509.02971",
  },
  td3: {
    label: "Fujimoto et al., TD3",
    url: "https://arxiv.org/abs/1802.09477",
  },
  "model-based-rl": {
    label: "Janner et al., Model-Based Policy Optimization",
    url: "https://arxiv.org/abs/1906.08253",
  },
  muzero: {
    label: "Schrittwieser et al., MuZero",
    url: "https://www.nature.com/articles/s41586-020-03051-4",
  },
  "behavior-cloning": {
    label: "Ross et al., DAgger",
    url: "https://arxiv.org/abs/1011.0686",
  },
  "offline-rl": {
    label: "Levine et al., Offline RL Tutorial",
    url: "https://arxiv.org/abs/2005.01643",
  },
  cql: {
    label: "Kumar et al., Conservative Q-Learning",
    url: "https://arxiv.org/abs/2006.04779",
  },
  "decision-transformer": {
    label: "Chen et al., Decision Transformer",
    url: "https://arxiv.org/abs/2106.01345",
  },
  rlhf: {
    label: "Ouyang et al., InstructGPT",
    url: "https://arxiv.org/abs/2203.02155",
  },
  "off-policy-evaluation": {
    label: "Jiang & Li: Doubly Robust Off-policy Value Evaluation (2016)",
    url: "https://proceedings.mlr.press/v48/jiang16.html",
  },
  "imitation-learning": {
    label:
      "Ross et al.: A Reduction of Imitation Learning to No-Regret Online Learning (2011)",
    url: "https://arxiv.org/abs/1011.0686",
  },
  "safe-rl-pomdp": {
    label:
      "Kaelbling, Littman & Cassandra: Planning and Acting in Partially Observable Stochastic Domains — belief-state ingredient",
    url: "https://www.cassandra.org/arc/papers/aij98.pdf",
  },
  "contextual-bandits-linucb": {
    label:
      "Li, Chu, Langford & Schapire: A Contextual-Bandit Approach to Personalized News Article Recommendation (2010)",
    url: "https://www.schapire.net/papers/www10.pdf",
  },
  "matching-networks": {
    label: "Vinyals et al.: Matching Networks for One Shot Learning",
    url: "https://arxiv.org/abs/1606.04080",
  },
  "relation-networks": {
    label:
      "Sung et al.: Learning to Compare—Relation Network for Few-Shot Learning",
    url: "https://arxiv.org/abs/1711.06025",
  },
  "siamese-triplet": {
    label:
      "Schroff et al.: FaceNet—A Unified Embedding for Face Recognition and Clustering",
    url: "https://arxiv.org/abs/1503.03832",
  },
  "meta-sgd-anil": {
    label:
      "Li et al.: Meta-SGD—Learning to Learn Quickly for Few-Shot Learning",
    url: "https://arxiv.org/abs/1707.09835",
  },
  "learned-optimizers": {
    label:
      "Andrychowicz et al.: Learning to Learn by Gradient Descent by Gradient Descent",
    url: "https://arxiv.org/abs/1606.04474",
  },
  "hypernetworks-meta-gradients": {
    label: "Ha et al.: HyperNetworks",
    url: "https://arxiv.org/abs/1609.09106",
  },
  "memory-augmented-meta-learning": {
    label:
      "Santoro et al.: Meta-Learning with Memory-Augmented Neural Networks",
    url: "https://arxiv.org/abs/1605.06065",
  },
  "meta-reinforcement-learning": {
    label:
      "Duan et al.: RL²—Fast Reinforcement Learning via Slow Reinforcement Learning",
    url: "https://arxiv.org/abs/1611.02779",
  },
  "cross-domain-few-shot": {
    label: "Triantafillou et al.: Meta-Dataset",
    url: "https://arxiv.org/abs/1903.03096",
  },
  "transfer-learning-strategies": {
    label:
      "Yosinski et al.: How Transferable Are Features in Deep Neural Networks?",
    url: "https://arxiv.org/abs/1411.1792",
  },
  "domain-adaptation-dann": {
    label: "Ganin et al.: Domain-Adversarial Training of Neural Networks",
    url: "https://arxiv.org/abs/1505.07818",
  },
  "domain-generalization-irm": {
    label: "Arjovsky et al.: Invariant Risk Minimization",
    url: "https://arxiv.org/abs/1907.02893",
  },
  "continual-learning": {
    label:
      "Kirkpatrick et al.: Overcoming Catastrophic Forgetting in Neural Networks",
    url: "https://arxiv.org/abs/1612.00796",
  },
  "multi-task-learning": {
    label:
      "Kendall et al.: Multi-Task Learning Using Uncertainty to Weigh Losses",
    url: "https://arxiv.org/abs/1705.07115",
  },
  "automl-hpo-nas": {
    label: "Liu et al.: DARTS—Differentiable Architecture Search",
    url: "https://arxiv.org/abs/1806.09055",
  },
  "curriculum-self-paced": {
    label:
      "Kumar, Packer & Koller: Self-Paced Learning for Latent Variable Models",
    url: "https://papers.nips.cc/paper_files/paper/2010/hash/e57c6b956a6521b28495f2886ca0977a-Abstract.html",
  },
  "test-time-adaptation": {
    label:
      "Wang et al.: Tent—Fully Test-Time Adaptation by Entropy Minimization",
    url: "https://arxiv.org/abs/2006.10726",
  },
  "semi-supervised-self-training": {
    label: "Sohn et al.: FixMatch—Simplifying Semi-Supervised Learning",
    url: "https://arxiv.org/abs/2001.07685",
  },
  "online-learning-drift": {
    label: "Gama et al.: A Survey on Concept Drift Adaptation",
    url: "https://doi.org/10.1145/2523813",
  },
  "bayesian-optimization": {
    label:
      "Srinivas et al.: Gaussian Process Optimization in the Bandit Setting — GP-UCB",
    url: "https://arxiv.org/abs/0912.3995",
  },
  "agent-workflows": {
    label: "Anthropic: Building effective agents — architectural patterns",
    url: "https://www.anthropic.com/research/building-effective-agents",
  },
  "tool-calling-contracts": {
    label: "JSON Schema: object validation, required and additional properties",
    url: "https://json-schema.org/understanding-json-schema/reference/object",
  },
  "react-agent-loop": {
    label:
      "Yao et al.: ReAct — Synergizing Reasoning and Acting in Language Models",
    url: "https://arxiv.org/abs/2210.03629",
  },
  "agent-memory-context": {
    label:
      "Park et al.: Generative Agents — memory, retrieval and reflection architecture",
    url: "https://arxiv.org/abs/2304.03442",
  },
  "agent-evaluation": {
    label: "Yao et al.: τ-bench — task-state evaluation and pass^k reliability",
    url: "https://arxiv.org/abs/2406.12045",
  },
  "agent-security-boundaries": {
    label:
      "MCP official security best practices — trust, authorization and tool boundaries",
    url: "https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices",
  },
  "multi-agent-orchestration": {
    label: "Wu et al.: AutoGen — multi-agent conversation architecture",
    url: "https://arxiv.org/abs/2308.08155",
  },
  "model-context-protocol": {
    label:
      "Model Context Protocol specification — pinned 2025-06-18 lifecycle and capabilities",
    url: "https://modelcontextprotocol.io/specification/2025-06-18",
  },
  "agent-state-checkpoints": {
    label:
      "LangGraph official documentation: Checkpointers, super-step boundaries and pending writes (accessed 2026-10-29)",
    url: "https://docs.langchain.com/oss/python/langgraph/checkpointers",
  },
};
