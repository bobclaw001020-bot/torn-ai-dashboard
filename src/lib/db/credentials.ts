import "server-only";

import { query } from "./index";
import { hashPassword, verifyPassword } from "../security/password";

export async function credentialsExist(): Promise<boolean> {
  const result = await query<{ exists: boolean }>("select exists(select 1 from app_credentials) as exists");
  return result.rows[0]?.exists ?? false;
}

export async function initializeCredentials(sharedPassword: string, adminPassword: string): Promise<void> {
  const sharedHash = await hashPassword(sharedPassword);
  const adminHash = await hashPassword(adminPassword);
  await query(
    `insert into app_credentials (id, shared_password_hash, admin_password_hash)
     values (true, $1, $2)
     on conflict (id) do nothing`,
    [sharedHash, adminHash],
  );
}

export async function verifyLogin(password: string, admin: boolean): Promise<boolean> {
  const result = await query<{ hash: string }>(
    `select ${admin ? "admin_password_hash" : "shared_password_hash"} as hash from app_credentials where id = true`,
  );
  const hash = result.rows[0]?.hash;
  return hash ? verifyPassword(password, hash) : false;
}
