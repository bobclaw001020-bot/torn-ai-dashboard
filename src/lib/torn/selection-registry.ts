/**
 * Central registry for Torn API selections.
 *
 * Keep API coverage in one place so new Torn v2/v1 selections can be added
 * without coupling UI code to raw API response shapes.
 */
export const TORN_SELECTIONS = {
  profile: ["profile"],
  resources: ["bars", "cooldowns"],
  economy: ["money", "networth"],
  combat: ["battlestats"],
} as const;

export type TornSelectionGroup = keyof typeof TORN_SELECTIONS;

export const ALL_INITIAL_SELECTIONS = Object.values(TORN_SELECTIONS).flat();
