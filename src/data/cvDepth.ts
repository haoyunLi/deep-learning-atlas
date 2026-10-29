import type { Lesson } from "./lessons";

export const cvDepthLessons: Lesson[] = [
  {
    id: "cv-preprocessing-augmentation",
    source: {
      label: "Torchvision: transforms for images, boxes and masks",
      url: "https://docs.pytorch.org/vision/stable/transforms.html",
    },
    title: "先把图像、标签和坐标一起变对",
    englishTitle:
      "CV Preprocessing, Joint Augmentation and Coordinate Contracts",
    category: "vision",
    level: "进阶",
    duration: "28 min",
    icon: "◫",
    summary:
      "从 resize、letterbox、flip 到 normalization，逐项检查 image、mask、box、keypoint 的变换，避免模型认真学习错位标签。",
    intuition:
      "把照片缩小后，照片上的尺子也必须跟着缩。只改 image 而不改 box，就像用旧地图坐标寻找新地图上的地点；loss 可能下降，但监督本身已经错了。",
    core: "输入 image [C,H,W]、对应 labels 与原始坐标，输出处理后的 tensor、同步 labels 及可追踪的 transform metadata。Geometric transforms 改坐标，photometric transforms 改像素；它们是否保留标签取决于任务。Pretrained normalization 是输入契约，不是任意美化。以下参数是可审计起点，不是通用最优配方。",
    equation:
      "x′=s·x+pad_x; y′=s·y+pad_y; horizontal flip of continuous xyxy: [x1,x2]→[W−x2,W−x1]; z=(x/255−μ)/σ",
    mechanicsSteps: [
      "先按 subject、scene 或 video 切分，再生成 patches 与随机增强。记录 RGB/BGR、uint8/float、channel order、mask class IDs；同一来源的近邻 crop 不作为独立测试。",
      "Synthetic 原图 W=640、H=480，box=[100,50,300,250]，目标 canvas=320×320。保持 aspect ratio，s=min(320/640,320/480)=0.5。",
      "Resize 后 image 为320×240，box=[50,25,150,125]；上下各 pad40，最后 box=[50,65,150,165]。直接强制320×320会使用 sx=.5、sy=2/3，是另一种几何变换。",
      "在 continuous boundary coordinates 中水平 flip，W=320，因此新 box=[320−150,65,320−50,165]=[170,65,270,165]。离散 pixel-center keypoint 若以0…W−1编号，则用 W−1−x；不要混用两个 convention。",
      "逆变换按相反次序：先 undo flip，再减 pad，再除 s，恢复[100,50,300,250]。保存 crop offset、scale、padding；被 crop 掉的内容无法靠 inverse transform 恢复。",
      "Image resize 可用 bilinear/bicubic 与合适 antialias；hard class mask 用 nearest-neighbor，不能把class0与class2混成class1。Soft probability maps 与连续 regression targets 要另定 interpolation，不照搬 hard mask 规则。",
      "Toy 单通道 raw value=153，转[0,1]得.6；若 μ=.5、σ=.25，则 z=.4。μ/σ是教学值；真实 RGB checkpoint 应复用它要求的 mean/std，不能把[0,255]直接代入[0,1]统计量。",
      "对照 no-augmentation baseline，尝试 p=.5 horizontal flip、有限 scale jitter；只有标签确实保持时才加。翻转文字、左右手 label、病理方向或改变具有诊断意义的颜色，都可能制造错误监督。",
      "先画至少16组 image+label overlays，再跑 tiny-set overfit；验证与部署固定同一 deterministic preprocessing。报告原坐标下 metrics，并检查 padding 区是否被模型当作 shortcut。",
    ],
    whenToUse: [
      "适合任何 detection、segmentation、pose 或 dense correspondence pipeline，尤其是复用 pretrained checkpoint 时。",
      "数据有限时，经过任务验证的 augmentation 能扩大有效变化；优势是成本相对低，代价是更多输入契约与调试工作。",
      "当小目标、坐标边缘、不同 aspect ratio 或跨设备数据出错时，先审计 preprocessing，再考虑加大模型。",
    ],
    limits: [
      "如果信息已在 resize/crop 中丢失，inverse transform 和更复杂 decoder 都不能恢复真实观测。",
      "任务可能不具备 flip、rotation、color invariance；不能因增强名称常见就默认保留 label。",
      "训练预处理正确不保证部署正确，解码库、EXIF orientation、interpolation 与归一化范围均可造成 shift。",
    ],
    howToUse: [
      "建立 input contract 表：尺寸、dtype、RGB顺序、坐标 convention、mask IDs、spacing 与 ignore index。",
      "实现 image 与 targets 共用一次随机参数的 joint transform，返回 forward/inverse metadata；用角点与边界框 fixture 检查 round-trip。",
      "先固定 resize+normalization，建立 baseline，再逐个加入 geometric/photometric augmentation 做同 split ablation。",
      "从 transformed overlays、tiny-set overfit、原图坐标 error 到外部数据分层检查，记录每个配置与随机种子。",
    ],
    tuning: [
      "Small-object recall 降低先看 resize 后目标剩余 pixels；提高 resolution 或使用保留上下文的 tiling，再考虑 loss。",
      "只有 train error 改善而 validation 变差时，分别检查 augmentation 是否太弱、过强或改变 label，不能只加更多随机变换。",
      "出现整体坐标平移优先查 padding/crop offset；固定倍数误差查 scale；颜色异常查 RGB/BGR 与重复 normalization。",
    ],
    settings: [
      {
        name: "Resize / canvas",
        start:
          "教学从320×320 letterbox开始；真实实验从 checkpoint 输入规则及目标尺寸出发，保留 scale/pad。",
        adjust:
          "小目标不足数个 pixels 时提高至640级别或tile；延迟超限时比较resolution–recall曲线。",
      },
      {
        name: "Geometric augmentation",
        start:
          "先只比较 p=0 与 p=.5 horizontal flip；确认任务允许后，再试 scale [.9,1.1]。",
        adjust:
          "overlay错位立即修实现；left/right label或文字语义改变则禁用相应变换。",
      },
      {
        name: "Interpolation / padding",
        start:
          "image bilinear+antialias、hard mask nearest；mask padding使用已定义ignore/background规则。",
        adjust:
          "细结构消失先查采样；mask出现非法class值先查interpolation，而非改network。",
      },
      {
        name: "Normalization / intensity",
        start:
          "uint8明确除255一次；pretrained输入使用其mean/std；从零训练的统计只由training data估计。",
        adjust:
          "train/inference激活或颜色分布错位时先核dtype/range；不要用test统计重新定规则。",
      },
    ],
    modifications: [
      "Tiling 保留局部细节，但需 overlap、边缘融合、全图去重与原图 offset；tile来自同slide/scene时仍必须同split。",
      "MixUp/CutMix 要同步定义 soft class targets 或 instance masks；classification recipe不能原样移到所有 detection任务。",
      "Test-time augmentation 需逐分支逆变换后融合，会增加推理成本；用同一评估集检验而非默认提升。",
    ],
    pitfalls: [
      "只改变 image，没有同步 mask/box/keypoint，或对各对象独立抽随机 crop。",
      "Mask resize 用 bilinear再取整，生成不存在的类别；ignore index被当真实类学习。",
      "把水平flip的 W−x boundary公式用于0…W−1 pixel-center，产生off-by-one。",
    ],
    example:
      "Synthetic letterbox+flip round-trip：[100,50,300,250] → [50,65,150,165] → [170,65,270,165]，逆序处理恢复原box。这个算术检验不代表任何模型准确率。",
    compareTo: [
      "camera-image-formation",
      "faster-rcnn-yolo",
      "unet",
      "dense-visual-correspondence",
    ],
  },
  {
    id: "feature-pyramids-small-objects",
    source: {
      label: "Lin et al.: Feature Pyramid Networks for Object Detection",
      url: "https://arxiv.org/abs/1612.03144",
    },
    title: "小目标为什么需要高分辨率特征",
    englishTitle:
      "Feature Pyramids, Stride, Receptive Fields and Small Objects",
    category: "vision",
    level: "进阶",
    duration: "29 min",
    icon: "▱",
    summary:
      "把 input pixels、feature stride、receptive field 与 FPN 逐级对应，知道应该改 resolution、neck、sampling 还是 detection head。",
    intuition:
      "远看一张地图能理解整座城市，却看不清一扇门。FPN 把深层上下文传回较细的网格；这能结合位置和语义，但无法凭空恢复早已被缩掉的门。",
    core: "Backbone 的 C2…C5 是不同 stride 的 features。FPN 用 lateral 1×1 projection 对齐 channels，再将较深特征 upsample，与同尺度 lateral features 相加，通常再用3×3卷积形成 P levels。它复用一次 backbone 的多尺度表示，区别于把多种尺寸 image 分别完整送进网络。",
    equation:
      "M_l=Conv1×1(C_l)+Upsample(M_(l+1)); P_l=Conv3×3(M_l); jump_l=jump_(l−1)·s_l; r_l=r_(l−1)+(k_l−1)d_l·jump_(l−1)",
    mechanicsSteps: [
      "先把 input size 与 smallest object size 写出来。Synthetic 256×256 image 中的8×8目标，在stride4网格覆盖约2×2 cells，在stride16仅约.5×.5 cell；覆盖数是尺度直觉，不是检测成功保证。",
      "假设 C2/C3/C4/C5 的 strides=4/8/16/32，对应 spatial shapes=64²/32²/16²/8²。各层 channels 可以不同，不能直接相加。",
      "将每层 lateral projection 到256 channels。M5=Conv1×1(C5) 为[256,8,8]；nearest upsample到[256,16,16]才能与C4的lateral输出相加。",
      "标量位置示意：lateral value=.3、top-down value=.7，融合值1.0。真实计算对整个[256,16,16]逐元素相加，之后3×3卷积可减少upsampling artifacts；不是把channel拼到512。",
      "继续向高分辨率传播，P2为[256,64,64]，共有1048576个values，FP32仅该输出约4MiB；P3为262144个values，约1MiB。这里不含batch、gradient、临时buffer与其它layers。",
      "三层3×3、stride2、dilation1，从 jump0=1、r0=1开始：第一层 jump2/r3；第二层 jump4/r7；第三层 jump8/r15。r15是theoretical receptive field，Effective Receptive Field取决于权重、非线性与输入。",
      "输入边长翻倍，固定stride/channels的feature spatial area约4倍；P2多出来的细网格可能帮助小物体，也增加activation、head与候选计算。只增decoder宽度不一定解决目标已被resize丢失的问题。",
      "为不同levels分配training targets，核anchor尺度或anchor-free assignment，以及每level positive counts；高分辨率层没有positive监督时，单纯添加P2可能不产生收益。",
      "固定split与evaluation，分别比较输入resolution、是否P2、相同backbone下neck选择；报告small/medium/large recall、latency、peak memory，避免把整套recipe改动都归因FPN。",
    ],
    whenToUse: [
      "目标尺度差异大、small-object recall差，且目标在输入仍有可用像素时，适合比较多尺度features。",
      "需要检测或分割的局部位置与全局上下文时，FPN可作为shared neck；优势是复用backbone，代价是高分辨率activation。",
      "同一场景含大结构与tiny instances时，可将FPN和tiling作为不同baseline；纯整图classification不一定需要每level head。",
    ],
    limits: [
      "FPN不能保证scale invariance，也不能恢复预处理删除的真实高频信息。",
      "Theoretical receptive field覆盖某位置不代表该位置对输出有同等影响。",
      "更高分辨率levels增加memory和候选数；如果漏检来自漏标或错误assignment，增加levels未必有效。",
    ],
    howToUse: [
      "统计原图和处理图的box/mask尺寸分布，用各level stride换算目标覆盖的feature cells。",
      "打印backbone输出shape，确认每个lateral projection、upsample size与head输入顺序一致。",
      "建立原neck baseline；一次只增加P2或改变resolution，记录每level正样本数与梯度。",
      "把small-object errors分成不可见、无positive、定位差、分类差与postprocessing删掉，再选择改动。",
    ],
    tuning: [
      "Small objects在input仍清楚但feature过粗时试P2或较低output stride；在input已经模糊时先改resolution/sampling。",
      "P2加入后false positives激增，检查scale assignment与hard negatives，再调score threshold，不能只看总体mAP。",
      "Memory受限时先比较channel256→128、checkpointing与tiling的代价，实测不能由参数量替代。",
    ],
    settings: [
      {
        name: "Pyramid levels / strides",
        start: "从现有detector的P3–P5或P2–P5配置起步，记录8/16/32或4/8/16/32。",
        adjust:
          "8pixel级目标召回不足且输入可见时对照加入stride4；没有稳定收益则回退。",
      },
      {
        name: "FPN channels",
        start:
          "256作为常见可比较起点，预算紧时做128对照；它是实验选择，不是必须值。",
        adjust: "activation超预算先测128；所有尺度欠拟合且数据充分时再增加。",
      },
      {
        name: "Input resolution / crop",
        start:
          "教学256；实际沿用checkpoint并保存每个目标处理后尺寸；比较1×与1.5×输入。",
        adjust:
          "目标被缩掉先升resolution或tile；上下文不足则扩大视野而非只放大局部。",
      },
      {
        name: "Target assignment / positives",
        start:
          "沿用head对应的scale或anchor规则，按level统计positive与unmatched比例。",
        adjust:
          "新level几乎无positive或同一目标被错误重复监督时，先修assignment再解释architecture结果。",
      },
    ],
    modifications: [
      "PAN/BiFPN增加bottom-up或加权融合路径；应在相同backbone、resolution和训练预算下比较。",
      "Dilated convolution可保留较小stride并扩大theoretical receptive field，但可能增加memory和稀疏采样问题。",
      "Tiling+global context分支兼顾局部细节与大结构，需要处理边缘截断、重复预测及全图坐标。",
    ],
    pitfalls: [
      "把upsampling后的64×64 feature当成64×64个新的独立高分辨率观测。",
      "把更大theoretical receptive field等同更好的Effective Receptive Field或可靠long-range reasoning。",
      "比较FPN与其它neck时同时改变backbone、image size和训练epochs，无法归因收益。",
    ],
    example:
      "Synthetic：8pixel目标在stride4/16下分别覆盖2/.5个cell宽；[256,64,64]输出占4MiB FP32。两者帮助理解空间信息与memory的取舍，不是模型性能预测。",
    compareTo: [
      "cnn",
      "swin-transformer",
      "deeplabv3-plus",
      "faster-rcnn-yolo",
    ],
  },
  {
    id: "box-regression-losses",
    source: {
      label: "Rezatofighi et al.: Generalized IoU",
      url: "https://arxiv.org/abs/1902.09630",
    },
    supplementarySources: [
      { label: "Zheng et al.: DIoU", url: "https://arxiv.org/abs/1911.08287" },
      {
        label: "Torchvision: GIoU loss",
        url: "https://docs.pytorch.org/vision/stable/generated/torchvision.ops.generalized_box_iou_loss.html",
      },
      {
        label: "DETR: matching and loss settings",
        url: "https://github.com/facebookresearch/detr/blob/main/main.py",
      },
    ],
    title: "两个框不相交时，loss怎样告诉它往哪走",
    englishTitle: "IoU, GIoU, DIoU and Bounding-Box Regression",
    category: "vision",
    level: "进阶",
    duration: "30 min",
    icon: "▣",
    summary:
      "从真实矩形面积手算 IoU/GIoU/DIoU，分清 training loss、matching cost 与 evaluation threshold，并检查梯度和坐标单位。",
    intuition:
      "两个框还没碰到时，IoU只告诉你重叠为零，分不清相距1步还是100步。GIoU看包住它们的空隙，DIoU直接加入中心距离，让训练获得额外几何信号。",
    core: "输入一对已匹配的predicted/target boxes，输出可优化的scalar loss。IoU衡量overlap，GIoU扣除smallest enclosing rectangle里的空白比例，DIoU加入normalized center distance。Classification、matching与box regression各有职责；换loss不会自动解决错误对象配对。 计算与实现的补充来源见本课末尾。",
    equation:
      "IoU=I/U; GIoU=IoU−(C−U)/C; L_GIoU=1−GIoU; L_DIoU=1−IoU+ρ²/c² (C=enclosing area; c²=enclosing diagonal²)",
    mechanicsSteps: [
      "采用continuous xyxy与合法正面积boxes，不加inclusive-pixel的+1。Synthetic target A=[0,0,2,2]、prediction B=[3,0,5,2]，两者area均4。",
      "Intersection=0、union=8，因此IoU=0、L_IoU=1。B在不相交区域小幅平移时IoU仍为0，单用overlap信号有flat region。",
      "Smallest enclosing rectangle从[0,0]到[5,2]，area C=10。空白比例(10−8)/10=.2，GIoU=−.2，L_GIoU=1.2。GIoU可以为负，不是probability。",
      "两个center分别(1,1)、(4,1)，ρ²=9；enclosing diagonal²=5²+2²=29，所以L_DIoU=1+9/29≈1.310345。DIoU和GIoU数值大小不是跨loss优劣指标。",
      "把B左移1到[2,0,4,2]，仍只有边缘接触，IoU=0；此时C=8、GIoU=0、L_GIoU=1，DIoU=1+4/20=1.2。额外几何项区分了两种零overlap状态。",
      "再左移1到[1,0,3,2]，intersection=2、union=6，IoU=1/3；enclosing area=6，GIoU=1/3，L_GIoU=2/3；center distance²=1、diagonal²=13，L_DIoU=2/3+1/13=29/39。",
      "对固定width=2的横向平移t>2，C=2(t+2)，L_GIoU=2−4/(t+2)，导数4/(t+2)²>0；gradient descent减小t。t=3时导数=.16。该toy不涵盖所有width/height梯度，也不保证每种geometry都快速收敛。",
      "如果加L1，先明确是pixels还是normalized cxcywh及reduction；输入边长翻倍会改变pixel L1，而IoU保持相同几何比例。记录各loss与gradient norm，再调相对权重。",
      "训练后仍按固定evaluation IoU协议测AP/recall与定位误差。NMS IoU threshold删重复预测，evaluation threshold决定match，二者都不是这里的training loss。",
    ],
    whenToUse: [
      "已知预测框与GT的配对，需要学习位置/尺寸时使用box regression loss；特别是早期大量boxes不overlap的训练。",
      "关注overlap quality且希望具备尺度相对性的几何loss时，可比较GIoU/DIoU与L1组合。",
      "优势是几何意义清晰；代价是边界处非光滑、各项尺度和匹配规则需共同调试。仅做fixed boxes后处理时不需要训练这些loss。",
    ],
    limits: [
      "GIoU/DIoU不是正确对象身份的证据；错误matching仍会把预测拉向错误GT。",
      "Axis-aligned box loss不能完整描述rotated objects、masks、thin boundaries或3D geometry。",
      "标签有偏、目标极小或严重截断时，几何loss可能强迫模型拟合不可靠边界；应分层评价。",
    ],
    howToUse: [
      "先用三对toy boxes核area、union、enclosing rectangle、center distance及合法坐标。",
      "确认loss只作用于matched positive boxes，empty target batch有明确定义，不让no-object学习任意box。",
      "从模型原recipe起步保存classification/L1/geometric各项及gradient，按1个变量改变权重。",
      "做no-overlap、touching、identical、containment及tiny-box检查，再固定evaluation protocol比较。",
    ],
    tuning: [
      "无overlap且loss不动先查是否只用IoU、box被detach或错误clamp；用finite difference核目标相关坐标梯度。",
      "Localization改善而classification变差时检查loss量级与gradient竞争，别用总loss单值判断。",
      "小框数值不稳先用FP32 geometry、valid-area检查与实现eps；任意增eps可能扭曲真实小框。",
    ],
    settings: [
      {
        name: "Box format / units",
        start:
          "明确continuous xyxy；若head输出normalized cxcywh，集中转换一次并核回转换。",
        adjust: "负面积、IoU>1或不同resolution loss异常时先查format与units。",
      },
      {
        name: "Loss family / coefficients",
        start:
          "优先原recipe；复现original DETR时可核官方L1=5、GIoU=2的设置，再做单项ablation。",
        adjust:
          "记录每项及gradient；某项主导训练却目标metric不升时将其权重减半对照。",
      },
      {
        name: "Reduction / empty targets",
        start:
          "按实现记录positive数归一化；zero-positive batch返回定义良好的0 box loss。",
        adjust:
          "batch组成改变导致loss剧跳时查sum/mean与distributed normalization，别先调learning rate。",
      },
      {
        name: "Numerical precision / eps",
        start:
          "geometry以FP32核对；Torchvision GIoU loss文档eps起点1e−7，保留正面积检查。",
        adjust:
          "tiny boxes接近eps量级时先检查坐标scale与precision；不要用eps掩盖非法boxes。",
      },
    ],
    modifications: [
      "CIoU进一步加入aspect-ratio项；它改变优化目标，不能仅凭名称完整就假定总优于DIoU。",
      "Rotated IoU或mask-based losses适合另一种output geometry，需要对应labels和evaluation。",
      "将几何loss用于matching cost时独立记录权重；选pair的cost与选定pair后的training loss可以不同。",
    ],
    pitfalls: [
      "把GIoU负值当成bug，或把所有loss硬截到[0,1]导致梯度消失。",
      "直接对所有query回归任意GT，包括未匹配no-object queries。",
      "把NMS threshold调节当作box regression训练，或为了指标好看更改evaluation IoU。",
    ],
    example:
      "Synthetic disjoint boxes使IoU loss一直为1，而GIoU loss在t=3→2时1.2→1.0。这个差异说明有额外几何信号，不证明某loss在所有数据上效果更好。",
    compareTo: [
      "detection-metrics-nms",
      "detr",
      "hungarian-set-matching",
      "loss-functions",
    ],
  },
  {
    id: "hungarian-set-matching",
    source: {
      label: "DETR official matching implementation",
      url: "https://github.com/facebookresearch/detr/blob/main/models/matcher.py",
    },
    supplementarySources: [
      {
        label: "SciPy: linear_sum_assignment and 3×3 example",
        url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.linear_sum_assignment.html",
      },
    ],
    title: "每个对象各选最近的，为什么会冲突",
    englishTitle: "Linear Assignment, Hungarian Steps and Set Prediction",
    category: "vision",
    level: "高级",
    duration: "32 min",
    icon: "⇄",
    summary:
      "手算 row reduction、column reduction、zero covering 与最优配对，区分配对本身、配对后的 loss、拒绝配对和不确定性。",
    intuition:
      "三个人分三把椅子，每个人都独自选最舒服的会抢同一把。Assignment 要优化整组安排；它能保证给定cost下的全局最小，却不能保证cost表达了真实身份。",
    core: "输入 pairwise cost C:[N,M]，输出受one-to-one约束的离散pairs。Square assignment要求每row/column各选一次；rectangular版本可让较多的一侧未匹配。Hungarian是一种求解方式；SciPy linear_sum_assignment使用modified Jonker–Volgenant，求解同一问题，不应把所有库实现都叫同一算法步骤。DETR训练先配GT，再对matched queries回归，对unmatched queries施加no-object分类监督。 计算与实现的补充来源见本课末尾。",
    equation:
      "min_X Σij Cij Xij; Xij∈{0,1}; square: ΣjXij=1, ΣiXij=1; matching cost is not necessarily training loss",
    mechanicsSteps: [
      "采用SciPy官方示例C=[[4,1,3],[2,0,5],[3,2,2]]作为3×3手算。每row/column必须各选一次。逐row贪心会选1、2、2得到5，但如果第一步先选全局最小的row2/col2=0，再安排剩余，可能得到6；局部最小本身不保证全局最优。",
      "Hungarian row reduction：各row减最小值[1,0,2]，得到[[3,0,2],[2,0,5],[1,0,0]]。每个完整assignment都减同一常数3，因此最优排列不变。",
      "Column reduction：各column最小值[1,0,0]，再减后得到[[2,0,2],[1,0,5],[0,0,0]]；所有完整assignment又减常数1。减法不是把原始总cost改写成reduced cost。",
      "目前不能找3个互不同行列的zeros。用col2与row3两条线可盖住所有zeros；未覆盖区域的最小值是1。少于3条线提示还不能直接完成zero matching。",
      "从未覆盖元素减1，在双重覆盖交点row3/col2加1，其余不变，得到[[1,0,1],[0,0,4],[0,1,0]]。现在可取row1→col2、row2→col1、row3→col3。",
      "回到原始C求和：1+2+2=5。六个排列的原cost为[6,11,5,9,7,6]，最小确为5；这是独立穷举核对，不依赖reduction过程。",
      "Rectangular toy：3 queries×2 GT，C=[[.1,.6],[.2,.3],[.9,.2]]，最优q1→GT1与q3→GT2，总.3，q2未配。DETR仍给q2 no-object分类loss，不给它任意GT box loss。",
      "DETR官方matcher的class cost使用−p(target)，不是训练CE的−log p；再加L1和−GIoU。Matching在no_grad下选indices，后续loss对选中predictions反传，不对离散Hungarian操作求普通梯度。",
      "有拒绝需求时显式建立dummy/unmatched penalties。单pair cost=8，而双方各unmatched cost=2，则拒绝总4更好；若仍强制完整matching，solver没有权力自行拒绝。Hard gate也要确保存在可行解，不能把无穷cost的结果静默当正常pair。",
      "输出cost分解、可行mask、matched/unmatched与替代assignment差距。Near-tie只说明此cost下不稳定，不是已经校准的identity probability；需扰动、标注或外部证据评估。",
    ],
    whenToUse: [
      "检测set prediction、tracking association、点或对象间一对一对应，且容量约束确实是one-to-one时使用。",
      "全局约束会让各row决策相互影响时，比独立nearest neighbor更合适；优势是固定cost下可精确优化。",
      "如果多对一、mass transport或明确uncertainty才是问题核心，优先比较min-cost flow、Optimal Transport或probabilistic assignment；不要硬套one-to-one。",
    ],
    limits: [
      "Cost最小不等于语义正确、identity真实或长时间trajectory最优。",
      "离散assignment可因微小cost变化突变，hard match本身不给posterior probability。",
      "大规模dense cost需要O(NM)存储，求解还增加计算；sparse gating会改变可行集合，应报告被排除的真pairs。",
    ],
    howToUse: [
      "写清row/column实体、允许容量、是否必须匹配、拒绝cost、空集合与class compatibility。",
      "把appearance、motion、classification与geometry各分量打印出来，统一尺度或明确权重，再形成cost matrix。",
      "用小矩阵穷举对照solver，包含square、rectangular、ties、empty和infeasible fixtures。",
      "在实际数据保存assignment与备选cost，对near-ties、unmatched与gate外真pairs做分层错误分析。",
    ],
    tuning: [
      "Unmatched太多先区分gate过严、dummy cost过低还是真实缺失，别只扩大所有gate。",
      "错误跨对象匹配多时查看各cost量级与尺度，新增appearance可能同时带来domain bias。",
      "匹配反复跳动时检查相近cost、时序信息与label quality；增大权重并不自动增加可信度。",
    ],
    settings: [
      {
        name: "Matching coefficients",
        start:
          "复现original DETR可核class/L1/GIoU=1/5/2；tracking另从归一化motion-only baseline起步。",
        adjust: "某分量数值压过其它项时先检查units，再按.5×/1×/2×单项对照。",
      },
      {
        name: "Unmatched / dummy cost",
        start: "先将拒绝语义写成成本；toy双方各2，使pair8优先拒绝为4。",
        adjust:
          "误连代价高时降低拒绝cost；漏配代价高时提高，但需固定验证协议。",
      },
      {
        name: "Gating / feasibility",
        start:
          "先不gate的小fixture验证，再按合法class及motion范围加入，逐row检查可行候选。",
        adjust:
          "出现空row或无完整matching时返回未匹配/不可行状态，不用巨大有限数掩盖。",
      },
      {
        name: "Query / object capacity",
        start:
          "DETR沿用checkpoint queries并统计每image实例数；N需覆盖目标上限，保留余量。",
        adjust:
          "目标数接近N造成召回上限时增N并重新训练；空query多则核no-object权重及计算预算。",
      },
    ],
    modifications: [
      "加入dummy nodes让模型可选择拒绝；其penalty必须反映漏配/错配成本，并明确每个dummy容量。",
      "Sinkhorn提供soft transport并可微分，但有marginal/entropy等不同假设，不是hard assignment概率的自动替代。",
      "Tracking可用temporal graph或min-cost flow跨多帧优化，代价是延迟、memory和更复杂的目标函数。",
    ],
    pitfalls: [
      "把greedy、Hungarian和SciPy当前solver混为一谈，或只比较每row最小值而忽略column冲突。",
      "把matching cost直接写成training CE，或以为no_grad匹配导致网络全部不能学习。",
      "把一个非常大的有限cost当作已经禁止的边，忽略infeasible或强制配对情况。",
    ],
    example:
      "官方3×3教学cost的最优排列为[2,1,3]（1-based），原cost=5。这个toy检验assignment机制，不是检测、tracking或Spatial真实配对准确率。",
    compareTo: [
      "detr",
      "multi-object-tracking",
      "optimal-transport",
      "structured-assignment-inference",
    ],
  },
  {
    id: "dense-visual-correspondence",
    source: {
      label: "Oquab et al.: DINOv2",
      url: "https://arxiv.org/abs/2304.07193",
    },
    supplementarySources: [
      {
        label: "DINOv2: token output implementation",
        url: "https://github.com/facebookresearch/dinov2/blob/main/dinov2/models/vision_transformer.py",
      },
    ],
    title: "一个patch的feature怎样找到另一个位置",
    englishTitle:
      "Dense Visual Features, Cosine Matching and Correspondence Validation",
    category: "vision",
    level: "高级",
    duration: "30 min",
    icon: "⋈",
    summary:
      "把 dense patch tokens、global embeddings、cosine similarity、mutual nearest neighbors 和 geometry verification 连起来，避免把漂亮feature图当可靠对应。",
    intuition:
      "整张图的名片能告诉你两张图都像一只猫，却找不到猫耳朵的位置。Dense features 给每块区域一张名片；相似名片能提出对应候选，但相同窗户、纹理或细胞会互相冒充。",
    core: "输入两张图及其坐标变换，抽取patch features F_A:[N_A,D]、F_B:[N_B,D]，归一化后计算pairwise similarity，得到候选patch对应。DINOv2是可用的self-supervised feature backbone示例；本课讲下游matching workflow，不复述DINO teacher/student训练。Global CLS token、patch tokens及register tokens用途不同，不能全部reshape成spatial grid。 计算与实现的补充来源见本课末尾。",
    equation:
      "f̂_i=f_i/||f_i||₂; Sij=f̂_Ai·f̂_Bj; j*(i)=argmax_j Sij; mutual if i=argmax_k S_k,j*(i); similarity is not probability",
    mechanicsSteps: [
      "先确定要匹配的是同一physical point、语义part还是相似外观。三种目标的ground truth与geometry条件不同；猫耳朵间的semantic correspondence不等于同一场景的pixel motion。",
      "选定ViT-S/14示例：224×224 image产生16×16=256个patch tokens；若D=384，则features为[256,384]。官方DINOv2输出将CLS、register与patch tokens分开，reshape前只取patch部分。",
      "保存resize/crop/letterbox和patch index到image位置的映射。Patch宽14限制原生定位粒度；把feature grid bilinear upsample到224²不会产生独立的pixel级观测。",
      "Synthetic 2D unit features：A1=(1,0)，A2=(.8,.6)，A3=(0,1)；B1=(.6,.8)，B2=(1,0)，B3=(0,1)。每个长度为1，可直接用dot product。",
      "得到S=[[.6,1,0],[.96,.8,.6],[.8,0,1]]。A2对B1的相似性=.8×.6+.6×.8=.96，最大；row-wise候选为A1→B2、A2→B1、A3→B3。",
      "反向column-wise检查：B2选A1、B1选A2、B3选A3，因此三对都是mutual。A2的top1−top2 margin=.96−.8=.16；若示意gate为.2，它会被拒绝。阈值需要validation，不是通用confidence。",
      "若另一个Bpatch与B1 feature完全相同，A2出现tie；任意tie-break可能仍产出一对mutual match。Mutual一致不等于正确，也不自动刻画全部ambiguity。",
      "在满足planar或纯旋转等条件时用homography/RANSAC核geometry；一般3D场景需合适epipolar/pose模型，非刚性组织不能直接套同一homography。用residual而非feature颜色是否相近判断。",
      "成本随N_A N_B增长：256×256有65536 scores，FP32约.25MiB；边长翻倍使各图token数4倍，pair matrix变16倍为1048576 scores、约4MiB。这里只算similarity matrix，不含encoder/gradient/temporary buffers。",
      "按独立scene/subject留出，报告correspondence precision、coverage、定位error与geometry inlier率；同时比较local descriptors、frozen dense features和task-specific finetuning。",
    ],
    whenToUse: [
      "缺少dense correspondence标注，想先以pretrained features建立候选matching或label transfer baseline时使用。",
      "需要相似区域检索、semantic part对应或registration初始化时，可把dense features与geometry/领域先验结合。",
      "优势是可复用representation，代价是patch级定位、similarity存储与域偏移；只需整图分类或检索时global embedding更直接。",
    ],
    limits: [
      "Semantic similarity不能证明physical identity，重复纹理、遮挡及外观相似实例可产生一致但错误的matches。",
      "Patch features与attention可视化不自动提供pixel-level masks、registration变换或uncertainty。",
      "Natural-image pretraining迁移到microscopy、遥感或多通道图像需要独立domain evaluation；高cosine不是已校准概率。",
    ],
    howToUse: [
      "定义correspondence label与coordinate system，准备少量可人工核对的landmarks或已知synthetic transforms。",
      "冻结backbone，使用配套preprocessing并抽patch tokens；记录layer、normalization与token grid。",
      "计算cosine与mutual/margin过滤，再做适用的geometry validation，保留unmatched而非强制每patch配对。",
      "按独立scene对precision–coverage与定位error作图；比较提高resolution、局部refinement与finetuning的代价。",
    ],
    tuning: [
      "Match都偏固定位置时先查patch order与resize/crop offsets；整片纹理错误再查feature域适配。",
      "高similarity但geometry坏时检查重复patterns、occlusion和模型假设，不能只提高threshold。",
      "提高resolution使定位更细也使global similarity matrix快速增长，可用coarse-to-fine或局部候选降低成本。",
    ],
    settings: [
      {
        name: "Checkpoint / layer / feature kind",
        start:
          "先固定ViT-S/14与最后层patch tokens；记录checkpoint，排除CLS/register，eval mode。",
        adjust:
          "语义匹配好而细位置差时对照中间层或multi-layer features，不假设最后层总最好。",
      },
      {
        name: "Input size / patch grid",
        start:
          "教学224→16×16；实际保持patch14的checkpoint结构，比较224与448输入。",
        adjust:
          "tiny structures在单patch内混合时增resolution或局部refine；不要随意更改checkpoint patch size。",
      },
      {
        name: "Normalization / similarity",
        start:
          "对每patch做L2 normalization再dot product；对零范数设invalid处理，不直接除0。",
        adjust:
          "feature norm主导排名或跨image尺度不同先核normalization；temperature不等于自动校准。",
      },
      {
        name: "Mutual / margin / geometry gates",
        start:
          "先无gate、mutual-only、margin .1/.2三个可解释对照；geometry阈值按处理图pixels声明。",
        adjust:
          "coverage崩塌先检查歧义是否真实；错误match多时加入独立geometry证据，并用验证集定阈值。",
      },
    ],
    modifications: [
      "Coarse-to-fine matching先找patch候选再在局部window细化，可减少全局pair计算但可能错过初始候选外的真match。",
      "Task-specific supervised contrastive或correspondence finetuning可改善领域表示，需避免从同scene近邻patch产生泄漏。",
      "把pairwise scores作为Optimal Transport或graph matching输入可表达coupling，但必须定义capacity/mass与unmatched语义。",
    ],
    pitfalls: [
      "把CLS或register tokens当image pixels一起reshape，导致位置含义错误。",
      "看到PCA feature颜色相似就宣称semantic segmentation或physical correspondence已经正确。",
      "只报告过滤后precision，不报被丢弃比例，使几乎不匹配的系统看似完美。",
    ],
    example:
      "Synthetic A2与B1 cosine=.96且mutual，但margin只有.16。它可以作为候选，不是96%的正确率；必须结合任务定义和独立验证。",
    compareTo: [
      "dino",
      "local-features-matching",
      "registration-ransac",
      "optical-flow-motion",
    ],
  },
  {
    id: "keypoint-heatmaps-pose",
    source: {
      label: "Sun et al.: Integral Human Pose Regression",
      url: "https://arxiv.org/abs/1711.08229",
    },
    title: "关键点是一格的最大值，还是整张分布",
    englishTitle: "Keypoint Heatmaps, Soft-Argmax and Pose Coordinate Decoding",
    category: "vision",
    level: "进阶",
    duration: "29 min",
    icon: "⌖",
    summary:
      "从 heatmap 到 argmax、soft-argmax、coordinate transform 与误差评价，理解 subpixel 输出、双峰歧义以及 left/right label 的处理。",
    intuition:
      "热力图像一张寻人地图：最亮的一格给一个候选位置；加权平均可落在格子之间，但两处同样亮时，平均位置可能恰好无人。连续坐标不等于更确定。",
    core: "输入image/crop，输出K个landmark heatmaps [K,Hh,Wh]、可选visibility与offset，再decode为坐标。Heatmap argmax产生离散位置；Integral Regression/soft-argmax对归一化map求期望，使坐标可微并降低硬量化。它不能自动解决multi-person association、occlusion或3D depth ambiguity。",
    equation:
      "p_k(u,v)=softmax(H_k(u,v)/T); x̂_k=Σuv u·p_k(u,v); ŷ_k=Σuv v·p_k(u,v); image coordinate=affine_inverse(heatmap coordinate)",
    mechanicsSteps: [
      "先定义K个landmark含义、left/right顺序、visibility与missing label。Human pose、animal pose和组织landmark各需自己的标注协议；未标注点不等于位于(0,0)。",
      "选top-down baseline：先用detector得到person/object crop，再预测该实例K张heatmaps。Bottom-up直接全图找关键点再做instance grouping，不能仅把同类最大值连接起来。",
      "规定一个toy一维heatmap的grid coordinates为[0,1,2,3]，unnormalized positive weights=[1,2,6,1]，归一化后p=[.1,.2,.6,.1]。可由logits=log(weights)、T=1的softmax得到。",
      "Hard argmax取index2。Soft-argmax算0×.1+1×.2+2×.6+3×.1=1.7；二者回答不同的point estimate问题。Toy variance=Σx²p−1.7²=3.5−2.89=.61 grid²，未经过calibration不能直接解释为可靠confidence interval。",
      "明确toy mapping x_image=4x_heat+2：argmax映到10pixel，soft-argmax到8.8pixel。若GT=9.2，绝对误差分别.8与.4；只是这个toy的结果，soft-argmax并非处处更好。真实crop还有offset/scale/half-pixel convention。",
      "降低temperature到T=.5，相当于将weights平方再归一化：[1,4,36,1]/42，期望=79/42≈1.880952，朝最大峰靠近。Temperature改变output/gradient，不可凭热图更尖就认定更准确。",
      "反例p=[.5,0,0,.5]在0与3双峰，期望1.5落在没有概率质量的位置。直接取均值会隐去两个候选；需要保留peaks、visibility或多假设输出，并检查annotation是否含歧义。",
      "Training可用Gaussian target heatmap的MSE、适当distribution loss或coordinate loss；Gaussian sigma用heatmap pixels定义。硬argmax几乎处处不能给坐标loss有用梯度，但heatmap监督可绕开decode训练。",
      "Flip augmentation同时变坐标并交换left/right landmark channels；masked loss只覆盖有效labels。Predictions恢复原坐标后，用pixel error或明确scale-normalized PCK/OKS protocol评估。",
      "诊断时分开detector crop漏目标、heatmap定位、左右交换、遮挡、instance grouping与inverse transform；2D landmarks精确也不自动给出metric3D pose。",
    ],
    whenToUse: [
      "需要有固定语义landmarks的human/animal pose、face landmarks或结构对齐时使用，监督应对应点位置及可见性。",
      "希望从heatmap得到continuous可微坐标时比较soft-argmax；优势是简单且可端到端训练，代价是对多峰分布的均值偏置。",
      "输出应为region或instance mask时，segmentation head更合适；无固定landmark定义时不应勉强套K个关键点。",
    ],
    limits: [
      "遮挡、左右对称与多个实例可造成多峰，单点估计会隐藏歧义。",
      "Heatmap分辨率、crop质量和coordinate convention限制定位；subpixel数值不代表同样精确的观测。",
      "2D image坐标无法单独确定metric3D pose；需要camera geometry、depth或额外先验及验证。",
    ],
    howToUse: [
      "写清landmark schema、visibility与left/right映射，抽样审阅annotation一致性。",
      "先固定crop与input/heatmap shapes，做corner/center round-trip fixtures，确认inverse mapping。",
      "建立heatmap监督+argmax baseline，再比较soft-argmax或offset refinement；避免同时更换backbone。",
      "保存失败heatmaps和原图overlay，分别报告visible/occluded、不同object scale与scene的误差和coverage。",
    ],
    tuning: [
      "系统性半格偏移先检查pixel-center/align_corners/resize conventions，再怀疑模型能力。",
      "预测集中在两个峰中间时检查multimodality，不只是降低temperature或增大network。",
      "热图全平或sigma过大时检查target generation、missing-mask与loss scaling；尖峰但错位时查label与crop。",
    ],
    settings: [
      {
        name: "Input / heatmap resolution",
        start:
          "例如input256×192、heatmap64×48作stride4 baseline，明确这里顺序为H×W。",
        adjust:
          "小landmark误差受网格限制时提高heatmap resolution或加offset head，并测memory/latency。",
      },
      {
        name: "Target Gaussian sigma",
        start:
          "可比较1、2、3 heatmap pixels，先画target与相邻landmark距离；不是image pixels。",
        adjust:
          "峰太宽互相混合或坐标学习慢时减sigma；标注有噪声时评估过窄target的敏感性。",
      },
      {
        name: "Soft-argmax temperature",
        start: "先T=1与hard argmax对照，定义logits归一化；再试.5和2。",
        adjust:
          "多峰均值落空时保留多假设；temperature仅在validation改善定位与校准时调整。",
      },
      {
        name: "Visibility / metric threshold",
        start:
          "missing labels用loss mask；PCK示例按参考长度100pixel与阈值.05得到5pixel，固定inclusive规则。",
        adjust: "遮挡样本或小对象退化时分层报告，不能通过放宽阈值制造提升。",
      },
    ],
    modifications: [
      "Offset head在粗heatmap cell旁预测局部连续偏移，可减少quantization但需要对应targets与坐标规范。",
      "Top-down适合已有可靠boxes，bottom-up适合全图多人但增加grouping；选择应依据拥挤度与延迟。",
      "多view triangulation或2D-to-3D lifting可扩展到3D，必须另外说明camera calibration、scale与训练先验。",
    ],
    pitfalls: [
      "只flip坐标却不交换left/right channels，或把missing point当(0,0)监督。",
      "把softmax后的heatmap叫已校准概率，或把subpixel输出自动等同更高accuracy。",
      "将soft-argmax双峰均值当成真实关键点，忽略它可能落在无支持位置。",
    ],
    example:
      "Synthetic weights[1,2,6,1]给soft-argmax1.7与argmax2；双峰[.5,0,0,.5]却给没有峰的1.5。一个例子展示连续性，另一个暴露均值估计的边界。",
    compareTo: [
      "prediction-heads",
      "mask-rcnn",
      "cv-preprocessing-augmentation",
      "stereo-depth-geometry",
    ],
  },
];
