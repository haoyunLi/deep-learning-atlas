import { conceptPaths } from "../data/conceptPaths";
import { aiJourneys } from "../data/aiLandscape";

export type LearningRoute = {
  id: string;
  title: string;
  lessonIds: string[];
  href: string;
};

export const learningRoutes: LearningRoute[] = [
  ...conceptPaths.map((path) => ({
    id: path.id,
    title: path.title,
    lessonIds: path.steps.map((step) => step.lessonId),
    href: `#/concepts/${path.id}`,
  })),
  ...aiJourneys.map((journey) => ({
    id: `journey-${journey.id}`,
    title: journey.title,
    lessonIds: journey.ids,
    href: `#/landscape?journey=${encodeURIComponent(journey.id)}`,
  })),
];

/** Only a route that actually contains this lesson can govern its neighbours. */
export function resolveLessonNavigation(
  lessonId: string,
  requestedPath: string | null | undefined,
  catalogIds: string[],
) {
  const route = learningRoutes.find(
    (candidate) => candidate.id === requestedPath && candidate.lessonIds.includes(lessonId),
  );
  const ids = route?.lessonIds ?? catalogIds;
  const index = ids.indexOf(lessonId);
  return {
    route,
    index,
    total: ids.length,
    previousId: index > 0 ? ids[index - 1] : undefined,
    nextId: index >= 0 && index < ids.length - 1 ? ids[index + 1] : undefined,
  };
}

/** Preserve supported reading-focus flags without carrying unrelated query state. */
export function lessonHref(lessonId: string, pathId?: string, currentQuery = "") {
  const previous = new URLSearchParams(currentQuery);
  const next = new URLSearchParams();
  if (pathId) next.set("path", pathId);
  for (const flag of ["animation", "sandbox", "exercise"])
    if (previous.get(flag) === "1") next.set(flag, "1");
  return `#/lesson/${encodeURIComponent(lessonId)}${next.size ? `?${next}` : ""}`;
}
