import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "../../../../../src/lib/auth/guards";
import { deleteProfileApiKey, replaceProfileApiKey } from "../../../../../src/lib/db/profiles";

const schema = z.object({ apiKey: z.string().trim().min(1) });

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const { id } = await context.params; const input = schema.parse(await request.json()); await replaceProfileApiKey(id, input.apiKey); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unauthorized or invalid request" }, { status: 400 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const { id } = await context.params; await deleteProfileApiKey(id); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unauthorized or invalid request" }, { status: 400 }); }
}
