import Link from "next/link";
import { requireUser } from "../../src/lib/auth/guards";
import { SyncButton } from "./sync-button";

export default async function SyncPage() {
  await requireUser();
  return <main className="mx-auto min-h-screen max-w-3xl p-6"><Link className="muted" href="/">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Sync All</h1><p className="muted mt-2">Syncs every active Torn profile. This never runs AI recommendations.</p><div className="card mt-6"><SyncButton /></div></main>;
}
