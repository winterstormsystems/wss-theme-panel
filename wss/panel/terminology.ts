/**
 * Customer-facing vocabulary for the WSS Bot Hosting Panel: the single source of truth.
 *
 * Presentation only. Backend classes, API objects, routes and Wings concepts keep the
 * Pterodactyl names ("server", "egg", "startup"). Used by WSS panel code, by the small core
 * seams listed in wss/core-patches.json, and by the WSS extension (which imports this file).
 */
export const terms = {
    bot: 'Bot',
    bots: 'Bots',
    myBots: 'My Bots',
    runtime: 'Runtime',
    network: 'Network',
    manage: 'Manage',
    manageBot: 'Manage bot',
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

/** Strings used by core seams, kept here so wording changes never touch upstream files. */
export const copy = {
    dashboard: {
        title: terms.myBots,
        description: 'Manage your hosted applications and view their current status.',
        documentTitle: terms.myBots,
        adminShowingOthers: "Showing other users' bots",
        adminShowingOwn: 'Showing your bots',
        emptyTitle: 'No bots yet',
        emptyDescription: 'Bots on your account, or bots you have been invited to, will appear here.',
        emptyAdminTitle: 'No other bots',
        emptyAdminDescription: 'There are no bots owned by other users.',
        newBot: 'New bot',
    },
    search: {
        title: 'Search bots',
        hint: 'Enter a bot name, ID or address to begin searching.',
        empty: 'No bots found',
    },
    settings: {
        detailsTitle: 'Bot Details',
        name: 'Bot Name',
        description: 'Bot Description',
        reinstallTitle: 'Reinstall Bot',
        reinstallConfirmTitle: 'Confirm bot reinstallation',
        reinstallConfirm: 'Yes, reinstall bot',
        reinstallBody: 'Reinstalling stops your bot and re-runs the installation script that set it up.',
        reinstallWarning: 'Some files may be deleted or modified. Back up your data before continuing.',
        reinstallDialog:
            'Your bot will be stopped and some files may be deleted or modified. Are you sure you want to continue?',
        sftpAddress: 'SFTP Address',
        botId: 'Bot ID',
    },
    auth: {
        // Maps the titles core passes to the auth card onto WSS wording; unknown titles pass through.
        titles: new Map<string, { title: string; subtitle?: string }>([
            ['Login to Continue', { title: 'Welcome back', subtitle: 'Sign in to manage your bots.' }],
        ]),
    },
} as const;
