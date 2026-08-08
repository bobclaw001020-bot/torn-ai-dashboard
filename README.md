# Torn AI Dashboard

Private family dashboard for up to 10 Torn City profiles.

## Core product rules

- **Sync All** synchronizes Torn API data, updates the database, history, and dashboard.
- **Sync All never triggers AI.**
- AI calculation/recommendation runs only from the Goals page after three goals are entered.
- AI uses the current database snapshot and does not call Torn API directly.
- Up to 10 Torn profiles are supported.
- Torn API keys are encrypted at rest and can be replaced or deleted.
- Detailed history is retained for about 30 days, with daily summary snapshots.
- All normal users can view all profiles and run **Sync All**.
- A separate admin password protects profile and security settings.

## Planned stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL-compatible database
- Torn API
- LM Studio on a private Mac mini
- Secure tunnel for the AI gateway
- Vercel

## Status

Repository initialized. Product specification and technical architecture are being finalized before feature implementation.
