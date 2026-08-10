import { NextResponse } from "next/server";
import { requireUser } from "../../../../src/lib/auth/guards";
import { query } from "../../../../src/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const result = await query<{
      id: string;
      started_at: string;
      completed_at: string | null;
      status: string;
      profiles_requested: number;
      profiles_succeeded: number;
      profiles_failed: number;
    }>(`select id, started_at, completed_at, status, profiles_requested, profiles_succeeded, profiles_failed from sync_runs order by started_at desc limit 1`);
    return NextResponse.json(result.rows[0] ?? null);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read sync status" }, { status: 500 });
  }
}
