import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    Archive,
    CalendarClock,
    Database,
    FolderOpen,
    KeyRound,
    LayoutDashboard,
    Network,
    ScrollText,
    Settings,
    SlidersHorizontal,
    SquareTerminal,
    UserRound,
    Users,
} from 'lucide-react';
import { terms } from '../terminology';

export interface SectionPresentation {
    label: string;
    icon: LucideIcon;
    /** Page heading shown by the workspace; omitted where the page speaks for itself. */
    title?: string;
    description?: string;
}

/**
 * Presentation of the bot area's sections, keyed by the route segment core registers
 * (router/routeTree.ts). Routes, permissions and screens still come from core's nav registry;
 * this only decides wording, icon and order. Unknown segments (new upstream pages, other
 * extensions' screens) fall back to core's own label and are listed after these.
 */
export const botSections = new Map<string, SectionPresentation>(
    Object.entries({
        overview: { label: 'Overview', icon: LayoutDashboard },
        '': { label: 'Console', icon: SquareTerminal },
        files: {
            label: 'Files',
            icon: FolderOpen,
            title: 'Files',
            description: `Browse, edit and upload your ${terms.bot.toLowerCase()}'s files.`,
        },
        startup: {
            label: terms.runtime,
            icon: SlidersHorizontal,
            title: 'Runtime Configuration',
            description: `Configure how your ${terms.bot.toLowerCase()} starts and manage its runtime variables.`,
        },
        network: {
            label: terms.network,
            icon: Network,
            title: terms.network,
            description: `Manage the network allocations available to your ${terms.bot.toLowerCase()}.`,
        },
        backups: {
            label: 'Backups',
            icon: Archive,
            title: 'Backups',
            description: `Create and manage recovery points for your ${terms.bot.toLowerCase()}.`,
        },
        schedules: {
            label: 'Schedules',
            icon: CalendarClock,
            title: 'Schedules',
            description: `Automate tasks and commands for your ${terms.bot.toLowerCase()}.`,
        },
        databases: {
            label: 'Databases',
            icon: Database,
            title: 'Databases',
            description: `Manage databases connected to your ${terms.bot.toLowerCase()}.`,
        },
        users: {
            label: terms.teamAccess,
            icon: Users,
            title: terms.teamAccess,
            description: `Control who can access this ${terms.bot.toLowerCase()} and what they are allowed to manage.`,
        },
        settings: {
            label: 'Settings',
            icon: Settings,
            title: 'Settings',
            description: `${terms.bot} details, SFTP access and reinstallation.`,
        },
        activity: {
            label: 'Activity',
            icon: ScrollText,
            title: 'Activity',
            description: `Review recent actions and events for your ${terms.bot.toLowerCase()}.`,
        },
    })
);

export const botSectionOrder = [...botSections.keys()];

export const accountSections = new Map<string, SectionPresentation>(
    Object.entries({
        '': {
            label: 'Profile & security',
            icon: UserRound,
            title: terms.account,
            description: 'Manage your profile, sign-in details and account security.',
        },
        api: {
            label: 'API credentials',
            icon: KeyRound,
            title: 'API credentials',
            description: 'Keys for the client API, used by your own scripts and tools.',
        },
        ssh: {
            label: 'SSH keys',
            icon: KeyRound,
            title: 'SSH keys',
            description: 'Public keys that can sign in to SFTP without a password.',
        },
        activity: {
            label: 'Activity',
            icon: Activity,
            title: 'Account activity',
            description: 'Sign-ins and changes made to your account.',
        },
    })
);

export const accountSectionOrder = [...accountSections.keys()];
