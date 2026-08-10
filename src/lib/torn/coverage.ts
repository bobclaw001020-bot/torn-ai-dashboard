/**
 * Torn API v2 coverage registry.
 *
 * The API is evolving, so this list is intentionally data-driven. Selections
 * that are not useful for a personal dashboard can be excluded without
 * changing the sync engine. We keep endpoint families separate so access
 * errors on one family do not invalidate the whole sync.
 *
 * Source: Torn API documentation / Swagger. See docs/TORN_API.md.
 */
export const TORN_COVERAGE = {
  user: [
    "basic", "profile", "bars", "cooldowns", "money", "networth", "personalstats",
    "workstats", "skills", "education", "honors", "medals", "icons", "inventory",
    "equipment", "itemmods", "properties", "stocks", "bank", "jobpoints", "company",
    "faction", "crimes", "criminaloffenses", "attacks", "attacksfull", "revives",
    "revivesfull", "reports", "races", "racecar", "racingskills", "missions",
    "competition", "casino", "bounties", "travel", "lastaction", "events", "newevents",
    "messages", "newmessages", "logcategories", "logtypes", "notifications", "hof",
  ],
  faction: [
    "basic", "members", "crimes", "territoryownership", "territorywars", "wars", "raids",
    "attacks", "revives", "reports", "upgrades", "tree", "hof", "news", "applications",
    "positions", "contributors", "chains", "chainreport", "rankedwarreport", "search",
  ],
  company: [
    "profile", "employees", "stock", "applications", "news", "companies",
  ],
  market: [
    "itemmarket", "properties", "rentals", "auctionhouse", "auctionhouselisting",
  ],
  torn: [
    "items", "itemdetails", "itemmods", "itemstats", "properties", "companies", "gyms",
    "education", "honors", "medals", "stocks", "cityshops", "pawnshop", "pokertables",
    "factiontree", "factionhof", "bounties", "territory", "competition", "raids", "hof",
    "racing", "organizedcrimes", "subcrimes", "searchforcash", "shoplifting", "logcategories",
    "logtypes",
  ],
} as const;

export type TornSection = keyof typeof TORN_COVERAGE;

export const DASHBOARD_USER_SELECTIONS = [
  "basic", "profile", "bars", "cooldowns", "money", "networth", "personalstats",
  "workstats", "skills", "education", "inventory", "equipment", "itemmods", "properties",
  "stocks", "bank", "jobpoints", "company", "faction", "crimes", "attacks", "revives",
  "races", "casino", "bounties", "travel", "lastaction", "hof",
] as const;
