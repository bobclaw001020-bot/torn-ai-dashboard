"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password, admin }),
    });
    if (!response.ok) setError("Invalid password or server is not configured.");
    else router.push("/");
    setBusy(false);
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block text-sm">
        Password
        <input className="input mt-1" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} />
        Admin access
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
