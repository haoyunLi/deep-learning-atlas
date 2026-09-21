import { useSyncExternalStore } from "react";
import { studioProjects } from "./projects";

export type MasteryLevel = 0 | 1 | 2 | 3;

export type StudioState = {
  version: 1;
  diagnostic: Record<string, string>;
  mastery: Record<string, MasteryLevel>;
  projectStages: Record<string, string[]>;
  lastTool: string | null;
  storageUnavailable: boolean;
};

const key = "dla-studio-v1";
const projectIds = new Set(studioProjects.map((project) => project.id));
const stageIds = new Set([
  "contract",
  "audit",
  "split",
  "train",
  "ablation",
  "errors",
  "test",
  "deploy",
]);
const EMPTY: StudioState = {
  version: 1,
  diagnostic: {},
  mastery: {},
  projectStages: {},
  lastTool: null,
  storageUnavailable: false,
};

let cached: StudioState | undefined;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseStudioState(raw: string | null): StudioState {
  let input: Record<string, unknown> = {};
  try {
    const value: unknown = JSON.parse(raw || "null");
    if (isRecord(value)) input = value;
  } catch {
    return EMPTY;
  }
  const diagnostic: Record<string, string> = isRecord(input.diagnostic)
    ? (Object.fromEntries(
        Object.entries(input.diagnostic).filter(
          ([question, answer]) =>
            question.length < 80 &&
            typeof answer === "string" &&
            answer.length < 120,
        ),
      ) as Record<string, string>)
    : {};
  const mastery = isRecord(input.mastery)
    ? (Object.fromEntries(
        Object.entries(input.mastery).filter(
          ([topic, level]) =>
            topic.length < 80 &&
            Number.isInteger(level) &&
            Number(level) >= 0 &&
            Number(level) <= 3,
        ),
      ) as Record<string, MasteryLevel>)
    : {};
  const projectStages: Record<string, string[]> = {};
  if (isRecord(input.projectStages)) {
    Object.entries(input.projectStages).forEach(([projectId, stages]) => {
      if (projectIds.has(projectId) && Array.isArray(stages)) {
        projectStages[projectId] = [
          ...new Set(
            stages.filter(
              (stage): stage is string =>
                typeof stage === "string" && stageIds.has(stage),
            ),
          ),
        ];
      }
    });
  }
  return {
    version: 1,
    diagnostic,
    mastery,
    projectStages,
    lastTool:
      typeof input.lastTool === "string" && input.lastTool.length < 120
        ? input.lastTool
        : null,
    storageUnavailable: false,
  };
}

function snapshot(): StudioState {
  if (cached) return cached;
  if (typeof window === "undefined") return EMPTY;
  try {
    cached = parseStudioState(window.localStorage.getItem(key));
  } catch {
    cached = { ...EMPTY, storageUnavailable: true };
  }
  return cached;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function sync(event: StorageEvent) {
  if (event.key === key || event.key === null) {
    cached = undefined;
    notify();
  }
}

function subscribe(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  if (!listeners.size) window.addEventListener("storage", sync);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", sync);
  };
}

function save(next: StudioState) {
  cached = next;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        diagnostic: next.diagnostic,
        mastery: next.mastery,
        projectStages: next.projectStages,
        lastTool: next.lastTool,
      }),
    );
    cached = { ...next, storageUnavailable: false };
  } catch {
    cached = { ...next, storageUnavailable: true };
  }
  notify();
}

export function useStudioState() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function answerDiagnostic(question: string, answer: string) {
  if (!question || !answer) return;
  const state = snapshot();
  save({ ...state, diagnostic: { ...state.diagnostic, [question]: answer } });
}

export function setMastery(topic: string, level: MasteryLevel) {
  if (!topic || !Number.isInteger(level) || level < 0 || level > 3) return;
  const state = snapshot();
  save({ ...state, mastery: { ...state.mastery, [topic]: level } });
}

export function toggleProjectStage(projectId: string, stageId: string) {
  if (!projectIds.has(projectId) || !stageIds.has(stageId)) return;
  const state = snapshot();
  const completed = state.projectStages[projectId] || [];
  const next = completed.includes(stageId)
    ? completed.filter((id) => id !== stageId)
    : [...completed, stageId];
  save({
    ...state,
    projectStages: { ...state.projectStages, [projectId]: next },
  });
}

export function visitStudioTool(tool: string) {
  if (!tool || snapshot().lastTool === tool) return;
  save({ ...snapshot(), lastTool: tool });
}

export function resetDiagnostic() {
  save({ ...snapshot(), diagnostic: {}, mastery: {} });
}
