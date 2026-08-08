export type TornProfileInput = {
  tornUserId: number;
  apiKey: string;
};

export type TornCurrentState = {
  tornUserId: number;
  fetchedAt: string;
  level?: number;
  rank?: string;
  networth?: number;
  money?: number;
  energy?: number;
  nerve?: number;
  happy?: number;
  cooldowns?: Record<string, number | null>;
  battleStats?: Record<string, number>;
  metrics: Record<string, unknown>;
};

export type TornSyncResult = {
  tornUserId: number;
  ok: boolean;
  state?: TornCurrentState;
  error?: string;
};
