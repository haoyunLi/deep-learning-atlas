import { useState } from "react";
import {
  tanhProbe,
  trainingLossSlice,
  trainingNumber as f,
  trainingStep,
  type TrainingInputs,
} from "../../studio/backpropMath";

export default function TrainingDiagnostics({
  inputs,
  step,
}: {
  inputs: TrainingInputs;
  step: number;
}) {
  const [delta, setDelta] = useState(0.1);
  const result = trainingStep(inputs);
  const probe = tanhProbe(result.before.z, delta);
  const curve = trainingLossSlice(inputs);
  const tx = (z: number) => 46 + ((z + 7) / 14) * 332;
  const ty = (h: number) => 118 - h * 70;
  const etaX = (eta: number) => 58 + (eta / 2) * 320;
  const maxLoss =
    Math.max(
      0.001,
      result.before.loss,
      result.after.loss,
      ...curve.points.map((p) => p.loss),
    ) * 1.2;
  const lossY = (loss: number) => 198 - (loss / maxLoss) * 148;
  const tanhPath = Array.from({ length: 141 }, (_, i) => {
    const z = -7 + i / 10;
    return `${i ? "L" : "M"}${tx(z)},${ty(Math.tanh(z))}`;
  }).join(" ");
  const lossPath = curve.points
    .map((p, i) => `${i ? "L" : "M"}${etaX(p.eta)},${lossY(p.loss)}`)
    .join(" ");
  return (
    <section
      className="training-diagnostics"
      aria-label="斜率与一步更新的几何解释"
    >
      <div className="training-diagnostic">
        <h3>为什么饱和会压小梯度？</h3>
        <div
          className="training-plot-scroll"
          role="region"
          tabIndex={0}
          aria-label="tanh 曲线，窄屏可左右滑动"
        >
          <svg
            viewBox="0 0 420 245"
            role="img"
            aria-labelledby="tanh-title tanh-desc"
          >
            <title id="tanh-title">
              当前 z={f(result.before.z)} 的 tanh 局部斜率
            </title>
            <desc id="tanh-desc">
              蓝线是 tanh；橙色虚线是当前点的切线。斜率 {f(probe.slope)}
              。探针单独改变 z={f(delta)}，实际 h 改变 {f(probe.actualChange)}。
            </desc>
            <text x="46" y="25">
              h = tanh(z) · 蓝曲线 / 橙切线
            </text>
            <path d="M46 48V198H378M46 118H378" className="diagnostic-axis" />
            {[-1, 0, 1].map((h) => (
              <text key={h} x="34" y={ty(h) + 4} textAnchor="end">
                {h}
              </text>
            ))}
            {[-6, 0, 6].map((z) => (
              <text key={z} x={tx(z)} y="218" textAnchor="middle">
                {z}
              </text>
            ))}
            <text x="390" y="218">
              z
            </text>
            <path d={tanhPath} className="diagnostic-curve" />
            <path
              d={`M${tx(result.before.z - 0.6)} ${ty(probe.h - probe.slope * 0.6)}L${tx(result.before.z + 0.6)} ${ty(probe.h + probe.slope * 0.6)}`}
              className="diagnostic-tangent"
            />
            <path
              d={`M${tx(result.before.z)} ${ty(probe.h)}L${tx(result.before.z + delta)} ${ty(probe.nextH)}`}
              className="diagnostic-probe"
            />
            <circle
              cx={tx(result.before.z)}
              cy={ty(probe.h)}
              r="4"
              className="diagnostic-current"
            />
            <circle
              cx={tx(result.before.z + delta)}
              cy={ty(probe.nextH)}
              r="4"
              className="diagnostic-probe-point"
            />
          </svg>
        </div>
        <label>
          只探测 tanh gate：Δz{" "}
          <select
            aria-label="tanh 小变动 Δz"
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value))}
          >
            <option value="0.1">+0.1</option>
            <option value="0.01">+0.01</option>
            <option value="-0.1">−0.1</option>
            <option value="-0.01">−0.01</option>
          </select>
        </label>
        <p className="training-probe-values">
          当前斜率 1−h²={f(probe.slope)}；实际 Δh={f(probe.actualChange)}
          ，局部近似斜率×Δz={f(probe.linearChange)}；割线 Δh/Δz=
          {f(probe.secant)}。
        </p>
        <p>
          曲线越平，同样的小 Δz 越难改变 h。减小
          |Δz|，割线更接近切线。这是局部敏感度探针，未执行 SGD。
        </p>
        {step >= 4 && (
          <p className="training-chain-product">
            完整路径：g𝑤 = δh × (1−h²) × x = {f(result.hiddenGradient)} ×{" "}
            {f(probe.slope)} × {f(inputs.x)} = {f(result.wGradient)}
            。局部斜率非负；x 或 v 的符号仍会改变完整梯度方向。
          </p>
        )}
      </div>
      {step >= 5 && (
        <div className="training-diagnostic">
          <h3>沿负梯度，走多远才合适？</h3>
          <div
            className="training-plot-scroll"
            role="region"
            tabIndex={0}
            aria-label="冻结梯度的一步 loss 曲线，窄屏可左右滑动"
          >
            <svg
              viewBox="0 0 420 245"
              role="img"
              aria-labelledby="loss-slice-title loss-slice-desc"
            >
              <title id="loss-slice-title">
                一步 loss 对 learning rate 的变化
              </title>
              <desc id="loss-slice-desc">
                φ(η)=L(w−ηg𝑤,v−ηgᵥ)。同一旧参数与梯度，η 从 0 到
                2；灰色虚线是更新前的 loss，橙点是当前 η={f(inputs.eta)}，loss=
                {f(result.after.loss)}。不是连续训练历史。
              </desc>
              <text x="58" y="25">
                Loss φ(η) · 蓝曲线 / 橙色当前步长
              </text>
              <path d="M58 48V198H378" className="diagnostic-axis" />
              {[0, maxLoss / 2, maxLoss].map((loss) => (
                <text key={loss} x="50" y={lossY(loss) + 4} textAnchor="end">
                  {f(loss)}
                </text>
              ))}
              {[0, 1, 2].map((eta) => (
                <text key={eta} x={etaX(eta)} y="218" textAnchor="middle">
                  {eta}
                </text>
              ))}
              <text x="390" y="218">
                η
              </text>
              <path
                d={`M58 ${lossY(result.before.loss)}H378`}
                className="diagnostic-reference"
              />
              <path d={lossPath} className="diagnostic-curve" />
              <circle
                cx="58"
                cy={lossY(result.before.loss)}
                r="4"
                className="diagnostic-current"
              />
              <circle
                data-eta={inputs.eta}
                data-loss={result.after.loss}
                cx={etaX(inputs.eta)}
                cy={lossY(result.after.loss)}
                r="5"
                className="diagnostic-selected"
              />
            </svg>
          </div>
          <p>
            φ(η)=L(w−ηg𝑤, v−ηgᵥ)；每个位置都是从同一旧参数提出的一步更新。灰虚线
            L(旧)={f(result.before.loss)}；橙点 η={f(inputs.eta)}，L(新)=
            {f(result.after.loss)}。
          </p>
          <p>
            η=0 处斜率 −(g𝑤²+gᵥ²)={f(curve.initialSlope)}
            。非零梯度只保证足够小的步长朝下降方向；走过低损失区，loss
            仍会升高。零梯度时曲线为水平线。
          </p>
          <p>
            横轴固定为 η∈[0,2]；纵轴从 0 起，并随当前参数调整。81
            个实际计算点连成示意曲线，不是训练轮次，也不保证区间外的行为。
          </p>
        </div>
      )}
    </section>
  );
}
