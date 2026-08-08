# Torn API Integration Plan v1

The official Torn API documentation confirms that the API is read-only and supports user, faction, company, market, property, and Torn data. API keys have access levels and are subject to request limits. Our application stores keys securely and shares selected profile data with the private family dashboard, so the UI must clearly disclose this storage/sharing purpose when an API key is entered. citeturn0search0turn0search2

## API version strategy

Prefer **API v2** for endpoints/selections available there because it is the current structured API and newer selections are being added/refactored there. Keep the adapter capable of using v1 where a required selection remains v1-only. The Torn documentation currently lists a mix of v1-only, v2-only, and changed-access selections. citeturn0search0turn0search3

## User API coverage

The sync layer should build a selection registry and request all useful selections allowed by the submitted key. Exact selections are determined from the key's access level and current API documentation rather than hard-coded assumptions.

Priority groups:

### Core dashboard

- profile/basic information
- stats / battle stats
- money / networth where available
- bars/resources
- cooldowns
- travel
- education
- work/company information where permitted
- faction information where permitted
- crimes / crime-related progress where permitted
- equipment / inventory where permitted

Recent API v2 changes include user cooldowns, travel, inventory, item mods, equipment mods/ammo, casino, and other refactored selections, so the adapter should be version-aware rather than assuming the older response shape. citeturn0search3turn0search4

### Secondary data

- honors / medals
- personal events/log categories where the key explicitly permits them
- racing
- attacks / combat history where useful and permitted
- organized crimes / faction activity where permitted
- other useful progression metrics

### Reference data

Use Torn/global data for calculation/reference purposes when useful:

- items and item details/stats
- gyms
- education
- companies
- properties
- market reference data
- shops
- stocks
- other Torn reference selections

Do not store large globally cached datasets per profile when a shared reference cache is more appropriate. Torn documents several globally cached selections, including item market, properties, rentals, company listings, user bazaar, and bounties. citeturn0search0

## API key requirements

Each profile uses its own API key. Torn documents four access levels and allows custom keys with exact selections. The application should show which access level/selections are recommended for this tool and should fail gracefully when a key lacks permission for an optional selection. citeturn0search0turn0search2

The application should **not ask for a Torn password**; the Torn documentation explicitly states that the API key is the intended credential. citeturn0search1

## Rate limits and errors

Torn documents error code 5 for excessive requests, with a maximum of 100 requests per minute per user/key, and also documents errors for invalid keys, incorrect selections, access restrictions, IP blocks, and disabled API service. The sync engine therefore needs:

- request budgeting
- endpoint batching where supported
- bounded concurrency
- retry/backoff for transient failures
- per-profile error isolation
- no retry loops for permission/credential errors
- clear sync result reporting

citeturn0search0turn0search2

## Sync design

`Sync All` loops through the active profiles and calls the selection registry. It should prefer combined selection requests where the endpoint/version supports them rather than making one HTTP request per metric.

Each endpoint result is normalized into the internal schema. Raw API payloads should not become the primary database model.

Pseudo-flow:

1. Load active profiles.
2. Decrypt one profile key server-side.
3. Determine supported selection groups.
4. Fetch core user data.
5. Fetch optional groups with isolated failures.
6. Normalize responses.
7. Upsert `profile_current`.
8. Append `metric_snapshots`.
9. Upsert the day's `daily_snapshots`.
10. Record `sync_results`.
11. Move to next profile.
12. Return aggregate Sync All status.

## API key UI disclosure

Because this service stores keys persistently and shares stored profile information with family members through the private dashboard, the API-key setup UI should include a clear disclosure reflecting Torn's documented data-storage/data-sharing guidance. The exact wording will be finalized during implementation. citeturn0search0

## Future-proofing

The API changes over time. Keep:

- selection definitions in one registry
- API version adapters isolated
- response normalizers version-aware
- database migrations additive where possible
- unsupported selections non-fatal

This allows new Torn API v2 selections to be added without rewriting the dashboard or calculation engine.
