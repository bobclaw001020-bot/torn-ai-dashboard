import { NextResponse } from "next/server";
import { requireUser } from "../../../src/lib/auth/guards";
import { syncAllProfiles } from "../../../src/lib/db/sync";

export async function POST() {
  try {
    await requireUser();
    const result = await syncAllProfiles();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 });
  }
}
