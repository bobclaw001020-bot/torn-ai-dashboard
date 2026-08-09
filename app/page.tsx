import Link from "next/link";
import { listProfiles } from "../src/lib/db/profiles";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let profiles: Awaited<ReturnType<typeof listProfiles>> = [];
  let databaseConfigured = true;

  try {
    profiles = await listProfiles();
  } catch {
    databaseConfigured = false;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="muted text-sm">Private family dashboard</p>
          <h1 className="text-3xl font-bold">Torn AI Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link className="btn" href="/goals">Goals</Link>
          <Link className="btn" href="/settings">Settings</Link>
          <Link className="btn btn-primary" href="/sync">Sync All</Link>
        </div>
      </header>

      {!databaseConfigured && (
        <div className="card mb-6 border-amber-500/40">
          <strong>Database not configured.</strong>
          <p className="muted mt-1 text-sm">Deploying the UI is possible now; add DATABASE_URL and the encryption secret before using real profiles.</p>
        </div>
      )}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Profiles", profiles.length.toString()],
          ["Level", "—"],
          ["Networth", "—"],
          ["30-day growth", "—"],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <p className="muted text-sm">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Torn Profiles</h2>
          <Link className="btn" href="/settings">Manage</Link>
        </div>
        {profiles.length === 0 ? (
          <p className="muted">No profiles yet. An admin can add the first Torn user in Settings.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <div className="rounded-lg border border-zinc-700 p-4" key={profile.id}>
                <div className="flex items-center justify-between">
                  <strong>{profile.displayName}</strong>
                  <span className="muted text-xs">#{profile.tornUserId}</span>
                </div>
                <p className="muted mt-2 text-sm">API key: {profile.hasApiKey ? "configured" : "missing"}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
