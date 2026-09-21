import type { ReactNode } from "react";

const tools = [
  {
    href: "#/studio",
    route: "/studio",
    label: "学习工作台",
    english: "Studio",
  },
  {
    href: "#/studio/code",
    route: "/studio/code",
    label: "代码实验",
    english: "Code Lab",
  },
  {
    href: "#/studio/shapes",
    route: "/studio/shapes",
    label: "形状调试",
    english: "Shape Debugger",
  },
  {
    href: "#/studio/arena",
    route: "/studio/arena",
    label: "算法竞技场",
    english: "Arena",
  },
  {
    href: "#/studio/projects",
    route: "/studio/projects",
    label: "项目案例",
    english: "Projects",
  },
];

export function StudioShell({
  route,
  eyebrow,
  title,
  english,
  intro,
  children,
}: {
  route: string;
  eyebrow: string;
  title: string;
  english: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="studio page-gutter">
      <div className="studio-heading">
        <span className="studio-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="studio-english">{english}</p>
        <p className="studio-intro">{intro}</p>
      </div>
      <nav className="studio-tool-nav" aria-label="学习工作台工具">
        {tools.map((tool, index) => (
          <a
            key={tool.route}
            href={tool.href}
            className={route === tool.route ? "active" : ""}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{tool.label}</strong>
            <em>{tool.english}</em>
          </a>
        ))}
      </nav>
      {children}
    </main>
  );
}

export function StudioSectionTitle({
  index,
  title,
  english,
  note,
}: {
  index: string;
  title: string;
  english: string;
  note?: string;
}) {
  return (
    <header className="studio-section-title">
      <span>{index}</span>
      <div>
        <h2>{title}</h2>
        <p>{english}</p>
      </div>
      {note && <small>{note}</small>}
    </header>
  );
}

export function StatusDot({
  tone = "blue",
}: {
  tone?: "blue" | "green" | "orange" | "red";
}) {
  return <span className={`studio-status-dot ${tone}`} aria-hidden="true" />;
}
