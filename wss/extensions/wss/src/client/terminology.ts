/**
 * Customer-facing vocabulary for WSS-owned UI. Change a word here, not in components.
 *
 * Pterodactyl's own screens keep their wording ("Server", "Egg", ...) because core strings
 * are hardcoded and the SDK cannot replace them; see wss/docs/GAPS.md.
 */
export const terms = {
    bot: 'Bot',
    bots: 'Bots',
    runtime: 'Runtime',
    network: 'Network',
    manage: 'Manage',
    dashboard: 'Dashboard',
    account: 'Account',
} as const;

export type Term = keyof typeof terms;

/** `count(2, 'bot', 'bots')` -> "2 bots" (lower-cased for use mid-sentence). */
export function count(value: number, singular: Term, plural: Term): string {
    return `${value} ${(value === 1 ? terms[singular] : terms[plural]).toLowerCase()}`;
}

/** Lower-case form for use mid-sentence: `lower('bots')` -> "bots". */
export function lower(term: Term): string {
    return terms[term].toLowerCase();
}
