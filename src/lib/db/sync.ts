import "server-only";

import { query } from "./index";
import { decryptApiKey } from "../security/api-key";
import { fetchCurrentProfile } from "../torn/client";

export async function syncAllProfiles() {
  const profiles = await query<{ id: string; torn_user_id: string; encrypted_api_key: string | null }>(
    `select id, torn_user_id, encrypted_api_key from profiles where is_active = true and deleted_at is null order by created_at asc`,
  );

  const run = await query<{ id: string }>(
    `insert into sync_runs (status, profiles_requested) values ('running', $1) returning id`,
    [profiles.rows.length],
  );
  const runId = run.rows[0].id;
  let succeeded = 0;
  let failed = 0;
  const results: Array<{ tornUserId: number; ok: boolean; error?: string }> = [];

  for (const profile of profiles.rows) {
    try {
      if (!profile.encrypted_api_key) throw new Error("API key is not configured");
      const state = await fetchCurrentProfile(Number(profile.torn_user_id), decryptApiKey(profile.encrypted_api_key));
      await query(
        `insert into profile_current (profile_id, captured_at, level, rank, networth, money, energy, nerve, happy, cooldowns, battle_stats, metrics)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         on conflict (profile_id) do update set captured_at=excluded.captured_at, level=excluded.level, rank=excluded.rank,
         networth=excluded.networth, money=excluded.money, energy=excluded.energy, nerve=excluded.nerve,
         happy=excluded.happy, cooldowns=excluded.cooldowns, battle_stats=excluded.battle_stats, metrics=excluded.metrics`,
        [profile.id, state.fetchedAt, state.level ?? null, state.rank ?? null, state.networth ?? null, state.money ?? null, state.energy ?? null, state.nerve ?? null, state.happy ?? null, JSON.stringify(state.cooldowns ?? {}), JSON.stringify(state.battleStats ?? {}), JSON.stringify(state.metrics)],
      );
      await query(
        `insert into metric_snapshots (profile_id, captured_at, source_sync_id, metrics) values ($1,$2,$3,$4)`,
        [profile.id, state.fetchedAt, runId, JSON.stringify(state.metrics)],
      );
      succeeded++;
      results.push({ tornUserId: Number(profile.torn_user_id), ok: true });
      await query(`insert into sync_results (sync_run_id, profile_id, status, endpoint_summary, captured_at) values ($1,$2,'success',$3,$4)`, [runId, profile.id, JSON.stringify({ selections: "initial" }), state.fetchedAt]);
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : "Sync failed";
      results.push({ tornUserId: Number(profile.torn_user_id), ok: false, error: message });
      await query(`insert into sync_results (sync_run_id, profile_id, status, error_message) values ($1,$2,'failed',$3)`, [runId, profile.id, message]);
    }
  }

  const status = failed === 0 ? "succeeded" : succeeded === 0 ? "failed" : "partial";
  await query(`update sync_runs set completed_at=now(), status=$1, profiles_succeeded=$2, profiles_failed=$3 where id=$4`, [status, succeeded, failed, runId]);
  return { runId, status, succeeded, failed, results };
}
