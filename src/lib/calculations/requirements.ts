export type CurrentState = {
  level?: number;
  money?: number;
  energy?: number;
  nerve?: number;
  cooldowns?: Record<string, number | null>;
  metrics: Record<string, unknown>;
};

export type ActionRequirement = {
  levelAtLeast?: number;
  moneyAtLeast?: number;
  energyAtLeast?: number;
  nerveAtLeast?: number;
  cooldownSecondsAtMost?: Record<string, number>;
};

export type CandidateAction = {
  id: string;
  name: string;
  requirements?: ActionRequirement;
  cost?: number;
  resourceCost?: Record<string, number>;
  expectedGain?: Record<string, number>;
  durationSeconds?: number;
};

export function isActionFeasible(state: CurrentState, action: CandidateAction): boolean {
  const r = action.requirements;
  if (!r) return true;
  if (r.levelAtLeast !== undefined && (state.level ?? -Infinity) < r.levelAtLeast) return false;
  if (r.moneyAtLeast !== undefined && (state.money ?? -Infinity) < r.moneyAtLeast) return false;
  if (r.energyAtLeast !== undefined && (state.energy ?? -Infinity) < r.energyAtLeast) return false;
  if (r.nerveAtLeast !== undefined && (state.nerve ?? -Infinity) < r.nerveAtLeast) return false;

  for (const [key, maxSeconds] of Object.entries(r.cooldownSecondsAtMost ?? {})) {
    const remaining = state.cooldowns?.[key];
    if (typeof remaining === "number" && remaining > maxSeconds) return false;
  }

  return true;
}
