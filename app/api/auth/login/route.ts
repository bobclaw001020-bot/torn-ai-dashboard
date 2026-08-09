import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLogin } from "../../../../src/lib/db/credentials";
import { createSessionValue, sessionCookieName, sessionMaxAge } from "../../../../src/lib/auth/session";

const schema = z.object({ password: z.string().min(1), admin: z.boolean().default(false) });

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const valid = await verifyLogin(input.password, input.admin);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieName, createSessionValue(input.admin ? "admin" : "user"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
