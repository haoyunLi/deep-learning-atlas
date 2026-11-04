# Atlas 逐课审阅记录

更新：2026-10-06。本轮清单：177 课；逐章审阅并形成取舍：177/177；尚待阅读：0。独立审计实际通读全部 177 章，执行者完整通读 133 章，并读取全部独立逐章判断、与当前代码对账。两站合计 357 章均有实质审阅结论。

独立报告与主线 dc91cb236e6a4540aebfbd1aaa17c8b76e6ace57 对账后，本轮必要科学/公式修正已落实。保留现有有效例子；额外图、互动、诊断题属可选后续增强。下表逐章记录依据、理由与取舍。本轮待浏览器核验的修改：0 章。运行授权恢复后已完成当前版本两站714个桌面/手机页面检查，以及32个最后一批修正/控件检查；无页面错误、失败请求或页面横向溢出。科学审阅覆盖与浏览器渲染验证分别计数。

自动清单导出或全目录渲染不代表科学审阅。章节原有来源及独立审计引用不等于执行者本轮逐条访问；最后一列仅保留实际核验记录。中文解释、English terminology；原创教学数据区分观测、假设与因果主张。

本轮全站 build、TypeScript 与内容/计算 validators 通过。Meta-learning 的46道题保持ID、四个不同选项与确定性排列，正确位置分布12/12/11/11；除IRM答案精度修正外保持正确答案文本，八题干扰项改为相关错误选项。新文字已通过当前版本桌面/手机渲染检查；triplet控制、TCN R=29和PPO分支也重新通过定向浏览器检查。

