# Atlas 逐课审阅记录

本轮清单：177 课。已逐章阅读并判断：52；结论/修改验证完成：51；尚待阅读：125。

状态只依据实际阅读正文、公式/例子、图表/实验和练习后手工写入的结论。自动清单导出、渲染检查或通用修复不代表章节已审阅。未改章节也记录保留理由；章节原有来源不等于本轮已逐条访问核验。

中文解释、English terminology；优先补推理缺口与可检验例子，保留已有有效内容。图示采用原创教学数据，区分观测、假设与因果主张。

## foundations

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [neural-networks · 神经网络从哪来](https://haoyunli.github.io/deep-learning-atlas/#/lesson/neural-networks) | 已修改并验证 | 正文解释线性层塌缩，已有可调2→2→1 forward；题目有代数证明，但尚无保持同一权重、去掉 activation 的表达能力对照。 | 补四个 XOR 点在 input/hidden space 的同权重对照，明确示例权重人为构造、没有训练。 | 数学不变量/有限差分通过；全站build通过；1440/375px控制操作、SVG文字≥13px、无裁切/重叠/横向溢出、无脚本错误；原创图截图已目视检查。 | — |
| [loss-functions · 损失函数定方向](https://haoyunli.github.io/deep-learning-atlas/#/lesson/loss-functions) | 已修改并验证 | loss/label粒度与CE接口说明准确，quiz有−log p数值；现有图只展示MSE/Huber，分类的logits→probability→loss→gradient链仍需脑补。 | 补3类CE联动读图，改变一个错误类logit，显示p与p−onehot梯度。 | 数学不变量/有限差分通过；全站build通过；1440/375px控制操作、SVG文字≥13px、无裁切/重叠/横向溢出、无脚本错误；原创图截图已目视检查。 | — |
| [backpropagation · 反向传播与局部敏感度](https://haoyunli.github.io/deep-learning-atlas/#/lesson/backpropagation) | 已修改并验证 | 已有单链数值、清零顺序与双层tanh训练图；责任分摊类比可能误导为因果归因，多路径相加只在文字提到。 | 改为局部敏感度解释；补共享参数双分支图与合计梯度。 | 数学不变量/有限差分通过；全站build通过；1440/375px控制操作、SVG文字≥13px、无裁切/重叠/横向溢出、无脚本错误；原创图截图已目视检查。 | [1](https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html) |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [gradient-descent · 梯度下降怎么走](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gradient-descent) | 已审阅 · 无实质补充需要 | 正文、练习与精确二次轨迹区分跨谷、振荡收敛、等幅及发散，稳定区间0<η<2已交代曲率条件，无需重复新增步长图。 | 保留当前内容 | θ更新与loss值手算核对；已有数值validator保留 | — |
| [adamw · AdamW 为什么好用](https://haoyunli.github.io/deep-learning-atlas/#/lesson/adamw) | 已审阅 · 无实质补充需要 | bias-corrected m/v、adaptive+ηλθ与L2不等价说清；固定四梯度toy用old θ收缩，m/v不受λ且明确真实g随θ变；恢复optimizer state与parameter groups有说明。 | 保留现有机制、数值实验与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |
| [regularization · 让模型学规律而非记答案](https://haoyunli.github.io/deep-learning-atlas/#/lesson/regularization) | 已审阅 · 无实质补充需要 | 训练/eval dropout与语义保持增强、early stop验证协议完整；ridge toy采用½λw²，导数(w−2)+λw和w*=2/(1+λ)一致，纵轴缩放已标，较小权重不保证泛化。 | 保留现有机制、数值实验与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |
| [model-evaluation · 评估模型到底会不会](https://haoyunli.github.io/deep-learning-atlas/#/lesson/model-evaluation) | 已审阅 · 无实质补充需要 | 主体/时间split与仅train fit preprocessing清楚，test选择污染、validation阈值和calibration/uncertainty均覆盖；新患者影像题匹配部署单位。 | 保留现有机制、数值实验与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |

## vision

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [cnn · 卷积为何懂图像](https://haoyunli.github.io/deep-learning-atlas/#/lesson/cnn) | 已审阅 · 无实质补充需要 | 跨相关kernel不翻转明确；4×4输入/2×2kernel→3×3窗口每项可手算，32/3/2/pad1→16的shape题正确；分割标签几何、stride损失与grid先验限定。 | 保留现有机制、数值实验与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |
| [resnet · 残差网络搭一条近路](https://haoyunli.github.io/deep-learning-atlas/#/lesson/resnet) | 已审阅 · 无实质补充需要 | identity/projection/add而非concat、dy/dx含I、激活依block版本说明；toy固定F和可调α不声称训练效果，向量数值含负修正并匹配x+αF。 | 保留现有机制、数值实验与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [rnn · 循环网络逐步读序列](https://haoyunli.github.io/deep-learning-atlas/#/lesson/rnn) | 已审阅 · 无实质补充需要 | 参数共享/BPTT/detach前向记忆与梯度窗口区分，bidirectional非causal；toy h=tanh(x+whprev)、h0=0和x[1,0,0,0]一致，饱和与跨样本state风险说明。 | 保留现有机制、数值实验与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |
| [lstm-gru · LSTM 与 GRU 的门](https://haoyunli.github.io/deep-learning-atlas/#/lesson/lstm-gru) | 已审阅 · 无实质补充需要 | c/h分路与GRU不同gate组织明确；toy cprev=.8、固定write=.15、o=.7逐步公式匹配，gate为直接可调教学值非真实学习；state边界与因果回放例具体。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [attention · 注意力是按需查找](https://haoyunli.github.io/deep-learning-atlas/#/lesson/attention) | 已审阅 · 无实质补充需要 | QKV/source、按key softmax、mask在softmax前、稳定softmax常数不变和未来token扰动测试明确；dense平方compute与Flash显存不物化区分，权重非完整因果解释。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [transformer · Transformer 的积木](https://haoyunli.github.io/deep-learning-atlas/#/lesson/transformer) | 已审阅 · 无实质补充需要 | attention跨token/FFN逐token、preNorm示意与originalencoderdecoder区分；4×4 mask行query列key、causal c≤r正确，token无position/no mask仅排列等变；L加倍score4倍题限定逻辑形状。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [encoder-models · Encoder 擅长读懂](https://haoyunli.github.io/deep-learning-atlas/#/lesson/encoder-models) | 已审阅 · 无实质补充需要 | bidirectional/MLM分类NER与retrieval目标分开，pooling不是任意句向量就有效；input truncation/similarity非校准概率、只看有效左右context的练习明确。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [decoder-models · Decoder 擅长续写](https://haoyunli.github.io/deep-learning-atlas/#/lesson/decoder-models) | 已审阅 · 无实质补充需要 | 输入[A,B,C]→[B,C,EOS]与内部shift不可重复解释完整；train各位置并行、inference自回归/cache不同，sampling不能修复事实问题，mask/stop/template有具体检查。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [encoder-decoder · Encoder–Decoder 做转换](https://haoyunli.github.io/deep-learning-atlas/#/lesson/encoder-decoder) | 已审阅 · 无实质补充需要 | [BOS,A,B]→[A,B,EOS]、decoder query/encoder KV与source/target长度分开；teacher forcing与真实生成条件不同，并要求真实autoregressive评估与忠实度。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## generative

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [autoencoder-vae · VAE 把数据放进连续空间](https://haoyunli.github.io/deep-learning-atlas/#/lesson/autoencoder-vae) | 已修改并验证 | ELBO公式、reparameterization和一维gaussianKL toy正确，KL/decoder collapse与异常score限制具体；tuning把ELBO下降写成loss改善方向，须分清符号。 | 明确最大化ELBO=最小化负ELBO；监控句改为负ELBO下降，不改正确概率公式。 | 完整正文/两题/lab及相关helper已核对；全站build通过；1440/375px关键文字、键盘range两端输出与页面溢出/脚本错误检查通过；桌面/手机截图已目视核对，手机图可横向滚动，说明换行完整。 | [1](https://arxiv.org/html/1312.6114v11) |
| [gan · GAN 用对抗学习生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gan) | 已审阅 · 无实质补充需要 | originalminimax与non-saturating G目标区别；固定sigmoidD/real2单样本loss计算与真实交替训练分开，低loss不保证分布逼近和mode覆盖，helper梯度/概率一致。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [diffusion · 扩散模型一步步去噪](https://haoyunli.github.io/deep-learning-atlas/#/lesson/diffusion) | 已审阅 · 无实质补充需要 | forward闭式x_t、ε/x0/v target与训练scheduler/推理sampler匹配、train步数≠sample步数；guidance的质量/覆盖tradeoff及fixed seed评估完整，细化DDPM/DDIM另有课程。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [gnn · 图神经网络在关系中学习](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gnn) | 已审阅 · 无实质补充需要 | message/update/readout、inductive/transductive与目标边泄漏清楚；toy同步oldstate mean self+neighbor，hop距离/target高亮正确，明示非标准symnormGCN。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [contrastive-learning · 对比学习让相似靠近](https://haoyunli.github.io/deep-learning-atlas/#/lesson/contrastive-learning) | 已审阅 · 无实质补充需要 | positive/false-negative/语义保留定义明确；lab选pairwise margin非InfoNCE，d+=.8→.64、m1.5负项与箭头/零梯度阈值一致，raw投影loss非下游质量。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [transfer-lora · 预训练模型怎么适配新任务](https://haoyunli.github.io/deep-learning-atlas/#/lesson/transfer-lora) | 已修改并验证 | shape A r×8/B8×r、16r参数、α/r和base冻结说明正确；toy Δy坐标未披露Ax/B数值，且只交adapter给optimizer遗漏新head可需训练。 | 给现有toy补Ax/B首行数值与Δy1=(1/r)ΣB1i(Ax)i来源；明确需学习的任务head显式纳入optimizer。 | 完整正文/两题/lab及相关helper已核对；全站build通过；1440/375px关键文字、键盘range两端输出与页面溢出/脚本错误检查通过；桌面/手机截图已目视核对，手机图可横向滚动，说明换行完整。 | [1](https://arxiv.org/html/2106.09685v2) |

## reinforcement

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [reinforcement-learning · 强化学习从反馈中决策](https://haoyunli.github.io/deep-learning-atlas/#/lesson/reinforcement-learning) | 已审阅 · 无实质补充需要 | state/action/longreturn与historical support边界具体；三步reward1,2,4 toy G=1+2γ+4γ²，finitegamma1有效且无训练曲线；训练探索return与eval return区分。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [mixture-of-experts · MoE 让专家分工](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mixture-of-experts) | 已审阅 · 无实质补充需要 | router topk输出、total/active/storage/真实compute分开，load/capacity/overflow与通信wait均覆盖；同token/hardware dense比较，expert领域分工不是硬编码标签。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [expectation-maximization · EM：猜隐藏变量，再更新参数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/expectation-maximization) | 已审阅 · 无实质补充需要 | fixedq Q最大化与observed likelihood不降前提及approx/GEM不同分清；mean-only toy固定π=.5/σ1、责任度加权均值与before/afterLL一致，明确仅一轮非全GMM。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [knn · kNN：看附近样本怎么说](https://haoyunli.github.io/deep-learning-atlas/#/lesson/knn) | 已审阅 · 无实质补充需要 | trainonly scale/库版本与欧氏metric正确，regression[2,4,9]uniform5；九点toy等比例轴、真实hypot排名、k奇数避免tie，circle为第k距离而非任意装饰。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [k-means · K-means：找 K 个代表点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/k-means) | 已审阅 · 无实质补充需要 | 平方距离目标→[0,2,10]均值4，inertia非天然类别证明；toy确定初始化oneLloyd assign/update/reassign同步、更新空簇保留原中心，equalaxis/硬分配与未收敛声明充分。 | 保留现有章内机制、可检查例子与两道区分性练习 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [gaussian-mixture-model · GMM：软分群的概率模型](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gaussian-mixture-model) | 已审阅 · 无实质补充需要 | 正文区分 mixture density 与 posterior responsibility，固定均值/权重的可调σ图按πN(x)算r，协方差奇异与held-out likelihood限制已明确；无需重复新增EM示例。 | 保留当前正文、可控例子与练习 | 全文、两道练习、lab renderer及相关计算helper已逐一核对；全目录桌面/手机渲染通过。 | — |
| [pca · PCA：保留最大变化方向](https://haoyunli.github.io/deep-learning-atlas/#/lesson/pca) | 已审阅 · 无实质补充需要 | 中心化、训练集fit后共享投影、SVD与方差/预测信息边界完整；8点对称零均值，n归一化投影方差及atan2主轴正确，图中两轴同尺度正交投影。 | 保留当前正文、可控例子与练习 | 全文、两道练习、lab renderer及相关计算helper已逐一核对；全目录桌面/手机渲染通过。 | — |
| [svm · SVM：把分类边界撑开](https://haoyunli.github.io/deep-learning-atlas/#/lesson/svm) | 已审阅 · 无实质补充需要 | 软间隔目标½\|\|w\|\|²+CΣhinge及支持向量范围明确；1D固定b=0以w∈[0,4]网格求解。核对C∈[.1,5]最优w≥.5，绘图margin上限不触发；黑圈只标hinge>0已披露。 | 保留当前正文、可控例子与练习 | 全文、两道练习、lab renderer及相关计算helper已逐一核对；全目录桌面/手机渲染通过。 | — |

## generative

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [energy-based-models · EBM：给状态打一个能量分数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/energy-based-models) | 已审阅 · 无实质补充需要 | 能量只定相对密度，Z、采样/负相位与score matching/NCE路线区别已交代；e²比值题抵消同一Z，扰动构象捷径例子和独立排序验证完整。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [infonce · InfoNCE：在候选里认出正样本](https://haoyunli.github.io/deep-learning-atlas/#/lesson/infonce) | 已审阅 · 无实质补充需要 | 分母含正例及负例，多正例概率和与逐正例平均已区分；4个固定similarity通过稳定softmax精确计算，温度不改变排序，题目ln3与false negatives正确。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [triplet-loss · Triplet：让正样本比负样本更近](https://haoyunli.github.io/deep-learning-atlas/#/lesson/triplet-loss) | 已审阅 · 待修改 | 平方距离lab的m>.8激活阈值、原文一般d定义及数值题正确；margin设置中“有效三元组过少时降低”方向反了：固定距离下降低m会减少active triplets。 | 改为适度增大margin或加强合理mining，保留所有违反/不稳定时减小margin的分支。 | 已完整读正文、练习及固定距离平方lab/helper；FaceNet§3.1公式与§3.2选择原则直接核对。 | [1](https://arxiv.org/html/1503.03832) |
| [simclr · SimCLR：同一图像的两种视角](https://haoyunli.github.io/deep-learning-atlas/#/lesson/simclr) | 已审阅 · 无实质补充需要 | 共享encoder+projector、2N视图排除自身后2N−2负例，原版无队列、probe取encoder输出已明确；4图例子6负例7候选正确。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [moco · MoCo：用队列保存更多对照](https://haoyunli.github.io/deep-learning-atlas/#/lesson/moco) | 已审阅 · 无实质补充需要 | query梯度、key停梯度/EMA和FIFO字典解耦正确，2/.9/4→2.2数值正确；过时键与false negative限制具体。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [clip · CLIP：让图片和文字相遇](https://haoyunli.github.io/deep-learning-atlas/#/lesson/clip) | 已审阅 · 无实质补充需要 | 归一化双塔与双向row/column CE、learned scale、候选prompt和校准限制完整；合成3×3矩阵仅画第1行精确softmax，4对图文[4,4]题正确。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [byol · BYOL：不靠负样本的自监督](https://haoyunli.github.io/deep-learning-atlas/#/lesson/byol) | 已审阅 · 无实质补充需要 | online独有predictor、target projector stop-gradient+EMA、交换视图方向明确，低MSE常数塌缩用方差/probe诊断，未把EMA本身当理论保证。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [barlow-twins · Barlow Twins：既一致，也少重复](https://haoyunli.github.io/deep-learning-atlas/#/lesson/barlow-twins) | 已审阅 · 无实质补充需要 | 跨视图按batch中心化/标准化相关矩阵，diag→1与offdiag→0目标正确，区别单视图协方差；小batch统计/下游局限和两道题覆盖关键误解。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [mae · MAE：遮住图像，再补回来](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mae) | 已审阅 · 无实质补充需要 | 原版encoder只看visible patches、decoder补mask并仅masked像素loss明确；196×.25=49例子正确，重建质量和下游可分性未混同。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [vicreg · VICReg：防止表示全部一样](https://haoyunli.github.io/deep-learning-atlas/#/lesson/vicreg) | 已审阅 · 无实质补充需要 | invariance、每路维度std下限、每路offdiag covariance三项明确；常数输出前后二项可零而variance触发题正确，统计形态不保证语义已交代。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [dino · DINO：让学生预测老师的视角](https://haoyunli.github.io/deep-learning-atlas/#/lesson/dino) | 已审阅 · 无实质补充需要 | teacher global/student global+local、cross-view CE、stop-gradient+EMA、centering和sharpening完整；注意力图不直接当分割结果，输出熵塌缩题有效。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [logistic-regression · 逻辑回归：简单而可靠的分类起点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/logistic-regression) | 已审阅 · 无实质补充需要 | logit/sigmoid/CE、inverse C、预处理训练内fit、重加权后校准与阈值拆开；固定b=−1/x=1.2图的(p−1)x梯度及ln3→.75题正确。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [random-forest · 随机森林：让很多树一起判断](https://haoyunli.github.io/deep-learning-atlas/#/lesson/random-forest) | 已审阅 · 无实质补充需要 | bootstrap+split随机feature、概率平均和多数票区别明确，0.2/.6/.9平均.567；OOB行级不可代表新个体题避免层级泄漏，特征重要性不冒充因果。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [supervised-contrastive · SupCon：同类样本都是正例](https://haoyunli.github.io/deep-learning-atlas/#/lesson/supervised-contrastive) | 已审阅 · 无实质补充需要 | 全positive log概率逐项平均且分母含所有除自身候选，粗类亚型和错标风险明确；缺正例batch题与标签[A,A,B,C]两正例题正确。 | 保留现有解释、例子与练习 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |

## vision

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [unet · U-Net：一边理解，一边找回位置](https://haoyunli.github.io/deep-learning-atlas/#/lesson/unet) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [nnunet · nnU-Net：让分割流水线自己适配](https://haoyunli.github.io/deep-learning-atlas/#/lesson/nnunet) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [unet-plus-plus · U-Net++：把跳接变成融合路径](https://haoyunli.github.io/deep-learning-atlas/#/lesson/unet-plus-plus) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [deeplabv3-plus · DeepLabv3+：看大范围，也修边界](https://haoyunli.github.io/deep-learning-atlas/#/lesson/deeplabv3-plus) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [vgg · VGG：用小卷积搭深网络](https://haoyunli.github.io/deep-learning-atlas/#/lesson/vgg) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [densenet · DenseNet：每层都能看到前面](https://haoyunli.github.io/deep-learning-atlas/#/lesson/densenet) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [efficientnet · EfficientNet：一起放大宽、深和分辨率](https://haoyunli.github.io/deep-learning-atlas/#/lesson/efficientnet) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [convnext · ConvNeXt：用现代训练配方重做 CNN](https://haoyunli.github.io/deep-learning-atlas/#/lesson/convnext) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [vit · ViT：把图像切成 token](https://haoyunli.github.io/deep-learning-atlas/#/lesson/vit) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [swin-transformer · Swin：窗口注意力也能跨窗交流](https://haoyunli.github.io/deep-learning-atlas/#/lesson/swin-transformer) | 待审阅 | 尚未逐章审阅 | — | — | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [bidirectional-rnn · 双向 RNN：前后文一起看](https://haoyunli.github.io/deep-learning-atlas/#/lesson/bidirectional-rnn) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [seq2seq · Seq2Seq：把一个序列变成另一个](https://haoyunli.github.io/deep-learning-atlas/#/lesson/seq2seq) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [tcn · TCN：用因果卷积读时间](https://haoyunli.github.io/deep-learning-atlas/#/lesson/tcn) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [word2vec · word2vec：词义来自邻居](https://haoyunli.github.io/deep-learning-atlas/#/lesson/word2vec) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [bert · BERT：遮住词，读懂整句](https://haoyunli.github.io/deep-learning-atlas/#/lesson/bert) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [roberta · RoBERTa：先把 BERT 训练充分](https://haoyunli.github.io/deep-learning-atlas/#/lesson/roberta) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [gpt-language-model · GPT 式 LM：预测下一个 token](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gpt-language-model) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [t5 · T5：所有语言任务都写成文本到文本](https://haoyunli.github.io/deep-learning-atlas/#/lesson/t5) | 待审阅 | 尚未逐章审阅 | — | — | — |

## vision

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [mobilenet-v2 · MobileNetV2：为设备预算设计卷积](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mobilenet-v2) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [mask-rcnn · Mask R-CNN：为每个物体单独画 mask](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mask-rcnn) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [detr · DETR：把目标检测当集合预测](https://haoyunli.github.io/deep-learning-atlas/#/lesson/detr) | 待审阅 | 尚未逐章审阅 | — | — | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [bart · BART：把弄乱的文本复原](https://haoyunli.github.io/deep-learning-atlas/#/lesson/bart) | 待审阅 | 尚未逐章审阅 | — | — | — |

## reinforcement

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [multi-armed-bandit · 先学会探索：多臂老虎机](https://haoyunli.github.io/deep-learning-atlas/#/lesson/multi-armed-bandit) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [q-learning · 用 Q 表学最优行动](https://haoyunli.github.io/deep-learning-atlas/#/lesson/q-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [sarsa · 按真实下一步更新：SARSA](https://haoyunli.github.io/deep-learning-atlas/#/lesson/sarsa) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [dqn · 让神经网络估 Q：DQN](https://haoyunli.github.io/deep-learning-atlas/#/lesson/dqn) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [double-dqn · 拆开选择与打分：Double DQN](https://haoyunli.github.io/deep-learning-atlas/#/lesson/double-dqn) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [dueling-dqn · 状态好坏与动作差别分开学](https://haoyunli.github.io/deep-learning-atlas/#/lesson/dueling-dqn) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [rainbow-dqn · 组合式 DQN：Rainbow](https://haoyunli.github.io/deep-learning-atlas/#/lesson/rainbow-dqn) | 已修改并验证 | 六组件组合与消融题准确；原版 Rainbow 的 replay priority 写成标量 TD error，混淆标准 PER 与 distributional KL loss。 | 改 KL priority 和设置说明；用回报分布建模消除分布式计算歧义。 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://arxiv.org/html/1710.02298) |
| [reinforce · 直接学动作概率：REINFORCE](https://haoyunli.github.io/deep-learning-atlas/#/lesson/reinforce) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [actor-critic · 一个行动，一个评分：Actor-Critic](https://haoyunli.github.io/deep-learning-atlas/#/lesson/actor-critic) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [trpo · 限制策略走太远：TRPO](https://haoyunli.github.io/deep-learning-atlas/#/lesson/trpo) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [ppo · 稳健更新策略：PPO](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ppo) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [ddpg · 连续动作的确定性策略：DDPG](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ddpg) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [td3 · 修正 DDPG 高估：TD3](https://haoyunli.github.io/deep-learning-atlas/#/lesson/td3) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [sac · 既拿高分也保留探索：SAC](https://haoyunli.github.io/deep-learning-atlas/#/lesson/sac) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [model-based-rl · 先想象再行动：Model-Based RL](https://haoyunli.github.io/deep-learning-atlas/#/lesson/model-based-rl) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [muzero · 在隐空间规划：MuZero](https://haoyunli.github.io/deep-learning-atlas/#/lesson/muzero) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [behavior-cloning · 先模仿专家：Behavior Cloning](https://haoyunli.github.io/deep-learning-atlas/#/lesson/behavior-cloning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [offline-rl · 只用已有轨迹：Offline RL](https://haoyunli.github.io/deep-learning-atlas/#/lesson/offline-rl) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [cql · 对数据外动作保持保守：CQL](https://haoyunli.github.io/deep-learning-atlas/#/lesson/cql) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [decision-transformer · 把轨迹当语言来建模](https://haoyunli.github.io/deep-learning-atlas/#/lesson/decision-transformer) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [reward-model · RM：把偏好变成可学习的分数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/reward-model) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [rlhf · RLHF：用人类偏好微调语言模型](https://haoyunli.github.io/deep-learning-atlas/#/lesson/rlhf) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [dpo · DPO：直接用偏好对训练](https://haoyunli.github.io/deep-learning-atlas/#/lesson/dpo) | 待审阅 | 尚未逐章审阅 | — | — | — |

## foundations

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [prediction-heads · Prediction head：最后一步怎么预测](https://haoyunli.github.io/deep-learning-atlas/#/lesson/prediction-heads) | 已审阅 · 无实质补充需要 | 已区分预测粒度、pooling、linear probe和attention head；题目核对[B,T,5]，可调类别数实际重算logits和softmax，当前无实质补充需要。 | 保留现有正文、lab与练习 | 正文、维度例子、两道题及renderer逻辑已核对；全目录1440/375px渲染与资源检查通过 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [attention-heads · Attention head：多视角读上下文](https://haoyunli.github.io/deep-learning-atlas/#/lesson/attention-heads) | 待审阅 | 尚未逐章审阅 | — | — | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [zero-shot-learning · Zero-shot：目标任务没有示例](https://haoyunli.github.io/deep-learning-atlas/#/lesson/zero-shot-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [few-shot-learning · Few-shot：少量示例怎么用](https://haoyunli.github.io/deep-learning-atlas/#/lesson/few-shot-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [in-context-learning · In-context learning：示例放在上下文](https://haoyunli.github.io/deep-learning-atlas/#/lesson/in-context-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [chain-of-thought-prompting · CoT：把中间步骤也作为提示](https://haoyunli.github.io/deep-learning-atlas/#/lesson/chain-of-thought-prompting) | 待审阅 | 尚未逐章审阅 | — | — | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [linear-probe · Linear probe：冻结特征后读答案](https://haoyunli.github.io/deep-learning-atlas/#/lesson/linear-probe) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [prototypical-networks · ProtoNet：每一类有一个中心](https://haoyunli.github.io/deep-learning-atlas/#/lesson/prototypical-networks) | 待审阅 | 尚未逐章审阅 | — | — | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [meta-learning-maml · MAML：学一个容易改的起点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/meta-learning-maml) | 待审阅 | 尚未逐章审阅 | — | — | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [cohort-design · Cohort：先定义谁能进入数据](https://haoyunli.github.io/deep-learning-atlas/#/lesson/cohort-design) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [data-leakage · 数据泄漏：模型偷看了答案](https://haoyunli.github.io/deep-learning-atlas/#/lesson/data-leakage) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [domain-shift · 分布变了，旧规律还可靠吗](https://haoyunli.github.io/deep-learning-atlas/#/lesson/domain-shift) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [external-validation · 外部验证：换个地方还能用吗](https://haoyunli.github.io/deep-learning-atlas/#/lesson/external-validation) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [calibration-uncertainty · 模型的 90% 真的有九成把握吗](https://haoyunli.github.io/deep-learning-atlas/#/lesson/calibration-uncertainty) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [class-imbalance · 少数类稀少时怎么学](https://haoyunli.github.io/deep-learning-atlas/#/lesson/class-imbalance) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [batch-normalization · BatchNorm：用同批样本校准通道](https://haoyunli.github.io/deep-learning-atlas/#/lesson/batch-normalization) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [layer-normalization · LayerNorm：每个 token 自己定标尺](https://haoyunli.github.io/deep-learning-atlas/#/lesson/layer-normalization) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [learning-rate-schedules · 学习率日程：什么时候迈大步](https://haoyunli.github.io/deep-learning-atlas/#/lesson/learning-rate-schedules) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [gradient-clipping · 梯度裁剪：限制一次更新前的冲击](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gradient-clipping) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [mixed-precision · 混合精度：把位数花在需要的地方](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mixed-precision) | 待审阅 | 尚未逐章审阅 | — | — | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [tokenization · Tokenization：文字怎样变成模型的单位](https://haoyunli.github.io/deep-learning-atlas/#/lesson/tokenization) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [positional-encoding · 位置编码：让注意力知道先后远近](https://haoyunli.github.io/deep-learning-atlas/#/lesson/positional-encoding) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [autoregressive-inference · 自回归解码：每次只决定下一个 token](https://haoyunli.github.io/deep-learning-atlas/#/lesson/autoregressive-inference) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [kv-cache · KV Cache：记住前缀算过的键和值](https://haoyunli.github.io/deep-learning-atlas/#/lesson/kv-cache) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [grouped-query-attention · GQA：多组 query 共享键和值](https://haoyunli.github.io/deep-learning-atlas/#/lesson/grouped-query-attention) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [retrieval-augmented-generation · RAG：先找证据，再组织答案](https://haoyunli.github.io/deep-learning-atlas/#/lesson/retrieval-augmented-generation) | 待审阅 | 尚未逐章审阅 | — | — | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [language-model-evaluation · 语言模型评估：预测得好与回答得好](https://haoyunli.github.io/deep-learning-atlas/#/lesson/language-model-evaluation) | 待审阅 | 尚未逐章审阅 | — | — | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [xgboost · XGBoost：每棵树修正当前错误](https://haoyunli.github.io/deep-learning-atlas/#/lesson/xgboost) | 待审阅 | 尚未逐章审阅 | — | — | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [gcn · GCN：按图连接混合邻居信息](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gcn) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [graphsage · GraphSAGE：采样邻居，学会处理新节点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/graphsage) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [gat · GAT：让邻居消息拥有不同权重](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gat) | 待审阅 | 尚未逐章审阅 | — | — | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [time-series-forecasting · 时间序列预测：站在过去预测未来](https://haoyunli.github.io/deep-learning-atlas/#/lesson/time-series-forecasting) | 待审阅 | 尚未逐章审阅 | — | — | — |

## generative

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [ddpm · DDPM：从已知噪声学会逐步生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ddpm) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [ddim · DDIM：用另一条路径更快地去噪](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ddim) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [latent-diffusion · Latent Diffusion：在压缩表示里生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/latent-diffusion) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [flow-matching · Flow Matching：学习把噪声运向数据的速度](https://haoyunli.github.io/deep-learning-atlas/#/lesson/flow-matching) | 待审阅 | 尚未逐章审阅 | — | — | — |

## reinforcement

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [off-policy-evaluation · OPE：用旧策略的日志估计新策略价值](https://haoyunli.github.io/deep-learning-atlas/#/lesson/off-policy-evaluation) | 待审阅 | 尚未逐章审阅 | — | — | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [state-space-models · SSM 与 S4：把长序列压进连续状态](https://haoyunli.github.io/deep-learning-atlas/#/lesson/state-space-models) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [mamba · Mamba：让状态更新由当前内容决定](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mamba) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [rwkv · RWKV：并行训练，循环生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/rwkv) | 待审阅 | 尚未逐章审阅 | — | — | — |

## vision

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [faster-rcnn-yolo · Faster R-CNN 与 YOLO：两条检测流水线](https://haoyunli.github.io/deep-learning-atlas/#/lesson/faster-rcnn-yolo) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [segment-anything · SAM：用 prompt 指出要分割什么](https://haoyunli.github.io/deep-learning-atlas/#/lesson/segment-anything) | 待审阅 | 尚未逐章审阅 | — | — | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [vision-language-models · VLM 与 Cross-Attention：让图像进入语言模型](https://haoyunli.github.io/deep-learning-atlas/#/lesson/vision-language-models) | 待审阅 | 尚未逐章审阅 | — | — | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [ctc-wav2vec · CTC 与 wav2vec 2.0：从声音到文字](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ctc-wav2vec) | 已修改并验证 | 原文要求去重目标标签，会错误删除 ll 等重复字符；blank 的路径折叠顺序需明确。 | 改为 T≥U+相邻重复对数；补 ll 的2/3帧对照并改为可计算练习。 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://www.cs.toronto.edu/~graves/icml_2006.pdf) |
| [whisper · Whisper：把 ASR 变成多任务序列生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/whisper) | 待审阅 | 尚未逐章审阅 | — | — | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [two-tower-retrieval · 矩阵分解、负采样与双塔召回](https://haoyunli.github.io/deep-learning-atlas/#/lesson/two-tower-retrieval) | 待审阅 | 尚未逐章审阅 | — | — | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [matrix-factorization · 矩阵分解：推荐系统的可解释坐标基线](https://haoyunli.github.io/deep-learning-atlas/#/lesson/matrix-factorization) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [learning-to-rank · Learning to Rank：从候选到有用顺序](https://haoyunli.github.io/deep-learning-atlas/#/lesson/learning-to-rank) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [survival-analysis · Kaplan–Meier、Cox 与 DeepSurv：有删失的时间预测](https://haoyunli.github.io/deep-learning-atlas/#/lesson/survival-analysis) | 待审阅 | 尚未逐章审阅 | — | — | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [deep-ensembles · Deep Ensembles：用多个解表达模型不确定性](https://haoyunli.github.io/deep-learning-atlas/#/lesson/deep-ensembles) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [conformal-selective-prediction · Conformal、拒答与 OOD：知道何时不确定](https://haoyunli.github.io/deep-learning-atlas/#/lesson/conformal-selective-prediction) | 已修改并验证 | s=1−p 的例子却称加入低概率标签，筛选方向反了；有限样本分位数缺 k>n 的全集情况，单次coverage降低不能直接证明交换性破坏。 | 明确 p≥1−q̂，补三类集合计算及 +∞ 边界；校准/域变化解释与练习同步修正。 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://arxiv.org/html/2107.07511) |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [causal-treatment-effects · DAG、Propensity 与 Treatment Effect：从预测到干预](https://haoyunli.github.io/deep-learning-atlas/#/lesson/causal-treatment-effects) | 待审阅 | 尚未逐章审阅 | — | — | — |

## reinforcement

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [imitation-learning · Behavior Cloning、DAgger 与 GAIL：从示范学策略](https://haoyunli.github.io/deep-learning-atlas/#/lesson/imitation-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [safe-rl-pomdp · POMDP 与 Safe RL：看不全时仍守约束](https://haoyunli.github.io/deep-learning-atlas/#/lesson/safe-rl-pomdp) | 待审阅 | 尚未逐章审阅 | — | — | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [quantization · 量化：把浮点张量映射到低比特整数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/quantization) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [distillation-pruning · 蒸馏与剪枝：把容量换成更小的计算图](https://haoyunli.github.io/deep-learning-atlas/#/lesson/distillation-pruning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [model-serving-monitoring · 导出、服务与监控：让训练结果在真实系统中成立](https://haoyunli.github.io/deep-learning-atlas/#/lesson/model-serving-monitoring) | 待审阅 | 尚未逐章审阅 | — | — | — |

## adaptation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [episodic-meta-learning · Episodic Meta-Learning：划分 Support Set 与 Query Set](https://haoyunli.github.io/deep-learning-atlas/#/lesson/episodic-meta-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [fomaml-reptile · FOMAML 与 Reptile：省掉二阶导数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/fomaml-reptile) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [matching-networks · Matching Networks：让 query 注意支持样本](https://haoyunli.github.io/deep-learning-atlas/#/lesson/matching-networks) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [relation-networks · Relation Networks：把距离函数也学出来](https://haoyunli.github.io/deep-learning-atlas/#/lesson/relation-networks) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [siamese-triplet · Siamese Networks 与 Triplet Loss：先学会比较](https://haoyunli.github.io/deep-learning-atlas/#/lesson/siamese-triplet) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [meta-sgd-anil · Meta-SGD 与 ANIL：学更新规则或只改 head](https://haoyunli.github.io/deep-learning-atlas/#/lesson/meta-sgd-anil) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [learned-optimizers · Learned Optimizer：让网络提出更新量](https://haoyunli.github.io/deep-learning-atlas/#/lesson/learned-optimizers) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [hypernetworks-meta-gradients · Hypernetworks 与 Meta-Gradient：参数也可以由模型产生](https://haoyunli.github.io/deep-learning-atlas/#/lesson/hypernetworks-meta-gradients) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [memory-augmented-meta-learning · Memory-Augmented Meta-Learning：把新标签写进外部记忆](https://haoyunli.github.io/deep-learning-atlas/#/lesson/memory-augmented-meta-learning) | 已修改并验证 | 当前 xₜ 与延迟 yₜ₋₁ 错配，破坏 one-shot 标签绑定；正文的临时memory/session边界其余正确。 | 绑定缓存 xₜ₋₁ 与 yₜ₋₁；补 A/B 三时刻例子与时间配对题。 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://arxiv.org/html/1605.06065) |
| [meta-reinforcement-learning · Meta-RL：让 agent 学会快速探索新任务](https://haoyunli.github.io/deep-learning-atlas/#/lesson/meta-reinforcement-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [cross-domain-few-shot · Cross-Domain Few-Shot：新类别还来自新领域](https://haoyunli.github.io/deep-learning-atlas/#/lesson/cross-domain-few-shot) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [transfer-learning-strategies · Transfer Learning：Freeze、Fine-Tune 还是 Train from Scratch](https://haoyunli.github.io/deep-learning-atlas/#/lesson/transfer-learning-strategies) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [domain-adaptation-dann · DANN：让特征能做任务却难分领域](https://haoyunli.github.io/deep-learning-atlas/#/lesson/domain-adaptation-dann) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [domain-generalization-irm · Domain Generalization 与 IRM：目标域不可见怎么办](https://haoyunli.github.io/deep-learning-atlas/#/lesson/domain-generalization-irm) | 已修改并验证 | 公式混合原始 IRM 的可优化 classifier 和 IRMv1 固定标量 w=1；环境/因果限制其余准确。 | 分清两种目标，改为只优化 Φ 的 IRMv1 方程；题目检查固定求导点。 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://arxiv.org/html/1907.02893) |
| [continual-learning · Continual Learning：在学新任务时别忘旧任务](https://haoyunli.github.io/deep-learning-atlas/#/lesson/continual-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [active-learning · Active Learning：下一笔标注花在哪里](https://haoyunli.github.io/deep-learning-atlas/#/lesson/active-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [multi-task-learning · Multi-Task Learning：共享什么，冲突怎么办](https://haoyunli.github.io/deep-learning-atlas/#/lesson/multi-task-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [automl-hpo-nas · AutoML：HPO、Hypergradient 与 NAS](https://haoyunli.github.io/deep-learning-atlas/#/lesson/automl-hpo-nas) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [curriculum-self-paced · Curriculum 与 Self-Paced Learning：先学什么](https://haoyunli.github.io/deep-learning-atlas/#/lesson/curriculum-self-paced) | 已修改并验证 | 章节正确区分预设 curriculum 与按当前loss筛选 self-paced、尾部能力风险；引用 arXiv 指向无关论文。 | 替换为 Bengio 等 Curriculum Learning 的准确 DOI；保留正文与练习。 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://doi.org/10.1145/1553374.1553380) |
| [federated-learning · Federated Learning 与 FedAvg：数据不集中时怎样共同训练](https://haoyunli.github.io/deep-learning-atlas/#/lesson/federated-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [test-time-adaptation · Test-Time Adaptation 与 TENT：模型上线后还能改什么](https://haoyunli.github.io/deep-learning-atlas/#/lesson/test-time-adaptation) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [semi-supervised-self-training · Semi-Supervised Learning 与 Self-Training：使用无标签数据](https://haoyunli.github.io/deep-learning-atlas/#/lesson/semi-supervised-self-training) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [online-learning-drift · Online Learning 与 Concept Drift：数据流里持续更新](https://haoyunli.github.io/deep-learning-atlas/#/lesson/online-learning-drift) | 已修改并验证 | prequential评估、监督延迟和漂移类型边界清楚；概念漂移综述引用 arXiv 指向无关论文。 | 替换为 Gama 等2014综述 DOI；保留已有机制与题目。 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://doi.org/10.1145/2523813) |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [count-likelihoods · Count Likelihood：先决定观测是怎样产生的](https://haoyunli.github.io/deep-learning-atlas/#/lesson/count-likelihoods) | 待审阅 | 尚未逐章审阅 | — | — | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [pseudobulk-hierarchy · Pseudobulk：把 cell evidence 放回 donor 层级](https://haoyunli.github.io/deep-learning-atlas/#/lesson/pseudobulk-hierarchy) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [nested-group-validation · Nested Group CV：评估整套选择流程](https://haoyunli.github.io/deep-learning-atlas/#/lesson/nested-group-validation) | 待审阅 | 尚未逐章审阅 | — | — | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [elastic-net · Elastic Net：相关 features 多、donors 少时先做稳基线](https://haoyunli.github.io/deep-learning-atlas/#/lesson/elastic-net) | 待审阅 | 尚未逐章审阅 | — | — | — |

## generative

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [scvi · scVI：用 Count VAE 分开 latent state 与测量条件](https://haoyunli.github.io/deep-learning-atlas/#/lesson/scvi) | 待审阅 | 尚未逐章审阅 | — | — | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [spatial-assignment · Spatial Assignment：先分清 matching、segmentation 与 annotation](https://haoyunli.github.io/deep-learning-atlas/#/lesson/spatial-assignment) | 待审阅 | 尚未逐章审阅 | — | — | — |
| [optimal-transport · Optimal Transport：同时分配，而不是各自找最近点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/optimal-transport) | 待审阅 | 尚未逐章审阅 | — | — | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 计划或已做修改 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- |
| [multiple-instance-learning · MIL：只有 donor 标签，怎样利用许多 cells 或 patches](https://haoyunli.github.io/deep-learning-atlas/#/lesson/multiple-instance-learning) | 待审阅 | 尚未逐章审阅 | — | — | — |
