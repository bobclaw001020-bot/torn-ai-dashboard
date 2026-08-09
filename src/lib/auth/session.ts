import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "torn_session";
const MAX_AGE = 60 * 60 * 24 * 7;

type SessionRole = "user" | "admin";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be configured and at least 32 characters");
  return value;
}

function sign(role: SessionRole, expires: number) {
  return createHmac("sha256", secret()).update(`${role}.${expires}`).digest("base64url");
}

export function createSessionValue(role: SessionRole) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  return `${role}.${expires}.${sign(role, expires)}`;
}

export function verifySessionValue(value?: string): SessionRole | null {
  if (!value) return null;
  const [role, expiresText, signature] = value.split(".");
  if ((role !== "user" && role !== "admin") || !expiresText || !signature) return null;
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return null;
  const expected = sign(role, expires);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? role : null;
}

export async function getSessionRole(): Promise<SessionRole | null> {
  const store = await cookies();
  return verifySessionValue(store.get(COOKIE)?.value);
}

export const sessionCookieName = COOKIE;
export const sessionMaxAge = MAX_AGE;
