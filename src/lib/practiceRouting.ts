import { useSyncExternalStore } from "react";
import { hashParts } from "./routing";

export type PracticeTab =
  "research" | "bench" | "case" | "diagnostic" | "language";
const tabs: readonly string[] = [
  "research",
  "bench",
  "case",
  "diagnostic",
  "language",
];
export type PracticeChoice = {
  tab: PracticeTab;
  lab?: string;
  research?: string;
};

export function readPracticeRoute(hash: string) {
  const { params } = hashParts(hash);
  const requested = params.get("tab");
  const tab: PracticeTab =
    requested && tabs.includes(requested)
      ? (requested as PracticeTab)
      : params.has("lab")
        ? "bench"
        : "research";
  return { tab, lab: params.get("lab"), research: params.get("research") };
}

export function practiceHash(hash: string, choice: PracticeChoice) {
  const { path, params } = hashParts(hash);
  const next = path === "/practice" ? params : new URLSearchParams();
  next.set("tab", choice.tab);
  if (choice.lab !== undefined) next.set("lab", choice.lab);
  if (choice.research !== undefined) next.set("research", choice.research);
  return `#/practice?${next.toString()}`;
}

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
function snapshot() {
  return window.location.hash;
}
const serverSnapshot = () => "#/practice";

export function usePracticeRoute() {
  return readPracticeRoute(
    useSyncExternalStore(subscribe, snapshot, serverSnapshot),
  );
}

export function navigatePractice(choice: PracticeChoice) {
  const next = practiceHash(window.location.hash, choice);
  if (next === window.location.hash) return;
  // A selection is navigable history; notify React because pushState emits no event.
  window.history.pushState(null, "", next);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
