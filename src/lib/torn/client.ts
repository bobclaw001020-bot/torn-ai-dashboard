import "server-only";

import type { TornCurrentState } from "./types";
import { DASHBOARD_USER_SELECTIONS } from "./coverage";

const TORN_API_BASE = "https://api.torn.com/v2";

export class TornApiError extends Error {
  constructor(message: string, readonly code?: number) {
    super(message);
    this.name = "TornApiError";
  }
}

function buildUrl(section: string, userId: number | undefined, apiKey: string, selections: readonly string[]) {
  const path = userId ? `/${section}/${userId}` : `/${section}/`;
  const url = new URL(`${TORN_API_BASE}${path}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("selections", selections.join(","));
  return url;
}

async function tornRequest<T>(section: string, userId: number | undefined, apiKey: string, selections: readonly string[]): Promise<T> {
  const response = await fetch(buildUrl(section, userId, apiKey, selections), {
    method: "GET",
    cache: "no-store",
    headers: { "User-Agent": "torn-ai-dashboard/0.1" },
    signal: AbortSignal.timeout(20_000),
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new TornApiError(`Torn API returned invalid JSON (HTTP ${response.status})`);
  }

  const record = body as Record<string, unknown>;
  const error = record.error as { code?: number; error?: string } | undefined;
  if (!response.ok || error) {
    throw new TornApiError(error?.error ?? `Torn API HTTP ${response.status}`, error?.code);
  }
  return body as T;
}

/** Fetch the dashboard-oriented user payload from Torn API v2. */
export async function fetchCurrentProfile(tornUserId: number, apiKey: string): Promise<TornCurrentState> {
  const data = await tornRequest<Record<string, unknown>>("user", tornUserId, apiKey, DASHBOARD_USER_SELECTIONS);
  const profile = (data.profile ?? data.basic ?? {}) as Record<string, unknown>;
  const bars = (data.bars ?? {}) as Record<string, unknown>;
  const cooldowns = (data.cooldowns ?? {}) as Record<string, unknown>;
  const battleStats = (data.battlestats ?? {}) as Record<string, unknown>;
  const networth = (data.networth ?? {}) as Record<string, unknown>;

  return {
    tornUserId,
    fetchedAt: new Date().toISOString(),
    level: typeof profile.level === "number" ? profile.level : undefined,
    rank: typeof profile.rank === "string" ? profile.rank : undefined,
    networth: typeof data.networth === "number" ? data.networth : typeof networth.total === "number" ? networth.total : undefined,
    money: typeof data.money === "number" ? data.money : undefined,
    energy: typeof bars.energy === "number" ? bars.energy : undefined,
    nerve: typeof bars.nerve === "number" ? bars.nerve : undefined,
    happy: typeof bars.happy === "number" ? bars.happy : undefined,
    cooldowns: Object.fromEntries(Object.entries(cooldowns).map(([key, value]) => [key, typeof value === "number" ? value : null])),
    battleStats: Object.fromEntries(Object.entries(battleStats).filter(([, value]) => typeof value === "number") as [string, number][]),
    metrics: data,
  };
}
