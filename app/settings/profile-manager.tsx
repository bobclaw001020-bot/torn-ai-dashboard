"use client";

import { useState } from "react";

type Profile = { id: string; displayName: string; tornUserId: number; hasApiKey: boolean; isActive: boolean };

export function ProfileManager({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [form, setForm] = useState({ displayName: "", tornUserId: "", apiKey: "" });
  const [message, setMessage] = useState("");

  async function add() {
    setMessage("");
    const response = await fetch("/api/profiles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, tornUserId: Number(form.tornUserId) }) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error ?? "Could not add profile");
    setProfiles((current) => [...current, body.profile]);
    setForm({ displayName: "", tornUserId: "", apiKey: "" });
    setMessage("Profile added. API key is encrypted server-side.");
  }

  async function rename(id: string) {
    const name = window.prompt("New display name");
    if (!name) return;
    const response = await fetch(`/api/profiles/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ displayName: name }) });
    if (!response.ok) return setMessage("Rename failed");
    setProfiles((current) => current.map((p) => p.id === id ? { ...p, displayName: name } : p));
  }

  async function resetKey(id: string) {
    const apiKey = window.prompt("Paste the new Torn API key");
    if (!apiKey) return;
    const response = await fetch(`/api/profiles/${id}/api-key`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ apiKey }) });
    setMessage(response.ok ? "API key replaced." : "API key replacement failed.");
    if (response.ok) setProfiles((current) => current.map((p) => p.id === id ? { ...p, hasApiKey: true } : p));
  }

  async function deleteKey(id: string) {
    if (!window.confirm("Delete this Torn API key? Historical data is retained.")) return;
    const response = await fetch(`/api/profiles/${id}/api-key`, { method: "DELETE" });
    setMessage(response.ok ? "API key deleted." : "API key deletion failed.");
    if (response.ok) setProfiles((current) => current.map((p) => p.id === id ? { ...p, hasApiKey: false } : p));
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this profile? This is a soft delete.")) return;
    const response = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
    if (!response.ok) return setMessage("Profile deletion failed.");
    setProfiles((current) => current.filter((p) => p.id !== id));
  }

  return <div className="space-y-6">
    <section className="card">
      <h2 className="mb-4 text-xl font-semibold">Add Torn user</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        <input className="input" placeholder="Torn user ID" inputMode="numeric" value={form.tornUserId} onChange={(e) => setForm({ ...form, tornUserId: e.target.value })} />
        <input className="input" placeholder="Torn API key" type="password" autoComplete="off" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
      </div>
      <button className="btn btn-primary mt-4" onClick={add}>Add user</button>
      {message && <p className="muted mt-3 text-sm">{message}</p>}
    </section>
    <section className="card">
      <h2 className="mb-4 text-xl font-semibold">Profiles</h2>
      <div className="space-y-3">
        {profiles.map((profile) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-700 p-4" key={profile.id}>
          <div><strong>{profile.displayName}</strong><p className="muted text-sm">Torn #{profile.tornUserId} · API key {profile.hasApiKey ? "configured" : "missing"}</p></div>
          <div className="flex flex-wrap gap-2"><button className="btn" onClick={() => rename(profile.id)}>Rename</button><button className="btn" onClick={() => resetKey(profile.id)}>Reset API key</button><button className="btn" onClick={() => deleteKey(profile.id)}>Delete key</button><button className="btn" onClick={() => remove(profile.id)}>Delete user</button></div>
        </div>)}
      </div>
    </section>
  </div>;
}