## foundations

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [neural-networks · 神经网络从哪来](https://haoyunli.github.io/deep-learning-atlas/#/lesson/neural-networks) | 已修改并验证 | 正文解释线性层塌缩，已有可调2→2→1 forward；题目有代数证明，但尚无保持同一权重、去掉 activation 的表达能力对照。 | 补四个 XOR 点在 input/hidden space 的同权重对照，明确示例权重人为构造、没有训练。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：2→2→1 可重算前传、ReLU 截断、affine 合并测验已经很好；新增对照图也已核对计算与接入 | 数学不变量/有限差分通过；全站build通过；1440/375px控制操作、SVG文字≥13px、无裁切/重叠/横向溢出、无脚本错误；原创图截图已目视检查。 | — |
| [loss-functions · 损失函数定方向](https://haoyunli.github.io/deep-learning-atlas/#/lesson/loss-functions) | 已修改并验证 | loss/label粒度与CE接口说明准确，quiz有−log p数值；现有图只展示MSE/Huber，分类的logits→probability→loss→gradient链仍需脑补。 | 补3类CE联动读图，改变一个错误类logit，显示p与p−onehot梯度。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：MSE/Huber 数值曲线与梯度、CE 概率测验值得保留；新增对照图也已核对计算与接入 | 数学不变量/有限差分通过；全站build通过；1440/375px控制操作、SVG文字≥13px、无裁切/重叠/横向溢出、无脚本错误；原创图截图已目视检查。 | — |
| [backpropagation · 反向传播与局部敏感度](https://haoyunli.github.io/deep-learning-atlas/#/lesson/backpropagation) | 已修改并验证 | 已有单链数值、清零顺序与双层tanh训练图；责任分摊类比可能误导为因果归因，多路径相加只在文字提到。 | 改为局部敏感度解释；补共享参数双分支图与合计梯度。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：单路径链式法则和最新两层 tanh 训练、饱和几何、同时 SGD、frozen-gradient loss slice 均已覆盖；新增对照图也已核对计算与接入 | 数学不变量/有限差分通过；全站build通过；1440/375px控制操作、SVG文字≥13px、无裁切/重叠/横向溢出、无脚本错误；原创图截图已目视检查。 | [1](https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html) |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [gradient-descent · 梯度下降怎么走](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gradient-descent) | 保留现有内容 · 可选增强已取舍 | 正文、练习与精确二次轨迹区分跨谷、振荡收敛、等幅及发散，稳定区间0<η<2已交代曲率条件，无需重复新增步长图。 | 保留当前内容<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：一维二次函数真实三步轨迹，η=1、2 和发散边界均已解释 | θ更新与loss值手算核对；已有数值validator保留 | — |
| [adamw · AdamW 为什么好用](https://haoyunli.github.io/deep-learning-atlas/#/lesson/adamw) | 保留现有内容 · 可选增强已取舍 | bias-corrected m/v、adaptive+ηλθ与L2不等价说清；固定四梯度toy用old θ收缩，m/v不受λ且明确真实g随θ变；恢复optimizer state与parameter groups有说明。 | 保留现有机制、数值实验与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：四个固定梯度真实计算 m̂/v̂、自适应更新与 decay，并明确与 L2 不等价 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |
| [regularization · 让模型学规律而非记答案](https://haoyunli.github.io/deep-learning-atlas/#/lesson/regularization) | 保留现有内容 · 可选增强已取舍 | 训练/eval dropout与语义保持增强、early stop验证协议完整；ridge toy采用½λw²，导数(w−2)+λw和w*=2/(1+λ)一致，纵轴缩放已标，较小权重不保证泛化。 | 保留现有机制、数值实验与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：Ridge 解析最优 w*=2/(1+λ)、与 AdamW 分离、dropout 期望测验已具备 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |
| [model-evaluation · 评估模型到底会不会](https://haoyunli.github.io/deep-learning-atlas/#/lesson/model-evaluation) | 保留现有内容 · 可选增强已取舍 | 主体/时间split与仅train fit preprocessing清楚，test选择污染、validation阈值和calibration/uncertainty均覆盖；新患者影像题匹配部署单位。 | 保留现有机制、数值实验与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：train/validation/test职责、group split、CI和测试集选择偏差均较完整 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |

## vision

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [cnn · 卷积为何懂图像](https://haoyunli.github.io/deep-learning-atlas/#/lesson/cnn) | 保留现有内容 · 可选增强已取舍 | 跨相关kernel不翻转明确；4×4输入/2×2kernel→3×3窗口每项可手算，32/3/2/pad1→16的shape题正确；分割标签几何、stride损失与grid先验限定。 | 保留现有机制、数值实验与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：真实4×4滑窗、cross-correlation说明和输出shape题很强 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |
| [resnet · 残差网络搭一条近路](https://haoyunli.github.io/deep-learning-atlas/#/lesson/resnet) | 保留现有内容 · 可选增强已取舍 | identity/projection/add而非concat、dy/dx含I、激活依block版本说明；toy固定F和可调α不声称训练效果，向量数值含负修正并匹配x+αF。 | 保留现有机制、数值实验与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：真实逐坐标相加、α=0 identity、与concat区分，测验含I+J_F | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [rnn · 循环网络逐步读序列](https://haoyunli.github.io/deep-learning-atlas/#/lesson/rnn) | 保留现有内容 · 可选增强已取舍 | 参数共享/BPTT/detach前向记忆与梯度窗口区分，bidirectional非causal；toy h=tanh(x+whprev)、h0=0和x[1,0,0,0]一致，饱和与跨样本state风险说明。 | 保留现有机制、数值实验与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：四步真实 h_t=tanh(x_t+wh_(t−1))、状态重置、truncated BPTT边界已解释 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer已读，AdamW toy helper另读；已有全目录桌面/手机渲染通过。 | — |
| [lstm-gru · LSTM 与 GRU 的门](https://haoyunli.github.io/deep-learning-atlas/#/lesson/lstm-gru) | 保留现有内容 · 可选增强已取舍 | c/h分路与GRU不同gate组织明确；toy cprev=.8、固定write=.15、o=.7逐步公式匹配，gate为直接可调教学值非真实学习；state边界与因果回放例具体。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：LSTM单坐标保留/写入/读出门数值完整，并说明门是学习生成的 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [attention · 注意力是按需查找](https://haoyunli.github.io/deep-learning-atlas/#/lesson/attention) | 保留现有内容 · 可选增强已取舍 | QKV/source、按key softmax、mask在softmax前、稳定softmax常数不变和未来token扰动测试明确；dense平方compute与Flash显存不物化区分，权重非完整因果解释。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：Q/K/V分阶段图、causal mask、真实手算沙盒已有；不是只有文字动画 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [transformer · Transformer 的积木](https://haoyunli.github.io/deep-learning-atlas/#/lesson/transformer) | 保留现有内容 · 可选增强已取舍 | attention跨token/FFN逐token、preNorm示意与originalencoderdecoder区分；4×4 mask行query列key、causal c≤r正确，token无position/no mask仅排列等变；L加倍score4倍题限定逻辑形状。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：现有mask矩阵、attention跨token与FFN逐token区分、pre-norm公式正确 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [encoder-models · Encoder 擅长读懂](https://haoyunli.github.io/deep-learning-atlas/#/lesson/encoder-models) | 保留现有内容 · 可选增强已取舍 | bidirectional/MLM分类NER与retrieval目标分开，pooling不是任意句向量就有效；input truncation/similarity非校准概率、只看有效左右context的练习明确。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：双向读取、分类/标注head、句向量需要检索目标已讲清 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [decoder-models · Decoder 擅长续写](https://haoyunli.github.io/deep-learning-atlas/#/lesson/decoder-models) | 保留现有内容 · 可选增强已取舍 | 输入[A,B,C]→[B,C,EOS]与内部shift不可重复解释完整；train各位置并行、inference自回归/cache不同，sampling不能修复事实问题，mask/stop/template有具体检查。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：next-token分解、训练并行/推理串行、shift与cache说明已具备 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [encoder-decoder · Encoder–Decoder 做转换](https://haoyunli.github.io/deep-learning-atlas/#/lesson/encoder-decoder) | 保留现有内容 · 可选增强已取舍 | [BOS,A,B]→[A,B,EOS]、decoder query/encoder KV与source/target长度分开；teacher forcing与真实生成条件不同，并要求真实autoregressive评估与忠实度。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：Q来自decoder、K/V来自encoder，teacher forcing与自由生成差别明确 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## generative

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [autoencoder-vae · VAE 把数据放进连续空间](https://haoyunli.github.io/deep-learning-atlas/#/lesson/autoencoder-vae) | 已修改并验证 | ELBO公式、reparameterization和一维gaussianKL toy正确，KL/decoder collapse与异常score限制具体；tuning把ELBO下降写成loss改善方向，须分清符号。 | 明确最大化ELBO=最小化负ELBO；监控句改为负ELBO下降，不改正确概率公式。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：已有μ固定、σ可调的重参数化与Gaussian KL，collapse限制写得清楚 | 完整正文/两题/lab及相关helper已核对；全站build通过；1440/375px关键文字、键盘range两端输出与页面溢出/脚本错误检查通过；桌面/手机截图已目视核对，手机图可横向滚动，说明换行完整。 | [1](https://arxiv.org/html/1312.6114v11) |
| [gan · GAN 用对抗学习生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gan) | 保留现有内容 · 可选增强已取舍 | originalminimax与non-saturating G目标区别；固定sigmoidD/real2单样本loss计算与真实交替训练分开，低loss不保证分布逼近和mode覆盖，helper梯度/概率一致。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：non-saturating目标、固定D的算术与非完整训练免责声明都已有 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [diffusion · 扩散模型一步步去噪](https://haoyunli.github.io/deep-learning-atlas/#/lesson/diffusion) | 保留现有内容 · 可选增强已取舍 | forward闭式x_t、ε/x0/v target与训练scheduler/推理sampler匹配、train步数≠sample步数；guidance的质量/覆盖tradeoff及fixed seed评估完整，细化DDPM/DDIM另有课程。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：训练随机t、直接构造x_t、训练/采样步数区分已有；房屋噪点图诚实标示意 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [gnn · 图神经网络在关系中学习](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gnn) | 保留现有内容 · 可选增强已取舍 | message/update/readout、inductive/transductive与目标边泄漏清楚；toy同步oldstate mean self+neighbor，hop距离/target高亮正确，明示非标准symnormGCN。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：同步mean聚合真数值、k-hop边界、与GCN差异均已明示 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [contrastive-learning · 对比学习让相似靠近](https://haoyunli.github.io/deep-learning-atlas/#/lesson/contrastive-learning) | 保留现有内容 · 可选增强已取舍 | positive/false-negative/语义保留定义明确；lab选pairwise margin非InfoNCE，d+=.8→.64、m1.5负项与箭头/零梯度阈值一致，raw投影loss非下游质量。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：pairwise-margin图与正文InfoNCE已明确是不同目标，false-negative/augmentation限制完整 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [transfer-lora · 预训练模型怎么适配新任务](https://haoyunli.github.io/deep-learning-atlas/#/lesson/transfer-lora) | 已修改并验证 | shape A r×8/B8×r、16r参数、α/r和base冻结说明正确；toy Δy坐标未披露Ax/B数值，且只交adapter给optimizer遗漏新head可需训练。 | 给现有toy补Ax/B首行数值与Δy1=(1/r)ΣB1i(Ax)i来源；明确需学习的任务head显式纳入optimizer。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：rank改变shape/参数量，α/r、merge、基础模型驻留成本完整 | 完整正文/两题/lab及相关helper已核对；全站build通过；1440/375px关键文字、键盘range两端输出与页面溢出/脚本错误检查通过；桌面/手机截图已目视核对，手机图可横向滚动，说明换行完整。 | [1](https://arxiv.org/html/2106.09685v2) |

## reinforcement

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [reinforcement-learning · 强化学习从反馈中决策](https://haoyunli.github.io/deep-learning-atlas/#/lesson/reinforcement-learning) | 保留现有内容 · 可选增强已取舍 | state/action/longreturn与historical support边界具体；三步reward1,2,4 toy G=1+2γ+4γ²，finitegamma1有效且无训练曲线；训练探索return与eval return区分。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：回报/未来状态、方法分支、toy累计回报与风险限制都已讲到 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [mixture-of-experts · MoE 让专家分工](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mixture-of-experts) | 保留现有内容 · 可选增强已取舍 | router topk输出、total/active/storage/真实compute分开，load/capacity/overflow与通信wait均覆盖；同token/hardware dense比较，expert领域分工不是硬编码标签。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：总参数/激活参数、通信、容量/overflow和非人工领域标签均正确 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [expectation-maximization · EM：猜隐藏变量，再更新参数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/expectation-maximization) | 保留现有内容 · 可选增强已取舍 | fixedq Q最大化与observed likelihood不降前提及approx/GEM不同分清；mean-only toy固定π=.5/σ1、责任度加权均值与before/afterLL一致，明确仅一轮非全GMM。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：mean-only EM真计算、likelihood前后、固定π/σ与非全局最优声明完整，手算沙盒更深 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [knn · kNN：看附近样本怎么说](https://haoyunli.github.io/deep-learning-atlas/#/lesson/knn) | 保留现有内容 · 可选增强已取舍 | trainonly scale/库版本与欧氏metric正确，regression[2,4,9]uniform5；九点toy等比例轴、真实hypot排名、k奇数避免tie，circle为第k距离而非任意装饰。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：等比例坐标、真距离/投票、可改查询与特征缩放沙盒已有 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [k-means · K-means：找 K 个代表点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/k-means) | 保留现有内容 · 可选增强已取舍 | 平方距离目标→[0,2,10]均值4，inertia非天然类别证明；toy确定初始化oneLloyd assign/update/reassign同步、更新空簇保留原中心，equalaxis/硬分配与未收敛声明充分。 | 保留现有章内机制、可检查例子与两道区分性练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：一轮Lloyd真实assign/update/reassign，明确没有运行至收敛 | 完整正文/公式/使用限制/settings/练习逐课已读；有lab者步骤/参数/renderer与相关helper已读；已有全目录桌面/手机渲染通过。 | — |
| [gaussian-mixture-model · GMM：软分群的概率模型](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gaussian-mixture-model) | 保留现有内容 · 可选增强已取舍 | 正文区分 mixture density 与 posterior responsibility，固定均值/权重的可调σ图按πN(x)算r，协方差奇异与held-out likelihood限制已明确；无需重复新增EM示例。 | 保留当前正文、可控例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：密度≠点概率、混合密度、posterior归一化、EM学习分离都很清楚 | 全文、两道练习、lab renderer及相关计算helper已逐一核对；全目录桌面/手机渲染通过。 | — |
| [pca · PCA：保留最大变化方向](https://haoyunli.github.io/deep-learning-atlas/#/lesson/pca) | 保留现有内容 · 可选增强已取舍 | 中心化、训练集fit后共享投影、SVD与方差/预测信息边界完整；8点对称零均值，n归一化投影方差及atan2主轴正确，图中两轴同尺度正交投影。 | 保留当前正文、可控例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：旋转投影轴真实方差、垂线重建误差与SVD概念已具备 | 全文、两道练习、lab renderer及相关计算helper已逐一核对；全目录桌面/手机渲染通过。 | — |
| [svm · SVM：把分类边界撑开](https://haoyunli.github.io/deep-learning-atlas/#/lesson/svm) | 保留现有内容 · 可选增强已取舍 | 软间隔目标½\|\|w\|\|²+CΣhinge及支持向量范围明确；1D固定b=0以w∈[0,4]网格求解。核对C∈[.1,5]最优w≥.5，绘图margin上限不触发；黑圈只标hinge>0已披露。 | 保留当前正文、可控例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：1D软间隔数值求解、C、hinge、固定b与网格近似均明示 | 全文、两道练习、lab renderer及相关计算helper已逐一核对；全目录桌面/手机渲染通过。 | — |

## generative

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [energy-based-models · EBM：给状态打一个能量分数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/energy-based-models) | 保留现有内容 · 可选增强已取舍 | 能量只定相对密度，Z、采样/负相位与score matching/NCE路线区别已交代；e²比值题抵消同一Z，扰动构象捷径例子和独立排序验证完整。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：归一化常数、能量非绝对概率、负相位必要性都讲清 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [infonce · InfoNCE：在候选里认出正样本](https://haoyunli.github.io/deep-learning-atlas/#/lesson/infonce) | 保留现有内容 · 可选增强已取舍 | 分母含正例及负例，多正例概率和与逐正例平均已区分；4个固定similarity通过稳定softmax精确计算，温度不改变排序，题目ln3与false negatives正确。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：温度实时logits/概率/loss，正例在分母、hard-negative例外说明已有 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [triplet-loss · Triplet：让正样本比负样本更近](https://haoyunli.github.io/deep-learning-atlas/#/lesson/triplet-loss) | 已修改并验证 | 平方距离lab的m>.8激活阈值、原文一般d定义及数值题正确；margin设置中“有效三元组过少时降低”方向反了：固定距离下降低m会减少active triplets。 | 改为适度增大margin或加强合理mining，保留所有违反/不稳定时减小margin的分支。<br>最终取舍：本轮修正已验证；保留已有有效例子，额外教学扩展可选后置。 | 执行者通读 + 独立逐章复核<br>保留：平方距离margin几何与半径sqrt(0.64+m)说明准确 | batch4 全站构建及 1440/375px 浏览器检查已通过；triplet 控制边界、TCN R=29、PPO 负 advantage 分支已核对；已有手机截图本轮逐张目视检查。 | [1](https://arxiv.org/html/1503.03832) |
| [simclr · SimCLR：同一图像的两种视角](https://haoyunli.github.io/deep-learning-atlas/#/lesson/simclr) | 保留现有内容 · 可选增强已取舍 | 共享encoder+projector、2N视图排除自身后2N−2负例，原版无队列、probe取encoder输出已明确；4图例子6负例7候选正确。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：两视图、projector与下游f表示、2N−2负例计数练习完整 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [moco · MoCo：用队列保存更多对照](https://haoyunli.github.io/deep-learning-atlas/#/lesson/moco) | 保留现有内容 · 可选增强已取舍 | query梯度、key停梯度/EMA和FIFO字典解耦正确，2/.9/4→2.2数值正确；过时键与false negative限制具体。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：EMA/key不反传、queue与batch解耦已有例题 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [clip · CLIP：让图片和文字相遇](https://haoyunli.github.io/deep-learning-atlas/#/lesson/clip) | 保留现有内容 · 可选增强已取舍 | 归一化双塔与双向row/column CE、learned scale、候选prompt和校准限制完整；合成3×3矩阵仅画第1行精确softmax，4对图文[4,4]题正确。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：已有3×3图文矩阵、温度条和单行CE，双向损失正文正确 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [byol · BYOL：不靠负样本的自监督](https://haoyunli.github.io/deep-learning-atlas/#/lesson/byol) | 保留现有内容 · 可选增强已取舍 | online独有predictor、target projector stop-gradient+EMA、交换视图方向明确，低MSE常数塌缩用方差/probe诊断，未把EMA本身当理论保证。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：predictor、stop-gradient、EMA及常数collapse识别完整 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [barlow-twins · Barlow Twins：既一致，也少重复](https://haoyunli.github.io/deep-learning-atlas/#/lesson/barlow-twins) | 保留现有内容 · 可选增强已取舍 | 跨视图按batch中心化/标准化相关矩阵，diag→1与offdiag→0目标正确，区别单视图协方差；小batch统计/下游局限和两道题覆盖关键误解。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：跨视图相关矩阵而非单视图协方差写得明确 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [mae · MAE：遮住图像，再补回来](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mae) | 保留现有内容 · 可选增强已取舍 | 原版encoder只看visible patches、decoder补mask并仅masked像素loss明确；196×.25=49例子正确，重建质量和下游可分性未混同。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：encoder仅可见patch、mask-token只在decoder、loss只masked均已覆盖 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [vicreg · VICReg：防止表示全部一样](https://haoyunli.github.io/deep-learning-atlas/#/lesson/vicreg) | 保留现有内容 · 可选增强已取舍 | invariance、每路维度std下限、每路offdiag covariance三项明确；常数输出前后二项可零而variance触发题正确，统计形态不保证语义已交代。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：常数输出使invariance/covariance为0而variance项触发的题非常好 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [dino · DINO：让学生预测老师的视角](https://haoyunli.github.io/deep-learning-atlas/#/lesson/dino) | 保留现有内容 · 可选增强已取舍 | teacher global/student global+local、cross-view CE、stop-gradient+EMA、centering和sharpening完整；注意力图不直接当分割结果，输出熵塌缩题有效。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：teacher仅global、student多crop、centering/sharpening与EMA均明确 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [logistic-regression · 逻辑回归：简单而可靠的分类起点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/logistic-regression) | 保留现有内容 · 可选增强已取舍 | logit/sigmoid/CE、inverse C、预处理训练内fit、重加权后校准与阈值拆开；固定b=−1/x=1.2图的(p−1)x梯度及ln3→.75题正确。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：已有logit→sigmoid→BCE→(p−y)x联动，边界与校准区别完整 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |
| [random-forest · 随机森林：让很多树一起判断](https://haoyunli.github.io/deep-learning-atlas/#/lesson/random-forest) | 保留现有内容 · 可选增强已取舍 | bootstrap+split随机feature、概率平均和多数票区别明确，0.2/.6/.9平均.567；OOB行级不可代表新个体题避免层级泄漏，特征重要性不冒充因果。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：bootstrap、随机特征、概率平均与OOB的group限制讲得好 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [supervised-contrastive · SupCon：同类样本都是正例](https://haoyunli.github.io/deep-learning-atlas/#/lesson/supervised-contrastive) | 保留现有内容 · 可选增强已取舍 | 全positive log概率逐项平均且分母含所有除自身候选，粗类亚型和错标风险明确；缺正例batch题与标签[A,A,B,C]两正例题正确。 | 保留现有解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：multiple positives平均log、分母包含正例、空positive问题完整 | 完整正文、公式、设置/局限、两道练习已逐课核对；有lab者同时核对renderer及外部计算helper。 | — |

## vision

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [unet · U-Net：一边理解，一边找回位置](https://haoyunli.github.io/deep-learning-atlas/#/lesson/unet) | 保留现有内容 · 可选增强已取舍 | 典型channel concat与ResNet加法、pixel logits/BCE与实例mask区别明确；64+32=96形状题有效，skip振幅仅缩放固定细节信号而不伪造训练改善。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：concat非add、C+C与融合、语义/实例区别已明确且有图 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [nnunet · nnU-Net：让分割流水线自己适配](https://haoyunli.github.io/deep-learning-atlas/#/lesson/nnunet) | 保留现有内容 · 可选增强已取舍 | 完整数据指纹/spacing/patch/2D3Dcascade规划框架、病例级CV及后处理选择明确，重采样小结构缺失题直指输入监督信息损失。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：self-configuring framework、spacing/patch/2D3D及预处理失真均解释完整 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [unet-plus-plus · U-Net++：把跳接变成融合路径](https://haoyunli.github.io/deep-learning-atlas/#/lesson/unet-plus-plus) | 保留现有内容 · 可选增强已取舍 | 同尺度nested dense concat递推正确，deep supervision多head和验证集选浅head/剪枝的成本权衡完整，未把更多连接当免费收益。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：nested节点公式、deep supervision、推理head选择写清楚 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [deeplabv3-plus · DeepLabv3+：看大范围，也修边界](https://haoyunli.github.io/deep-learning-atlas/#/lesson/deeplabv3-plus) | 保留现有内容 · 可选增强已取舍 | ASPP含1×1、多rate3×3及GAP投影上采样分支，decoder低层边界融合完整；dilation2有效核5题和4×4边界padding风险正确。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：ASPP完整含1×1、多rate、GAP支路与decoder，dilation边界限制已讲 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [vgg · VGG：用小卷积搭深网络](https://haoyunli.github.io/deep-learning-atlas/#/lesson/vgg) | 保留现有内容 · 可选增强已取舍 | 3×3+ReLU叠加理论感受野及原版FC成本、无residual明确，stride1两层RF5题正确；以匹配权重预处理/真实设备成本评估迁移。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：历史定位、3×3堆叠、理论感受野练习明确 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [densenet · DenseNet：每层都能看到前面](https://haoyunli.github.io/deep-learning-atlas/#/lesson/densenet) | 保留现有内容 · 可选增强已取舍 | block保留所有旧feature并concat新增growth通道，transition压缩明确；24+4×12=72且参数少≠激活显存低，两题与局限一致。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：growth-rate通道算例、concat非add、激活成本与参数量区分强 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [efficientnet · EfficientNet：一起放大宽、深和分辨率](https://haoyunli.github.io/deep-learning-atlas/#/lesson/efficientnet) | 保留现有内容 · 可选增强已取舍 | B0基础与depth/width/resolution compound scaling，αβ²γ²≈2计算预算关系明确；预训练和实测设备算子限制完整，无通用最快宣称。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：compound scaling和FLOPs≠latency解释到位 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [convnext · ConvNeXt：用现代训练配方重做 CNN](https://haoyunli.github.io/deep-learning-atlas/#/lesson/convnext) | 保留现有内容 · 可选增强已取舍 | depthwise7×7空间+PW通道、LN/GELU/residual骨架正确，仍为CNN；用controlledrecipe/data消融核大小，避免架构因果归因过度。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：仍为ConvNet、DW空间/PW通道、recipe混杂与消融已讲清 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [vit · ViT：把图像切成 token](https://haoyunli.github.io/deep-learning-atlas/#/lesson/vit) | 保留现有内容 · 可选增强已取舍 | patch grid/[CLS]/位置处理与密集任务decoder明确；224/16→196、宽高翻倍attention配对16倍题正确，8×8原图lab实时N+1平方且声明非实测显存。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：8×8 patch slider、N与N²真实计数、位置适配与理论/实测显存差别完整 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [swin-transformer · Swin：窗口注意力也能跨窗交流](https://haoyunli.github.io/deep-learning-atlas/#/lesson/swin-transformer) | 保留现有内容 · 可选增强已取舍 | 窗口/shifted mask与patch merging多尺度完整，逐层跨窗≠单层global已明确；非标准尺寸padding/partition/reverse/mask题覆盖可操作调试。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：窗口与shift跨窗、patch merge、单层非全局已讲清 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [bidirectional-rnn · 双向 RNN：前后文一起看](https://haoyunli.github.io/deep-learning-atlas/#/lesson/bidirectional-rnn) | 保留现有内容 · 可选增强已取舍 | 两独立方向state concat64+64=128、padding/packed处理、全序列可见条件明确；固定允许延迟另评估题有效避免在线未来泄漏。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：两套独立参数、128维concat、完整输入与固定延迟区别清晰 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [seq2seq · Seq2Seq：把一个序列变成另一个](https://haoyunli.github.io/deep-learning-atlas/#/lesson/seq2seq) | 保留现有内容 · 可选增强已取舍 | 固定context瓶颈与attention版本保留所有states、teacher-forcing真实历史和自由生成反馈、BOS/EOS/padding/labelshift完整，两题匹配部署信息集。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：固定向量瓶颈、attention补救、teacher forcing和EOS均已讲 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [tcn · TCN：用因果卷积读时间](https://haoyunli.github.io/deep-learning-atlas/#/lesson/tcn) | 已修改并验证 | 因果left padding、finite RF与时间CV正确，但公式R中的mₗ未解释，读者无法从常见每block两卷积结构计算覆盖历史。 | 定义K/dₗ/mₗ并补K3、d=[1,2,4]每组2卷积→R29原始算例，保留现有因果和200步依赖题。<br>最终取舍：本轮修正已验证；保留已有有效例子，额外教学扩展可选后置。 | 执行者通读 + 独立逐章复核<br>保留：因果/dilation/完整receptive-field公式含每block卷积数m已正确 | batch4 全站构建及 1440/375px 浏览器检查已通过；triplet 控制边界、TCN R=29、PPO 负 advantage 分支已核对；已有手机截图本轮逐张目视检查。 | — |
| [word2vec · word2vec：词义来自邻居](https://haoyunli.github.io/deep-learning-atlas/#/lesson/word2vec) | 保留现有内容 · 可选增强已取舍 | CBOW/Skip-gram方向、负采样和静态一词多义/OOV限制准确，领域近邻≠完整事实理解；句向量检索需专门目标而不声称简单平均足够。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：CBOW/Skip-gram方向、静态embedding限制完整 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [bert · BERT：遮住词，读懂整句](https://haoyunli.github.io/deep-learning-atlas/#/lesson/bert) | 保留现有内容 · 可选增强已取舍 | 原版MLM+NSP、双向可见性、CLS vs token/span头明确；lab仅[MASK]且披露随机替换/保留分支，子词标签及padding对齐题有效。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：双向MLM与原版NSP，现有mask位置图并注明随机替换/原词分支 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [roberta · RoBERTa：先把 BERT 训练充分](https://haoyunli.github.io/deep-learning-atlas/#/lesson/roberta) | 保留现有内容 · 可选增强已取舍 | 动态mask/no NSP但仍encoder、byteBPE空格和checkpoint语言覆盖明确；与BERT控制split/length/data而非名称替代验证，两题正确。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：训练配方而非全新attention、dynamic masking/no NSP、语言覆盖均明确 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [gpt-language-model · GPT 式 LM：预测下一个 token](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gpt-language-model) | 保留现有内容 · 可选增强已取舍 | 因果nexttoken可并行teacher train/推理自回归/cache、[A,B,C]→[B,C,EOS]防double shift完整；固定[2,1,0]softmax和u=.72inverseCDF正确，温度≠事实准确已交代。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：真实温度概率条、固定随机数采样、训练位置对齐练习很强 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [t5 · T5：所有语言任务都写成文本到文本](https://haoyunli.github.io/deep-learning-atlas/#/lesson/t5) | 保留现有内容 · 可选增强已取舍 | span sentinel目标与BART全文恢复区分，encoder双向/decoder因果cross-attention完整；text-to-text分类解码成本及input/target长度独立两题有效。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：sentinel span corruption与text-to-text用途完整 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |

## vision

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [mobilenet-v2 · MobileNetV2：为设备预算设计卷积](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mobilenet-v2) | 保留现有内容 · 可选增强已取舍 | expand→depthwise→linear narrow projection及stride1形状匹配residual正确，投影后非线性误改题有效；FLOPs与端侧kernel/访存成本拆开。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：inverted residual/linear bottleneck、设备延迟限制正确 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [mask-rcnn · Mask R-CNN：为每个物体单独画 mask](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mask-rcnn) | 保留现有内容 · 可选增强已取舍 | RPN/FPN→RoIAlign→class/box/mask并行head与实例监督正确；提高NMS IoU阈值减相贴抑制方向正确，box/mask小尺度AP与语义mask选择题完整。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：RPN/RoIAlign/并行head/实例标签要求完整 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |
| [detr · DETR：把目标检测当集合预测](https://haoyunli.github.io/deep-learning-atlas/#/lesson/detr) | 保留现有内容 · 可选增强已取舍 | learned queries/Hungarian1:1匹配/no-object与class+L1+overlap正确，fixedquery预测数上限及原版无需NMS范围明确；小目标多尺度限制和100vs180题有效。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：Hungarian一对一、no-object、query上限、原版无NMS完整 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [bart · BART：把弄乱的文本复原](https://haoyunli.github.io/deep-learning-atlas/#/lesson/bart) | 保留现有内容 · 可选增强已取舍 | 受损全文encoder→自回归重建原全文decoder、teacher shift/padding与EOS正确，全文恢复和T5 missing-span区别已呈现；事实数字15%→50%错例独立核查。 | 保留当前解释、例子与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：denoising seq2seq与完整序列重建正确 | 已阅读完整正文、公式、例子、设置/局限与两道题；适用lab的renderer及计算输入已核对。 | — |

## reinforcement

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [multi-armed-bandit · 先学会探索：多臂老虎机](https://haoyunli.github.io/deep-learning-atlas/#/lesson/multi-armed-bandit) | 保留现有内容 · 可选增强已取舍 | 即时reward无动作改变next-state假设、εgreedy随机含best与UCB均值不确定性明确；4动作ε.2→.85题和3arm概率lab精确且不宣称真均值。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：探索分支包含 greedy arm 的说明很准确；固定 Q=[1,3,2]，概率条和练习的 0.85 都应保留 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [q-learning · 用 Q 表学最优行动](https://haoyunli.github.io/deep-learning-atlas/#/lesson/q-learning) | 保留现有内容 · 可选增强已取舍 | offpolicy max target与实际行为分工、terminated vs truncated明确，2+.5(4.6−2)=3.3题及old1→1+α3.6lab吻合。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：target=4.6、TD error=3.6、一次更新而非训练轮次的边界说明；正文区分 terminated/truncated | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [sarsa · 按真实下一步更新：SARSA](https://haoyunli.github.io/deep-learning-atlas/#/lesson/sarsa) | 保留现有内容 · 可选增强已取舍 | actual a′按同π采且下一轮执行同变量，onpolicy探索风险已交代；target1.9与max4.6对照，固定3候选lab含负target并未伪称采样器。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：同一状态下 SARSA target 与 Q-learning 4.6 的并列比较；明确滑块不是随机采样器或 Expected SARSA | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [dqn · 让神经网络估 Q：DQN](https://haoyunli.github.io/deep-learning-atlas/#/lesson/dqn) | 保留现有内容 · 可选增强已取舍 | replay去相关/重用与target缓变/stopgrad区别、离散动作及terminal/truncated准确；真实终止r2题及1+γ4平方losslab吻合。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：replay、online、stopgrad target 的分工；γ=.9 得 target4.6、MSE6.76 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [double-dqn · 拆开选择与打分：Double DQN](https://haoyunli.github.io/deep-learning-atlas/#/lesson/double-dqn) | 保留现有内容 · 可选增强已取舍 | online argmax/target评价同动作职责正确，online[5,4]/target[2,6]→2数值题直接识别高估机制，未声称无偏或解决探索。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：练习的“online 选、target 评”，不应再写一遍定义 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [dueling-dqn · 状态好坏与动作差别分开学](https://haoyunli.github.io/deep-learning-atlas/#/lesson/dueling-dqn) | 保留现有内容 · 可选增强已取舍 | mean-centered raw A、V=mean Q而不是任意Vπ/maxQ已经特别澄清；V3/A[2,0]→[4,2]正确，架构不替代target/replay。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：V 是动作 Q 均值、原始 A 不等于真正 Aπ 的精细区分非常好 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [rainbow-dqn · 组合式 DQN：Rainbow](https://haoyunli.github.io/deep-learning-atlas/#/lesson/rainbow-dqn) | 已修改并验证 | 六组件组合与消融题准确；原版 Rainbow 的 replay priority 写成标量 TD error，混淆标准 PER 与 distributional KL loss。 | 改 KL priority 和设置说明；用回报分布建模消除分布式计算歧义。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：六组件、逐项消融、C51 概率质量和支持边界的检查 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://arxiv.org/html/1710.02298) |
| [reinforce · 直接学动作概率：REINFORCE](https://haoyunli.github.io/deep-learning-atlas/#/lesson/reinforce) | 保留现有内容 · 可选增强已取舍 | γᵗ外折扣与Gt内部折扣匹配J，baseline动作独立/stopgrad及leave-one-out避免本样本mean偏差，完整局总回报仍合法但噪声大已交代；Bernoulli logit精确更新非直接概率加A。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：Bernoulli logit 梯度更新，不把 advantage 直接加概率；γᵗ和 return-to-go 的公式正确 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [actor-critic · 一个行动，一个评分：Actor-Critic](https://haoyunli.github.io/deep-learning-atlas/#/lesson/actor-critic) | 保留现有内容 · 可选增强已取舍 | A2C同步/A3C异步onpolicy与泛actorcritic含offpolicy区分；critic target/advantage detach范围明确，固定3.7target半平方标量V更新及p=.4 logit梯度准确。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：同一 δ 驱动 actor/critic、V=3.7 时方向翻转；已明确 actor 不经 δ 反传 critic | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [trpo · 限制策略走太远：TRPO](https://haoyunli.github.io/deep-learning-atlas/#/lesson/trpo) | 保留现有内容 · 可选增强已取舍 | 均值KLold\|\|new约束、FVP/CG与linesearch实际检查完整；理论maxKL界不当有限sample均值硬保证，题目与工程限制一致。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：平均 KL、近似 Fisher/CG、line search 和无真实回报单调保证的限定 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [ppo · 稳健更新策略：PPO](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ppo) | 已修改并验证 | 公式及机制正确，但现有数值题只有正A，上/下哪侧clipping的负A分支仍需读者自行推导。 | 以ε.2补正A/r1.4、负A/r.6与负A/r1.4三个原创min对照；说明最大化surrogate/最小化负loss和非硬KL裁剪。<br>最终取舍：本轮修正已验证；保留已有有效例子，额外教学扩展可选后置。 | 执行者通读 + 独立逐章复核<br>保留：已经有正负 A、两个分支、min、平台、折点和标量更新范围说明；无需再建议补“负 advantage 例子” | batch4 全站构建及 1440/375px 浏览器检查已通过；triplet 控制边界、TCN R=29、PPO 负 advantage 分支已核对；已有手机截图本轮逐张目视检查。 | [1](https://arxiv.org/pdf/1707.06347) |
| [ddpg · 连续动作的确定性策略：DDPG](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ddpg) | 保留现有内容 · 可选增强已取舍 | 确定性actor链式∂Q/∂a·∂μ/∂θ，replay/target软更新/执行探索噪声及尺度一致；2×.5=1上升与−Q loss符号题有效。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：动作缩放、replay、actor/critic target 和真实回报校准 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [td3 · 修正 DDPG 高估：TD3](https://haoyunli.github.io/deep-learning-atlas/#/lesson/td3) | 保留现有内容 · 可选增强已取舍 | twin min target、delayed actor/targets及两种noise路径分离明确；min(5,8)r1γ.9→5.5正确，未把min当无偏真实下界。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：三机制、两类噪声分开、actor/target 延迟更新的顺序正确 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [sac · 既拿高分也保留探索：SAC](https://haoyunli.github.io/deep-learning-atlas/#/lesson/sac) | 已修改并验证 | 现代twinQ与原版范围已注明、tanhJacobian/缩放/log-density符号准确；fixedlogπ−.8下bonus.8α及target1+.9(2.5+.8α)正确，α提升不冒充reward保证。 本轮复核：双 Q 的较小估计被 aria-label 称作下界，可能暗示真实 Q 的保证。 | 保留现有机制解释、例子与两题 本轮：无障碍名称改为“双 Q 较小估计”；保留既有 SAC 计算与控制。<br>最终取舍：无障碍名称改为“双 Q 较小估计”；保留既有 SAC 计算与控制。 | 执行者通读 + 独立逐章复核<br>保留：现代 twin-Q 形式、tanh Jacobian、连续 log density 可为正的提醒；现有 target 数值正确 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [model-based-rl · 先想象再行动：Model-Based RL](https://haoyunli.github.io/deep-learning-atlas/#/lesson/model-based-rl) | 保留现有内容 · 可选增强已取舍 | dynamics/reward或planning-sufficient latent→MPC/short rollout家族区分；one/multistep验证、ensemble支持与真实回报锚点完整，模型漏洞和误差累积题有效。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：one-step/multi-step 验证、MBPO 短 rollout、MPC 重规划和真实回报对照 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [muzero · 在隐空间规划：MuZero](https://haoyunli.github.io/deep-learning-atlas/#/lesson/muzero) | 保留现有内容 · 可选增强已取舍 | h历史encoder/g nextlatent+reward/f prior+value/MCTS visit-target及真实reward监督完整；不知道规则≠无交互动作集合，latent无需pixel重建已交代。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：h/g/f 分工，搜索访问次数监督 policy、不要求像素重建 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [behavior-cloning · 先模仿专家：Behavior Cloning](https://haoyunli.github.io/deep-learning-atlas/#/lesson/behavior-cloning) | 保留现有内容 · 可选增强已取舍 | 离散CE/连续分布回归、无需reward、closed-loop covariate shift及DAgger当前访问状态专家标注明确；ln4→ln2题和开环≠闭环成功率有效。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：无需 reward、连续多峰动作、开环准确率与闭环恢复分开 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [offline-rl · 只用已有轨迹：Offline RL](https://haoyunli.github.io/deep-learning-atlas/#/lesson/offline-rl) | 保留现有内容 · 可选增强已取舍 | fixedD vs offpolicy可继续采数据明确，BC不是性能下限已修饰；max外推O.O.D./support与独立OPE/环境评估完整，不以trainingQ当上线证据。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：BC 不是性能下限、off-policy≠offline、日志支持与 OPE 的严谨边界 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [cql · 对数据外动作保持保守：CQL](https://haoyunli.github.io/deep-learning-atlas/#/lesson/cql) | 保留现有内容 · 可选增强已取舍 | 离散logsumexp−dataQ保守相对正则与Bellman项、连续采样近似条件准确；Q全+10两项相消题防绝对Q误解，α过强与数据覆盖限制具体。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：相对正则与 Bellman anchoring 分开、连续动作采样近似限制 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [decision-transformer · 把轨迹当语言来建模](https://haoyunli.github.io/deep-learning-atlas/#/lesson/decision-transformer) | 保留现有内容 · 可选增强已取舍 | causal(RTG,state,action)监督仅action、无Bellman及未折扣RTG10−3=7与缩放推理一致完整；高目标token不创造未见成功轨迹已交代。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：监督 action loss、无 Bellman backup、RTG 不是性能保证 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [reward-model · RM：把偏好变成可学习的分数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/reward-model) | 保留现有内容 · 可选增强已取舍 | 同prompt pairwise BT reward差、prompt隔离/lengthconfound/独立人评正确；分数同+5不变题与Δr/2、−Δr/2 sigmoid/gradient图准确，不把概率当事实正确率。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：分差 slider、sigmoid、loss/gradient、相对零点与 reward hacking 限定完整 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [rlhf · RLHF：用人类偏好微调语言模型](https://haoyunli.github.io/deep-learning-atlas/#/lesson/rlhf) | 保留现有内容 · 可选增强已取舍 | 经典SFT→RM→PPO加π\|\|reference KL范围准确，reference frozen/current采样/独立人评与rewardhacking完整；同KL提高β惩罚更大题并不声称RM改善。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：SFT→RM→PPO、独立人评和 reward hacking 的边界 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [dpo · DPO：直接用偏好对训练](https://haoyunli.github.io/deep-learning-atlas/#/lesson/dpo) | 保留现有内容 · 可选增强已取舍 | response-only序列logprob和reference frozen/差中差βsigmoid机制准确；固定.6/.2与.4/.3示例Δln2.25及梯度正确，固定β效果不外推训练胜率。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：四个序列概率、reference-relative gap、prompt/padding mask 与 β 只改变固定样例的说明 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |

## foundations

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [prediction-heads · Prediction head：最后一步怎么预测](https://haoyunli.github.io/deep-learning-atlas/#/lesson/prediction-heads) | 保留现有内容 · 可选增强已取舍 | 已区分预测粒度、pooling、linear probe和attention head；题目核对[B,T,5]，可调类别数实际重算logits和softmax，当前无实质补充需要。 | 保留现有正文、lab与练习<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：已有真实 z=Wh、类别数2–5、softmax随类别增减重算的实验；正文区分 token、sequence、多标签、回归，练习 [B,T,5] 很好 | 正文、维度例子、两道题及renderer逻辑已核对；全目录1440/375px渲染与资源检查通过 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [attention-heads · Attention head：多视角读上下文](https://haoyunli.github.io/deep-learning-atlas/#/lesson/attention-heads) | 保留现有内容 · 可选增强已取舍 | 每头QKV投影/softmaxkeys/concatWO与predictionhead维度区别完整；512/8=64及固定width8heads1/2/4/8lab形状正确，未来token改动测试与mask广播有操作性。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：d_model8→1/2/4/8 heads 图能精确表达宽度守恒；正文、题目512/8=64及改变未来输入的因果检查很强 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [zero-shot-learning · Zero-shot：目标任务没有示例](https://haoyunli.github.io/deep-learning-atlas/#/lesson/zero-shot-learning) | 保留现有内容 · 可选增强已取舍 | 相对target任务shot定义、pretrain相关知识和prompt选择可泄漏说明完整；CLIP类prompt与candidate依赖、独立test协议及100prompt selection题有效。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：zero 指目标任务例数，不是没预训练；候选类别/模板改变评价；已有 CLIP lab 的双向对比与零样本迁移说明 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [few-shot-learning · Few-shot：少量示例怎么用](https://haoyunli.github.io/deep-learning-atlas/#/lesson/few-shot-learning) | 保留现有内容 · 可选增强已取舍 | 少标签预算而非单一算法，ICL/prototype/gradient与meta-train queryloss和meta-test label不可用区分；N×K计数及多support随机抽样方差完整。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：5-way3-shot=15及 prompt/prototype/gradient 三种机制已区分，meta-train query可更新共享参数也已讲清 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [in-context-learning · In-context learning：示例放在上下文](https://haoyunli.github.io/deep-learning-atlas/#/lesson/in-context-learning) | 保留现有内容 · 可选增强已取舍 | θ固定的上下文条件生成与持久finetune区别明确；zero/one/fewshot、演示占预算及query截断案例两题具体，测试答案选例泄漏已交代。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：权重固定、上下文成本、示例顺序、不能由表现证明新知识，以及真实格式示范 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [chain-of-thought-prompting · CoT：把中间步骤也作为提示](https://haoyunli.github.io/deep-learning-atlas/#/lesson/chain-of-thought-prompting) | 保留现有内容 · 可选增强已取舍 | fewshot步骤demonstration vs zero指令、θ固定和最终答案/步骤/成本独立评估完整；7−2+4=9原例可核验，生成解释不当内部因果轨迹。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：7−2+4=9、direct/zero-shot/few-shot比较、中间文本不是真实因果轨迹、外部核验与成本，边界准确 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [linear-probe · Linear probe：冻结特征后读答案](https://haoyunli.github.io/deep-learning-atlas/#/lesson/linear-probe) | 保留现有内容 · 可选增强已取舍 | 冻结θ+eval buffers、特征层/pooling、trainfit标准化与linearhead监督范围明确，BN runningstats不随requires_grad冻结题直接覆盖实现坑。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：BN buffers冻结、特征层/pooling/训练统计、linear vs full fine-tune；现有两题很好 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [prototypical-networks · ProtoNet：每一类有一个中心](https://haoyunli.github.io/deep-learning-atlas/#/lesson/prototypical-networks) | 保留现有内容 · 可选增强已取舍 | class support均值/query负平方距离softmax及meta-train queryloss更新encoder、meta-test仅support重算完整；[0,2],[2,4]→[1,3]题正确，多峰单中心限制明确。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：原型均值、平方欧氏距离、query只进loss、单类多峰局限；已有[0,2],[2,4]→[1,3]题，不能建议“首次增加均值算例” | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [meta-learning-maml · MAML：学一个容易改的起点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/meta-learning-maml) | 已修改并验证 | support inner→query outer沿θ′高阶chain正确，meta-test真正support更新与ICL/prototype区别完整；1st-order标近似/任务隔离及成本对照题有效。 本轮复核：手算 sandbox 的 query 用途未清楚区分 meta-train 与 held-out meta-test。 | 保留现有机制解释、例子与两题 本轮：将两任务明确标成 meta-train；query 仅用于 outer update；held-out meta-test 固定共享 θ，仅用 support 适应，query 只评分。<br>最终取舍：将两任务明确标成 meta-train；query 仅用于 outer update；held-out meta-test 固定共享 θ，仅用 support 适应，query 只评分。 | 执行者通读 + 独立逐章复核<br>保留：现有双任务数值沙盘、K与inner steps、query梯度×inner Jacobian、MAML/FOMAML/Reptile并列以及三层代码阅读。不是缺数值/代码 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [cohort-design · Cohort：先定义谁能进入数据](https://haoyunli.github.io/deep-learning-atlas/#/lesson/cohort-design) | 保留现有内容 · 可选增强已取舍 | t0/L/g/H和随访可观察性、纳排选择/多index相关性正确；gap7H14→(7,21]题，completefollowup固定A15/B45/C100 lab事件落窗精确且声明非真实患病率。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：时间窗图、可调horizon、六例手算沙盒与随访不足处理齐全 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [data-leakage · 数据泄漏：模型偷看了答案](https://haoyunli.github.io/deep-learning-atlas/#/lesson/data-leakage) | 保留现有内容 · 可选增强已取舍 | 时间可得/实体/全数据fit与长期test选择信息流完整；fixedt0/cutoff控制[-40,-10,5,30]计数正确且无未来≠全流程无泄漏声明，缩放不能修未来特征题有效。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：时间截止图与训练折内fit原则完整 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [domain-shift · 分布变了，旧规律还可靠吗](https://haoyunli.github.io/deep-learning-atlas/#/lesson/domain-shift) | 保留现有内容 · 可选增强已取舍 | covariate P(X)变/P(Y\|X)稳、prior P(Y)变/P(X\|Y)稳及conditional concept正确；无标签不能证实关系稳、importance support/ESS与调后独立target样本完整。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：covariate/label/concept shift定义和支持重叠限制较严谨 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [external-validation · 外部验证：换个地方还能用吗](https://haoyunli.github.io/deep-learning-atlas/#/lesson/external-validation) | 保留现有内容 · 可选增强已取舍 | 整个model/preprocess/threshold与协议冻结、time/site/entity独立边界和外部adaptation需另test明确；discrimination/calibration/subgroup+CI/事件数并报，不用一次外部成绩声称全场景。 | 保留现有机制解释、例子与两题<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：冻结完整pipeline、适配后再留独立测试、不同迁移轴说明清楚 | 逐课读全正文/公式/设置/例子及练习；适用lab同时核对renderer与计算helper，现有1440/375px全目录渲染证据。 | — |
| [calibration-uncertainty · 模型的 90% 真的有九成把握吗](https://haoyunli.github.io/deep-learning-atlas/#/lesson/calibration-uncertainty) | 保留现有内容 · 可选增强已取舍 | 概率校准与top-label区分、正温度argmax不变、多类跨样本排名例外已修正 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：概率校准与top-label区分、正温度argmax不变、多类跨样本排名例外已修正 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [class-imbalance · 少数类稀少时怎么学](https://haoyunli.github.io/deep-learning-atlas/#/lesson/class-imbalance) | 保留现有内容 · 可选增强已取舍 | 训练权重/重采样/focal/决策阈值四层区分很好 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：训练权重/重采样/focal/决策阈值四层区分很好 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [batch-normalization · BatchNorm：用同批样本校准通道](https://haoyunli.github.io/deep-learning-atlas/#/lesson/batch-normalization) | 保留现有内容 · 可选增强已取舍 | NCHW 的 2048 个值、[1,3,5,7]→μ=4/var=5、γβ 改变最终均值；running variance 的无偏/有偏区别和 train/eval 坑，均准确而难得 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：NCHW 的 2048 个值、[1,3,5,7]→μ=4/var=5、γβ 改变最终均值；running variance 的无偏/有偏区别和 train/eval 坑，均准确而难得 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [layer-normalization · LayerNorm：每个 token 自己定标尺](https://haoyunli.github.io/deep-learning-atlas/#/lesson/layer-normalization) | 保留现有内容 · 可选增强已取舍 | [2,3,4] 轴说明、[1,1,3,3] 的 LN 与 RMSNorm 数值、Pre-/Post-LN 非等价和 padding mask 边界 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：[2,3,4] 轴说明、[1,1,3,3] 的 LN 与 RMSNorm 数值、Pre-/Post-LN 非等价和 padding mask 边界 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [learning-rate-schedules · 学习率日程：什么时候迈大步](https://haoyunli.github.io/deep-learning-atlas/#/lesson/learning-rate-schedules) | 保留现有内容 · 可选增强已取舍 | 400 micro-batches、累积4、10 epochs=1000 updates，以及 t=550 时 .000505 的余弦中点；AMP 跳步/恢复状态已讲清 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：400 micro-batches、累积4、10 epochs=1000 updates，以及 t=550 时 .000505 的余弦中点；AMP 跳步/恢复状态已讲清 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [gradient-clipping · 梯度裁剪：限制一次更新前的冲击](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gradient-clipping) | 保留现有内容 · 可选增强已取舍 | [3,4]→[1.2,1.6] 与 value clipping [2,2]；Adam 更新并无同范数硬界限；累积和 AMP 顺序题 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：[3,4]→[1.2,1.6] 与 value clipping [2,2]；Adam 更新并无同范数硬界限；累积和 AMP 顺序题 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [mixed-precision · 混合精度：把位数花在需要的地方](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mixed-precision) | 保留现有内容 · 可选增强已取舍 | FP32 baseline、autocast 不改形状、loss scale=1024、小梯度下溢、forward Inf 不能靠 scaling 修复；已有内容足够正确 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：FP32 baseline、autocast 不改形状、loss scale=1024、小梯度下溢、forward Inf 不能靠 scaling 修复；已有内容足够正确 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [tokenization · Tokenization：文字怎样变成模型的单位](https://haoyunli.github.io/deep-learning-atlas/#/lesson/tokenization) | 保留现有内容 · 可选增强已取舍 | low×3/lower×2/new×1 的可核对 BPE merge、tie-break、ID 只是索引、[2,3]→[2,3,512] 与 output vocab 维；不是只写概念 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：low×3/lower×2/new×1 的可核对 BPE merge、tie-break、ID 只是索引、[2,3]→[2,3,512] 与 output vocab 维；不是只写概念 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [positional-encoding · 位置编码：让注意力知道先后远近](https://haoyunli.github.io/deep-learning-atlas/#/lesson/positional-encoding) | 保留现有内容 · 可选增强已取舍 | RoPE 二维旋转和相对位置恒等式、Q/K 都旋转而 V 通常不转、[1,0] 的 π/2 数值、cache 位置128案例、不是距离越远分数必低 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：RoPE 二维旋转和相对位置恒等式、Q/K 都旋转而 V 通常不转、[1,0] 的 π/2 数值、cache 位置128案例、不是距离越远分数必低 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [autoregressive-inference · 自回归解码：每次只决定下一个 token](https://haoyunli.github.io/deep-learning-atlas/#/lesson/autoregressive-inference) | 保留现有内容 · 可选增强已取舍 | logits=[2,1,0] 两种温度数字、top-p=.8 留前两项、prefill 只取最后有效位置、EOS/stop 与预算区分 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：logits=[2,1,0] 两种温度数字、top-p=.8 留前两项、prefill 只取最后有效位置、EOS/stop 与预算区分 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [kv-cache · KV Cache：记住前缀算过的键和值](https://haoyunli.github.io/deep-learning-atlas/#/lesson/kv-cache) | 保留现有内容 · 可选增强已取舍 | 完整 causal 前缀为何可复用、4096→4097 shape、512 MiB/4 GiB/16 GiB 算术、cache 不让历史读取变 O(1)，以及现有预算实验 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：完整 causal 前缀为何可复用、4096→4097 shape、512 MiB/4 GiB/16 GiB 算术、cache 不让历史读取变 O(1)，以及现有预算实验 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [grouped-query-attention · GQA：多组 query 共享键和值](https://haoyunli.github.io/deep-learning-atlas/#/lesson/grouped-query-attention) | 保留现有内容 · 可选增强已取舍 | Hq8/Hkv2 的全部形状、query weights 仍独立、1/4 缓存不等于1/4延迟、checkpoint转换要训练 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：Hq8/Hkv2 的全部形状、query weights 仍独立、1/4 缓存不等于1/4延迟、checkpoint转换要训练 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [retrieval-augmented-generation · RAG：先找证据，再组织答案](https://haoyunli.github.io/deep-learning-atlas/#/lesson/retrieval-augmented-generation) | 保留现有内容 · 可选增强已取舍 | 原始 RAG-Sequence 的边缘化、现代拼接区别、20→4 检索重排、gold evidence 对照、版本60°C/80°C 与引用支持判断，已很完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：原始 RAG-Sequence 的边缘化、现代拼接区别、20→4 检索重排、gold evidence 对照、版本60°C/80°C 与引用支持判断，已很完整 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [language-model-evaluation · 语言模型评估：预测得好与回答得好](https://haoyunli.github.io/deep-learning-atlas/#/lesson/language-model-evaluation) | 保留现有内容 · 可选增强已取舍 | PPL=4 手算、shift/mask、stride、按 token 加权 NLL、不同 tokenizer 不直接比、裁判偏差和预算限制 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：PPL=4 手算、shift/mask、stride、按 token 加权 NLL、不同 tokenizer 不直接比、裁判偏差和预算限制 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [xgboost · XGBoost：每棵树修正当前错误](https://haoyunli.github.io/deep-learning-atlas/#/lesson/xgboost) | 保留现有内容 · 可选增强已取舍 | 四样本完整单轮算例、G/H、最优叶值、gain、η、缺失默认方向、margin≠probability，均应原样保留 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：四样本完整单轮算例、G/H、最优叶值、gain、η、缺失默认方向、margin≠probability，均应原样保留 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |

## frontiers

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [gcn · GCN：按图连接混合邻居信息](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gcn) | 保留现有内容 · 可选增强已取舍 | 路径三点、度数[2,3,2]、中心6/√6≈2.45；对称归一化不是行平均的纠正尤为值得保留 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：路径三点、度数[2,3,2]、中心6/√6≈2.45；对称归一化不是行平均的纠正尤为值得保留 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [graphsage · GraphSAGE：采样邻居，学会处理新节点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/graphsage) | 保留现有内容 · 可选增强已取舍 | 采样向外、计算向内；fanout乘积61；[4,2]×[.25,.75]=2.5；归纳能力来自共享函数而非采样 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：采样向外、计算向内；fanout乘积61；[4,2]×[.25,.75]=2.5；归纳能力来自共享函数而非采样 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [gat · GAT：让邻居消息拥有不同权重](https://haoyunli.github.io/deep-learning-atlas/#/lesson/gat) | 保留现有内容 · 可选增强已取舍 | additive与dot-product区别、局部softmax、[.25,.75]加权得2.5、多头concat/mean、经典GAT表达限制都已有 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：additive与dot-product区别、局部softmax、[.25,.75]加权得2.5、多头concat/mean、经典GAT表达限制都已有 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [time-series-forecasting · 时间序列预测：站在过去预测未来](https://haoyunli.github.io/deep-learning-atlas/#/lesson/time-series-forecasting) | 保留现有内容 · 可选增强已取舍 | 发布延迟/修订版本、L/H形状、seasonal naive、递归/direct、逐horizon误差已经完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：发布延迟/修订版本、L/H形状、seasonal naive、递归/direct、逐horizon误差已经完整 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |

## generative

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [ddpm · DDPM：从已知噪声学会逐步生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ddpm) | 保留现有内容 · 可选增强已取舍 | x0=2、ε=−1、ᾱ=.36→xt=.4；误差.25；ε̂错误引起x̂0偏差；末端与参数化的限定完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：x0=2、ε=−1、ᾱ=.36→xt=.4；误差.25；ε̂错误引起x̂0偏差；末端与参数化的限定完整 | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [ddim · DDIM：用另一条路径更快地去噪](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ddim) | 保留现有内容 · 可选增强已取舍 | 完整σ跨步公式、η=0仍有初始随机性、确定性不等于精确可逆、同一步数不一定同NFE | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 执行者通读 + 独立逐章复核<br>保留：完整σ跨步公式、η=0仍有初始随机性、确定性不等于精确可逆、同一步数不一定同NFE | 执行者已实际通读正文、公式/例子、练习及适用 lab；独立完整审计交叉复核。 | — |
| [latent-diffusion · Latent Diffusion：在压缩表示里生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/latent-diffusion) | 保留现有内容 · 可选增强已取舍 | 空间位置64倍与总标量48倍区分、s成对缩放、重建瓶颈、图像Q/文本KV和LDM与sampler正交关系 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：空间位置64倍与总标量48倍区分、s成对缩放、重建瓶颈、图像Q/文本KV和LDM与sampler正交关系 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [flow-matching · Flow Matching：学习把噪声运向数据的速度](https://haoyunli.github.io/deep-learning-atlas/#/lesson/flow-matching) | 保留现有内容 · 可选增强已取舍 | 明确t=0噪声/t=1数据、CFM直线特例、条件平均、训练无ODE/生成需ODE、NFE、不同v定义，质量很高 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：明确t=0噪声/t=1数据、CFM直线特例、条件平均、训练无ODE/生成需ODE、NFE、不同v定义，质量很高 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## reinforcement

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [off-policy-evaluation · OPE：用旧策略的日志估计新策略价值](https://haoyunli.github.io/deep-learning-atlas/#/lesson/off-policy-evaluation) | 保留现有内容 · 可选增强已取舍 | 固定π、support/未测混杂、IPS/DR、单条DR可超奖励范围、累计比率、ESS≠区间、独立策略选择评估，几乎无须补文字 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：固定π、support/未测混杂、IPS/DR、单条DR可超奖励范围、累计比率、ESS≠区间、独立策略选择评估，几乎无须补文字 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [state-space-models · SSM 与 S4：把长序列压进连续状态](https://haoyunli.github.io/deep-learning-atlas/#/lesson/state-space-models) | 保留现有内容 · 可选增强已取舍 | Ā=.8、输入[1,0,2]→状态[1,.8,2.64] 已是很好的算例；卷积/递推同一系统的关系正确 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：Ā=.8、输入[1,0,2]→状态[1,.8,2.64] 已是很好的算例；卷积/递推同一系统的关系正确 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [mamba · Mamba：让状态更新由当前内容决定](https://haoyunli.github.io/deep-learning-atlas/#/lesson/mamba) | 已修改并验证 | Δ/B/C 的输入相关性、局部卷积缓存、scan 实测边界 本轮复核：离散 B 的写法容易读成 B_t 被重复相乘，直接输入分支未定义。 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮：定义 B̄_t=Discretize(A,Δ_t,B_t)，更新只乘 B̄_t x_t；明确 D_skip 的直接输入项。内容相关参数图作为可选后续增强。<br>最终取舍：定义 B̄_t=Discretize(A,Δ_t,B_t)，更新只乘 B̄_t x_t；明确 D_skip 的直接输入项。内容相关参数图作为可选后续增强。 | 执行者通读 + 独立逐章复核<br>保留：Δ/B/C 的输入相关性、局部卷积缓存、scan 实测边界 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | [1](https://arxiv.org/html/2312.00752v2) |
| [rwkv · RWKV：并行训练，循环生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/rwkv) | 已修改并验证 | numerator/denominator 稳定状态、会话隔离、固定缓存与精确检索的边界 本轮复核：原加权式遗漏当前 token bonus 并混用历史衰减索引。 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮：明确采用 2023 RWKV；历史项使用 (t−1−i)w，当前项使用 u+k_t，补输出投影及 u=ln2 的 14/3 对照。<br>最终取舍：明确采用 2023 RWKV；历史项使用 (t−1−i)w，当前项使用 u+k_t，补输出投影及 u=ln2 的 14/3 对照。 | 执行者通读 + 独立逐章复核<br>保留：numerator/denominator 稳定状态、会话隔离、固定缓存与精确检索的边界 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | [1](https://arxiv.org/html/2305.13048v2) |

## vision

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [faster-rcnn-yolo · Faster R-CNN 与 YOLO：两条检测流水线](https://haoyunli.github.io/deep-learning-atlas/#/lesson/faster-rcnn-yolo) | 保留现有内容 · 可选增强已取舍 | 几何变换回原图、small AP、固定分辨率与包含后处理的延迟比较 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：几何变换回原图、small AP、固定分辨率与包含后处理的延迟比较 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [segment-anything · SAM：用 prompt 指出要分割什么](https://haoyunli.github.io/deep-learning-atlas/#/lesson/segment-anything) | 保留现有内容 · 可选增强已取舍 | embedding复用、正负点、多mask歧义、质量分不等于医学置信度 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：embedding复用、正负点、多mask歧义、质量分不等于医学置信度 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [vision-language-models · VLM 与 Cross-Attention：让图像进入语言模型](https://haoyunli.github.io/deep-learning-atlas/#/lesson/vision-language-models) | 保留现有内容 · 可选增强已取舍 | text-only、image-only、打乱图像三种消融非常重要 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：text-only、image-only、打乱图像三种消融非常重要 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## sequence

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [ctc-wav2vec · CTC 与 wav2vec 2.0：从声音到文字](https://haoyunli.github.io/deep-learning-atlas/#/lesson/ctc-wav2vec) | 已修改并验证 | 原文要求去重目标标签，会错误删除 ll 等重复字符；blank 的路径折叠顺序需明确。 | 改为 T≥U+相邻重复对数；补 ll 的2/3帧对照并改为可计算练习。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：CTC对路径求和与wav2vec自监督预训练分开；配套题已经正确说明相邻重复字符需要blank | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://www.cs.toronto.edu/~graves/icml_2006.pdf) |
| [whisper · Whisper：把 ASR 变成多任务序列生成](https://haoyunli.github.io/deep-learning-atlas/#/lesson/whisper) | 保留现有内容 · 可选增强已取舍 | 特殊tokens统一任务、静音幻觉、原时间轴与分窗offset | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：特殊tokens统一任务、静音幻觉、原时间轴与分窗offset | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [two-tower-retrieval · 矩阵分解、负采样与双塔召回](https://haoyunli.github.io/deep-learning-atlas/#/lesson/two-tower-retrieval) | 保留现有内容 · 可选增强已取舍 | 向量范数与cosine区别、future catalog、ANN recall与模型recall分开 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：向量范数与cosine区别、future catalog、ANN recall与模型recall分开 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [matrix-factorization · 矩阵分解：推荐系统的可解释坐标基线](https://haoyunli.github.io/deep-learning-atlas/#/lesson/matrix-factorization) | 保留现有内容 · 可选增强已取舍 | bias baseline、cold start、显式/隐式反馈区别 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：bias baseline、cold start、显式/隐式反馈区别 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [learning-to-rank · Learning to Rank：从候选到有用顺序](https://haoyunli.github.io/deep-learning-atlas/#/lesson/learning-to-rank) | 保留现有内容 · 可选增强已取舍 | candidate recall是ranker上限、位置偏差、同query比较 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：candidate recall是ranker上限、位置偏差、同query比较 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [survival-analysis · Kaplan–Meier、Cox 与 DeepSurv：有删失的时间预测](https://haoyunli.github.io/deep-learning-atlas/#/lesson/survival-analysis) | 保留现有内容 · 可选增强已取舍 | 非信息删失、风险集、比例风险、C-index不是校准都写得好 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：非信息删失、风险集、比例风险、C-index不是校准都写得好 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [deep-ensembles · Deep Ensembles：用多个解表达模型不确定性](https://haoyunli.github.io/deep-learning-atlas/#/lesson/deep-ensembles) | 保留现有内容 · 可选增强已取舍 | 概率平均、total variance、共同偏差不能靠低disagreement排除 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：概率平均、total variance、共同偏差不能靠低disagreement排除 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [conformal-selective-prediction · Conformal、拒答与 OOD：知道何时不确定](https://haoyunli.github.io/deep-learning-atlas/#/lesson/conformal-selective-prediction) | 已修改并验证 | s=1−p 的例子却称加入低概率标签，筛选方向反了；有限样本分位数缺 k>n 的全集情况，单次coverage降低不能直接证明交换性破坏。 | 明确 p≥1−q̂，补三类集合计算及 +∞ 边界；校准/域变化解释与练习同步修正。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：独立calibration、边际而非subgroup保证、OOD目标分开 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 | [1](https://arxiv.org/html/2107.07511) |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [causal-treatment-effects · DAG、Propensity 与 Treatment Effect：从预测到干预](https://haoyunli.github.io/deep-learning-atlas/#/lesson/causal-treatment-effects) | 保留现有内容 · 可选增强已取舍 | time zero、estimand、overlap、未测混杂、cross-fitting和预后≠疗效 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：time zero、estimand、overlap、未测混杂、cross-fitting和预后≠疗效 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## reinforcement

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [imitation-learning · Behavior Cloning、DAgger 与 GAIL：从示范学策略](https://haoyunli.github.io/deep-learning-atlas/#/lesson/imitation-learning) | 保留现有内容 · 可选增强已取舍 | BC/DAgger闭环差别、专家查询成本与安全约束 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：BC/DAgger闭环差别、专家查询成本与安全约束 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [safe-rl-pomdp · POMDP 与 Safe RL：看不全时仍守约束](https://haoyunli.github.io/deep-learning-atlas/#/lesson/safe-rl-pomdp) | 保留现有内容 · 可选增强已取舍 | 期望约束≠每条轨迹安全、shield/fallback、d由需求而非训练成绩决定 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：期望约束≠每条轨迹安全、shield/fallback、d由需求而非训练成绩决定 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [quantization · 量化：把浮点张量映射到低比特整数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/quantization) | 保留现有内容 · 可选增强已取舍 | scale/zero-point、PTQ/QAT、真kernel与墙钟性能的区分 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：scale/zero-point、PTQ/QAT、真kernel与墙钟性能的区分 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [distillation-pruning · 蒸馏与剪枝：把容量换成更小的计算图](https://haoyunli.github.io/deep-learning-atlas/#/lesson/distillation-pruning) | 保留现有内容 · 可选增强已取舍 | T²、KL teacher→student、dense zero不自动加速；总体内容可用 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：T²、KL teacher→student、dense zero不自动加速；总体内容可用 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [model-serving-monitoring · 导出、服务与监控：让训练结果在真实系统中成立](https://haoyunli.github.io/deep-learning-atlas/#/lesson/model-serving-monitoring) | 保留现有内容 · 可选增强已取舍 | 完整latency、golden输入输出、延迟标签、drift非质量证明、版本回滚覆盖很完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：完整latency、golden输入输出、延迟标签、drift非质量证明、版本回滚覆盖很完整 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## adaptation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [episodic-meta-learning · Episodic Meta-Learning：划分 Support Set 与 Query Set](https://haoyunli.github.io/deep-learning-atlas/#/lesson/episodic-meta-learning) | 已修改并验证 | 现有3-way/K可调、12个query固定的真实计数图，以及任务先切分的协议 本轮复核：同一患者的 support/query 重叠未区分跨 meta split 与同一 held-out task。 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。 本轮：题干明确目标是新患者泛化且患者已用于 meta-training；解释合法的新患者 task 内 support/query 与跨 meta split 泄漏的区别。<br>最终取舍：题干明确目标是新患者泛化且患者已用于 meta-training；解释合法的新患者 task 内 support/query 与跨 meta split 泄漏的区别。 | 独立审计通读 + 执行者逐课对账<br>保留：现有3-way/K可调、12个query固定的真实计数图，以及任务先切分的协议 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [fomaml-reptile · FOMAML 与 Reptile：省掉二阶导数](https://haoyunli.github.io/deep-learning-atlas/#/lesson/fomaml-reptile) | 已修改并验证 | 一维二次函数是精确计算，MAML梯度包含(1−2α)、FOMAML忽略它、Reptile取θ′−θ；已有数值，不要重复造同款 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：一维二次函数是精确计算，MAML梯度包含(1−2α)、FOMAML忽略它、Reptile取θ′−θ；已有数值，不要重复造同款 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [matching-networks · Matching Networks：让 query 注意支持样本](https://haoyunli.github.io/deep-learning-atlas/#/lesson/matching-networks) | 已修改并验证 | 对每个support softmax再按类求和、full context可选、样本不均衡先验警告 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：对每个support softmax再按类求和、full context可选、样本不均衡先验警告 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [relation-networks · Relation Networks：把距离函数也学出来](https://haoyunli.github.io/deep-learning-atlas/#/lesson/relation-networks) | 已修改并验证 | K-shot求和/均值尺度区别、original MSE、learned comparison容量和same-backbone消融 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：K-shot求和/均值尺度区别、original MSE、learned comparison容量和same-backbone消融 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [siamese-triplet · Siamese Networks 与 Triplet Loss：先学会比较](https://haoyunli.github.io/deep-learning-atlas/#/lesson/siamese-triplet) | 已修改并验证 | 共享权重、semi-hard mining、零loss比例与验证阈值；已有d+=.5,d−=1.2,m=.4→0题；项目已有可调margin、平方距离边界图 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：共享权重、semi-hard mining、零loss比例与验证阈值；已有d+=.5,d−=1.2,m=.4→0题；项目已有可调margin、平方距离边界图 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [meta-sgd-anil · Meta-SGD 与 ANIL：学更新规则或只改 head](https://haoyunli.github.io/deep-learning-atlas/#/lesson/meta-sgd-anil) | 已修改并验证 | Meta-SGD可学负α；ANIL inner只改head、outer仍改backbone已准确 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：Meta-SGD可学负α；ANIL inner只改head、outer仍改backbone已准确 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [learned-optimizers · Learned Optimizer：让网络提出更新量](https://haoyunli.github.io/deep-learning-atlas/#/lesson/learned-optimizers) | 已修改并验证 | optimizeeθ与optimizerφ、unroll/horizon泛化、meta-training成本与Adam基线都已清楚 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：optimizeeθ与optimizerφ、unroll/horizon泛化、meta-training成本与Adam基线都已清楚 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [hypernetworks-meta-gradients · Hypernetworks 与 Meta-Gradient：参数也可以由模型产生](https://haoyunli.github.io/deep-learning-atlas/#/lesson/hypernetworks-meta-gradients) | 已修改并验证 | 生成head/adapter而非整个大模型、task metadata捷径、generated weights是否真被target使用 本轮复核：无标签 query 输入统计被一律判为泄漏，缺少 inductive 协议条件。 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。 本轮：明确声明 support-only inductive；解释公开允许的无 query-label transductive 输入可合法，区分协议违反与标签泄漏。新增计算图可选后置。<br>最终取舍：明确声明 support-only inductive；解释公开允许的无 query-label transductive 输入可合法，区分协议违反与标签泄漏。新增计算图可选后置。 | 独立审计通读 + 执行者逐课对账<br>保留：生成head/adapter而非整个大模型、task metadata捷径、generated weights是否真被target使用 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [memory-augmented-meta-learning · Memory-Augmented Meta-Learning：把新标签写进外部记忆](https://haoyunli.github.io/deep-learning-atlas/#/lesson/memory-augmented-meta-learning) | 已修改并验证 | 当前 xₜ 与延迟 yₜ₋₁ 错配，破坏 one-shot 标签绑定；正文的临时memory/session边界其余正确。 | 绑定缓存 xₜ₋₁ 与 yₜ₋₁；补 A/B 三时刻例子与时间配对题。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：label延迟、memory读写与reset、跨会话隔离是正确主线 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | [1](https://arxiv.org/html/1605.06065) |
| [meta-reinforcement-learning · Meta-RL：让 agent 学会快速探索新任务](https://haoyunli.github.io/deep-learning-atlas/#/lesson/meta-reinforcement-learning) | 已修改并验证 | episode reset≠trial reset、hidden state适配与慢速权重学习、交互成本/安全边界 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：episode reset≠trial reset、hidden state适配与慢速权重学习、交互成本/安全边界 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [cross-domain-few-shot · Cross-Domain Few-Shot：新类别还来自新领域](https://haoyunli.github.io/deep-learning-atlas/#/lesson/cross-domain-few-shot) | 已修改并验证 | source-only选参、强预训练原型/linear baseline、小support的BN风险，以及已有完整跨机构项目 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：source-only选参、强预训练原型/linear baseline、小support的BN风险，以及已有完整跨机构项目 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [transfer-learning-strategies · Transfer Learning：Freeze、Fine-Tune 还是 Train from Scratch](https://haoyunli.github.io/deep-learning-atlas/#/lesson/transfer-learning-strategies) | 已修改并验证 | head-only→后层→全量/从零的循序基线、BN buffers与数据切分 本轮复核：head-only 与 fine-tune 的优化变量和预训练距离正则混用。 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮：分开固定 θ₀ 的 min_w 与初始化于 θ₀ 的 min_{θ,w}；距离正则只用于对应 backbone，标为可选并区别 weight decay。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：分开固定 θ₀ 的 min_w 与初始化于 θ₀ 的 min_{θ,w}；距离正则只用于对应 backbone，标为可选并区别 weight decay。 | 执行者通读 + 独立逐章复核<br>保留：head-only→后层→全量/从零的循序基线、BN buffers与数据切分 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [domain-adaptation-dann · DANN：让特征能做任务却难分领域](https://haoyunli.github.io/deep-learning-atlas/#/lesson/domain-adaptation-dann) | 已修改并验证 | GRL符号正确、source任务与两域domain head分工、50%域准确率不证明成功、条件错位可能负迁移 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：GRL符号正确、source任务与两域domain head分工、50%域准确率不证明成功、条件错位可能负迁移 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [domain-generalization-irm · Domain Generalization 与 IRM：目标域不可见怎么办](https://haoyunli.github.io/deep-learning-atlas/#/lesson/domain-generalization-irm) | 已修改并验证 | 公式混合原始 IRM 的可优化 classifier 和 IRMv1 固定标量 w=1；环境/因果限制其余准确。 本轮复核：已发布 IRMv1 公式正确；剩余练习把同方向相关等同于无环境变化。 | 分清两种目标，改为只优化 Φ 的 IRMv1 方程；题目检查固定求导点。 本轮：将不足条件限定为机制与强度相同且无其他信息性变化；说明 80%→90% 同方向变化仍有环境信息，但不保证识别因果。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：将不足条件限定为机制与强度相同且无其他信息性变化；说明 80%→90% 同方向变化仍有环境信息，但不保证识别因果。 | 执行者通读 + 独立逐章复核<br>保留：IRM不保证因果性、强ERM与GroupDRO对照、source-domain选模、environment要有机制意义 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | [1](https://arxiv.org/html/1907.02893) · [2](https://arxiv.org/html/1907.02893v3) |
| [continual-learning · Continual Learning：在学新任务时别忘旧任务](https://haoyunli.github.io/deep-learning-atlas/#/lesson/continual-learning) | 已修改并验证 | 三类incremental协议、EWC/LwF/replay/GEM、内存公平性；计划使用accuracy matrix正确 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：三类incremental协议、EWC/LwF/replay/GEM、内存公平性；计划使用accuracy matrix正确 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [active-learning · Active Learning：下一笔标注花在哪里](https://haoyunli.github.io/deep-learning-atlas/#/lesson/active-learning) | 已修改并验证 | 已有budget1–5真实选择A/B/C/D/E、固定entropy教学说明、样本成本/随机多seed基线 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：已有budget1–5真实选择A/B/C/D/E、固定entropy教学说明、样本成本/随机多seed基线 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [multi-task-learning · Multi-Task Learning：共享什么，冲突怎么办](https://haoyunli.github.io/deep-learning-atlas/#/lesson/multi-task-learning) | 已修改并验证 | loss量纲、任务采样率与权重不同、gradient cosine、single-task与Pareto对照 本轮复核：Gaussian regression 的 uncertainty loss 被写成通用任务公式，求和范围不清。 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮：用逐任务括号明确求和；限定 Gaussian regression，定义 s_t=log σ_t²，说明分类 likelihood 要单独推导。梯度合成图可选后置。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：用逐任务括号明确求和；限定 Gaussian regression，定义 s_t=log σ_t²，说明分类 likelihood 要单独推导。梯度合成图可选后置。 | 执行者通读 + 独立逐章复核<br>保留：loss量纲、任务采样率与权重不同、gradient cosine、single-task与Pareto对照 | 本轮全文/公式及练习对账；全站 build、TypeScript 和内容/计算 validators 通过。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | [1](https://arxiv.org/html/1705.07115v3) |
| [automl-hpo-nas · AutoML：HPO、Hypergradient 与 NAS](https://haoyunli.github.io/deep-learning-atlas/#/lesson/automl-hpo-nas) | 已修改并验证 | random baseline、资源预算、winner’s curse、continuous relaxation与离散化重训已完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：random baseline、资源预算、winner’s curse、continuous relaxation与离散化重训已完整 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [curriculum-self-paced · Curriculum 与 Self-Paced Learning：先学什么](https://haoyunli.github.io/deep-learning-atlas/#/lesson/curriculum-self-paced) | 已修改并验证 | 章节正确区分预设 curriculum 与按当前loss筛选 self-paced、尾部能力风险；引用 arXiv 指向无关论文。 | 替换为 Bengio 等 Curriculum Learning 的准确 DOI；保留正文与练习。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：外部difficulty与当前loss选样区分、公平examples-seen预算、群体覆盖警告和现有binary v公式 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | [1](https://doi.org/10.1145/1553374.1553380) |
| [federated-learning · Federated Learning 与 FedAvg：数据不集中时怎样共同训练](https://haoyunli.github.io/deep-learning-atlas/#/lesson/federated-learning) | 已修改并验证 | 已按[1,2,1]样本权重实时重算FedAvg，local steps1–5、客户端target[−2,1,4]、privacy非保证 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：已按[1,2,1]样本权重实时重算FedAvg，local steps1–5、客户端target[−2,1,4]、privacy非保证 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [test-time-adaptation · Test-Time Adaptation 与 TENT：模型上线后还能改什么](https://haoyunli.github.io/deep-learning-atlas/#/lesson/test-time-adaptation) | 已修改并验证 | affine/statistics白名单、source reset、predict-then-update vs update-then-predict、entropy降但accuracy降的警告 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：affine/statistics白名单、source reset、predict-then-update vs update-then-predict、entropy降但accuracy降的警告 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [semi-supervised-self-training · Semi-Supervised Learning 与 Self-Training：使用无标签数据](https://haoyunli.github.io/deep-learning-atlas/#/lesson/semi-supervised-self-training) | 已修改并验证 | weak产生pseudo-label、strong一致性、阈值/coverage/少数类与OOD问题已准确 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：weak产生pseudo-label、strong一致性、阈值/coverage/少数类与OOD问题已准确 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | — |
| [online-learning-drift · Online Learning 与 Concept Drift：数据流里持续更新](https://haoyunli.github.io/deep-learning-atlas/#/lesson/online-learning-drift) | 已修改并验证 | prequential评估、监督延迟和漂移类型边界清楚；概念漂移综述引用 arXiv 指向无关论文。 | 替换为 Gama 等2014综述 DOI；保留已有机制与题目。 本轮共享练习采用确定性选项换位，保持ID；八题相关干扰项另有更新，IRM答案另作精度修正。<br>最终取舍：已核对既有主线修正；保持已完成内容，余下教学增强可选后置。 | 执行者通读 + 独立逐章复核<br>保留：predict→延迟标签→计分/更新、30天label maturity、PSI不能证明accuracy下降、选择偏差与回滚 | 正文、公式、例子及两道练习已核对；本批构建/内容回归通过；1440/375px浏览器HTTP200、无横向溢出、无脚本错误或失败请求。 本轮46题答案文本/ID/四个不同选项/稳定排列检查通过（IRM答案精度修正单列），正确位置12/12/11/11； 当前版本714个桌面/手机页面检查通过；最后一批32个定向渲染/控件检查通过，无页面错误/失败请求/溢出。 | [1](https://doi.org/10.1145/2523813) |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [count-likelihoods · Count Likelihood：先决定观测是怎样产生的](https://haoyunli.github.io/deep-learning-atlas/#/lesson/count-likelihoods) | 保留现有内容 · 可选增强已取舍 | 真实Poisson/NB PMF、tail mass、θ/α方向、原始count与β区分非常完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：真实Poisson/NB PMF、tail mass、θ/α方向、原始count与β区分非常完整 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## training

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [pseudobulk-hierarchy · Pseudobulk：把 cell evidence 放回 donor 层级](https://haoyunli.github.io/deep-learning-atlas/#/lesson/pseudobulk-hierarchy) | 保留现有内容 · 可选增强已取舍 | composition slider、independent unit、sum/mean/log顺序反例已很直观 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：composition slider、independent unit、sum/mean/log顺序反例已很直观 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [nested-group-validation · Nested Group CV：评估整套选择流程](https://haoyunli.github.io/deep-learning-atlas/#/lesson/nested-group-validation) | 保留现有内容 · 可选增强已取舍 | 6-donor完整inner/outer/refit例、grouped fit scope与独立性边界非常强 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：6-donor完整inner/outer/refit例、grouped fit scope与独立性边界非常强 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [elastic-net · Elastic Net：相关 features 多、donors 少时先做稳基线](https://haoyunli.github.io/deep-learning-atlas/#/lesson/elastic-net) | 保留现有内容 · 可选增强已取舍 | 正交设计解析threshold/shrinkage、真实相关特征需迭代、软件符号映射已说明 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：正交设计解析threshold/shrinkage、真实相关特征需迭代、软件符号映射已说明 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## generative

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [scvi · scVI：用 Count VAE 分开 latent state 与测量条件](https://haoyunli.github.io/deep-learning-atlas/#/lesson/scvi) | 保留现有内容 · 可选增强已取舍 | raw counts、C×G→C×K→C×G、library=10/20数值、confounding与transductive限制完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：raw counts、C×G→C×K→C×G、library=10/20数值、confounding与transductive限制完整 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## classical

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [spatial-assignment · Spatial Assignment：先分清 matching、segmentation 与 annotation](https://haoyunli.github.io/deep-learning-atlas/#/lesson/spatial-assignment) | 保留现有内容 · 可选增强已取舍 | geometry/expression真实cost/Gibbs/entropy、非EM/RL/非校准声明十分到位 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：geometry/expression真实cost/Gibbs/entropy、非EM/RL/非校准声明十分到位 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
| [optimal-transport · Optimal Transport：同时分配，而不是各自找最近点](https://haoyunli.github.io/deep-learning-atlas/#/lesson/optimal-transport) | 保留现有内容 · 可选增强已取舍 | mass≠row概率、balanced/partial/unbalanced、Sinkhorn与数值toy很完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：mass≠row概率、balanced/partial/unbalanced、Sinkhorn与数值toy很完整 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |

## representation

| 章节 | 实际状态 | 具体发现 / 保留理由 | 已做修改 / 取舍 | 审阅依据与独立复核 | 验证 | 本轮核验来源 |
| --- | --- | --- | --- | --- | --- | --- |
| [multiple-instance-learning · MIL：只有 donor 标签，怎样利用许多 cells 或 patches](https://haoyunli.github.io/deep-learning-atlas/#/lesson/multiple-instance-learning) | 保留现有内容 · 可选增强已取舍 | bag监督、[.25,1.5]手算、permutation invariance与attention非因果限制完整 | 保留现有机制、例子与练习；额外教学扩展作为可选后续增强。<br>最终取舍：保留现有有效内容；额外图示、互动或例题作为可选后续增强，不计为本轮科学错误待办。 | 独立审计通读 + 执行者逐课对账<br>保留：bag监督、[.25,1.5]手算、permutation invariance与attention非因果限制完整 | 独立审计实际阅读正文、公式/例子、练习及适用 lab；执行者已读取逐课判断并对账。 | — |
