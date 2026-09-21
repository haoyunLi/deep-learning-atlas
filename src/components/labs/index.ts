import { foundationsClassicalLabs } from "./foundationsClassical";
import { visionSequenceLabs } from "./visionSequence";
import { reinforcementRepresentationLabs } from "./reinforcementRepresentation";
import { generativeDataLabs } from "./generativeData";
import { metaAdaptationLabs } from "./metaAdaptation";
import type { LabDefinition } from "./types";

export const parameterLabs: Record<string, LabDefinition> = {
  ...foundationsClassicalLabs,
  ...visionSequenceLabs,
  ...reinforcementRepresentationLabs,
  ...generativeDataLabs,
  ...metaAdaptationLabs,
};
export const legacyAnimationIds = ["attention", "diffusion", "ppo"];
export const mechanismCount =
  Object.keys(parameterLabs).length + legacyAnimationIds.length;
export function animationKind(id: string) {
  return parameterLabs[id]
    ? "parameter"
    : legacyAnimationIds.includes(id)
      ? "visual"
      : "steps";
}
