import Link from "next/link";
import { requireUser } from "../../src/lib/auth/guards";
import { GoalsForm } from "./goals-form";

export default async function GoalsPage() {
  await requireUser();
  return <main className="mx-auto min-h-screen max-w-4xl p-6"><Link className="muted" href="/">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Goals</h1><p className="muted mt-2">Enter three goals. Calculation and AI run only when you submit this form.</p><GoalsForm /></main>;
}
