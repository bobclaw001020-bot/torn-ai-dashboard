export const GOAL_SLOTS = [1, 2, 3] as const;

export type GoalSlot = (typeof GOAL_SLOTS)[number];

export type GoalInput = {
  slot: GoalSlot;
  text: string;
};

export type NormalizedGoal = {
  type: string;
  target: Record<string, unknown>;
  originalInput: string;
  deadline?: string;
};
