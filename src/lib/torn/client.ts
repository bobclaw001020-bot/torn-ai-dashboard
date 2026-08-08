import "server-only";

import type { TornCurrentState } from "./types";

const TORN_API_BASE = "https://api.torn.com";

function buildUrl(path: string, apiKey: string, selections: string[]) {
  const url = new URL(`${TORN_API_BASE}${path}`);
  url.searchParams.set("key", apiKey);
  if (selections.length > 0) url.searchParams.set("selections", selections.join(","));
  return url;
}

async function tornRequest<T>(path: string, apiKey: string, selections: string[]): Promise<T> {
  const response = await fetch(buildUrl(path, apiKey, selections), {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Torn API HTTP ${response.status}`);
  }

  const body = (await response.json()) as T & { error?: unknown };
  if (body && "error" in body && body.error) {
    throw new Error("Torn API returned an error");
  }

  return body;
}

/**
 * First sync adapter. Keep raw endpoint calls isolated here; the rest of the
 * application consumes normalized state instead of Torn response shapes.
 * Expand the selection registry as API coverage is implemented.
 */
export async function fetchCurrentProfile(
  tornUserId: number,
  apiKey: string,
): Promise<TornCurrentState> {
  const data = await tornRequest<Record<string, unknown>>(
    `/user/${tornUserId}`,
    apiKey,
    ["profile", "bars", "cooldowns", "money", "networth", "battlestats"],
  );

  const profile = (data.profile ?? {}) as Record<string, unknown>;
  const bars = (data.bars ?? {}) as Record<string, unknown>;
  const cooldowns = (data.cooldowns ?? {}) as Record<string, unknown>;
  const battleStats = (data.battlestats ?? {}) as Record<string, unknown>;

  return {
    tornUserId,
    fetchedAt: new Date().toISOString(),
    level: typeof profile.level === "number" ? profile.level : undefined,
    rank: typeof profile.rank === "string" ? profile.rank : undefined,
    networth: typeof data.networth === "number" ? data.networth : undefined,
    money: typeof data.money === "number" ? data.money : undefined,
    energy: typeof bars.energy === "number" ? bars.energy : undefined,
    nerve: typeof bars.nerve === "number" ? bars.nerve : undefined,
    happy: typeof bars.happy === "number" ? bars.happy : undefined,
    cooldowns: Object.fromEntries(
      Object.entries(cooldowns).map(([key, value]) => [key, typeof value === "number" ? value : null]),
    ),
    battleStats: Object.fromEntries(
      Object.entries(battleStats).filter(([, value]) => typeof value === "number") as [string, number][],
    ),
    metrics: data,
  };
}
