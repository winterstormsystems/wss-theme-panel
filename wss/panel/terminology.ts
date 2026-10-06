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
    // Customer label for core's subusers page (route, API and types stay "users").
    teamAccess: 'Team Access',
} as const;

export type Term = keyof typeof terms;

/**
 * Customer titles for core's permission groups (keys from app/Models/Permission.php). The keys
 * and every permission value stay exactly as core defines them; this is wording only.
 */
const permissionGroups = new Map<string, string>([
    ['control', 'Console & power'],
    ['user', 'Team access'],
    ['file', 'Files'],
    ['backup', 'Backups'],
    ['allocation', 'Network'],
    ['startup', 'Runtime'],
    ['database', 'Databases'],
    ['schedule', 'Schedules'],
    ['settings', 'Settings'],
    ['activity', 'Activity'],
]);

const sentence = (key: string): string => {
    const words = key.replace(/[-_.]+/g, ' ').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
};

/** `permissionGroupTitle('allocation')` -> "Network"; unknown groups are shown in sentence case. */
export function permissionGroupTitle(key: string): string {
    return permissionGroups.get(key) ?? sentence(key);
}

/** `permissionLabel('read-content')` -> "Read content" (the permission value is unchanged). */
export function permissionLabel(key: string): string {
    return sentence(key);
}

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
        reinstallUnavailable:
            'This bot is set up to skip its installation script, so reinstalling is unavailable until an administrator re-enables it.',
        sftpAddress: 'SFTP Address',
        botId: 'Bot ID',
    },
    runtime: {
        // "Startup Command" -> "Launch Command": the command Wings runs to launch the bot. "Start"
        // is already the power action, so "Launch" avoids two meanings for one word.
        launchCommand: 'Launch Command',
        // "Docker Image" -> "Runtime Image": still an image, named for what it provides.
        runtimeImage: 'Runtime Image',
        imageHelp: 'The runtime image your bot runs in. Change it only if your bot needs a different runtime version.',
        imageLocked: "This bot's runtime image was set by an administrator and cannot be changed here.",
        variablesTitle: 'Environment Variables',
        noVariablesTitle: 'No variables',
        noVariables: "This bot doesn't have any runtime variables to configure.",
    },
    team: {
        invite: 'Invite member',
        inviteTitle: 'Invite a team member',
        editTitle: (email: string, editable: boolean) => `${editable ? 'Edit' : 'View'} access for ${email}`,
        emailLabel: 'Email address',
        emailHelp: `They will get access to this bot with the permissions you choose below.`,
        save: 'Save changes',
        sendInvite: 'Send invite',
        restrictedNote: 'You can only grant permissions that your own account has on this bot.',
    },
    graphs: {
        cpu: 'CPU Usage',
        memory: 'Memory Usage',
        network: 'Network Traffic',
    },
    auth: {
        signIn: 'Sign in',
        // Maps the titles core passes to the auth card onto WSS wording; unknown titles pass through.
        titles: new Map<string, { title: string; subtitle?: string }>([
            ['Login to Continue', { title: 'Welcome back', subtitle: 'Sign in to manage your bots.' }],
        ]),
    },
} as const;
