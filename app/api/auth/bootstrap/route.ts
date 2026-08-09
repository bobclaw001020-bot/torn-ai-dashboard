import { NextResponse } from "next/server";
import { z } from "zod";
import { credentialsExist, initializeCredentials } from "../../../../src/lib/db/credentials";

const schema = z.object({ bootstrapSecret: z.string().min(1), sharedPassword: z.string().min(12), adminPassword: z.string().min(12) });

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const expected = process.env.BOOTSTRAP_SECRET;
    if (!expected || input.bootstrapSecret !== expected) return NextResponse.json({ error: "Invalid bootstrap secret" }, { status: 401 });
    if (await credentialsExist()) return NextResponse.json({ error: "Already initialized" }, { status: 409 });
    await initializeCredentials(input.sharedPassword, input.adminPassword);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bootstrap failed" }, { status: 400 });
  }
}
