# Torn API coverage strategy

Torn currently exposes a large and evolving API, with API v2 development ongoing. The official Swagger/API documentation is the source of truth. We use v2 for the main dashboard path and keep the selection registry data-driven so new selections can be added without changing the sync architecture.

## Dashboard sync priority

The first user sync focuses on the key-owner's user data:

- basic/profile
- bars/cooldowns
- money/networth
- personalstats/workstats/skills
- education/honors/medals
- inventory/equipment/itemmods
- properties/stocks/bank/jobpoints
- company/faction
- crimes/attacks/revives
- racing/casino/bounties/travel
- lastaction/HOF

The normalized database stores high-value metrics in typed columns and keeps the broader normalized response in JSONB so useful API fields are not discarded while the schema evolves.

## Access and failure behavior

API keys have access levels. A key may legitimately fail on a selection because its access level does not permit that selection. The sync engine should record the failure for that selection/profile and continue with other selections/profiles where possible.

Torn also documents request limits and error codes. Sync must therefore avoid uncontrolled parallel requests and must classify rate-limit, invalid-key, permission, inactive-key, and temporary errors separately.

## API terms disclosure

Because this application persistently stores Torn API data, shares selected profile data with the other members of this private family dashboard, and securely stores API keys, the API-key entry screen must visibly explain the storage, sharing, purpose, key-storage/access, and required access level in the format Torn requests.

This is a product requirement, not merely documentation.
