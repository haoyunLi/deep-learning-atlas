const biologySite = "https://haoyunli.github.io/intro-to-bio-for-computational-biology/";

export const biologyConnections: Record<string, {
  label: string;
  chapter: string;
  lab: string;
}> = {
  "motif-pwm-scoring": { label: "TF、motif、occupancy 与 activity 各测什么", chapter: "rb04", lab: "motif" },
  "enhancer-gene-abc": { label: "Enhancer–gene evidence：候选边怎样逐层验证", chapter: "rb05", lab: "enhancer" },
  "regulon-tf-activity": { label: "TF expression 为什么不等于 TF activity", chapter: "rb04", lab: "motif" },
  "ligand-receptor-inference": { label: "Ligand–Receptor、complex 与通信证据", chapter: "rb07", lab: "lr" },
  "perturbation-generalization": { label: "In vitro / in vivo 模型选择与 Perturbation Logic", chapter: "rb08", lab: "models" },
  "variant-mixture-inference": { label: "Somatic / Germline 与 Inherited / De novo", chapter: "rb03", lab: "lineage" },
};
export const biologyChapterUrl = (chapter: string) => `${biologySite}textbook.html#${chapter}`;
export const biologyLabUrl = (lab: string) => `${biologySite}regulation-lab.html#${lab}`;
