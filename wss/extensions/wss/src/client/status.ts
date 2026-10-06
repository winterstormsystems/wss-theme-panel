import type { ServerCardState } from '@pterodactyl/sdk';

/** Semantic tone, mapped to WSS status tokens in styles.css. */
export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface BotStatus {
    /** Stable key for tests and data attributes. */
    key: string;
    label: string;
    tone: StatusTone;
    /** True for states that are moving on their own (starting, installing, ...). */
    transitional: boolean;
}

const power = {
    running: { key: 'online', label: 'Online', tone: 'success', transitional: false },
    starting: { key: 'starting', label: 'Starting', tone: 'warning', transitional: true },
    stopping: { key: 'stopping', label: 'Stopping', tone: 'warning', transitional: true },
    stopped: { key: 'offline', label: 'Offline', tone: 'danger', transitional: false },
    offline: { key: 'offline', label: 'Offline', tone: 'danger', transitional: false },
} as const satisfies Record<Extract<ServerCardState, { kind: 'ready' }>['power'], BotStatus>;

const unavailable = {
    installing: { key: 'installing', label: 'Installing', tone: 'warning', transitional: true },
    transferring: { key: 'transferring', label: 'Transferring', tone: 'warning', transitional: true },
    'restoring-backup': { key: 'restoring', label: 'Restoring backup', tone: 'warning', transitional: true },
    maintenance: { key: 'maintenance', label: 'Maintenance', tone: 'warning', transitional: false },
    suspended: { key: 'suspended', label: 'Suspended', tone: 'danger', transitional: false },
    'connection-error': { key: 'unreachable', label: 'Unreachable', tone: 'danger', transitional: false },
    unavailable: { key: 'unavailable', label: 'Unavailable', tone: 'neutral', transitional: false },
} as const satisfies Record<Extract<ServerCardState, { kind: 'unavailable' }>['reason'], BotStatus>;

const loading: BotStatus = { key: 'checking', label: 'Checking', tone: 'neutral', transitional: true };

/** Derives the customer-facing status from the panel's own card state; no states are invented. */
export function botStatus(state: ServerCardState): BotStatus {
    if (state.kind === 'ready') return power[state.power];
    if (state.kind === 'unavailable') return unavailable[state.reason];
    return loading;
}

/** Usage ratio 0..1, or null when the resource is unlimited (limit 0). */
export function usageRatio(value: number, limit: number): number | null {
    if (limit <= 0) return null;
    return Math.min(1, Math.max(0, value / limit));
}

/** Tone for a usage meter: the panel's own alarm flag (>= 90%) wins, then a 75% warning band. */
export function usageTone(ratio: number | null, alarm: boolean): StatusTone {
    if (alarm || (ratio !== null && ratio >= 0.9)) return 'danger';
    if (ratio !== null && ratio >= 0.75) return 'warning';
    return 'neutral';
}

const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

/** Binary units, matching the panel's own formatting ("256 MiB"). */
export function formatBytes(bytes: number): string {
    if (bytes < 1) return '0 B';
    const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / 1024 ** exponent;
    const rounded = value >= 100 || exponent === 0 ? String(Math.round(value)) : value.toFixed(1).replace(/\.0$/, '');
    return `${rounded} ${units[exponent]}`;
}

/** CPU values are percentages of one core (100 = one full core), as reported by Wings. */
export function formatPercent(value: number): string {
    return `${value >= 100 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, '')}%`;
}

/** Background utility per tone (dots and bars). Neutral uses the brand blue. */
export const toneBackground = {
    success: 'wss:bg-status-success',
    warning: 'wss:bg-status-warning',
    danger: 'wss:bg-status-danger',
    neutral: 'wss:bg-brand',
} as const satisfies Record<StatusTone, string>;
