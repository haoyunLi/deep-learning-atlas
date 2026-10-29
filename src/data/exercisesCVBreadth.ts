import type { Exercise } from "./exerciseTypes";

export const cvBreadthExercises: Record<string, Exercise[]> = {
  "camera-image-formation": [
    {
      id: "camera-image-formation-mechanism",
      kind: "mechanism",
      question:
        "在无 distortion 的 camera 中，fx=800、cx=320、Xc=1、Zc=5，u 是多少？",
      options: ["160", "320", "480", "800"],
      answer: 2,
      explanation:
        "u=800×(1/5)+320=480 pixels。X/Z 是 normalized coordinate；不能把 metres 直接加到 pixels。",
    },
    {
      id: "camera-image-formation-decision",
      kind: "decision",
      question: "把图缩成一半用于 stereo，最先保证什么？",
      options: [
        "只改输入 tensor，K 不变",
        "同步缩放 intrinsics 与标注，再核 disparity 的 pixel 单位",
        "把 network 加深来吸收坐标误差",
      ],
      answer: 1,
      explanation:
        "Depth=fB/d 要求 f 与 disparity 使用同一分辨率的 pixel 单位。已知几何变换应显式处理。",
    },
  ],
  "local-features-matching": [
    {
      id: "local-features-matching-mechanism",
      kind: "mechanism",
      question: "最近与次近 descriptor distance 为 .7 与 .8，τ=.75 时怎样？",
      options: [
        "通过，因为 .7<.75",
        "拒绝，因为 .7/.8=.875>.75",
        "必然正确，因为最近邻唯一",
      ],
      answer: 1,
      explanation:
        "Ratio test 比较 d1/d2，而非 d1 与 τ。它在检查第一候选是否明显优于第二候选。",
    },
    {
      id: "local-features-matching-decision",
      kind: "decision",
      question: "大量漂亮连线，但 registration 失败，优先检查什么？",
      options: [
        "只增加 keypoint 数",
        "descriptor metric、重复纹理和几何模型是否正确",
        "只把输出图颜色改清晰",
      ],
      answer: 1,
      explanation:
        "Matching coverage、descriptor ambiguity 与 scene geometry 分别限制最终变换。局部相似不等于几何一致。",
    },
  ],
  "registration-ransac": [
    {
      id: "registration-ransac-mechanism",
      kind: "mechanism",
      question: "w=.5、每次抽4个matches，一次全为inliers的概率是多少？",
      options: [".5", ".25", ".0625", ".99"],
      answer: 2,
      explanation:
        "独立模型下 w^s=.5⁴=.0625。99% 是多次抽样至少一次成功的目标，不是单次成功率。",
    },
    {
      id: "registration-ransac-decision",
      kind: "decision",
      question: "RANSAC inliers很多，但组织边界仍错位，优先做什么？",
      options: [
        "只把confidence提高到1",
        "查inlier覆盖、held-out landmarks与是否存在非刚性形变",
        "把所有outliers强行改成inliers",
      ],
      answer: 1,
      explanation:
        "Consensus只说明某种模型解释一部分matches。模型假设与空间覆盖决定它能否支持全图registration。",
    },
  ],
  "detection-metrics-nms": [
    {
      id: "detection-metrics-nms-mechanism",
      kind: "mechanism",
      question:
        "同类A/B的IoU=.391，A分数更高。NMS threshold从.3提高到.5会怎样？",
      options: ["从只留A变成两者都留", "从两者都留变成只留A", "IoU也自动提高"],
      answer: 0,
      explanation:
        "Greedy NMS抑制与已保留框重叠超过threshold的候选。提高threshold放宽去重，geometry本身没变。",
    },
    {
      id: "detection-metrics-nms-decision",
      kind: "decision",
      question: "同一个GT周围有三个合格预测框，评价时能算三个TP吗？",
      options: [
        "能，三个框都看到了对象",
        "通常不能，一对一matching只允许一个TP，重复可算FP",
        "只要score高就都算TP",
      ],
      answer: 1,
      explanation:
        "Detection metric衡量是否找全独立对象。重复预测不应反复获得同一对象的recall奖励，具体ignore/crowd规则按evaluator。",
    },
  ],
  "segmentation-task-metrics": [
    {
      id: "segmentation-task-metrics-mechanism",
      kind: "mechanism",
      question:
        "两个GT objects被合成一个mask，但foreground pixels完全正确，能得出什么？",
      options: [
        "Instance segmentation也必然完美",
        "Foreground Dice可以为1，但instance identity仍错误",
        "所有metric都必须为0",
      ],
      answer: 1,
      explanation:
        "Pixel foreground metric忽略同类objects之间的ID。Merge/split需要instance或panoptic层级评价。",
    },
    {
      id: "segmentation-task-metrics-decision",
      kind: "decision",
      question: "要用显微图统计细胞数量，优先补哪类评价？",
      options: [
        "只看semantic accuracy",
        "Instance matching、merge/split和count bias",
        "只看训练loss",
      ],
      answer: 1,
      explanation:
        "Counting依赖独立instance，而不是单纯foreground面积。还应按touching程度和目标大小分层。",
    },
  ],
  "optical-flow-motion": [
    {
      id: "optical-flow-motion-mechanism",
      kind: "mechanism",
      question: "Ix=1、Iy=0、It=−2时，brightness equation告诉我们什么？",
      options: ["u=2且v=0", "u=2，但v仍未确定", "u和v都等于2"],
      answer: 1,
      explanation:
        "方程为u−2=0，没有关于v的约束。额外邻域、时间或learned prior才能补足信息。",
    },
    {
      id: "optical-flow-motion-decision",
      kind: "decision",
      question: "把半分辨率flow恢复原图，除了resize还应做什么？",
      options: [
        "保持u/v数值完全不变",
        "按空间缩放比例同步放大u/v，并核方向与units",
        "只调颜色轮",
      ],
      answer: 1,
      explanation:
        "Flow values是pixels displacement；图像空间变大时同一运动的pixel数也变大。",
    },
  ],
  "multi-object-tracking": [
    {
      id: "multi-object-tracking-mechanism",
      kind: "mechanism",
      question:
        "Cost=[[.10,.20],[.11,.90]]，one-to-one matching的较低总cost是多少？",
      options: ["1.00", ".31", ".21"],
      answer: 1,
      explanation:
        "可行完整assignments只有diagonal=.10+.90=1.00和cross=.20+.11=.31。.21会复用同一个detection，不满足one-to-one。",
    },
    {
      id: "multi-object-tracking-decision",
      kind: "decision",
      question: "检测AP高，但人交叉后经常换ID，优先改查哪层？",
      options: [
        "association、appearance/motion gate与ID指标",
        "只增加class数量",
        "只看每帧box数量",
      ],
      answer: 0,
      explanation:
        "单帧AP不测身份连续性。应查看交叉前后cost、gate及match记录，同时检查漏检。",
    },
  ],
  "stereo-depth-geometry": [
    {
      id: "stereo-depth-geometry-mechanism",
      kind: "mechanism",
      question: "f=800px、B=.1m、d=20px，depth是多少？",
      options: [".4m", "2m", "4m", "160m"],
      answer: 2,
      explanation: "Z=fB/d=80/20=4m。f与d必须处在同一image pixel scale。",
    },
    {
      id: "stereo-depth-geometry-decision",
      kind: "decision",
      question: "远处depth噪声特别大，最合理的解释之一是什么？",
      options: [
        "disparity越小，同样pixel误差对depth越敏感",
        "远处目标必然更亮",
        "只要网络输出dense就不可能有误差",
      ],
      answer: 0,
      explanation:
        "|δZ|≈fB|δd|/d²。小disparity使depth误差被放大，还需考虑matching和calibration。",
    },
  ],
  "point-cloud-learning": [
    {
      id: "point-cloud-learning-mechanism",
      kind: "mechanism",
      question: "h(x)=[x,x²]、points=[1,2,3]，channel-wise max是多少？",
      options: ["[6,14]", "[2,14/3]", "[3,9]"],
      answer: 2,
      explanation:
        "每个feature channel分别取max。换row顺序不改变这个结果，但换点的坐标可能改变。",
    },
    {
      id: "point-cloud-learning-decision",
      kind: "decision",
      question: "PointNet通过permutation测试后，能否认为已解决rotation泛化？",
      options: [
        "能，两者是同一种变化",
        "不能；point顺序与坐标旋转是不同变换",
        "只需更多max pooling即可",
      ],
      answer: 1,
      explanation:
        "Permutation改变输入排列；rotation改变每个point的coordinates。后者需要合适设计、augmentation或额外假设。",
    },
  ],
  "nerf-gaussian-splatting": [
    {
      id: "nerf-gaussian-splatting-mechanism",
      kind: "mechanism",
      question: "前红后蓝、两者α=.5、黑背景，合成颜色是多少？",
      options: ["(.5,0,.5)", "(.5,0,.25)", "(.25,0,.5)"],
      answer: 1,
      explanation:
        "第二层还要乘前层留下的transmittance=.5，因此blue contribution=.5×.5=.25。剩余.25落到black background。",
    },
    {
      id: "nerf-gaussian-splatting-decision",
      kind: "decision",
      question: "Novel-view照片很逼真，能否直接宣称metric surface准确？",
      options: [
        "能，PSNR高已经足够",
        "不能，需独立depth/geometry验证",
        "只要Gaussian数量足够就能",
      ],
      answer: 1,
      explanation:
        "图像可由多种几何/appearance组合解释。Photometric quality和metric surface accuracy是不同结论。",
    },
  ],
  "video-understanding": [
    {
      id: "video-understanding-mechanism",
      kind: "mechanism",
      question: "30fps视频取8帧、stride4，首末采样中心间隔是多少？",
      options: ["8/30≈.267秒", "28/30≈.933秒", "32秒"],
      answer: 1,
      explanation:
        "索引0,4,8,12,16,20,24,28。首末相隔(T−1)×stride=28frames；不含额外定义的clip边界。",
    },
    {
      id: "video-understanding-decision",
      kind: "decision",
      question: "打乱frame顺序后动作分类几乎不降，应该怎样解释？",
      options: [
        "已经证明模型理解顺序",
        "可能依赖静态背景/外观，应做temporal与shortcut诊断",
        "必须立即加大模型直到训练满分",
      ],
      answer: 1,
      explanation:
        "顺序无关可能是任务确实可静态识别，也可能是shortcut。需要按action类型和背景做对照，而非自动宣称temporal reasoning。",
    },
  ],
  "document-ai-ocr": [
    {
      id: "document-ai-ocr-mechanism",
      kind: "mechanism",
      question:
        "W=1000,H=2000，pixel box=(100,200,300,400)，0–1000归一化box是什么？",
      options: ["(100,200,300,400)", "(100,100,300,200)", "(50,100,150,200)"],
      answer: 1,
      explanation:
        "x除W再乘1000；y除H再乘1000。宽高不同不能用同一个scale处理全部coordinates。",
    },
    {
      id: "document-ai-ocr-decision",
      kind: "decision",
      question: "模型返回合法JSON，但金额在页面中找不到，最先怎么处理？",
      options: [
        "因为schema合法就接受",
        "保留unknown或复核，并要求能定位到page/source span的证据",
        "删除原OCR避免冲突",
      ],
      answer: 1,
      explanation:
        "Schema validation只验证结构。内容真实性需要页面证据，错误“补全”不应替代缺失事实。",
    },
  ],
};
