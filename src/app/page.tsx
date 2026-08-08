const cards = [
  { label: "Level", value: "—" },
  { label: "Networth", value: "—" },
  { label: "Money", value: "—" },
  { label: "Cooldown", value: "—" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--surface)] p-6 text-[var(--foreground)] md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">TORN AI DASHBOARD</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50"
          >
            Sync All
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <p className="text-sm text-[var(--muted)]">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <article className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">30-Day Growth</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">History will appear after the first sync.</p>
              </div>
            </div>
            <div className="mt-8 flex h-56 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
              No snapshot data yet
            </div>
          </article>

          <article className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Profiles</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Up to 10 Torn profiles</p>
            <div className="mt-6 rounded-lg border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">
              Add profiles from Settings.
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Goals & AI Recommendation</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Enter three goals on the Goals page to calculate an optimized path. Sync never triggers AI.
              </p>
            </div>
            <a className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-gray-50" href="/goals">
              Open Goals
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
