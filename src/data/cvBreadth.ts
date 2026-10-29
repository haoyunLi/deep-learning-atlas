import type { Lesson } from "./lessons";

export const cvBreadthLessons: Lesson[] = [
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "camera-image-formation",
    source: {
      label: "OpenCV: Camera Calibration and 3D Reconstruction",
      url: "https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html",
    },
    title: "Camera Geometry：像素怎样来自三维世界？",
    englishTitle: "Image Formation, Intrinsics and Extrinsics",
    summary:
      "从一个三维点手算 pixel projection，分清 focal length、camera pose、distortion，以及 resize/crop 对坐标的影响。",
    intuition:
      "照片不是世界坐标的直接副本。同一个物体离相机更远会变小，转动相机会改变它的 pixel 位置；神经网络看到的图像已经包含这些几何与成像选择。",
    core: "输入 world point Xw:[3]、world-to-camera rotation R:[3,3]、translation t:[3]、intrinsic matrix K:[3,3]；先算 Xc=RXw+t，再按深度归一化并投到 pixels。Pinhole model 是理想化近似，实际镜头还要考虑 radial/tangential distortion、exposure、blur 与 sampling。Output pixel 不携带唯一的 depth；单张二维观测对应一条 ray。",
    equation:
      "Xc=RXw+t; u=fx Xc/Zc+cx; v=fy Yc/Zc+cy; K=[[fx,0,cx],[0,fy,cy],[0,0,1]]",
    mechanicsSteps: [
      "先声明 coordinate frame 和单位。World-to-camera 与 camera-to-world 是逆变换；t 不是可以直接解释为 camera world position 的同一向量。",
      "把 world point 变到 camera frame。本例直接给 Xc=(1,0.5,5) metres，Zc>0 表示点在采用此约定的 camera 前方。",
      "去除深度尺度：normalized coordinates=(1/5,0.5/5)=(0.2,0.1)。把 (2,1,10) 代入会得到同一 normalized coordinate，说明 projection 丢失绝对深度。",
      "取 fx=fy=800 pixels、principal point=(320,240)，得到 (u,v)=(480,320)。Focal length 的 pixel 单位与 lens 标称 mm 需要 sensor/pixel pitch 才能连接。",
      "整张图等比例缩小一半时，fx、fy、cx、cy 一起变成 400、400、160、120；同一点落在 (240,160)，不能只缩图而保留旧 K。",
      "若再从左上角裁去 (20,10) pixels，新的 principal point=(140,110)，点的位置变成 (220,150)。Resize、crop、padding 必须按实际顺序组合。",
      "真实 calibration 用已知 pattern 的多个姿态估计 K、distortion 与每张图 pose，检查重投影 residual 的空间结构；只拍几张近似正面图会缺乏几何约束。",
      "把未用于拟合的 pattern/views 留作检查，再将同一坐标变换作用于 boxes、masks、keypoints 和 depth。Low reprojection error 仍不证明所有 camera motions 或新焦距下都可靠。",
    ],
    whenToUse: [
      "做 stereo、3D reconstruction、AR、robotics 或多视角视觉前，先建立 camera contract。",
      "训练视觉模型时排查 resize/crop 导致的标注错位，或把 image outputs 投回真实空间。",
      "优点是几何关系可手算，能在训练前定位单位、方向和坐标错误。",
    ],
    limits: [
      "Pinhole 不包含镜头畸变、rolling shutter、运动模糊和光照；实际模型需匹配相机。",
      "单张 image projection 不唯一确定 depth；学习到的 monocular depth 依赖先验和尺度假设。",
      "Calibration 质量取决于 pattern 测量、姿态覆盖与镜头设置，低拟合误差不能替代留出检查。",
    ],
    howToUse: [
      "保存 image dimensions、sensor/camera ID、intrinsics、extrinsics direction、distortion convention。",
      "先投影几个已知三维点，画 principal point、axes 与 reprojection residual。",
      "每次 preprocessing 同步更新 K 与 annotation，并做 forward/inverse round-trip。",
      "焦距、分辨率或镜头变化后检查 calibration 有效范围；用 held-out views 报 residual 与 failure cases。",
    ],
    tuning: [
      "Calibration images 覆盖画面边角和多种倾角，比只增加重复正面图更有信息。",
      "Distortion 参数过多可能拟合噪声；比较简单模型与 held-out residual。",
      "Resize 尺度由目标细节与 compute 决定，同时记录新的 pixel geometry。",
    ],
    settings: [
      {
        name: "coordinate convention",
        start: "明确 world→camera、metres 与 pixel axis direction。",
        adjust: "左右颠倒或负 depth 时先查变换，不先调 network。",
      },
      {
        name: "calibration views",
        start: "采集不同倾角、距离与视野位置的 pattern。",
        adjust: "边缘 residual 大时补边缘视角并检查 distortion。",
      },
      {
        name: "preprocessing transform",
        start: "记录 resize/crop/pad 的完整顺序和数值。",
        adjust: "坐标 round-trip 不一致时修复变换，再比较模型。",
      },
    ],
    modifications: [
      "Fisheye lens 使用对应 projection/distortion model，而不是强塞进低阶普通镜头模型。",
      "多相机系统可联合 calibration，并传播 pose/intrinsic uncertainty 到下游距离。",
    ],
    pitfalls: [
      "把 R,t 的方向写反，却仅凭一张看起来合理的投影图通过。",
      "只改图像大小，忘记 K、boxes 与 keypoints 的对应变化。",
    ],
    example:
      "Synthetic pinhole：Xc=(1,.5,5)，fx=fy=800，c=(320,240) → pixel=(480,320)。半尺寸图得到 (240,160)；再 crop offset=(20,10) 得 (220,150)。这只是无 distortion 的 projection 算术，不是一次真实 calibration。",
    compareTo: [
      "stereo-depth-geometry",
      "registration-ransac",
      "nerf-gaussian-splatting",
      "cnn",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "local-features-matching",
    source: {
      label: "OpenCV: Feature Matching with SIFT/ORB descriptors",
      url: "https://docs.opencv.org/4.x/dc/dc3/tutorial_py_matcher.html",
    },
    title: "Local Features：怎样找到两张图中的同一个位置？",
    englishTitle: "Keypoints, Descriptors and Feature Matching",
    summary:
      "拆开 keypoint detection、descriptor、nearest-neighbor matching、ratio test 和 geometry verification，理解 classical CV baseline。",
    intuition:
      "给图中有辨识度的小区域制作“指纹”，在另一张图中找相似指纹。但重复窗户也很像，所以 descriptor 相似还需要几何检验。",
    core: "输入两张图，输出候选 correspondences [(xᵢ,yᵢ)↔(x′ᵢ,y′ᵢ)]。Detector 选位置/scale/orientation；descriptor 将局部 patch 编成向量或 binary string；matcher 比较距离，再过滤歧义。SIFT 常用 floating descriptors 与 L2；ORB 常用 binary descriptors 与 Hamming。Learned local matchers 可增强难场景，但仍需定义几何输出与评价。",
    equation:
      "ratio=d1/d2; accept if d1<τ d2; Hamming(a,b)=Σj 1[aj≠bj]; geometric residual=‖x′−project(Hx)‖",
    mechanicsSteps: [
      "先保证两图可能存在重叠视野，明确任务是 planar registration、camera motion 还是 object localization。",
      "Detector 输出 keypoints 及 scale/orientation。纹理少的墙面或明显重复图案通常缺少稳定、独特的局部证据。",
      "Descriptor 将每个局部区域变成固定维数表示；保存对应 keypoint 索引，不能把 descriptor row 与 pixel positions 打乱。",
      "对每个 query descriptor 找最近和次近邻。本例 d1=.4、d2=.8，ratio=.5；若 τ=.75 则通过。另一个 ratio=.7/.8=.875 会被拒绝，即使最近邻距离不算大。",
      "对于 binary descriptor，101100 与 111001 有 3 bits 不同，因此 Hamming distance=3。不要用一个未核对的 floating L2 matcher 替代 binary metric。",
      "Cross-check 要求 A 的最佳 B 同时把 A 视作最佳；ratio test 检查局部歧义。两者条件不同，不保证通过后就是正确 correspondence。",
      "把保留的 matches 交给合适的 geometric estimator，如 plane 的 homography 或两视图 epipolar model，用 RANSAC 分离 outliers。",
      "分别报告 keypoint coverage、匹配正确率、geometric inlier ratio 与最终 registration/pose error；不要用画面上的连线数量替代质量。",
    ],
    whenToUse: [
      "图像有可重复纹理、数据量小、需要可解释 matching 或快速几何 baseline。",
      "用于拼接、物体定位、相机位姿估计与 registration 的候选对应生成。",
      "优点是组件可分开检查，descriptor 与几何错误可以逐阶段定位。",
    ],
    limits: [
      "严重 blur、光照变化、低纹理和重复纹理会破坏匹配，更多 keypoints 不一定解决。",
      "SIFT/ORB 的 invariance 有范围；极端 viewpoint、非刚性形变可能超出假设。",
      "Descriptor match 是相似证据，不是 identity 或空间关系的最终证明。",
    ],
    howToUse: [
      "先画 keypoint spatial coverage，检查两个图是否覆盖同一结构。",
      "按 descriptor 类型选择 distance；ORB WTA_K=2通常用Hamming，WTA_K=3/4按官方实现用Hamming2。",
      "保存 top-2 distances，比较 ratio threshold 与 cross-check 的 precision/coverage。",
      "对照几何模型筛选，留出手工 correspondences 检验定位误差。",
    ],
    tuning: [
      "Ratio threshold 可比较 .6/.75/.85；越严格通常保留更少匹配，不是通用最佳。",
      "Keypoint 数从图像分辨率和纹理密度决定；记录空间覆盖而非只报数量。",
      "Descriptor/matcher 的近似搜索参数影响速度与 nearest-neighbor recall，须和几何成功率一起看。",
    ],
    settings: [
      {
        name: "descriptor / distance",
        start: "SIFT→L2；binary ORB 通常→Hamming，按实现核对。",
        adjust: "匹配距离无区分度时先核 descriptor dtype 与 metric。",
      },
      {
        name: "ratio threshold",
        start: "教学比较 .6/.75/.85，画保留数与inlier ratio。",
        adjust: "错配多时收紧；覆盖不足时查纹理和尺度，再考虑放宽。",
      },
      {
        name: "geometry verification",
        start: "按真实场景选择 H、F/E 或其它变换。",
        adjust: "inliers集中小区域时补coverage，不只降低残差threshold。",
      },
    ],
    modifications: [
      "比较 learned descriptors 或 dense matching，保持相同几何评价与场景 split。",
      "加入 mutual matching、空间覆盖约束或多尺度候选，但分别报告增加的假设。",
    ],
    pitfalls: [
      "把局部 patch 很像直接解读为同一个物体位置。",
      "不同 descriptor family 仍沿用同一数值距离阈值。",
    ],
    example:
      "Synthetic match pairs：(.4,.8) 的 ratio=.5 通过 τ=.75；(.7,.8) 的 ratio=.875 被拒绝。保留者仍可能来自重复图案，需要 RANSAC 的几何一致性。",
    compareTo: [
      "registration-ransac",
      "camera-image-formation",
      "contrastive-learning",
      "knn",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "registration-ransac",
    source: {
      label: "OpenCV: Feature Matching + Homography and RANSAC",
      url: "https://docs.opencv.org/4.x/d1/de0/tutorial_py_feature_homography.html",
    },
    title: "RANSAC Registration：少量错配为什么会毁掉对齐？",
    englishTitle: "Robust Geometric Estimation and Registration",
    summary:
      "用抽样、假设、inlier consensus 和重拟合学习 robust estimation，并分清 rigid、affine、homography 与非刚性变换。",
    intuition:
      "一群人报同一条道路的位置，有些人在胡乱指路。RANSAC 先相信一小组人提出地图，再检查有多少其它报告支持它，而不是一次把所有报告平均。",
    core: "输入 matched points 与 transform family，输出 estimated transform、inlier mask 和 residual。RANSAC 反复抽 minimal subsets、拟合、按 residual threshold 计 consensus，再用最好 inliers 重拟合。Homography 用 3×3 homogeneous matrix 表达平面 projective mapping；它不是一般三维场景任意 camera translation 的完整模型。",
    equation:
      "x′~Hx; n≥log(1−p)/log(1−w^s); eᵢ=‖x′ᵢ−project(Hxᵢ)‖; s=4 for generic homography samples",
    mechanicsSteps: [
      "先选 transform family：translation、rigid/similarity、affine、homography 或 deformation。更多自由度会更容易拟合错误匹配。",
      "Homography 在 scale 无关后有 8 个自由度，generic minimal sample 需 4 个非退化 correspondences；共线或集中很窄的点会不稳定。",
      "假设每个 match 独立正确的概率 w=.5，抽 s=4 个全正确的概率为 .5⁴=.0625。",
      "若要至少一次 all-inlier sample 的概率 p=.99，n≥log(.01)/log(1−.0625)=71.36，因此教学预算取 72 次。该概率依赖独立抽样和正确 w 假设。",
      "对每个 hypothesis，把 source points 映到 target，再计算像素 residual。本例阈值3px时 errors=[1,2,8] 仅前两点属于 inlier。",
      "用最多/最高质量 consensus 的 points 重拟合，检查 residual 分布和空间覆盖；inlier count 多但只集中一角，外推仍可能坏。",
      "将 source image resample 到 target frame，区分 forward point transform 与 image warping 的 inverse sampling；不要把方向参数随意交换。",
      "留出 landmarks、边界或不同 images 评价 alignment，并与 identity/simple transform 比较。Nonrigid tissue deformation 不能由提高 RANSAC iterations 自动修好。",
    ],
    whenToUse: [
      "候选匹配含 outliers，需要拟合明确几何关系，如平面定位、拼接与 registration。",
      "优点是无需知道哪些 correspondence 错，可得到可审计的 inlier mask。",
      "想把坐标/匹配问题与 neural feature training 分开排查时。",
    ],
    limits: [
      "Outlier 比例很高、inliers 几何退化或模型不正确时，抽更多次可能仍找不到正确解。",
      "RANSAC confidence 只针对抽样成功条件，不是最终 transform 误差的 calibrated probability。",
      "阈值和 residual metric 决定 consensus；不同尺度、畸变和anisotropic noise可能需要不同模型。",
    ],
    howToUse: [
      "先在人工对应点上验证 transform family 与坐标方向。",
      "估计 inlier ratio 范围，用公式理解 iteration cost，再使用实现的自适应停止规则。",
      "画 transformed corners、residual vectors 和 inlier spatial coverage。",
      "在独立 landmarks 上报 median/tail error，保存 matrix、units、threshold 与seed。",
    ],
    tuning: [
      "Residual threshold 可先对照测量误差的1–3倍范围，不用跨分辨率固定同一pixel值。",
      "Confidence 越高、inlier ratio越低，抽样预算增长越快；先改善matches可能更划算。",
      "若非刚性形变明显，比较分区/非刚性模型，同时用regularization防止过拟合。",
    ],
    settings: [
      {
        name: "transform family",
        start: "从满足物理过程的最简单模型开始。",
        adjust: "系统性残差提示模型不匹配，先查畸变/非刚性，不盲加iterations。",
      },
      {
        name: "reprojection threshold",
        start: "明确target pixels与预处理尺度，按标注误差给候选。",
        adjust: "过低会排除真实matches；过高会接纳错误结构。",
      },
      {
        name: "confidence / iterations",
        start: "以w=.5,s=4,p=.99理解72次教学预算。",
        adjust: "真实数据用有效w估计、adaptive stopping并保留失败率。",
      },
    ],
    modifications: [
      "使用 robust loss 或局部优化细化 consensus solution，并保留前后 held-out errors。",
      "对于真正3D camera motion，改为essential/fundamental matrix和pose recovery，而不是把homography强用到所有景深。",
    ],
    pitfalls: [
      "把 high inlier ratio 当作全图对齐准确，忽略分布集中。",
      "缩图后继续使用原图pixel threshold，或混淆warp方向。",
    ],
    example:
      "Synthetic RANSAC：w=.5、s=4、p=.99时至少72次独立抽样达到公式目标；w=.8时只需9次。这个数量只刻画抽到全inlier sample的机会，不保证模型非退化或正确。",
    compareTo: [
      "local-features-matching",
      "camera-image-formation",
      "stereo-depth-geometry",
      "spatial-assignment",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "detection-metrics-nms",
    source: {
      label: "Torchvision: Non-Maximum Suppression definition",
      url: "https://docs.pytorch.org/vision/stable/generated/torchvision.ops.nms.html",
    },
    title: "Detection Evaluation：score、NMS 与 AP 各在判断什么？",
    englishTitle: "Bounding Boxes, IoU, NMS and Average Precision",
    summary:
      "沿着框坐标、去重、prediction–ground-truth matching 和 PR curve 理解检测质量，不把三个阈值混成一个。",
    intuition:
      "检测器可能给同一只猫画三个框。先决定保留哪些预测，再决定每个框是否准确找到某个真实对象，最后观察confidence排序下的precision–recall；这三步不是同一件事。",
    core: "Input 是 predicted boxes [N,4]、scores [N]、classes [N] 和 ground-truth boxes；output 是保留预测、逐阈值TP/FP/FN与AP。Score threshold按模型分数筛选，NMS IoU按预测之间的重叠去重，evaluation IoU按预测与真值的重叠判定匹配。AP需要明确类别、IoU、interpolation、max detections、area与crowd/ignore规则；COCO evaluator是可核查实现。",
    equation:
      "IoU=intersection/(areaA+areaB−intersection); precision=TP/(TP+FP); recall=TP/GT; AP=area under specified interpolated PR curve",
    mechanicsSteps: [
      "规定 boxes 是xyxy还是cxcywh，是否归一化，边界坐标是否连续。本例使用continuous xyxy，不加入离散像素的+1。",
      "A=(0,0,4,4)，B=(1,1,5,5)，各area=16，intersection=3×3=9，union=23，IoU=9/23≈.3913。",
      "设A score=.9、B score=.8，同一class。Greedy NMS保留A；threshold=.3时B被抑制，threshold=.5时B保留。阈值更高通常容许更多重叠。",
      "独立改变score threshold：.85会先过滤B，但这是score screening，不是在判断box geometry。Different classes是否互相抑制需显式说明。",
      "Evaluation按score排序并执行一对一matching，同一ground truth通常只能贡献一次TP；围住同一对象的重复框仍可能是FP，不能重复提高recall。",
      "两件ground truths、预测顺序TP,FP,TP时，PR点按(precision, recall)排列为(1,.5)、(.5,.5)、(2/3,1)。在all-points monotone-envelope积分定义下AP=1/2×1+1/2×2/3=5/6。",
      "上述5/6不是COCO 101-point AP的精确数值。COCO还跨IoU .50:.05:.95、类别与设定切片汇总；必须使用同一evaluator才能比较。",
      "按class、size、crowding、camera与场景拆error；另报部署score threshold下的误报/漏报和含postprocessing的latency。AP提升不自动解决现场cost。",
    ],
    whenToUse: [
      "比较Faster R-CNN、YOLO或DETR输出，或排查duplicate、small-object、crowded-scene errors。",
      "调整部署阈值时，拆开模型ranking、定位质量和去重规则。",
      "优点是逐框matching可检查，能避免只盯一个mAP而不知道错在哪里。",
    ],
    limits: [
      "NMS可能压掉真实的相贴对象；set-prediction模型也不一定使用同一种NMS。",
      "AP对annotation policy、漏标和ignore/crowd设置敏感，跨dataset指标不可直接等同。",
      "高score不是calibrated correctness probability；AP也不直接提供业务最优threshold。",
    ],
    howToUse: [
      "随机画原图、增强后boxes与逆变换输出，检查units/format。",
      "锁定evaluator version与IoU/area/maxDet设置，保存逐prediction matching。",
      "同时扫score与NMS threshold，观察duplicate FP和crowded-scene recall。",
      "按camera/video/scene独立split，输出PR曲线和实际部署点的latency/error。",
    ],
    tuning: [
      "score threshold控制保留数量；先按validation成本选择，再锁定测试设置。",
      "NMS IoU可比较.3/.5/.7，密集真实对象被压掉时检查提高threshold或其它postprocessing。",
      "Input resolution与max detections影响small/crowded recall，应与计算预算联合评价。",
    ],
    settings: [
      {
        name: "coordinate format",
        start: "continuous xyxy、原图pixel units，记录逆变换。",
        adjust: "IoU异常时先检查负宽高、resize/pad与格式混用。",
      },
      {
        name: "score / NMS IoU",
        start: "分别做阈值扫描，不把两个0.5视作同一意义。",
        adjust: "重复FP多查NMS；低分真目标多查score与ranking。",
      },
      {
        name: "evaluation contract",
        start: "明确AP50/AP75/COCO AP、class、area与maxDet。",
        adjust: "不同结果先对齐evaluator和标签规则，再比较architecture。",
      },
    ],
    modifications: [
      "Soft-NMS降低重叠框score而非直接删除；仍需validation核效果。",
      "拥挤场景比较set prediction或instance masks，保留相同label/metric协议。",
    ],
    pitfalls: [
      "把NMS threshold调低，以为一定提高recall。",
      "以同一ground truth重复匹配多个高分框来计算TP。",
    ],
    example:
      "Synthetic boxes A/B的IoU=.3913；同类且score .9/.8，NMS .3只留A、.5留两者。另一个PR fixture TP,FP,TP在两件GT下all-points AP=5/6；不要把这一积分结果冒称标准COCO AP。",
    compareTo: [
      "faster-rcnn-yolo",
      "detr",
      "mask-rcnn",
      "segmentation-task-metrics",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "segmentation-task-metrics",
    source: {
      label: "Kirillov et al.: Panoptic Segmentation",
      url: "https://arxiv.org/abs/1801.00868",
    },
    title: "Segmentation Tasks：像素正确，为何计数仍可能全错？",
    englishTitle: "Semantic, Instance and Panoptic Segmentation Metrics",
    summary:
      "把semantic class、instance identity与完整scene partition拆开，并通过merge/split例子比较IoU、Dice、AP与PQ。",
    intuition:
      "把两个人涂成同一种颜色，可能已完成“哪些像素是人”；但如果需要数人数，必须知道这片颜色里面有两个人。任务标签不同，评价单位也不同。",
    core: "Semantic segmentation输出每pixel类别；instance segmentation输出每个可数object的mask和class；panoptic segmentation给每pixel class与适用的instance ID，并区分things/stuff。Metric必须匹配输出contract：pixel IoU/Dice、instance AP与panoptic PQ不能互换。Boundary measurement或cell counting还可能需要额外的boundary/instance指标。",
    equation:
      "IoU=TP/(TP+FP+FN); Dice=2TP/(2TP+FP+FN); PQ=Σmatched IoU/(|TP|+0.5|FP|+0.5|FN|)=SQ×RQ",
    mechanicsSteps: [
      "先定义object ontology：同类相贴objects是否各有ID，空白/void如何处理，stuff是否需要区分instances。",
      "Semantic foreground fixture：两个真实objects各3pixels、预测将6pixels合成一个mask。Foreground区域完全正确，binary foreground IoU=1、Dice=1。",
      "对每个真实instance，merged mask与它的intersection=3、union=6，instance IoU=.5。采用原始PQ的strict IoU>.5匹配规则时，两个GT都未匹配。",
      "该merge例有TP=0、FP=1、FN=2，PQ=0；这与完美foreground Dice并不矛盾，因为后者不检查instance identity。",
      "另一个fixture有TP=2、FP=1、FN=1，匹配IoUs=.8和.6。SQ=(.8+.6)/2=.7；RQ=2/(2+.5+.5)=2/3；PQ=1.4/3≈.4667。",
      "统一pixel confusion统计和mean aggregation：micro foreground Dice、每class宏平均、每image平均的权重不同，空mask处理也需固定。",
      "对thin structures、small objects与touching boundaries单列指标；pixel面积大的区域可能掩盖小实例错误。",
      "把postprocessing中的connected components、watershed、min-area filtering纳入评价，按subject/scene而非近邻patch随机split。",
    ],
    whenToUse: [
      "选择U-Net、Mask R-CNN、SAM或panoptic pipeline前，先确定真正需要的输出。",
      "做cell/vehicle计数、touching-object分离或scene parsing时，避免只看foreground Dice。",
      "优点是将class error、boundary error、merge/split与漏实例拆开诊断。",
    ],
    limits: [
      "不同annotation policy与void/crowd处理会改变metric，不能只按名称比较。",
      "PQ和AP仍可能掩盖特定大小、边界或稀有类别失败，应分层报告。",
      "下游morphology或counting的偏差不一定由一个pixel metric充分描述。",
    ],
    howToUse: [
      "抽查标签中的class IDs与instance IDs，画相贴目标、空图和ignore区域。",
      "为task建立一两个merge/split手工fixtures，确认evaluator符合预期。",
      "报告region/instance/boundary不同层级指标，并保存每image error maps。",
      "在同一数据与预处理上比较architecture与postprocessing，把人工标注分歧纳入解释。",
    ],
    tuning: [
      "Threshold改变mask面积；min-area改变小目标召回，需按validation实例大小分组评估。",
      "Watershed distance/seed参数影响merge与split tradeoff，不能只追求更多objects。",
      "Class/instance loss权重应与监督目标一致；metric定义固定后再调模型。",
    ],
    settings: [
      {
        name: "label contract",
        start: "分别保存semantic class与instance ID，明确background/void。",
        adjust: "计数或morphology任务必须检查每instance标签完整性。",
      },
      {
        name: "matching / aggregation",
        start: "固定IoU threshold、strictness、class平均与empty-mask规则。",
        adjust: "指标差异先核protocol，不先归因architecture。",
      },
      {
        name: "postprocessing",
        start: "从不做过滤与明确规则两个baseline比较。",
        adjust: "小实例被删或touching objects被merge时看分层errors。",
      },
    ],
    modifications: [
      "加入boundary distance、object count bias或形态测量误差，让评价连接真实用途。",
      "Promptable segmentation可作为候选生成，但最终类别和instance组合仍要独立评价。",
    ],
    pitfalls: [
      "把foreground Dice=1说成每个object都找对。",
      "通过删除困难小objects提高平均metric，却不报告coverage变化。",
    ],
    example:
      "Synthetic merge：GT两个3pixel objects，prediction一个6pixel mask。Foreground IoU=1，但每instance IoU=.5；在strict >.5 PQ matching下PQ=0。这个例子展示任务差异，不代表某架构必然merge。",
    compareTo: [
      "unet",
      "mask-rcnn",
      "segment-anything",
      "detection-metrics-nms",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "optical-flow-motion",
    source: {
      label:
        "Teed & Deng: RAFT—Recurrent All-Pairs Field Transforms for Optical Flow",
      url: "https://arxiv.org/abs/2003.12039",
    },
    title: "Optical Flow：每个pixel在下一帧去了哪里？",
    englishTitle: "Optical Flow, Brightness Constraints and Learned Matching",
    summary:
      "从brightness constraint与aperture problem走到RAFT，分清pixel motion、object tracking与真实三维速度。",
    intuition:
      "看一根均匀直线移动，只能可靠看出垂直于线的位移；沿着线滑动几乎不可见。Flow不是“看两帧就知道一切运动”，而是用局部证据和先验补足不确定性。",
    core: "输入相邻frames I1/I2:[H,W,C]，输出dense flow F:[H,W,2]，表示source pixel到target位置的displacement。经典brightness constancy在小运动下形成线性约束，空间regularity补足欠定方向。RAFT用learned features、all-pairs correlation pyramid与recurrent update迭代估计flow；它并不直接输出persistent object IDs或metric 3D velocity。",
    equation: "I1(x,y)≈I2(x+u,y+v); Ix u+Iy v+It≈0; EPE=√[(u−u*)²+(v−v*)²]",
    mechanicsSteps: [
      "固定flow方向、pixel units与frame time interval；forward flow和backward flow不能仅靠改变符号就处处互换。",
      "Brightness constancy假设相同scene point在两帧brightness近似不变；曝光变化、specular reflection和occlusion会破坏它。",
      "在局部线性toy里，Ix=1、Iy=0、It=−2只给出u=2，v任意。一个pixel的一条方程不能解两个unknowns，这就是aperture问题的一个表达。",
      "邻域再提供独立约束Ix=0、Iy=1、It=−1，若共享运动假设成立，则得到v=1。若邻域跨object boundary，共享同一flow可能错。",
      "RAFT先抽取两帧feature，构造所有pixel-pair的相似性，再按当前flow位置查询correlation neighborhoods，用recurrent unit更新flow。原始all-pairs cost对空间分辨率增长很敏感。",
      "本例GT flow=(2,1)，prediction=(3,1)，EPE=1pixel。相同1pixel误差对极小目标和大尺度运动的重要性不一定相同。",
      "检查occluded区域与non-occluded区域；forward-backward consistency可帮助发现异常，但一致也不保证正确。",
      "恢复原图分辨率时，flow field除了resize interpolation，还要同步缩放u/v数值；再按scene/video留出评估。",
    ],
    whenToUse: [
      "需要dense correspondence、video stabilization、运动分割或tracking的辅助运动线索。",
      "光流可作为动作识别或视频处理的输入，但也需比较RGB-only baseline。",
      "优点是每pixel displacement可以直接画vector或warp结果，便于诊断。",
    ],
    limits: [
      "Occlusion、motion blur、低纹理、重复纹理与illumination change都可能使对应不可靠。",
      "Flow是image-plane displacement，camera motion、depth与object motion混在一起；不等于真实物体速度。",
      "更平滑flow可能跨越真实motion boundary，不能只按颜色图是否平滑评价。",
    ],
    howToUse: [
      "先验证方向与units，用一个已知translation的synthetic image pair做测试。",
      "画warped image、flow vectors、EPE以及occlusion mask，避免只看颜色轮图。",
      "对large motion、small objects和camera motion分别测性能。",
      "报告frames间隔、resize规则、iterations、latency与显存；按video/scenario切分。",
    ],
    tuning: [
      "多尺度与更高分辨率帮助小结构，但correlation memory会增加。",
      "Recurrent update iterations影响速度/精度；在固定硬件和motion分布上做曲线。",
      "Photometric或smoothness权重必须考虑occlusion与boundary，否则会鼓励错误一致性。",
    ],
    settings: [
      {
        name: "flow direction / Δt",
        start: "明确t→t+1及pixels per frame，记录fps。",
        adjust: "换fps或frame stride时重新解释位移与速度。",
      },
      {
        name: "resolution / padding",
        start: "遵守模型stride，保存原图与处理图变换。",
        adjust: "小目标flow丢失时提高resolution并测memory。",
      },
      {
        name: "update iterations",
        start: "从对应checkpoint recipe开始，固定其它设置。",
        adjust: "画EPE–latency曲线选择，不把更多iterations视作必然正确。",
      },
    ],
    modifications: [
      "加入occlusion-aware losses、depth或camera pose以解释运动来源。",
      "用sparse local matching做baseline，或将flow接到multi-object tracker但保留ID association步骤。",
    ],
    pitfalls: [
      "只resize flow图，不缩放displacement values。",
      "将光流方向直接当细胞迁移或真实3D速度，忽略camera和depth。",
    ],
    example:
      "Synthetic约束u=2但v不可识别；第二独立gradient约束给v=1。Prediction=(3,1)与GT=(2,1)的EPE为1pixel。这是局部linear toy，不是RAFT实际训练结果。",
    compareTo: [
      "local-features-matching",
      "multi-object-tracking",
      "video-understanding",
      "camera-image-formation",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "multi-object-tracking",
    source: {
      label: "Bewley et al.: Simple Online and Realtime Tracking (SORT)",
      url: "https://arxiv.org/abs/1602.00763",
    },
    title: "Multi-Object Tracking：框相似，不代表ID相同",
    englishTitle: "Tracking-by-Detection and Data Association",
    summary:
      "连接detector、motion prediction、global assignment与track lifecycle，理解ID switch和遮挡为什么不能只靠单帧AP衡量。",
    intuition:
      "每帧都找到两个人还不够：两人交叉后，系统必须记住谁是谁。Detection回答“现在在哪里”，tracking还要回答“与上一帧哪条轨迹对应”。",
    core: "输入video detections及可选appearance features，输出跨时间的track IDs和states。Tracking-by-detection先预测已有track位置，再构造track–detection cost、gating、全局matching及未匹配管理。SORT结合Kalman与Hungarian assignment；appearance与更复杂motion models是可比较扩展，不能补救所有漏检或遮挡。",
    equation:
      "Cij=λm motion_cost(i,j)+λa appearance_cost(i,j); assignment*=argmin Σ Cij; unmatched tracks/detections require explicit lifecycle rules",
    mechanicsSteps: [
      "先定义track unit与时间：一帧中的box/mask、timestamp、class与是否允许离开视野后re-identification。",
      "Motion model预测每条track的新state及uncertainty。Kalman的predict/update原理见对应课程；tracker还必须判断哪个measurement属于它。",
      "按位置、IoU或Mahalanobis gate排除不合理pair，再计算剩余cost。Appearance similarity是额外线索，不等于身份真值。",
      "两track×两detection的toy cost=[[.10,.20],[.11,.90]]。按row贪心先选.10后只能选.90，总cost=1.00。",
      "全局matching改选cross pair，cost=.20+.11=.31，更低；这种coupling解释为什么每条track各自选最近邻不够。",
      "未匹配detection可以创建tentative track，未匹配track进入lost状态。min_hits与max_age共同决定短暂误报、遮挡恢复和陈旧ID保留。",
      "在occlusion或交叉时检查ID switches、fragmentation与trajectory continuity；同时保留detection precision/recall。HOTA/IDF1等评价关注association，不能由AP替代。",
      "按完整video、camera或scene分割数据，保存逐帧match、gated pairs与lifecycle事件，定位detector还是association出错。",
    ],
    whenToUse: [
      "需要人数/车辆/细胞的轨迹、停留时间或运动统计，而非只需单帧位置。",
      "已有较可靠detector，希望建立可解释在线tracking baseline。",
      "优点是prediction、association和lifecycle可分别消融，计算流程容易检查。",
    ],
    limits: [
      "长遮挡、相似appearance、突变运动和漏检会导致身份不可确定，硬输出ID可能掩盖ambiguity。",
      "Hungarian只求当前cost matrix的最优assignment，不保证长时identity全局最优。",
      "增加max_age可能恢复遮挡，也可能把不同对象错误接到旧track。",
    ],
    howToUse: [
      "先用固定detector建立SORT类baseline，画预测box、measurement和track ID。",
      "构造交叉、漏一帧、离开再进入等小fixtures检验lifecycle。",
      "记录motion/appearance cost分布及gating拒绝率，独立查missed detections。",
      "报告IDF1/HOTA及检测指标、latency，按场景/拥挤度/遮挡时长分层。",
    ],
    tuning: [
      "max_age须结合fps：30frames在30fps约1秒，换采样率后意义改变。",
      "min_hits提高track稳定性但延迟新目标确认；同时报告time-to-confirm。",
      "混合cost前先校准尺度，避免一个大数值项无意支配assignment。",
    ],
    settings: [
      {
        name: "association gate",
        start: "根据motion uncertainty与合理位移范围定义gate。",
        adjust: "gate过严会fragment，过松会错误连接；按motion类型检查。",
      },
      {
        name: "max_age / min_hits",
        start: "用seconds和frames同时记录，检查短遮挡fixtures。",
        adjust: "根据遮挡分布与误连接成本调整，而非追求最长轨迹。",
      },
      {
        name: "appearance weight",
        start: "先motion-only，再加appearance做同协议ablation。",
        adjust: "相似制服/细胞导致错误连接时复核embedding与gallery更新。",
      },
    ],
    modifications: [
      "Mask-level tracking或lineage modeling可适应对象分裂/合并，普通one-to-one tracker不够。",
      "离线global association可用未来frames，但不能和仅online方法无条件比较延迟与信息量。",
    ],
    pitfalls: [
      "使用GT未来轨迹修正当前assignment后宣称online performance。",
      "把长期保留同一个ID当作正确，忽略它可能接错对象。",
    ],
    example:
      "Synthetic cost matrix[[.10,.20],[.11,.90]]：row-greedy为1.00，全局cross assignment为.31。现实tracker还必须处理gates与unmatched，不能强迫任何两个对象都匹配。",
    compareTo: [
      "kalman-filtering",
      "detection-metrics-nms",
      "optical-flow-motion",
      "structured-assignment-inference",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "stereo-depth-geometry",
    source: {
      label: "OpenCV: Depth Map from Stereo Images",
      url: "https://docs.opencv.org/4.x/dd/d53/tutorial_py_depthmap.html",
    },
    title: "Stereo Depth：差一个pixel，距离会差多少？",
    englishTitle: "Epipolar Geometry, Disparity and Depth",
    summary:
      "从rectified stereo手算depth与误差传播，并解释monocular depth、stereo与SfM的尺度条件。",
    intuition:
      "轮流闭上左右眼，近物体的位置跳得更明显。Stereo把这种disparity变成depth，但远处disparity很小，一个pixel误差就可能对应很大的距离误差。",
    core: "输入已calibrate并rectify的stereo pair、focal length f与baseline B，输出disparity d和depth Z。Rectification让对应搜索主要沿同一row；理想平行geometry下Z=fB/d。Learned stereo负责更复杂matching，但geometry、occlusion与scale要求仍在。单目learned depth的metric尺度取决于训练与额外信息；一般SfM存在scale ambiguity。",
    equation:
      "d=uL−uR; Z=fB/d; |δZ|≈fB |δd|/d²; rectified ideal stereo assumes consistent pixel units",
    mechanicsSteps: [
      "检查左右camera内参、相对pose、同步和baseline单位；B是物理长度，f和d都用同一图像分辨率的pixels。",
      "Undistort与rectify，再画epipolar lines检查同一物体是否落在同一row附近。未rectify直接按row搜索通常不成立。",
      "找correspondence并计算disparity。本例f=800px、B=.1m、d=40px，因此Z=800×.1/40=2m。",
      "同样camera下d=20px得到Z=4m。Disparity减半对应depth翻倍，不是线性加倍disparity得到更远。",
      "用一阶误差传播：1px disparity error在d=40处约造成80/1600=.05m depth error；在d=20处约.20m，远处更敏感。",
      "对zero/negative或无效disparity保留invalid mask，不能用一个随意epsilon把它变成看似精确的巨大depth。",
      "经典block matching依赖window与texture；learned cost volume/regularization改善匹配，但在遮挡、透明/反光和域外场景仍需检测失败。",
      "报告valid coverage与不同depth ranges的error，并检查metric scale和timestamp；不要只展示彩色depth map。",
    ],
    whenToUse: [
      "有已知baseline与同步相机，需要metric depth、机器人测距或3D reconstruction。",
      "比较geometry-based stereo与monocular预测，理解不同传感与尺度假设。",
      "优点是已知calibration下有明确depth公式，误差可从disparity解释。",
    ],
    limits: [
      "Occlusion和无纹理区域缺少可靠对应；输出dense不表示每pixel都有独立证据。",
      "Baseline过小远处误差大；过大可能增加遮挡和matching难度。",
      "Moving scenes的不同步或rolling shutter会破坏静态stereo geometry。",
    ],
    howToUse: [
      "先在已知距离target上测试calibration与depth scale。",
      "明确disparity实现是否含fixed-point scaling，先转换到真实pixel单位。",
      "检查left-right consistency、confidence与invalid regions，报告coverage。",
      "按距离、texture、光照和运动分层验证，并保存完整camera/preprocess参数。",
    ],
    tuning: [
      "Disparity search range来自预期Zmin：dmax≈fB/Zmin，不能凭默认截断近处目标。",
      "Block/window越大通常更平滑但损失thin structures和depth boundary。",
      "提高image resolution改变f/d数值与compute；必须一致缩放camera参数。",
    ],
    settings: [
      {
        name: "baseline / units",
        start: "B用metres；f/d用处理图pixels，保存scale。",
        adjust: "depth整体差固定倍数时先查units和fixed-point convention。",
      },
      {
        name: "disparity range",
        start: "按最近/最远有效距离推导候选范围。",
        adjust: "近目标饱和或远目标不稳定时分开检查range与precision。",
      },
      {
        name: "invalid / consistency",
        start: "输出validity mask并记录可用覆盖率。",
        adjust: "不要仅填洞提高视觉平滑度，填补结果需单独标识。",
      },
    ],
    modifications: [
      "融合temporal frames或其它sensors提高约束，但必须传播calibration与时间误差。",
      "Multi-view stereo/SfM使用更多views；metric尺度仍需已知baseline或其它锚点。",
    ],
    pitfalls: [
      "将raw fixed-point disparity直接代入Z=fB/d。",
      "把彩色depth边界锐利当作meter尺度准确。",
    ],
    example:
      "Synthetic rectified stereo：fB=80px·m。d=40→2m，d=20→4m；1px误差的一阶depth影响分别约.05m和.20m。模型不包含occlusion、distortion或calibration uncertainty。",
    compareTo: [
      "camera-image-formation",
      "local-features-matching",
      "optical-flow-motion",
      "nerf-gaussian-splatting",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "point-cloud-learning",
    source: {
      label:
        "Qi et al.: PointNet—Deep Learning on Point Sets for 3D Classification and Segmentation",
      url: "https://arxiv.org/abs/1612.00593",
    },
    title: "Point Clouds：没有pixel网格，网络怎样理解三维形状？",
    englishTitle: "PointNet, Local Neighborhoods and 3D Representations",
    summary:
      "从unordered point sets理解permutation invariance，比较point、voxel与graph表示，并追踪pooling丢掉的信息。",
    intuition:
      "同一把椅子的3D点云换一个文件行顺序，物体不应变成另一种类别。但如果把椅子转动、裁掉一条腿或改变采样密度，问题就复杂得多；这些变化不是同一种invariance。",
    core: "输入points X:[N,3]与可选color/normals/features，输出object label或per-point labels。PointNet对每个point使用共享函数，再用symmetric pooling获得全局表示；segmentation可把global feature拼回每点。PointNet++类模型进一步分层建局部neighborhoods；voxel/sparse convolution与graph提供另一种局部结构。",
    equation:
      "z=max_pool_i h(xi); classification=f(z); per-point output_i=g([h_local(xi),z]); max is invariant to row permutation",
    mechanicsSteps: [
      "先定义points来自LiDAR、RGB-D、mesh sampling还是reconstruction，保存坐标单位、axes、采样密度与missing regions。",
      "将N×3点逐行送入shared MLP；shared表示同一组weights用于所有point，不为每个index学习独立规则。",
      "Synthetic 1D示例x=[1,2,3]，h(x)=[x,x²]，三个features为[1,1]、[2,4]、[3,9]。Channel-wise max得到z=[3,9]。",
      "把rows重排成[3,1,2]，max仍为[3,9]；这证明此pooling的permutation invariance。它没有证明rotation、translation或density invariance。",
      "示例shape：1024×3经MLP变1024×64，再形成global feature1024维；将global复制拼接到每点64维后得1024×1088，per-point head输出1024×C。",
      "Global max可能看不到所有局部结构；引入radius/kNN neighborhoods与hierarchical sampling，让模型逐尺度处理局部几何。Radius对应真实距离，kNN则固定邻居数而非物理尺度。",
      "Voxel把空间量化成网格，64³有262144 cells，128³有2097152，是8倍dense cell数；sparse representation只存活跃单元，但效率仍依赖occupancy和实现。",
      "评估不同rotation、density、occlusion与sensor的泛化；shape classification与per-point segmentation用不同metrics，并按独立scene/object split。",
    ],
    whenToUse: [
      "点云classification、part segmentation、场景理解、3D object detection的representation基础。",
      "需要理解PointNet为什么不依赖文件point顺序，以及何时需要local geometry。",
      "优点是直接处理unordered samples，避免总是构造密集3D网格。",
    ],
    limits: [
      "Permutation invariance不能自动解决rotation、scale、density或sensor shift。",
      "Global pooling会压缩细节，薄结构与小区域可能在sampling/pooling中丢失。",
      "从reconstructed points得到高性能，仍可能依赖reconstruction artifacts或场景泄漏。",
    ],
    howToUse: [
      "画原始point cloud、units、color/normal与被采样的点，检查是否错误normalize掉任务所需绝对尺度。",
      "先做row permutation测试，再单独测rotation/translation/point dropout。",
      "比较global PointNet与local neighborhood/voxel baseline，保持input points预算。",
      "按object/scene/sensor切分并报告small parts、occluded regions和runtime。",
    ],
    tuning: [
      "Number of points控制coverage与compute；比较随机、farthest-point或voxel sampling的稀有结构保留。",
      "Neighborhood radius应对应物理尺度与density；k固定时同时记录最大neighbor distance。",
      "Coordinate normalization是任务假设：size classification不能随意把每个object都缩为单位球。",
    ],
    settings: [
      {
        name: "point count / sampling",
        start: "如1024/2048作为同预算候选，先画coverage。",
        adjust: "细结构缺失时检查sampling，而不是只加hidden width。",
      },
      {
        name: "radius / k",
        start: "记录physical units、neighbor count分布与空邻域处理。",
        adjust: "density变化时比较multi-scale或density-aware grouping。",
      },
      {
        name: "normalization / augmentation",
        start: "明确是否保留absolute size与方向，分别测试rotation。",
        adjust: "仅当任务对该变换invariant时采用相应augmentation。",
      },
    ],
    modifications: [
      "使用PointNet++、point attention或graph layers建local geometry；比较新增的sampling/neighbor成本。",
      "采用sparse voxel convolution处理大场景，或融合image features但检查camera calibration。",
    ],
    pitfalls: [
      "把max pooling不变性说成所有3D transformations都不变。",
      "把同一object的不同采样points放进train/test，制造虚假的泛化。",
    ],
    example:
      "Synthetic shared h(x)=[x,x²]：对points[1,2,3]与[3,1,2]，global max均为[3,9]。真实PointNet会学习h；该toy仅证明symmetric aggregation对顺序的性质。",
    compareTo: [
      "gnn",
      "graphsage",
      "camera-image-formation",
      "nerf-gaussian-splatting",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "nerf-gaussian-splatting",
    source: {
      label:
        "Mildenhall et al.: NeRF—Representing Scenes as Neural Radiance Fields",
      url: "https://arxiv.org/abs/2003.08934",
    },
    title: "NeRF 与 3DGS：怎样从照片合成一个新视角？",
    englishTitle: "Neural Radiance Fields and 3D Gaussian Splatting",
    summary:
      "比较implicit field与explicit Gaussian primitives，用一条ray的alpha compositing解释view synthesis，并界定它与mesh reconstruction的区别。",
    intuition:
      "新视角图像可以通过“沿每条光线询问颜色和透明度”生成，也可以把许多带颜色的3D椭球投到屏幕上合成。两者都可能画得逼真，但逼真图像不保证已经获得准确可编辑的实体表面。",
    core: "输入多视角images与camera calibration/poses，输出可从新camera渲染的scene representation。NeRF以MLP等implicit function预测位置/方向对应的density与radiance，经volume rendering成像。原始3D Gaussian Splatting用explicit anisotropic Gaussians、opacity与view-dependent color并做visibility-aware rasterization；训练目标和表示均不同。3DGS原论文：https://arxiv.org/abs/2308.04079 。",
    equation:
      "αi=1−exp(−σiΔi); Ti=∏j<i(1−αj); C=Σi Tiαi ci + T_end c_bg; 3DGS uses projected Gaussian footprints with ordered alpha blending",
    mechanicsSteps: [
      "先检查scene近似static、images曝光与poses一致，确定训练views与真正held-out views；camera error可能被representation吸收成模糊或漂浮结构。",
      "NeRF从一个pixel生成camera ray r(t)=o+td，在near/far范围采样3D位置；density σ非负，color可以依赖view direction。",
      "每段density转opacity：若σΔ=ln2，则α=1−exp(−ln2)=.5；density与occupancy概率不是同一数值。",
      "两段toy的α均为.5，colors为red=(1,0,0)、blue=(0,0,1)，black background。第一weight=.5；第二weight=(1−.5)×.5=.25；背景remaining transmittance=.25。",
      "因此rendered color=(.5,0,.25)，不是简单平均(.5,0,.5)。前方材料降低后方贡献，depth ordering影响结果。",
      "3DGS优化3D Gaussian means、covariances、opacities和color表示，将ellipsoid投影为screen-space footprint并进行可见性相关compositing；density control会split/clone/prune primitives。",
      "NeRF的采样数量/field representation与3DGS的Gaussian count/densification分别控制compute、memory和细节；共享compositing直觉不表示两者是同一算法。",
      "在held-out camera views测image quality、render latency、memory与geometry consistency；若需要metric surface，用独立depth/mesh ground truth验证，不能只看PSNR。",
    ],
    whenToUse: [
      "已有多视角capture，需要novel-view rendering、scene capture或可交互可视化。",
      "想比较implicit coordinate networks与explicit primitives的速度/存储/优化tradeoff。",
      "优点是用image supervision直接优化可微rendering，不必先获得完整surface mesh。",
    ],
    limits: [
      "Sparse/poorly distributed views、reflective/transparent materials和moving objects可导致欠定或artifact。",
      "Photometric reconstruction不保证metric geometry、semantic labels或物体可独立编辑。",
      "原始方法针对一定scene/camera假设；dynamic/relightable/generalizable variants需要不同模型与训练。",
    ],
    howToUse: [
      "先检查camera poses、units、background masks与view coverage，再训练representation。",
      "固定train/validation/test camera views，避免从训练相邻camera中挑最好看的视角。",
      "同时报告render quality、latency、GPU memory、representation size与失败区域。",
      "对几何用途另测depth/surface errors；将任何postprocessed mesh与原representation区分。",
    ],
    tuning: [
      "NeRF near/far和sampling density要覆盖scene；过稀会漏thin structures，更多sample增加cost。",
      "3DGS densification增加primitives与memory；监控held-out质量而非只追training image。",
      "Position encoding、regularization与appearance处理会影响过拟合，需与capture质量一起判断。",
    ],
    settings: [
      {
        name: "camera / scene contract",
        start: "校验poses、intrinsics、static scene与exposure差异。",
        adjust: "出现漂浮或重影先查camera/动态物体，再加representation容量。",
      },
      {
        name: "ray sampling / bounds",
        start: "near/far与scene尺度一致，记录samples per ray。",
        adjust: "薄结构和远处错误时分层检查sampling与view coverage。",
      },
      {
        name: "Gaussian count / density control",
        start: "遵守实现recipe并记录primitive数、memory与view metrics。",
        adjust: "过密仅改善train时检查overfitting；剪枝后重测thin structures。",
      },
    ],
    modifications: [
      "Dynamic fields、deformation models或4D representations可以处理时间变化，但需新的监督与评估。",
      "把semantic/feature fields接到rendering上支持查询，注意feature意义需要独立验证。",
    ],
    pitfalls: [
      "把photo-realistic render等同于准确mesh或真实材质。",
      "比较一个模型training views和另一个模型held-out views。",
    ],
    example:
      "Synthetic一条ray：front red α=.5、back blue α=.5、black background，weights=.5/.25/background .25，color=(.5,0,.25)。这个compositing片段不是NeRF或3DGS的完整训练器。",
    compareTo: [
      "camera-image-formation",
      "stereo-depth-geometry",
      "point-cloud-learning",
      "neural-networks",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "video-understanding",
    source: {
      label:
        "Bertasius et al.: Is Space-Time Attention All You Need for Video Understanding?",
      url: "https://arxiv.org/abs/2102.05095",
    },
    title: "Video Understanding：多看几帧，就理解动作了吗？",
    englishTitle: "Temporal Sampling, Video Models and Action Localization",
    summary:
      "从sampling span、frame order与attention成本理解video classification、temporal localization和long-video reasoning的区别。",
    intuition:
      "“打开门”和“关上门”可以包含几乎相同的画面，只是顺序不同。把每帧特征平均，会丢掉你真正要判断的方向与时间关系。",
    core: "输入video clips [T,H,W,C]与timestamps，输出clip labels、时间区间或video-conditioned text。2D CNN加temporal head、3D CNN、TCN/RNN与Video Transformer用不同方式处理时空信息。TimeSformer比较空间与时间attention分解；模型看到的真实时间范围由fps、stride与frames数量共同决定。",
    equation:
      "sample span=(T−1)×stride/fps; N=T×P; full attention pairs≈T²P²; divided pairs≈P T² + T P² (excluding special tokens)",
    mechanicsSteps: [
      "先区分clip classification、temporal action localization、object tracking与video QA；label是否包含事件起止时间决定head与metric。",
      "假设fps=30、取T=8帧、stride=4，sampled indices为0,4,…,28，首末采样中心相隔28/30≈.933秒；不是只看T这个数字就知道覆盖时长。",
      "Frame features可以平均作为简单baseline，但序列A→B与B→A平均相同。若任务依赖顺序，需要显式temporal modeling与order-sensitive evaluation。",
      "以224×224 image、16×16patch为例，每帧P=14²=196 patches；8帧共有N=1568 tokens（不计class token）。",
      "Full joint attention每head每layer有N²=2458624 pair positions。Divided attention的示意pair count为196×8²+8×196²=319872；这是pair数量，不是完整FLOPs或显存测量。",
      "3D convolution强调局部时空patterns，RNN/TCN处理序列features，Transformer可建更广关系；不同比较必须对齐sampled span、resolution与pretraining。",
      "Long video通常先clip sampling或hierarchical aggregation；稀疏采样可能跳过短事件，摘要或memory也可能丢掉关键细节。",
      "按原始video/subject/scene分割数据；同一video相邻clips不能伪装成独立测试。按action duration、camera motion和背景变化检查shortcut。",
    ],
    whenToUse: [
      "动作/行为识别、事件定位或需要顺序的视觉理解任务。",
      "已尝试single-frame或pooled-frame baseline，希望判断时间信息是否提供收益。",
      "优点是显式处理时序context，能区分静态外观相似但运动不同的事件。",
    ],
    limits: [
      "Sparse sampling会漏短事件；更多frames也可能仅增加重复背景。",
      "背景、拍摄设备或actor身份可能成为shortcut，clip accuracy无法证明理解动作机制。",
      "Long-video QA的正确答案还依赖检索coverage与语言generation，不能由video encoder alone保证。",
    ],
    howToUse: [
      "固定fps/timestamps和sample policy，保存实际采样frame indices。",
      "对比single-frame、mean pooling与temporal model，做time-shuffle/order-reversal诊断。",
      "按video/subject/scene split，报告不同持续时长与背景的表现。",
      "在目标硬件测完整decode、sampling、model和postprocessing latency，不只attention核心。",
    ],
    tuning: [
      "Frames与stride共同选择：增stride看得更长但时间分辨率更低。",
      "Patch size、spatial resolution与attention factorization影响token数，应先算shape再训练。",
      "Temporal localization threshold与window overlap影响重复检测和边界误差，需专门validation。",
    ],
    settings: [
      {
        name: "T / stride / fps",
        start: "记录如8帧、stride4、30fps对应.933秒采样span。",
        adjust: "短事件漏检先减stride或提高采样率；长依赖不足再扩大span。",
      },
      {
        name: "spatial-temporal model",
        start: "建立mean-pooled frame baseline，再加时序结构。",
        adjust: "shuffle不降性能时检查任务是否被静态shortcut解决。",
      },
      {
        name: "split / clip aggregation",
        start: "同video的所有clips归同一split，固定聚合规则。",
        adjust:
          "部署视频更长或multi-event时换任务与评价，而非直接平均所有预测。",
      },
    ],
    modifications: [
      "采用hierarchical或streaming memory处理长视频，逐阶段检查检索和信息丢失。",
      "结合audio、flow或tracked objects，但需测试缺失modality与异步时间戳。",
    ],
    pitfalls: [
      "把frames数量当真实时间长度，忽略采样stride。",
      "将同一原始video相邻clips分散进train/test。",
    ],
    example:
      "Synthetic采样：30fps、T=8、stride4覆盖首末中心.933秒。每帧196patches时N=1568；full attention pair positions约2458624，divided示意约319872。该计数不是TimeSformer实际latency或GPU memory benchmark。",
    compareTo: [
      "tcn",
      "rnn",
      "vit",
      "optical-flow-motion",
      "multi-object-tracking",
    ],
  },
  {
    category: "vision",
    level: "进阶",
    duration: "24 分钟",
    icon: "▧",
    id: "document-ai-ocr",
    source: {
      label:
        "Huang et al.: LayoutLMv3—Pre-training for Document AI with Unified Text and Image Masking",
      url: "https://arxiv.org/abs/2204.08387",
    },
    title: "Document AI：读到文字，为什么还不等于读懂表格？",
    englishTitle: "OCR, Layout, Reading Order and Structured Extraction",
    summary:
      "把text detection、recognition、layout与field extraction拆开，理解layout-aware模型、OCR-free模型和可核查输出。",
    intuition:
      "发票里出现三个相同金额，仅知道文字“100.00”还不够。它可能是单价、小计或税额；需要位置、表格结构和字段关系才能赋予含义。",
    core: "输入page images或PDF内容，输出text tokens、bounding boxes、reading order、tables及schema fields。OCR负责定位/识别文字，layout models连接文本、视觉与2D位置；LayoutLMv3将text和image masking及alignment用于pretraining。OCR-free image-to-sequence是另一类pipeline，并不自动免除hallucination、provenance和schema validation。",
    equation:
      "normalized box=(1000x1/W,1000y1/H,1000x2/W,1000y2/H); CER=(S+D+I)/N; field accuracy ≠ 1−CER",
    mechanicsSteps: [
      "先检查PDF有可用text layer还是纯scan，是否含旋转、扫描噪声、手写、多栏或table；直接抽text不一定保留正确reading order。",
      "Text detector找words/lines的regions，recognizer产生字符串和confidence；保持每个token与page/box的关联，不能只拼成无坐标纯文本。",
      "Synthetic页面W=1000、H=2000，box=(100,200,300,400)px，在0–1000坐标约定下得到(100,100,300,200)。x与y分母不同。",
      "Layout-aware encoder结合text tokens、2D boxes和image patches。Tokenization拆分一个word时，需按实现规则给subtokens继承位置并维持label alignment。",
      "Reading order、table cell grouping与key-value association把离散文本变成结构；两栏同一行的文字不一定应直接相邻。",
      "Toy reference string长度10，recognition含1substitution、1deletion、1insertion，则CER=(1+1+1)/10=.3。字段抽取可能仍正确，也可能一个数字错就导致关键字段完全错误。",
      "将model output写入明确schema：类型、日期、单位、required/optional、unknown与source span。Schema合法只证明格式，不证明内容来自页面。",
      "按document source/template/vendor切分，单独报OCR CER、layout/table质量、field exact match与unsupported extraction；保留人能回看的page区域。",
    ],
    whenToUse: [
      "发票、表格、论文、表单与档案的结构化提取，需要文字与layout共同支持。",
      "已有OCR但字段错配，或想比较OCR-based与image-to-sequence pipeline的错误来源。",
      "优点是保留provenance和分阶段指标，方便人工复核和局部替换组件。",
    ],
    limits: [
      "OCR错误会向下游传播，但端到端模型也可能生成页面不存在的文字或字段。",
      "长文档、多页表格、复杂reading order与语言/字体shift可超出训练分布。",
      "格式合法、confidence高或语言通顺，都不保证field value正确或有来源。",
    ],
    howToUse: [
      "抽样建立text、boxes、reading order、tables和最终fields的gold examples。",
      "对已有text-layer PDF和scans分别建立baseline，避免所有内容都重复OCR。",
      "检查coordinate normalization、subtoken label alignment与image transforms。",
      "保留page/box/source text，做schema validation和人工抽查；按template/source留出评价。",
    ],
    tuning: [
      "DPI与crop尺寸影响小字辨认及memory；先比较OCR error与完整pipeline latency。",
      "Max sequence length与page chunking会截断跨页关系，overlap需要防重复与冲突。",
      "字段confidence threshold应用validation校准，允许unknown而非强迫补齐。",
    ],
    settings: [
      {
        name: "image / OCR configuration",
        start: "记录DPI、rotation、language与text-layer使用规则。",
        adjust: "小字、旋转或手写失败时分开诊断detection/recognition。",
      },
      {
        name: "box coordinate convention",
        start: "核实现使用pixels还是0–1000 normalized boxes。",
        adjust: "模型看似忽略layout时检查x/y尺度、crop与token alignment。",
      },
      {
        name: "output schema / provenance",
        start: "明确字段类型、unknown、page与source box，保留原文字。",
        adjust: "格式正确但值不对时审查证据和association，不只改prompt。",
      },
    ],
    modifications: [
      "引入table structure recognition或跨页graph，将row/column关系显式建模。",
      "结合retrieval或Agent执行字段核对时，页面文字仍是待分析data，不能当成可信tool instructions。",
    ],
    pitfalls: [
      "用随机page split，让同模板甚至同document流入train/test。",
      "用language model“修正”OCR后删除原文，失去核对依据。",
    ],
    example:
      "Synthetic 1000×2000 page上box(100,200,300,400)归一化为(100,100,300,200)。10-character reference中S=D=I=1得到CER=.3；这不直接等于30%的fields错误，需单独检查field extraction。",
    compareTo: [
      "vision-language-models",
      "ctc-wav2vec",
      "retrieval-augmented-generation",
      "transformer",
    ],
  },
];
