import { requireAdmin } from "../../src/lib/auth/guards";
import { listProfiles } from "../../src/lib/db/profiles";
import { ProfileManager } from "./profile-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  let profiles: Awaited<ReturnType<typeof listProfiles>> = [];
  let configured = true;
  try { profiles = await listProfiles(); } catch { configured = false; }

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="muted mb-6 mt-1">Admin-only profile and security management.</p>
      {!configured && <div className="card mb-6 border-amber-500/40">Database is not configured yet.</div>}
      <ProfileManager initialProfiles={profiles} />
    </main>
  );
}
