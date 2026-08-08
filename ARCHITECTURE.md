# Technical Architecture v1

## System boundaries

The application is split into four major pipelines:

1. **Torn Sync** — fetches and normalizes Torn API data. No AI.
2. **Persistence** — stores current state, recent history, and daily summaries.
3. **Goal Optimization** — deterministic calculations and feasible-action scoring.
4. **AI Recommendation** — receives structured snapshot/calculation results and explains/builds the user-facing path through LM Studio.

## Request flow

### Sync

Browser -> Next.js server -> Torn API -> normalizers -> database -> dashboard refresh

### Recommendation

Browser -> Goals page -> Next.js server -> database snapshot -> goal parser -> calculation engine -> optimizer -> LM Studio -> validated recommendation -> database -> UI

LM Studio never calls Torn API.

## Data model

The initial relational model should contain:

### profiles

- id (UUID)
- display_name
- torn_user_id
- encrypted_api_key
- api_key_version
- is_active
- created_at
- updated_at
- deleted_at (nullable)

### profile_current

One current normalized state per profile. Store high-value current metrics in typed columns and retain extensible structured data for API fields that are useful but not stable enough for first-class columns.

### metric_snapshots

- id
- profile_id
- captured_at
- source_sync_id
- metric payload / normalized values

This table is the recent-history layer and is subject to approximately 30-day detailed retention.

### daily_snapshots

- id
- profile_id
- snapshot_date
- summary metrics
- created_at

This is the lightweight historical layer.

### sync_runs

- id
- started_at
- completed_at
- status
- profiles_requested
- profiles_succeeded
- profiles_failed
- error summary

### sync_results

- id
- sync_run_id
- profile_id
- endpoint/status metadata
- captured_at
- error information if applicable

### goals

- id
- profile_id
- slot (1..3)
- goal_type
- target_value / structured target
- deadline (nullable)
- original_input
- normalized_goal JSON
- created_at
- updated_at

### recommendation_runs

- id
- profile_id
- snapshot reference
- created_at
- status
- goals JSON
- calculation result JSON
- optimizer result JSON
- ai result JSON

### dashboard_layouts

- id
- profile_id
- layout JSON
- theme mode
- updated_at

### app_settings

Server-side application/security settings that are safe to store in the database. Secrets and encryption master keys must remain in deployment secret storage, not in source control.

## Authentication model

Two credentials exist:

- shared user password
- separate admin password

Use server-side session cookies. Passwords are stored as strong one-way password hashes; never plaintext.

Admin-only operations require a distinct admin session/role.

The normal shared session does not identify a family member.

## API key encryption

Torn API keys are encrypted at rest using authenticated encryption (prefer AES-256-GCM or an equivalent modern AEAD implementation). The encryption key is held only in Vercel/server environment secrets and is never committed to GitHub.

Key rotation should be supported by storing an encryption version alongside each encrypted value.

## Torn API adapter

Implement a single server-side Torn client with:

- request timeout
- response validation
- endpoint-specific normalization
- rate/error handling
- structured logging without API keys
- per-profile isolation

The client should map Torn API responses into an internal normalized model so UI/calculation code is not tightly coupled to raw Torn API JSON.

## Calculation architecture

Calculation code must be deterministic and independently testable.

Suggested interfaces:

- `MetricCalculator`
- `ActionEvaluator`
- `RequirementChecker`
- `GoalScorer`
- `PathOptimizer`

An action should expose, where known:

- prerequisites
- direct cost
- resource cost
- expected gain
- duration
- affected metrics/goals
- uncertainty/confidence

Impossible actions are filtered before ranking.

## AI architecture

Use a provider interface, with LM Studio as the first implementation.

`AIProvider.generateRecommendation(input)` receives only the minimum structured context required:

- current snapshot
- three normalized goals
- feasible actions
- calculation results
- optimizer candidates

AI output must be schema-validated before being displayed or stored. Numeric fields that can be calculated deterministically should be taken from the calculation result rather than trusted from model-generated numbers.

## Mac mini connectivity

LM Studio runs on the always-on Mac mini. Do not expose the LM Studio port directly to the public Internet.

Production target:

Vercel server -> authenticated AI gateway -> private tunnel (initial preference: Cloudflare Tunnel) -> Mac mini -> LM Studio.

The exact tunnel configuration will be finalized during deployment. Credentials remain server-side.

## Vercel

Vercel hosts the Next.js application. Torn API calls, database access, credential decryption, and AI gateway calls are server-side only.

Browser code must never receive:

- Torn API keys
- encryption keys
- admin password hash
- LM Studio gateway secret
- database credentials

## UI structure

- `/dashboard` — current metrics, growth, profiles, Sync All
- `/goals` — three goals and Calculate Recommendation
- `/recommendations/[id]` — immediate path and longer-term plan
- `/settings` — admin-only profile/security management

Profile selection is a dashboard data selection mechanism, not a login identity.

## Retention

A scheduled cleanup process should remove detailed metric snapshots older than the configured retention window (default ~30 days). Daily snapshots are retained as the lightweight historical record.

Because Vercel serverless execution is not a persistent scheduler, the production cleanup/snapshot mechanism should use an external scheduled trigger or supported database scheduling mechanism.

## Security principles

- No secrets in GitHub.
- All Torn API access server-side.
- Encrypted API keys at rest.
- Strong password hashing for shared/admin passwords.
- Secure, HTTP-only, same-site session cookies.
- CSRF protection for state-changing authenticated routes where applicable.
- Validate all user and AI input with schemas.
- Never log API keys, passwords, session secrets, or raw sensitive credentials.
- Least-privilege database/service credentials.
