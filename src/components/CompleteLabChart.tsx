import type { LabChart } from "../data/completeLabs/types";

const ink = "#14284b",
  blue = "#245fbd",
  reference = "#a75224",
  grid = "#d6dfe9";
// Conservative widths keep mixed CJK/English labels out of adjacent marks.
// The full label remains in the SVG title and the accessible data table.
const shortLabel = (value: string, width: number) => {
  const size = (char: string) =>
    /[^\x00-\x7F]/.test(char) ? 14 : /[MW@]/.test(char) ? 13 : 9;
  if ([...value].reduce((n, c) => n + size(c), 0) <= width) return value;
  let result = "",
    used = 0;
  for (const char of value) {
    if (used + size(char) > width - 14) break;
    result += char;
    used += size(char);
  }
  return result + "…";
};
export function displayNumber(value: number) {
  if (!Number.isFinite(value)) return "不可计算";
  if (value === 0) return "0";
  if (Math.abs(value) >= 1e6 || Math.abs(value) < 0.001)
    return value.toExponential(3);
  return new Intl.NumberFormat("en", { maximumFractionDigits: 4 }).format(
    value,
  );
}
const range = (values: number[]) => {
  let low = Math.min(0, ...values),
    high = Math.max(0, ...values);
  if (high === low) high = low + 1;
  const pad = (high - low) * 0.1;
  if (low < 0) low -= pad;
  if (high > 0) high += pad;
  return [low, high];
};
export default function CompleteLabChart({
  chart,
  baseline,
  label,
}: {
  chart: LabChart;
  baseline: LabChart;
  label: string;
}) {
  if (chart.kind === "matrix") {
    const comparison = baseline.kind === "matrix" ? baseline : chart;
    const columns = Math.max(chart.columns.length, comparison.columns.length);
    const width = Math.max(660, 170 + columns * 76);
    const rows = Math.max(chart.rows.length, comparison.rows.length);
    const panelHeight = 75 + rows * 44;
    const maximum = Math.max(
      1e-12,
      ...chart.values.flat().map(Math.abs),
      ...comparison.values.flat().map(Math.abs),
    );
    return (
      <div
        className="complete-chart-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${label}，矩阵可横向滚动`}
      >
        <span className="complete-scroll-hint">
          上下两幅分别是当前与固定对照。蓝色表示非负值，橙色表示负值，深浅共用同一尺度；宽图可左右滑动，完整数值见下表。
        </span>
        <svg
          viewBox={`0 0 ${width} ${panelHeight * 2 + 25}`}
          style={{ minWidth: width }}
          role="img"
          aria-label={`${label}：当前参数和固定对照的矩阵；单位 ${chart.unit}`}
        >
          {[chart, comparison].map((m, panel) => (
            <g key={panel} transform={`translate(0 ${panel * panelHeight})`}>
              <text x={20} y={24} className="complete-svg-title">
                {panel === 0 ? "当前参数" : "固定对照"} · {m.unit}
              </text>
              {m.columns.map((name, j) => (
                <text key={j} x={160 + j * 76} y={52} textAnchor="middle">
                  <title>{name}</title>
                  {shortLabel(name, 66)}
                </text>
              ))}
              {m.rows.map((name, i) => (
                <g key={i}>
                  <text x={18} y={82 + i * 44}>
                    <title>{name}</title>
                    {shortLabel(name, 98)}
                  </text>
                  {m.values[i].map((v, j) => (
                    <g key={j}>
                      <rect
                        x={126 + j * 76}
                        y={62 + i * 44}
                        width={68}
                        height={36}
                        fill={v < 0 ? reference : blue}
                        fillOpacity={0.07 + (0.2 * Math.abs(v)) / maximum}
                        stroke={grid}
                      />
                      <text
                        x={160 + j * 76}
                        y={85 + i * 44}
                        textAnchor="middle"
                      >
                        {displayNumber(v)}
                      </text>
                    </g>
                  ))}
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
    );
  }
  if (chart.kind === "line") {
    const comparison = baseline.kind === "line" ? baseline : chart;
    const [lo, hi] = range([...chart.y, ...comparison.y]);
    let xmin = Math.min(...chart.x, ...comparison.x),
      xmax = Math.max(...chart.x, ...comparison.x);
    if (xmin === xmax) xmax = xmin + 1;
    const x = (v: number) => 78 + ((v - xmin) / (xmax - xmin)) * 530;
    const y = (v: number) => 280 - ((v - lo) / (hi - lo)) * 210;
    const path = (m: typeof chart) =>
      m.x.map((v, i) => `${i ? "L" : "M"}${x(v)},${y(m.y[i])}`).join(" ");
    return (
      <div
        className="complete-chart-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${label}，曲线可横向滚动`}
      >
        <span className="complete-scroll-hint">
          蓝色实线＝当前；橙色虚线＝对照。坐标范围同时包含两组。
        </span>
        <svg
          viewBox="0 0 660 340"
          role="img"
          aria-label={`${label}：${chart.xLabel} 与 ${chart.yLabel}`}
        >
          <text x={20} y={24} className="complete-svg-title">
            {chart.yLabel}
          </text>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1={78}
                x2={608}
                y1={y(lo + (hi - lo) * t)}
                y2={y(lo + (hi - lo) * t)}
                stroke={grid}
              />
              <text x={70} y={y(lo + (hi - lo) * t) + 5} textAnchor="end">
                {displayNumber(lo + (hi - lo) * t)}
              </text>
            </g>
          ))}
          <path
            d={path(comparison)}
            fill="none"
            stroke={reference}
            strokeWidth={2.5}
            strokeDasharray="6 5"
          />
          <path d={path(chart)} fill="none" stroke={blue} strokeWidth={3} />
          {chart.x.length <= 32 &&
            chart.x.map((v, i) => (
              <circle key={i} cx={x(v)} cy={y(chart.y[i])} r={3.5} fill={blue}>
                <title>{`${chart.xLabel}=${v}; ${chart.yLabel}=${chart.y[i]}`}</title>
              </circle>
            ))}
          {[xmin, (xmin + xmax) / 2, xmax].map((v, i) => (
            <text key={i} x={x(v)} y={304} textAnchor="middle">
              {displayNumber(v)}
            </text>
          ))}
          <text x={345} y={330} textAnchor="middle">
            {chart.xLabel}
          </text>
        </svg>
      </div>
    );
  }
  const comparison = baseline.kind === "bars" ? baseline : chart;
  // Preserve labels added/removed by a parameter; absence is never silently turned into zero.
  const labels = [...new Set([...chart.labels, ...comparison.labels])];
  const [lo, hi] = range([...chart.values, ...comparison.values]);
  const x = (v: number) => 178 + ((v - lo) / (hi - lo)) * 416;
  const height = 85 + labels.length * 66;
  return (
    <div
      className="complete-chart-scroll"
      tabIndex={0}
      role="region"
      aria-label={`${label}，柱图可横向滚动`}
    >
      <span className="complete-scroll-hint">
        每项上方蓝条＝当前；下方橙色轮廓＝对照。缺失项显示 n/a。
      </span>
      <svg
        viewBox={`0 0 740 ${height}`}
        style={{ minWidth: 740 }}
        role="img"
        aria-label={`${label}：数值对照，单位 ${chart.unit}`}
      >
        <text x={20} y={24} className="complete-svg-title">
          {chart.unit || "Computed value"}
        </text>
        {[lo, (lo + hi) / 2, hi].map((v, i) => (
          <g key={i}>
            <line x1={x(v)} x2={x(v)} y1={42} y2={height - 30} stroke={grid} />
            <text x={x(v)} y={height - 8} textAnchor="middle">
              {displayNumber(v)}
            </text>
          </g>
        ))}
        <line x1={x(0)} x2={x(0)} y1={42} y2={height - 30} stroke={ink} />
        {labels.map((name, i) => (
          <g key={name}>
            <text x={18} y={65 + i * 66}>
              <title>{name}</title>
              {shortLabel(name, 144)}
            </text>
            {[chart, comparison].map((m, k) => {
              const idx = m.labels.indexOf(name),
                v = m.values[idx],
                yy = 48 + i * 66 + k * 25;
              return idx < 0 ? (
                <text key={k} x={610} y={yy + 16}>
                  n/a
                </text>
              ) : (
                <g key={k}>
                  <rect
                    x={Math.min(x(0), x(v))}
                    y={yy}
                    width={Math.abs(x(v) - x(0))}
                    height={18}
                    fill={k ? "none" : blue}
                    stroke={k ? reference : blue}
                    strokeWidth={k ? 1.7 : 0}
                  />
                  <text x={608} y={yy + 15}>
                    {displayNumber(v)}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
