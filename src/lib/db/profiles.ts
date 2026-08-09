import "server-only";

import { query } from "./index";
import { encryptApiKey } from "../security/api-key";

export type Profile = {
  id: string;
  displayName: string;
  tornUserId: number;
  hasApiKey: boolean;
  isActive: boolean;
};

export async function listProfiles(): Promise<Profile[]> {
  const result = await query<Profile & { display_name: string; torn_user_id: string; has_api_key: boolean; is_active: boolean }>(
    `select id, display_name, torn_user_id, encrypted_api_key is not null as has_api_key, is_active
     from profiles where deleted_at is null order by created_at asc`,
  );

  return result.rows.map((row) => ({
    id: row.id,
    displayName: row.display_name,
    tornUserId: Number(row.torn_user_id),
    hasApiKey: row.has_api_key,
    isActive: row.is_active,
  }));
}

export async function createProfile(input: {
  displayName: string;
  tornUserId: number;
  apiKey: string;
}): Promise<string> {
  const encrypted = encryptApiKey(input.apiKey);
  const result = await query<{ id: string }>(
    `insert into profiles (display_name, torn_user_id, encrypted_api_key)
     values ($1, $2, $3) returning id`,
    [input.displayName.trim(), input.tornUserId, encrypted],
  );
  return result.rows[0].id;
}

export async function replaceProfileApiKey(profileId: string, apiKey: string): Promise<void> {
  await query(
    `update profiles set encrypted_api_key = $1, api_key_version = api_key_version + 1, updated_at = now()
     where id = $2 and deleted_at is null`,
    [encryptApiKey(apiKey), profileId],
  );
}

export async function deleteProfileApiKey(profileId: string): Promise<void> {
  await query(
    `update profiles set encrypted_api_key = null, updated_at = now() where id = $1 and deleted_at is null`,
    [profileId],
  );
}

export async function renameProfile(profileId: string, displayName: string): Promise<void> {
  await query(
    `update profiles set display_name = $1, updated_at = now() where id = $2 and deleted_at is null`,
    [displayName.trim(), profileId],
  );
}

export async function softDeleteProfile(profileId: string): Promise<void> {
  await query(
    `update profiles set is_active = false, deleted_at = now(), updated_at = now() where id = $1 and deleted_at is null`,
    [profileId],
  );
}
