import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "../../../src/lib/auth/guards";
import { createProfile, listProfiles } from "../../../src/lib/db/profiles";

const schema = z.object({ displayName: z.string().trim().min(1).max(80), tornUserId: z.number().int().positive(), apiKey: z.string().trim().min(1) });

export async function GET() {
  try { await requireAdmin(); return NextResponse.json({ profiles: await listProfiles() }); }
  catch { return NextResponse.json({ error: "Unauthorized or database unavailable" }, { status: 401 }); }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = schema.parse(await request.json());
    const id = await createProfile(input);
    const profile = (await listProfiles()).find((item) => item.id === id);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
