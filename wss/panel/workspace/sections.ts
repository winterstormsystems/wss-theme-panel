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
            description: `Ports and addresses assigned to your ${terms.bot.toLowerCase()}.`,
        },
        backups: {
            label: 'Backups',
            icon: Archive,
            title: 'Backups',
            description: `Create, download and restore backups of your ${terms.bot.toLowerCase()}'s files.`,
        },
        schedules: {
            label: 'Schedules',
            icon: CalendarClock,
            title: 'Schedules',
            description: 'Automate restarts, commands and backups.',
        },
        databases: {
            label: 'Databases',
            icon: Database,
            title: 'Databases',
            description: `Databases available to your ${terms.bot.toLowerCase()}.`,
        },
        users: {
            label: 'Users',
            icon: Users,
            title: 'Users',
            description: `Invite people to help manage this ${terms.bot.toLowerCase()}.`,
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
            description: `Recent actions taken on this ${terms.bot.toLowerCase()}.`,
        },
    })
);

export const botSectionOrder = [...botSections.keys()];

export const accountSections = new Map<string, SectionPresentation>(
    Object.entries({
        '': { label: 'Profile & security', icon: UserRound },
        api: { label: 'API credentials', icon: KeyRound },
        ssh: { label: 'SSH keys', icon: KeyRound },
        activity: { label: 'Activity', icon: Activity },
    })
);

export const accountSectionOrder = [...accountSections.keys()];
