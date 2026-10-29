import { mlTrainingLabs } from "./mlTraining";
import { mlClassicalLabs } from "./mlClassical";
import { mlSystemsLabs } from "./mlSystems";
import type { CompleteLabMap } from "./types";
export const mlCompleteLabs: CompleteLabMap = {
  ...mlTrainingLabs,
  ...mlClassicalLabs,
  ...mlSystemsLabs,
};
