import { biologyBridgeExercises } from "./exercisesBiologyBridge";
import { mlDepthExercises } from "./exercisesMLDepth";
import { cvDepthExercises } from "./exercisesCVDepth";
import { agentDepthExercises } from "./exercisesAgentDepth";
import type { Exercise } from "./exerciseTypes";
import { coreExercises } from "./exercisesCore";
import { trainingLanguageExercises } from "./exercisesTrainingLanguage";
import { modelFamilyExercises } from "./exercisesModelFamilies";
import { visionConceptExercises } from "./exercisesVisionConcepts";
import { classicalRLExercises } from "./exercisesClassicalRL";
import { frontierSystemsExercises } from "./exercisesFrontierSystems";
import { metaLearningExercises } from "./exercisesMetaLearning";
import { researchExercises } from "./exercisesResearch";
import { mechanismExercises } from "./exercisesMechanism";
import { bioInferenceControlExercises } from "./exercisesBioInferenceControl";
import { bioGraphRepresentationExercises } from "./exercisesBioGraphRepresentation";
import { mlBreadthExercises } from "./exercisesMLBreadth";
import { cvBreadthExercises } from "./exercisesCVBreadth";
import { agentBreadthExercises } from "./exercisesAgentBreadth";

export const exerciseGroups: Record<string, Exercise[]>[] = [
  biologyBridgeExercises,
  coreExercises,
  trainingLanguageExercises,
  modelFamilyExercises,
  visionConceptExercises,
  classicalRLExercises,
  frontierSystemsExercises,
  metaLearningExercises,
  researchExercises,
  mechanismExercises,
  bioInferenceControlExercises,
  bioGraphRepresentationExercises,
  mlBreadthExercises,
  cvBreadthExercises,
  agentBreadthExercises,
  mlDepthExercises,
  cvDepthExercises,
  agentDepthExercises,
];
export const exercises: Record<string, Exercise[]> = Object.assign(
  {},
  ...exerciseGroups,
);
