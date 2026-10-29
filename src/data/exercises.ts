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

export const exerciseGroups: Record<string, Exercise[]>[] = [
  coreExercises,
  trainingLanguageExercises,
  modelFamilyExercises,
  visionConceptExercises,
  classicalRLExercises,
  frontierSystemsExercises,
  metaLearningExercises,
  researchExercises,
  mechanismExercises,
];
export const exercises: Record<string, Exercise[]> = Object.assign(
  {},
  ...exerciseGroups,
);
