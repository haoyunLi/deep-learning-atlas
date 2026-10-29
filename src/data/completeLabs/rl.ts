import type { CompleteLabMap } from "./types";
import { rlRepresentationLabs } from "./rlRepresentation";
import { rlControlLabs } from "./rlControl";
import { rlAdaptationLabs } from "./rlAdaptation";
import { rlAgentLabs } from "./rlAgents";
export const rlCompleteLabs: CompleteLabMap = {
  ...rlRepresentationLabs,
  ...rlControlLabs,
  ...rlAdaptationLabs,
  ...rlAgentLabs,
};
