import type { CompleteLabMap } from "./types";
import { cvArchitectureLabs } from "./cvArchitecture";
import { cvGeometryLabs } from "./cvGeometry";
import { cvLanguageLabs } from "./cvLanguage";
import { cvInferenceLabs } from "./cvInference";
import { cvStateLabs } from "./cvState";
export const cvCompleteLabs: CompleteLabMap = {
  ...cvArchitectureLabs,
  ...cvGeometryLabs,
  ...cvLanguageLabs,
  ...cvInferenceLabs,
  ...cvStateLabs,
};
