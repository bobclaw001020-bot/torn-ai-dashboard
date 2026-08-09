# Vercel deployment and first test

## 1. Connect the repository

In Vercel, import `bobclaw001020-bot/torn-ai-dashboard` and deploy the `main` branch.

## 2. Create PostgreSQL

Create a production PostgreSQL database that provides a `DATABASE_URL` connection string. Run `src/lib/db/schema.sql` once against that database.

## 3. Configure Vercel environment variables

Required before using the app:

- `DATABASE_URL`
- `SESSION_SECRET` — random secret, at least 32 characters
- `BOOTSTRAP_SECRET` — long random one-time setup secret
- `TORN_API_KEY_ENCRYPTION_KEY` — base64 encoding of exactly 32 random bytes

Do not put Torn API keys, passwords, database passwords, or these secrets in GitHub.

## 4. Bootstrap the two passwords

After the first successful deployment, call:

`POST /api/auth/bootstrap`

with JSON:

```json
{
  "bootstrapSecret": "the Vercel BOOTSTRAP_SECRET",
  "sharedPassword": "a strong shared password",
  "adminPassword": "a different strong admin password"
}
```

This endpoint refuses to run after credentials already exist.

After successful bootstrap, remove or rotate `BOOTSTRAP_SECRET` in Vercel. The database credentials remain the source of truth.

## 5. Test login

1. Open `/login`.
2. Sign in with the normal shared password.
3. Confirm `/` loads.
4. Sign out/reopen a private browser session and confirm unauthenticated access redirects to `/login`.
5. Sign in with the admin password and confirm `/settings` loads.
6. Add one Torn profile with its Torn user ID and API key.
7. Confirm the dashboard shows only `configured`, never the API key.
8. Press **Sync All**.
9. Confirm current state and snapshot rows are written to PostgreSQL.
10. Confirm the Sync All operation does not call the AI gateway.

## 6. Vercel build validation

GitHub Actions runs:

- TypeScript typecheck
- ESLint
- Next.js production build

Fix any CI failure before treating a deployment as production-ready.
