export const cvMetadata = {
  nnunet: {
    source: {
      label: "Isensee et al., nnU-Net (Nature Methods, 2021)",
      url: "https://doi.org/10.1038/s41592-020-01008-z",
    },
    usage: [
      "医学图像分割任务变化多、没有时间逐项手调 U-Net pipeline。",
      "需要强、可复现的 baseline 来判断自定义方法是否真的有收益。",
    ],
  },
  "unet-plus-plus": {
    source: {
      label: "Zhou et al., UNet++ (2018)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7329239/",
    },
    usage: [
      "U-Net 已可运行，但浅层细节与深层语义结合不足、边界或小目标仍差。",
      "能承担额外计算并需要比较不同 decoder 深度。",
    ],
  },
  "deeplabv3-plus": {
    source: {
      label: "Chen et al., DeepLabv3+ (2018)",
      url: "https://arxiv.org/abs/1802.02611",
    },
    usage: [
      "自然场景语义分割，物体大小差异显著。",
      "希望在感受野、输出分辨率和计算量之间控制取舍。",
    ],
  },
  vgg: {
    source: {
      label: "Simonyan & Zisserman, VGG (2014)",
      url: "https://arxiv.org/abs/1409.1556",
    },
    usage: [
      "学习 CNN stage、感受野和深度概念。",
      "已有 VGG 预训练权重且需要兼容旧实验或感知损失。",
    ],
  },
  densenet: {
    source: {
      label: "Huang et al., DenseNet (2017)",
      url: "https://arxiv.org/abs/1608.06993",
    },
    usage: [
      "需要比较 feature reuse 和 residual addition 的不同设计。",
      "图像分类或作为预训练 backbone，且实测延迟和显存可接受。",
    ],
  },
  efficientnet: {
    source: {
      label: "Tan & Le, EfficientNet (ICML, 2019)",
      url: "https://proceedings.mlr.press/v97/tan19a.html",
    },
    usage: [
      "分类需要在精度与计算预算间挑选不同规模模型。",
      "想用成熟的预训练 CNN Backbone 做 Transfer Learning。",
    ],
  },
  convnext: {
    source: {
      label: "Liu et al., ConvNeXt (CVPR, 2022)",
      url: "https://arxiv.org/abs/2201.03545",
    },
    usage: [
      "想保留卷积归纳偏置，同时使用强的现代视觉 backbone。",
      "图像分类、检测或分割需要与 ViT/Swin 公平比较。",
    ],
  },
  "swin-transformer": {
    source: {
      label: "Liu et al., Swin Transformer (ICCV, 2021)",
      url: "https://arxiv.org/abs/2103.14030",
    },
    usage: [
      "检测、实例/语义分割等需要多尺度 feature maps 的视觉任务。",
      "高分辨率图像让标准全局 ViT attention 成本过高。",
    ],
  },
  "mobilenet-v2": {
    source: {
      label: "Sandler et al., MobileNetV2 (2018)",
      url: "https://arxiv.org/abs/1801.04381",
    },
    usage: [
      "手机、边缘设备或在线服务有明确延迟与内存预算。",
      "需要轻量分类 backbone 或分割、检测的特征提取器。",
    ],
  },
  "mask-rcnn": {
    source: {
      label: "He et al., Mask R-CNN (2017)",
      url: "https://arxiv.org/abs/1703.06870",
    },
    usage: [
      "需要计数或分别跟踪多个同类物体。",
      "目标级 mask 比整张图语义分割更有用。",
    ],
  },
  detr: {
    source: {
      label: "Carion et al., DETR (2020)",
      url: "https://arxiv.org/abs/2005.12872",
    },
    usage: [
      "研究 end-to-end 目标检测与集合预测。",
      "有预训练实现，并希望减少 anchor/NMS 等人工设计。",
    ],
  },
  "faster-rcnn-yolo": {
    source: {
      label:
        "Ren et al.: Faster R-CNN—Towards Real-Time Object Detection (2015)",
      url: "https://arxiv.org/abs/1506.01497",
    },
    usage: [
      "Faster R-CNN 适合准确率优先和中小数据迁移基线。",
      "YOLO 类适合 batch=1 延迟、边缘设备或高吞吐。",
    ],
  },
  "segment-anything": {
    source: {
      label: "Kirillov et al.: Segment Anything (2023)",
      url: "https://arxiv.org/abs/2304.02643",
    },
    usage: [
      "交互标注、预标注或开放词汇对象抠图。",
      "同一图像需要多次快速提示。",
    ],
  },
  "camera-image-formation": {
    source: {
      label: "OpenCV: Camera Calibration and 3D Reconstruction",
      url: "https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html",
    },
    usage: [
      "做 stereo、3D reconstruction、AR、robotics 或多视角视觉前，先建立 camera contract。",
      "训练视觉模型时排查 resize/crop 导致的标注错位，或把 image outputs 投回真实空间。",
    ],
  },
  "local-features-matching": {
    source: {
      label: "OpenCV: Feature Matching with SIFT/ORB descriptors",
      url: "https://docs.opencv.org/4.x/dc/dc3/tutorial_py_matcher.html",
    },
    usage: [
      "图像有可重复纹理、数据量小、需要可解释 matching 或快速几何 baseline。",
      "用于拼接、物体定位、相机位姿估计与 registration 的候选对应生成。",
    ],
  },
  "registration-ransac": {
    source: {
      label: "OpenCV: Feature Matching + Homography and RANSAC",
      url: "https://docs.opencv.org/4.x/d1/de0/tutorial_py_feature_homography.html",
    },
    usage: [
      "候选匹配含 outliers，需要拟合明确几何关系，如平面定位、拼接与 registration。",
      "优点是无需知道哪些 correspondence 错，可得到可审计的 inlier mask。",
    ],
  },
  "segmentation-task-metrics": {
    source: {
      label: "Kirillov et al.: Panoptic Segmentation",
      url: "https://arxiv.org/abs/1801.00868",
    },
    usage: [
      "选择U-Net、Mask R-CNN、SAM或panoptic pipeline前，先确定真正需要的输出。",
      "做cell/vehicle计数、touching-object分离或scene parsing时，避免只看foreground Dice。",
    ],
  },
  "optical-flow-motion": {
    source: {
      label:
        "Teed & Deng: RAFT—Recurrent All-Pairs Field Transforms for Optical Flow",
      url: "https://arxiv.org/abs/2003.12039",
    },
    usage: [
      "需要dense correspondence、video stabilization、运动分割或tracking的辅助运动线索。",
      "光流可作为动作识别或视频处理的输入，但也需比较RGB-only baseline。",
    ],
  },
  "multi-object-tracking": {
    source: {
      label: "Bewley et al.: Simple Online and Realtime Tracking (SORT)",
      url: "https://arxiv.org/abs/1602.00763",
    },
    usage: [
      "需要人数/车辆/细胞的轨迹、停留时间或运动统计，而非只需单帧位置。",
      "已有较可靠detector，希望建立可解释在线tracking baseline。",
    ],
  },
  "stereo-depth-geometry": {
    source: {
      label: "OpenCV: Depth Map from Stereo Images",
      url: "https://docs.opencv.org/4.x/dd/d53/tutorial_py_depthmap.html",
    },
    usage: [
      "有已知baseline与同步相机，需要metric depth、机器人测距或3D reconstruction。",
      "比较geometry-based stereo与monocular预测，理解不同传感与尺度假设。",
    ],
  },
  "point-cloud-learning": {
    source: {
      label:
        "Qi et al.: PointNet—Deep Learning on Point Sets for 3D Classification and Segmentation",
      url: "https://arxiv.org/abs/1612.00593",
    },
    usage: [
      "点云classification、part segmentation、场景理解、3D object detection的representation基础。",
      "需要理解PointNet为什么不依赖文件point顺序，以及何时需要local geometry。",
    ],
  },
  "nerf-gaussian-splatting": {
    source: {
      label:
        "Mildenhall et al.: NeRF—Representing Scenes as Neural Radiance Fields",
      url: "https://arxiv.org/abs/2003.08934",
    },
    usage: [
      "已有多视角capture，需要novel-view rendering、scene capture或可交互可视化。",
      "想比较implicit coordinate networks与explicit primitives的速度/存储/优化tradeoff。",
    ],
  },
  "video-understanding": {
    source: {
      label:
        "Bertasius et al.: Is Space-Time Attention All You Need for Video Understanding?",
      url: "https://arxiv.org/abs/2102.05095",
    },
    usage: [
      "动作/行为识别、事件定位或需要顺序的视觉理解任务。",
      "已尝试single-frame或pooled-frame baseline，希望判断时间信息是否提供收益。",
    ],
  },
  "document-ai-ocr": {
    source: {
      label:
        "Huang et al.: LayoutLMv3—Pre-training for Document AI with Unified Text and Image Masking",
      url: "https://arxiv.org/abs/2204.08387",
    },
    usage: [
      "发票、表格、论文、表单与档案的结构化提取，需要文字与layout共同支持。",
      "已有OCR但字段错配，或想比较OCR-based与image-to-sequence pipeline的错误来源。",
    ],
  },
  "feature-pyramids-small-objects": {
    source: {
      label: "Lin et al.: Feature Pyramid Networks for Object Detection",
      url: "https://arxiv.org/abs/1612.03144",
    },
    usage: [
      "目标尺度差异大、small-object recall差，且目标在输入仍有可用像素时，适合比较多尺度features。",
      "需要检测或分割的局部位置与全局上下文时，FPN可作为shared neck；优势是复用backbone，代价是高分辨率activation。",
    ],
  },
  "box-regression-losses": {
    source: {
      label: "Rezatofighi et al.: Generalized IoU",
      url: "https://arxiv.org/abs/1902.09630",
    },
    usage: [
      "已知预测框与GT的配对，需要学习位置/尺寸时使用box regression loss；特别是早期大量boxes不overlap的训练。",
      "关注overlap quality且希望具备尺度相对性的几何loss时，可比较GIoU/DIoU与L1组合。",
    ],
  },
  "dense-visual-correspondence": {
    source: {
      label: "Oquab et al.: DINOv2",
      url: "https://arxiv.org/abs/2304.07193",
    },
    usage: [
      "缺少dense correspondence标注，想先以pretrained features建立候选matching或label transfer baseline时使用。",
      "需要相似区域检索、semantic part对应或registration初始化时，可把dense features与geometry/领域先验结合。",
    ],
  },
  "keypoint-heatmaps-pose": {
    source: {
      label: "Sun et al.: Integral Human Pose Regression",
      url: "https://arxiv.org/abs/1711.08229",
    },
    usage: [
      "需要有固定语义landmarks的human/animal pose、face landmarks或结构对齐时使用，监督应对应点位置及可见性。",
      "希望从heatmap得到continuous可微坐标时比较soft-argmax；优势是简单且可端到端训练，代价是对多峰分布的均值偏置。",
    ],
  },
  "encoder-models": {
    source: {
      label: "BERT: Pre-training of Deep Bidirectional Transformers",
      url: "https://arxiv.org/abs/1810.04805",
    },
    usage: [
      "文本分类、实体识别、搜索排序、特征提取。",
      "输入可以完整获得，且重点是理解或匹配而非逐词生成。",
    ],
  },
  "decoder-models": {
    source: {
      label: "Language Models are Few-Shot Learners",
      url: "https://arxiv.org/abs/2005.14165",
    },
    usage: [
      "开放式文本生成、代码生成、对话和统一的序列续写任务。",
      "可利用大量无标签序列做自监督预训练时。",
    ],
  },
  "encoder-decoder": {
    source: {
      label: "Attention Is All You Need",
      url: "https://arxiv.org/abs/1706.03762",
    },
    usage: [
      "翻译、摘要、语音转写、结构化输入到文本输出。",
      "输入和输出是不同序列，且需要明确对齐或条件生成时。",
    ],
  },
  "bidirectional-rnn": {
    source: {
      label: "Schuster & Paliwal, Bidirectional RNNs (1997)",
      url: "https://doi.org/10.1109/78.650093",
    },
    usage: [
      "离线文本标注、语音片段分类或完整时间序列分析。",
      "序列长度适中，想比单向 RNN 多利用右侧上下文。",
    ],
  },
  seq2seq: {
    source: {
      label: "Sutskever et al., Sequence to Sequence Learning (2014)",
      url: "https://arxiv.org/abs/1409.3215",
    },
    usage: [
      "翻译、摘要、语音转写等输入输出均为序列且长度可变。",
      "需要理解 encoder-decoder 与 autoregressive generation 的基础结构。",
    ],
  },
  tcn: {
    source: {
      label: "Bai et al., Temporal Convolutional Networks (2018)",
      url: "https://arxiv.org/abs/1803.01271",
    },
    usage: [
      "时间序列预测、传感器信号、音频等有固定历史窗口的任务。",
      "希望并行训练且要求严格因果性。",
    ],
  },
  word2vec: {
    source: {
      label:
        "Mikolov et al.: Distributed Representations of Words and Phrases (SGNS, 2013)",
      url: "https://arxiv.org/abs/1310.4546",
    },
    usage: [
      "学习 embedding 基础、构建轻量词汇特征 baseline。",
      "数据/算力有限且任务对上下文歧义不敏感。",
    ],
  },
  roberta: {
    source: {
      label: "Liu et al., RoBERTa (2019)",
      url: "https://arxiv.org/abs/1907.11692",
    },
    usage: [
      "BERT 类理解任务需要一个强的通用 encoder baseline。",
      "研究预训练 recipe 对下游任务的影响。",
    ],
  },
  t5: {
    source: {
      label: "Raffel et al., T5 (JMLR, 2020)",
      url: "https://www.jmlr.org/papers/v21/20-074.html",
    },
    usage: [
      "翻译、摘要、问答或多个任务共用统一输入输出形式。",
      "既要看完整输入又要生成可变长度结果。",
    ],
  },
  bart: {
    source: {
      label: "Lewis et al., BART (ACL, 2020)",
      url: "https://arxiv.org/abs/1910.13461",
    },
    usage: [
      "摘要、改写、生成式问答等需要读完整输入再生成输出。",
      "想比较 T5 与 BART 的 seq2seq 预训练目标。",
    ],
  },
  "in-context-learning": {
    source: {
      label: "Brown et al.: Language Models are Few-Shot Learners",
      url: "https://arxiv.org/abs/2005.14165",
    },
    usage: [
      "需快速改变模型回答格式、任务规则，且不便更新模型权重时。",
      "只掌握少量示例，想先测预训练模型是否已具备相关能力时。",
    ],
  },
  "chain-of-thought-prompting": {
    source: {
      label:
        "Wei et al.: Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
      url: "https://arxiv.org/abs/2201.11903",
    },
    usage: [
      "算术、符号操作、条件链等确实需要多步处理的任务。",
      "直接回答基线反复漏掉步骤，且额外 token 成本可接受时。",
    ],
  },
  tokenization: {
    source: {
      label: "Hugging Face: Tokenization algorithms",
      url: "https://huggingface.co/docs/transformers/main/en/tokenizer_summary",
    },
    usage: [
      "准备语言模型训练数据，或排查奇怪空格、未知字符、输入被截断和聊天模板不一致。",
      "比较中文、英文、代码等数据的 token 长度、上下文成本和词表覆盖。",
    ],
  },
  "positional-encoding": {
    source: {
      label: "Su et al., RoFormer / Rotary Position Embedding",
      url: "https://arxiv.org/abs/2104.09864",
    },
    usage: [
      "Transformer 的词序、时间序列或图像 patch 位置对预测有意义。",
      "理解长上下文退化、KV cache 位置错位，以及不同 checkpoint 的 RoPE 配置。",
    ],
  },
  "autoregressive-inference": {
    source: {
      label: "Hugging Face: Generation strategies",
      url: "https://huggingface.co/docs/transformers/main/en/generation_strategies",
    },
    usage: [
      "部署 decoder 语言模型、调聊天输出风格、结构化生成或分析为什么相同提示产生不同答案。",
      "比较延迟、生成长度和质量，区分模型能力与采样策略造成的差异。",
    ],
  },
  "kv-cache": {
    source: {
      label: "Hugging Face: How caching works",
      url: "https://huggingface.co/docs/transformers/main/en/cache_explanation",
    },
    usage: [
      "自回归生成多个 token，重复处理历史前缀成为主要开销。",
      "设计长上下文服务、并发容量、前缀复用，或排查首 token 快而后续解码显存暴涨。",
    ],
  },
  "grouped-query-attention": {
    source: {
      label: "Ainslie et al., GQA (EMNLP 2023)",
      url: "https://arxiv.org/abs/2305.13245",
    },
    usage: [
      "设计或选择面向长上下文、大并发自回归服务的语言模型。",
      "理解 num_attention_heads 与 num_key_value_heads 的区别，或分析缓存为何比普通 MHA 小。",
    ],
  },
  "retrieval-augmented-generation": {
    source: {
      label: "Lewis et al., Retrieval-Augmented Generation (2020)",
      url: "https://arxiv.org/abs/2005.11401",
    },
    usage: [
      "回答来自经常更新、领域专有或需要出处的资料，例如产品手册、研究资料库和内部知识库。",
      "需要把知识更新与模型权重更新分开，并能追踪回答依据的文档版本。",
    ],
  },
  "time-series-forecasting": {
    source: {
      label: "Hyndman & Athanasopoulos: Forecasting, rolling-origin evaluation",
      url: "https://otexts.com/fpp3/tscv.html",
    },
    usage: [
      "目标随时间变化且存在滞后、趋势或季节结构，需要预测库存需求、设备负荷或其他连续观测时。",
      "多条相关序列可共享统计规律，想比较单序列统计模型与全局神经网络或树模型时。",
    ],
  },
  "state-space-models": {
    source: {
      label:
        "Gu et al.: Efficiently Modeling Long Sequences with Structured State Spaces (2022)",
      url: "https://arxiv.org/abs/2111.00396",
    },
    usage: [
      "长序列且二次 attention 成本不可接受时。",
      "需要固定大小流式状态和稳定逐步延迟时。",
    ],
  },
  mamba: {
    source: {
      label:
        "Gu & Dao: Mamba—Linear-Time Sequence Modeling with Selective State Spaces (2023)",
      url: "https://arxiv.org/abs/2312.00752",
    },
    usage: [
      "上下文很长且需要近线性内存增长时。",
      "流式生成希望每层缓存大小不随上下文增长时。",
    ],
  },
  rwkv: {
    source: {
      label:
        "Peng et al.: RWKV—Reinventing RNNs for the Transformer Era (2023)",
      url: "https://arxiv.org/abs/2305.13048",
    },
    usage: [
      "自回归服务希望 KV cache 不随上下文增长时。",
      "需要 RNN 式流式处理但想保留大规模语言建模训练方式时。",
    ],
  },
  "ctc-wav2vec": {
    source: {
      label: "Graves et al.: Connectionist Temporal Classification (2006)",
      url: "https://www.cs.toronto.edu/~graves/icml_2006.pdf",
    },
    usage: [
      "转录标注少但无标注语音多。",
      "输入输出单调对齐，且不需要显式帧级 alignment。",
    ],
  },
  whisper: {
    source: {
      label: "OpenAI Whisper: official audio frontend source",
      url: "https://github.com/openai/whisper/blob/main/whisper/audio.py",
    },
    usage: [
      "多语种转录/翻译与强 zero-shot 基线。",
      "需要统一文本生成接口和时间戳。",
    ],
  },
  "particle-filters": {
    source: {
      label: "Naesseth et al.: Elements of Sequential Monte Carlo",
      url: "https://arxiv.org/abs/1903.04797",
    },
    usage: [
      "Nonlinear或non-Gaussian dynamic state-space model需要online filtering。",
      "状态分布可能多峰，单一均值/协方差近似不够。",
    ],
  },
  "speculative-decoding": {
    source: {
      label:
        "Leviathan, Kalman & Matias: Fast Inference from Transformers via Speculative Decoding (ICML 2023)",
      url: "https://proceedings.mlr.press/v202/leviathan23a.html",
    },
    usage: [
      "目标模型逐 token decode 是性能瓶颈，且有足够便宜、与目标较一致的 draft mechanism。",
      "希望在保持指定 sampling distribution 的前提下优化推理，而不是以质量变化换速度。",
    ],
  },
};
