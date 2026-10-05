import type { ArenaAlgorithm, ArenaConfig } from "./arenaMath";

export type ArenaExposure = { dataKey: string; model: ArenaAlgorithm; reason: string; budget: number; revealedAt: number };
const storageKey = "dla-arena-test-exposures-v1";
const models = ["logistic", "knn", "forest", "boosting", "mlp"];

// Training consumes the same PRNG as validation/test. All data settings belong
// to this key; the model setting scale does not change the generated points.
export function arenaDataKey(config: ArenaConfig) {
  return JSON.stringify(["arena-data-v1", config.dataset, config.trainSize, config.noise, config.imbalance, config.shift, config.seed]);
}

export function parseArenaExposures(raw: string | null): ArenaExposure[] {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is ArenaExposure => item && typeof item.dataKey === "string" && models.includes(item.model) && typeof item.reason === "string" && item.reason.trim().length > 0 && Number.isFinite(item.budget) && Number.isFinite(item.revealedAt));
  } catch { return []; }
}

export function readArenaExposures() {
  if (typeof window === "undefined") return [];
  try { return parseArenaExposures(window.localStorage.getItem(storageKey)); } catch { return []; }
}

export function saveArenaExposures(items: ArenaExposure[]) {
  try { window.localStorage.setItem(storageKey, JSON.stringify(items)); return true; } catch { return false; }
}
