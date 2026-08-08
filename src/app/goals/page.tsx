const goals = [1, 2, 3];

export default function GoalsPage() {
  return (
    <main className="min-h-screen bg-[var(--surface)] p-6 text-[var(--foreground)] md:p-10">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm text-[var(--muted)] hover:underline">← Dashboard</a>
        <header className="mt-6">
          <p className="text-sm font-medium text-[var(--muted)]">GOAL OPTIMIZER</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Set your three goals</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Calculation and AI run only when you submit this page. The recommendation uses the current database snapshot.
          </p>
        </header>

        <form className="mt-8 space-y-5">
          {goals.map((number) => (
            <section key={number} className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <label htmlFor={`goal-${number}`} className="text-sm font-semibold">Goal {number}</label>
              <textarea
                id={`goal-${number}`}
                name={`goal-${number}`}
                rows={3}
                placeholder={number === 1 ? "Example: Get to level 100 within 60 days" : number === 2 ? "Example: Reach $5B networth" : "Example: Reach 50M strength"}
                className="mt-3 w-full resize-y rounded-lg border border-[var(--border)] px-4 py-3 outline-none focus:border-gray-500"
              />
            </section>
          ))}

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Calculate Recommendation
          </button>
        </form>
      </div>
    </main>
  );
}
