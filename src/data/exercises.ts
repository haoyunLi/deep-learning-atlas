import type { Exercise } from "./exerciseTypes";
import { coreExercises } from "./exercisesCore";
import { trainingLanguageExercises } from "./exercisesTrainingLanguage";
import { modelFamilyExercises } from "./exercisesModelFamilies";
import { visionConceptExercises } from "./exercisesVisionConcepts";
import { classicalRLExercises } from "./exercisesClassicalRL";

export const exerciseGroups: Record<string, Exercise[]>[] = [
  coreExercises,
  trainingLanguageExercises,
  modelFamilyExercises,
  visionConceptExercises,
  classicalRLExercises,
];
export const exercises: Record<string, Exercise[]> = Object.assign(
  {},
  ...exerciseGroups,
);
