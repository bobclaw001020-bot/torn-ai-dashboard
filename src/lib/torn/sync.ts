import "server-only";

import { query } from "../db";
import { decryptApiKey } from "../security/api-key";
import { fetchCurrentProfile } from "./client";

export async function syncAllProfiles() {
  const run = await query<{ id: string }>(
    `insert into sync_runs (status, profiles_requested) select 'running', count(*) from profiles where is_active = true and deleted_at is null returning id`,
  );
  const syncRunId = run.rows[0]?.id;
  if (!syncRunId) throw new Error("Could not create sync run");

  const profiles = await query<{ id: string; torn_user_id: string; encrypted_api_key: string | null }>(
    `select id, torn_user_id, encrypted_api_key from profiles where is_active = true and deleted_at is null order by created_at asc`,
  );

  let succeeded = 0;
  let failed = 0;
  const errors: Array<{ profileId: string; error: string }> = [];

  for (const profile of profiles.rows) {
    if (!profile.encrypted_api_key) {
      failed += 1;
      errors.push({ profileId: profile.id, error: "API key is not configured" });
      await query(
        `insert into sync_results (sync_run_id, profile_id, status, error_code, error_message) values ($1,$2,'failed','MISSING_API_KEY',$3)`,
        [syncRunId, profile.id, "API key is not configured"],
      );
      continue;
    }

    try {
      const apiKey = decryptApiKey(profile.encrypted_api_key);
      const state = await fetchCurrentProfile(Number(profile.torn_user_id), apiKey);

      await query(
        `insert into profile_current (profile_id,captured_at,level,rank,networth,money,energy,nerve,happy,cooldowns,battle_stats,metrics)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         on conflict (profile_id) do update set captured_at=excluded.captured_at,level=excluded.level,rank=excluded.rank,networth=excluded.networth,money=excluded.money,energy=excluded.energy,nerve=excluded.nerve,happy=excluded.happy,cooldowns=excluded.cooldowns,battle_stats=excluded.battle_stats,metrics=excluded.metrics`,
        [profile.id, state.fetchedAt, state.level ?? null, state.rank ?? null, state.networth ?? null, state.money ?? null, state.energy ?? null, state.nerve ?? null, state.happy ?? null, JSON.stringify(state.cooldowns ?? {}), JSON.stringify(state.battleStats ?? {}), JSON.stringify(state.metrics)],
      );

      await query(
        `insert into metric_snapshots (profile_id,captured_at,source_sync_id,metrics) values ($1,$2,$3,$4)`,
        [profile.id, state.fetchedAt, syncRunId, JSON.stringify(state.metrics)],
      );

      succeeded += 1;
      await query(
        `insert into sync_results (sync_run_id,profile_id,status,endpoint_summary,captured_at) values ($1,$2,'success',$3,$4)`,
        [syncRunId, profile.id, JSON.stringify({ selections: "initial" }), state.fetchedAt],
      );
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Unknown Torn API error";
      errors.push({ profileId: profile.id, error: message });
      await query(
        `insert into sync_results (sync_run_id,profile_id,status,error_code,error_message) values ($1,$2,'failed','SYNC_ERROR',$3)`,
        [syncRunId, profile.id, message.slice(0, 500)],
      );
    }
  }

  const status = failed === 0 ? "succeeded" : succeeded === 0 ? "failed" : "partial";
  await query(
    `update sync_runs set completed_at=now(),status=$1,profiles_succeeded=$2,profiles_failed=$3,error_summary=$4 where id=$5`,
    [status, succeeded, failed, JSON.stringify(errors), syncRunId],
  );

  return { syncRunId, status, succeeded, failed, errors };
}
