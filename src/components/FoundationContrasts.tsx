import { useState } from "react";
import {
  xorContrast,
  classificationContrast,
  sharedParameterContrast,
} from "./foundationContrastMath";
import "./foundation-contrasts.css";

const colors = ["#638fc3", "#218776"];
const f = (n: number) => n.toFixed(3);

function XorContrast() {
  const [nonlinear, setNonlinear] = useState(true);
  const rows = xorContrast(nonlinear);
  const correct = rows.filter((r) => r.prediction === r.target).length;
  const hidden = new Map<string, typeof rows>();
  rows.forEach((r) => {
    const key = `${r.h1},${r.h2}`;
    hidden.set(key, [...(hidden.get(key) || []), r]);
  });
  const ix = (x: number) => 65 + ((x + 0.25) / 1.5) * 230;
  const iy = (y: number) => 270 - ((y + 0.25) / 1.5) * 190;
  const hx = (x: number) => 405 + ((x + 0.25) / 2.5) * 230;
  const hy = (y: number) => 270 - ((y + 1.25) / 2.5) * 190;
  return (
    <section
      className="foundation-contrast detail-section"
      data-foundation="xor"
    >
      <h2>保留权重，只移除 activation</h2>
      <p>
        四个输入的目标是
        XOR。示例权重人为构造，当前没有训练：s=x₁+x₂，h₁=φ(s)，h₂=φ(s−1)，margin=h₁−2h₂−0.5；margin&gt;0
        预测 1。
      </p>
      <label className="contrast-control">
        Activation
        <select
          aria-label="Activation"
          value={nonlinear ? "relu" : "identity"}
          onChange={(e) => setNonlinear(e.target.value === "relu")}
        >
          <option value="relu">ReLU：φ(z)=max(0,z)</option>
          <option value="identity">移除非线性：φ(z)=z</option>
        </select>
      </label>
      <div
        className="contrast-plot-scroll"
        tabIndex={0}
        role="region"
        aria-label="XOR 输入与隐藏空间，可横向滚动"
      >
        <svg
          viewBox="0 0 720 330"
          role="img"
          aria-label="同一权重在 ReLU 与 identity 下的隐藏表示与固定预测边界"
        >
          <text x="35" y="30" className="contrast-title">
            Input space · 目标 0 / 1
          </text>
          <text x="375" y="30" className="contrast-title">
            Hidden space · 同一线性 head
          </text>
          <path d="M65 70V270H310 M405 70V270H650" className="contrast-axis" />
          <text x="305" y="294">
            x₁
          </text>
          <text x="45" y="72">
            x₂
          </text>
          <text x="645" y="294">
            h₁
          </text>
          <text x="383" y="72">
            h₂
          </text>
          {[0, 1].map((v) => (
            <g key={v}>
              <text x={ix(v)} y="292" textAnchor="middle">
                {v}
              </text>
              <text x="53" y={iy(v) + 5} textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          {[0, 1, 2].map((v) => (
            <text key={v} x={hx(v)} y="292" textAnchor="middle">
              {v}
            </text>
          ))}
          {[-1, 0, 1].map((v) => (
            <text key={v} x="394" y={hy(v) + 5} textAnchor="end">
              {v}
            </text>
          ))}
          {rows.map((r) => (
            <g key={`${r.x1}${r.x2}`}>
              <circle
                cx={ix(r.x1)}
                cy={iy(r.x2)}
                r="8"
                fill={colors[r.target]}
              />
              <text x={ix(r.x1) + 14} y={iy(r.x2) + 5}>
                {r.x1}
                {r.x2} → {r.target}
              </text>
            </g>
          ))}
          <line
            x1={hx(-0.25)}
            y1={hy(-0.375)}
            x2={hx(2.25)}
            y2={hy(0.875)}
            stroke="#d18743"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          {[...hidden.values()].map((group) => {
            const r = group[0];
            return (
              <g key={`${r.h1}${r.h2}`}>
                <circle
                  cx={hx(r.h1)}
                  cy={hy(r.h2)}
                  r="8"
                  fill={colors[r.target]}
                />
                <text x={hx(r.h1) + 14} y={hy(r.h2) + 5}>
                  {group.map((p) => `${p.x1}${p.x2}`).join("/")} → {r.target}
                </text>
              </g>
            );
          })}
          <text x="375" y="318">
            虚线：margin=0；颜色与文字表示目标类别
          </text>
        </svg>
      </div>
      <div className="contrast-table-scroll">
        <table>
          <caption>
            同一权重的四次 forward ·{" "}
            <span data-xor-correct={correct}>{correct}/4 正确</span>
          </caption>
          <thead>
            <tr>
              <th>输入</th>
              <th>隐藏 (h₁,h₂)</th>
              <th>margin</th>
              <th>目标 → 预测</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.x1}${r.x2}`} data-xor-row={`${r.x1}${r.x2}`}>
                <td>
                  {r.x1}, {r.x2}
                </td>
                <td>
                  {r.h1}, {r.h2}
                </td>
                <td>{r.margin}</td>
                <td>
                  {r.target} → {r.prediction}
                  {r.target !== r.prediction ? " · 错误" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        移除 activation 后，margin=1.5−(x₁+x₂)，全部层合成一个 affine
        map。当前权重在 00 上失败；换任何 affine 权重仍无法完成 XOR：若 a x₁+b
        x₂+c 在 10、01 为正，则 a+b+2c&gt;0；若在 00、11
        为负，则同一和必须&lt;0，矛盾。
      </p>
    </section>
  );
}

function ClassificationContrast() {
  const [wrongLogit, setWrongLogit] = useState(0);
  const logits = [1, wrongLogit, -1],
    result = classificationContrast(logits);
  return (
    <section
      className="foundation-contrast detail-section"
      data-foundation="classification"
    >
      <h2>一个错误类 logit，联动三种量</h2>
      <p>
        固定目标 y=A、zₐ=1、z꜀=−1，只改变错误类 B 的
        logit。三个概率一起重算：p=softmax(z)，L=−log
        pₐ，∂L/∂z=p−onehot(A)。这里显示模型概率，不代表概率已校准。
      </p>
      <label className="contrast-control">
        错误类 B 的 logit
        <input
          type="range"
          aria-label="错误类 B 的 logit"
          min="-2"
          max="4"
          step="0.25"
          value={wrongLogit}
          onChange={(e) => setWrongLogit(Number(e.target.value))}
        />
        <output>{f(wrongLogit)}</output>
      </label>
      <div
        className="contrast-plot-scroll"
        tabIndex={0}
        role="region"
        aria-label="分类概率与 logit 梯度固定坐标对照，可横向滚动"
      >
        <svg
          viewBox="0 0 720 305"
          role="img"
          aria-label="三类概率 0到1与带正负号的 logit 梯度"
        >
          <text x="24" y="30" className="contrast-title">
            Class / logit
          </text>
          <text x="190" y="30" className="contrast-title">
            Probability
          </text>
          <text x="450" y="30" className="contrast-title">
            ∂L/∂z
          </text>
          <text x="190" y="62">
            0
          </text>
          <text x="350" y="62" textAnchor="end">
            1
          </text>
          <text x="450" y="62" textAnchor="middle">
            −1
          </text>
          <text x="540" y="62" textAnchor="middle">
            0
          </text>
          <text x="630" y="62" textAnchor="middle">
            +1
          </text>
          <line x1="540" y1="75" x2="540" y2="265" className="contrast-axis" />
          {result.probabilities.map((p, i) => {
            const y = 100 + i * 70,
              g = result.gradients[i];
            return (
              <g key={i}>
                <text x="24" y={y + 5}>
                  {["A · target", "B · wrong", "C · wrong"][i]} / {f(logits[i])}
                </text>
                <rect
                  x="190"
                  y={y - 12}
                  width="160"
                  height="24"
                  fill="#e4eee9"
                />
                <rect
                  x="190"
                  y={y - 12}
                  width={p * 160}
                  height="24"
                  fill="#218776"
                />
                <text x="370" y={y + 5} data-class-probability={i}>
                  {f(p)}
                </text>
                <rect
                  x={540 + Math.min(g, 0) * 90}
                  y={y - 12}
                  width={Math.abs(g) * 90}
                  height="24"
                  fill={g < 0 ? "#638fc3" : "#d18743"}
                />
                <text x="650" y={y + 5} data-class-gradient={i}>
                  {f(g)}
                </text>
              </g>
            );
          })}
          <text x="24" y="290">
            蓝：负梯度；橙：正梯度。减去梯度后，正确类 logit 上升、错误类下降。
          </text>
        </svg>
      </div>
      <p className="contrast-result" data-class-loss={result.loss}>
        Cross-entropy = {f(result.loss)}；三个 logit 梯度之和 ={" "}
        {result.gradients.reduce((a, b) => a + b, 0).toFixed(6)}
      </p>
      <p>
        向右拖动 B：pᵦ 上升，pₐ 下降，loss 增大。其局部变化率就是
        ∂L/∂zᵦ=pᵦ&gt;0；这一步是
        sensitivity，优化器还需乘学习率再更新。可以先预测方向再拖动验证。
      </p>
    </section>
  );
}

function SharedParameterContrast() {
  const [weight, setWeight] = useState(1),
    r = sharedParameterContrast(weight);
  return (
    <section
      className="foundation-contrast detail-section"
      data-foundation="shared"
    >
      <h2>同一个参数经过两条路径</h2>
      <p>
        z₁=2w，z₂=3w，ŷ=z₁+z₂，L=½(ŷ−4)²。图中的 w
        是同一个参数；先累加两条路径的梯度，再执行一次 optimizer update。
      </p>
      <label className="contrast-control">
        共享参数 w
        <input
          type="range"
          aria-label="共享参数 w"
          min="0"
          max="1.6"
          step="0.05"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
        <output>{f(weight)}</output>
      </label>
      <div
        className="contrast-plot-scroll"
        tabIndex={0}
        role="region"
        aria-label="共享参数的双分支梯度，可横向滚动"
      >
        <svg
          viewBox="0 0 720 315"
          role="img"
          aria-label="共享 w 的前向两条分支和反向两项梯度之和"
        >
          <path
            d="M125 125L235 85 M125 125L235 185 M350 85L455 125 M350 185L455 125 M550 125H600"
            fill="none"
            stroke="#647b75"
            strokeWidth="2"
          />
          <rect
            x="30"
            y="100"
            width="95"
            height="50"
            rx="8"
            className="contrast-node"
          />
          <text x="77" y="131" textAnchor="middle">
            w={f(weight)}
          </text>
          <rect
            x="235"
            y="60"
            width="115"
            height="50"
            rx="8"
            className="contrast-node"
          />
          <text x="292" y="91" textAnchor="middle">
            2w={f(r.z1)}
          </text>
          <rect
            x="235"
            y="160"
            width="115"
            height="50"
            rx="8"
            className="contrast-node"
          />
          <text x="292" y="191" textAnchor="middle">
            3w={f(r.z2)}
          </text>
          <rect
            x="455"
            y="100"
            width="95"
            height="50"
            rx="8"
            className="contrast-node"
          />
          <text x="502" y="131" textAnchor="middle">
            ŷ={f(r.prediction)}
          </text>
          <rect
            x="600"
            y="100"
            width="100"
            height="50"
            rx="8"
            className="contrast-node"
          />
          <text x="650" y="131" textAnchor="middle">
            L={f(r.loss)}
          </text>
          <text x="195" y="42" fill="#218776">
            路径 1：∂L/∂z₁ × ∂z₁/∂w = r × 2 = {f(r.branch1)}
          </text>
          <text x="195" y="239" fill="#d18743">
            路径 2：∂L/∂z₂ × ∂z₂/∂w = r × 3 = {f(r.branch2)}
          </text>
          <text x="30" y="286" className="contrast-title">
            r=ŷ−4={f(r.residual)}；∂L/∂w = 2r + 3r = {f(r.gradient)}
          </text>
        </svg>
      </div>
      <p className="contrast-result" data-shared-gradient={r.gradient}>
        ∂L/∂w = {f(r.branch1)} + {f(r.branch2)} = {f(r.gradient)}
      </p>
      <p>
        w=0.8 时 residual
        与两项梯度都为零；两侧的导数符号相反。这里总梯度恰好等于对 L=½(5w−4)²
        直接求导的
        5(5w−4)，可用于核对自动微分的累加。分支项是路径导数，不能解释成各分支“造成的误差比例”。
      </p>
    </section>
  );
}

export default function FoundationContrasts({
  lessonId,
}: {
  lessonId: string;
}) {
  if (lessonId === "neural-networks") return <XorContrast />;
  if (lessonId === "loss-functions") return <ClassificationContrast />;
  if (lessonId === "backpropagation") return <SharedParameterContrast />;
  return null;
}
