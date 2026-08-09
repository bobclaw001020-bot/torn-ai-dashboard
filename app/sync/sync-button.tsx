"use client";

import { useState } from "react";

export function SyncButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");

  async function sync() {
    setBusy(true); setResult("");
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const body = await response.json();
      setResult(response.ok ? `Sync ${body.status}: ${body.succeeded} succeeded, ${body.failed} failed.` : body.error ?? "Sync failed");
    } catch { setResult("Sync failed."); }
    finally { setBusy(false); }
  }

  return <div><button className="btn btn-primary" disabled={busy} onClick={sync}>{busy ? "Syncing…" : "Sync All"}</button>{result && <p className="muted mt-4 text-sm">{result}</p>}</div>;
}
