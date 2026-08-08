# Product Specification v1

## 1. Product goal

A private family Torn City dashboard for up to 10 Torn profiles. The system synchronizes Torn data, keeps recent history, and uses a calculation engine plus AI to produce an optimal, executable path for three user-defined goals.

## 2. Access model

- One shared normal-user password.
- One separate admin password.
- No need to identify which family member is logged in.
- All normal users can view all 10 profiles and run **Sync All**.
- Admin settings:
  - Profiles: Add user, Rename user, Delete user, Reset API key.
  - Security: Change shared password.
- Maximum 10 profiles.

## 3. Torn profiles and API keys

Each profile has its own Torn user ID and Torn API key.

API keys:
- are encrypted at rest;
- are never exposed to the browser in plaintext;
- can be replaced;
- can be deleted;
- when deleted, profile history may be retained or deleted as an explicit choice.

## 4. Sync behavior

The dashboard exposes **Sync All**.

Sync All:
1. Fetches data for all active Torn profiles.
2. Normalizes and validates API responses.
3. Updates current database state.
4. Updates recent history.
5. Creates/updates daily summary snapshots when appropriate.
6. Refreshes dashboard data.

**Sync All never invokes calculation, the goal optimizer, LM Studio, or AI.**

## 5. Data coverage

The system should capture as much useful data as Torn API provides, including where available:

- Level and rank
- Networth and money
- Energy, nerve, happy, cooldowns
- Battle stats
- Crimes
- Work
- Education
- Faction
- Company
- Travel
- Items
- Market-related data
- Other useful API-provided metrics

## 6. History

- Detailed/recent history: approximately 30 days.
- Daily summary snapshots: lightweight historical records.
- All reasonable numeric metrics should be eligible for daily snapshots.
- Retention should prevent uncontrolled database growth.

## 7. Dashboard

Initial UI is intentionally simple. Default dashboard should prioritize:

- Level
- Networth
- Money
- Cooldowns
- Energy / Nerve / Happy where useful
- Battle stats
- 30-day growth
- Profile overview

Customization per profile:
- Drag and drop widgets
- Show/hide widgets
- Reorder widgets
- Custom dashboard layout
- Dark/light mode
- Theme/color architecture reserved for future use

## 8. Goals

The Goals page is the only place that triggers calculation and AI recommendation.

Users enter exactly three active goals for an optimization run.

Built-in goal types include common goals such as:
- Level
- Networth
- Money
- Battle stats
- Other supported metrics

The user may also enter a goal that does not have a predefined option. Natural-language goal input is supported, and the AI can map it into a controlled structured goal representation. New goal logic must not be allowed to arbitrarily modify production calculation code.

## 9. Goal optimization

The three goals are optimized together, not independently.

Pipeline:

Current database snapshot -> goal parsing -> available actions -> requirement filtering -> calculation -> cost/benefit analysis -> goal interaction analysis -> optimizer -> recommendation path.

The optimizer must remove actions that the current account cannot perform because of requirements, cooldowns, resources, level, or other known constraints.

## 10. Cost and opportunity cost

Where data and models permit, recommendations should include:

- Direct cost
- Expected return
- Net gain
- Energy/resource cost
- Time cost
- Impact on each of the three goals

## 11. AI separation

The calculation engine is responsible for numerical facts and deterministic calculations.

The optimizer is responsible for ranking feasible actions and building a path.

The AI is responsible for interpreting structured results, understanding natural-language goals, explaining trade-offs, and producing useful natural-language recommendations.

AI must not be treated as the source of numerical truth when a deterministic calculation is available.

## 12. AI data source

AI receives the current database snapshot and structured calculation/optimizer results. AI does not directly call Torn API.

This keeps Torn synchronization and AI recommendation as separate pipelines.

## 13. Recommendation output

The result should include both:

### Immediate path

A prioritized list of actions with costs, expected gains, reasons, constraints, and goal impact.

### Longer-term plan

A multi-week plan (for example, a 30-day plan) with projected progress, estimated cost, expected gain, and estimated time where calculable.

## 14. Recommendation history

Recommendation runs should be stored with:
- profile
- three goals
- snapshot used
- calculation/optimizer results
- AI result
- timestamp

This allows later comparison and auditing.

## 15. AI infrastructure

LM Studio runs continuously on the user's Mac mini.

Production path:

Browser -> Vercel server-side AI gateway -> authenticated secure tunnel -> Mac mini -> LM Studio.

LM Studio should not be directly exposed to the public Internet.

AI provider code should be abstracted so LM Studio can later be replaced by another provider without rewriting the optimizer.

## 16. Technology

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL-compatible database
- Torn API
- LM Studio
- Vercel
- GitHub
- Secure private tunnel for Mac mini AI access
