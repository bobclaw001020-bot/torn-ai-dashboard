"use client";

import { useState } from "react";

export function GoalsForm() {
  const [goals, setGoals] = useState(["", "", ""]);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (goals.some((goal) => !goal.trim())) return setMessage("Please enter all three goals.");
    // AI integration is intentionally not wired here yet. This endpoint will be
    // added only after deterministic snapshot/calculation infrastructure is complete.
    setMessage("Goal input is ready. Recommendation engine is the next implementation stage.");
  }

  return <form className="mt-6 space-y-4" onSubmit={submit}>
    {goals.map((goal, index) => <label className="card block" key={index}><span className="text-sm font-medium">Goal {index + 1}</span><input className="input mt-2" placeholder={index === 0 ? "e.g. Level 100" : index === 1 ? "e.g. Networth $5B" : "e.g. Strength 50M"} value={goal} onChange={(e) => setGoals((current) => current.map((value, i) => i === index ? e.target.value : value))} /></label>)}
    <button className="btn btn-primary" type="submit">Calculate Recommendation</button>
    {message && <p className="muted text-sm">{message}</p>}
  </form>;
}
