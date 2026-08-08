# Database Design v1

## Design goals

- PostgreSQL-compatible.
- Strong relational integrity for profiles, goals, sync runs, and recommendations.
- JSON/JSONB only where Torn API coverage is broad or evolving.
- Current state is optimized for dashboard reads.
- Recent snapshots support growth calculations.
- Daily snapshots support lightweight long-term history.

## Tables

### profiles

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| display_name | text | Required |
| torn_user_id | bigint | Unique among active profiles |
| encrypted_api_key | text | AEAD ciphertext |
| api_key_version | integer | Encryption key version |
| is_active | boolean | Default true |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz nullable | Soft delete support |

### profile_current

| Column | Type | Notes |
|---|---|---|
| profile_id | uuid | PK/FK profiles |
| captured_at | timestamptz | Last successful sync state |
| level | integer nullable | Common dashboard metric |
| rank | text nullable | |
| networth | numeric nullable | Money-safe numeric type |
| money | numeric nullable | |
| energy | integer nullable | |
| nerve | integer nullable | |
| happy | integer nullable | |
| cooldowns | jsonb nullable | Endpoint-derived cooldown data |
| battle_stats | jsonb nullable | Normalized battle stat structure |
| other_metrics | jsonb nullable | Extensible normalized fields |
| raw_summary | jsonb nullable | Limited normalized summary, not an unrestricted raw API archive |

### metric_snapshots

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| profile_id | uuid | FK |
| captured_at | timestamptz | |
| source_sync_id | uuid nullable | FK sync_runs |
| metrics | jsonb | Normalized numeric/time-series metrics |
| created_at | timestamptz | |

Indexes:
- `(profile_id, captured_at desc)`
- `captured_at`

### daily_snapshots

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| profile_id | uuid | FK |
| snapshot_date | date | One per profile/day |
| metrics | jsonb | Lightweight summary |
| created_at | timestamptz | |

Unique constraint:
- `(profile_id, snapshot_date)`

### sync_runs

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| started_at | timestamptz | |
| completed_at | timestamptz nullable | |
| status | text | running/succeeded/partial/failed |
| profiles_requested | integer | |
| profiles_succeeded | integer | |
| profiles_failed | integer | |
| error_summary | jsonb nullable | Sanitized errors |

### sync_results

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| sync_run_id | uuid | FK |
| profile_id | uuid | FK |
| status | text | success/failed |
| endpoint_summary | jsonb nullable | Endpoint/result metadata |
| captured_at | timestamptz | |
| error_code | text nullable | |
| error_message | text nullable | Sanitized |

### goals

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| profile_id | uuid | FK |
| slot | smallint | 1, 2, or 3 |
| goal_type | text | Controlled goal identifier |
| target | jsonb | Structured target |
| deadline | timestamptz nullable | |
| original_input | text | User's original natural-language input |
| normalized_goal | jsonb | Parsed/validated representation |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique constraint:
- `(profile_id, slot)`

### recommendation_runs

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| profile_id | uuid | FK |
| created_at | timestamptz | |
| status | text | running/succeeded/failed |
| snapshot_captured_at | timestamptz | Exact snapshot used |
| goals | jsonb | Three goals used |
| calculation_result | jsonb | Deterministic facts |
| optimizer_result | jsonb | Candidate/path scoring |
| ai_result | jsonb nullable | Validated model result |
| model_name | text nullable | LM Studio model identifier |
| error_message | text nullable | Sanitized |

### dashboard_layouts

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| profile_id | uuid | Unique FK |
| layout | jsonb | Widget positions/visibility/order |
| theme_mode | text | light/dark |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Security settings

Passwords and encryption master keys are not represented as application-readable plaintext values in the database.

Password storage should use a strong password hashing algorithm such as Argon2id. Encryption master secrets remain in Vercel environment secrets.

## Retention jobs

Detailed `metric_snapshots` older than the configured retention period (default 30 days) should be deleted in batches. `daily_snapshots` are retained separately.

## Future extension

If the Torn API exposes additional data that becomes useful for recommendations, add normalized columns only for stable/high-value metrics. Keep less-stable endpoint-specific data in JSONB to avoid constant migrations.
