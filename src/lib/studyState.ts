import { useSyncExternalStore } from "react";
import { lessons } from "../data/lessons";

export type Attempt = {
  selected: number;
  correct: boolean;
  signature: string;
  updatedAt: number;
};
export type StudyState = {
  completed: string[];
  lastLesson: string | null;
  attempts: Record<string, Attempt>;
  storageUnavailable: boolean;
};
const known = new Set(lessons.map((lesson) => lesson.id));
const EMPTY: StudyState = {
  completed: [],
  lastLesson: null,
  attempts: {},
  storageUnavailable: false,
};
const key = "dla-study-v1";
let cached: StudyState | undefined;
const listeners = new Set<() => void>();

function validAttempt(id: string, value: unknown): value is Attempt {
  const lessonId = id.replace(/-(mechanism|decision)$/, "");
  if (
    !known.has(lessonId) ||
    id === lessonId ||
    !value ||
    typeof value !== "object"
  )
    return false;
  const attempt = value as Partial<Attempt>;
  return (
    Number.isInteger(attempt.selected) &&
    attempt.selected! >= 0 &&
    attempt.selected! < 8 &&
    typeof attempt.correct === "boolean" &&
    typeof attempt.signature === "string" &&
    /^[0-9a-f]{1,8}$/.test(attempt.signature) &&
    typeof attempt.updatedAt === "number" &&
    Number.isFinite(attempt.updatedAt) &&
    attempt.updatedAt >= 0
  );
}

export function parseStudyState(
  raw: string | null,
  legacy: string | null = null,
): StudyState {
  let input: Record<string, unknown> = {};
  try {
    const value: unknown = JSON.parse(raw || "null");
    if (value && typeof value === "object" && !Array.isArray(value))
      input = value as Record<string, unknown>;
  } catch {
    /* Recover using legacy progress. */
  }
  let completed = input.completed;
  if (!Array.isArray(completed)) {
    try {
      completed = JSON.parse(legacy || "[]");
    } catch {
      completed = [];
    }
  }
  const attempts: Record<string, Attempt> = {};
  if (
    input.attempts &&
    typeof input.attempts === "object" &&
    !Array.isArray(input.attempts)
  ) {
    for (const [id, value] of Object.entries(input.attempts)) {
      if (validAttempt(id, value)) attempts[id] = value;
    }
  }
  return {
    completed: [
      ...new Set(
        (Array.isArray(completed) ? completed : []).filter(
          (id): id is string => typeof id === "string" && known.has(id),
        ),
      ),
    ],
    lastLesson:
      typeof input.lastLesson === "string" && known.has(input.lastLesson)
        ? input.lastLesson
        : null,
    attempts,
    storageUnavailable: false,
  };
}

function snapshot(): StudyState {
  if (cached) return cached;
  if (typeof window === "undefined") return EMPTY;
  try {
    cached = parseStudyState(
      localStorage.getItem(key),
      localStorage.getItem("dla-progress"),
    );
  } catch {
    cached = { ...EMPTY, storageUnavailable: true };
  }
  return cached;
}
function notify() {
  listeners.forEach((listener) => listener());
}
function sync(event: StorageEvent) {
  if (event.key === key || event.key === "dla-progress" || event.key === null) {
    cached = undefined;
    notify();
  }
}
function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener("storage", sync);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", sync);
  };
}
export function useStudyState() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}
function save(next: StudyState) {
  cached = next;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        completed: next.completed,
        lastLesson: next.lastLesson,
        attempts: next.attempts,
      }),
    );
    cached = { ...next, storageUnavailable: false };
  } catch {
    cached = { ...next, storageUnavailable: true };
  }
  notify();
}
export function toggleCompleted(id: string) {
  if (!known.has(id)) return;
  const state = snapshot();
  save({
    ...state,
    completed: state.completed.includes(id)
      ? state.completed.filter((item) => item !== id)
      : [...state.completed, id],
  });
}
export function visitLesson(id: string) {
  if (!known.has(id) || snapshot().lastLesson === id) return;
  save({ ...snapshot(), lastLesson: id });
}
export function recordAttempt(id: string, attempt: Attempt) {
  if (!validAttempt(id, attempt)) return;
  save({ ...snapshot(), attempts: { ...snapshot().attempts, [id]: attempt } });
}
export function questionSignature(question: {
  question: string;
  options: string[];
  answer: number;
}) {
  const text = JSON.stringify([
    question.question,
    question.options,
    question.answer,
  ]);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++)
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}
