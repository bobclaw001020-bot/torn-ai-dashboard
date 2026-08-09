import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "../../../../src/lib/auth/guards";
import { renameProfile, softDeleteProfile } from "../../../../src/lib/db/profiles";

const schema = z.object({ displayName: z.string().trim().min(1).max(80) });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const { id } = await context.params; const input = schema.parse(await request.json()); await renameProfile(id, input.displayName); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unauthorized or invalid request" }, { status: 400 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const { id } = await context.params; await softDeleteProfile(id); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unauthorized or invalid request" }, { status: 400 }); }
}
