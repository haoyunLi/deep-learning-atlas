import type { ReactNode } from "react";

export function LabCanvas({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="lab-canvas-scroll"
      tabIndex={0}
      role="region"
      aria-label={`${label}（可横向滚动）`}
    >
      <svg
        className="lab-canvas"
        viewBox="0 0 720 360"
        role="img"
        aria-label={label}
      >
        <rect
          x="1"
          y="1"
          width="718"
          height="358"
          rx="12"
          fill="#f8fbff"
          stroke="#d9e5f2"
        />
        {children}
      </svg>
    </div>
  );
}

export function VizText({
  x,
  y,
  children,
  size = 14,
  fill = "#14284b",
  anchor = "start",
  weight = 500,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  weight?: number | string;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={fill}
      textAnchor={anchor}
      fontWeight={weight}
    >
      {children}
    </text>
  );
}

export function VizNode({
  x,
  y,
  width = 135,
  height = 58,
  label,
  sublabel,
  active = false,
  color = "#245fbd",
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  sublabel?: string;
  active?: boolean;
  color?: string;
}) {
  return (
    <g className="lab-node">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="9"
        fill={active ? `${color}12` : "#fff"}
        stroke={active ? color : "#bdcfe0"}
        strokeWidth={active ? 2 : 1}
      />
      <VizText
        x={x + width / 2}
        y={y + (sublabel ? height / 2 - 2 : height / 2 + 5)}
        anchor="middle"
        size={14}
        weight={700}
        fill={active ? color : "#14284b"}
      >
        {label}
      </VizText>
      {sublabel && (
        <VizText
          x={x + width / 2}
          y={y + height / 2 + 18}
          anchor="middle"
          size={11}
          fill="#60708b"
        >
          {sublabel}
        </VizText>
      )}
    </g>
  );
}

export function VizArrow({
  x1,
  y1,
  x2,
  y2,
  active = false,
  color = "#245fbd",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active?: boolean;
  color?: string;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a = {
    x: x2 - 8 * Math.cos(angle - 0.5),
    y: y2 - 8 * Math.sin(angle - 0.5),
  };
  const b = {
    x: x2 - 8 * Math.cos(angle + 0.5),
    y: y2 - 8 * Math.sin(angle + 0.5),
  };
  return (
    <g opacity={active ? 1 : 0.4}>
      <line
        className={active ? "lab-flow" : undefined}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={active ? "6 5" : undefined}
      />
      <path d={`M${x2} ${y2} L${a.x} ${a.y} L${b.x} ${b.y} Z`} fill={color} />
    </g>
  );
}
