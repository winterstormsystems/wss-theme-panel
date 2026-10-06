import { cn } from '@/lib/cn';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

interface Status {
    label: string;
    tone: Tone;
    pulse?: boolean;
}

const dot = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
    neutral: 'bg-muted-foreground',
} as const satisfies Record<Tone, string>;

/**
 * Status from the panel's live state: `power` is the WebSocket power state (core server
 * store), `serverStatus` the server's lifecycle status from the API (installing, suspended…).
 * Lifecycle states win because power actions are unavailable while they last.
 */
export function resolveBotStatus(power: string | null, serverStatus: string | null, transferring: boolean): Status {
    if (serverStatus === 'suspended') return { label: 'Suspended', tone: 'danger' };
    if (serverStatus === 'installing') return { label: 'Installing', tone: 'warning', pulse: true };
    if (serverStatus === 'install_failed') return { label: 'Install failed', tone: 'danger' };
    if (serverStatus === 'restoring_backup') return { label: 'Restoring backup', tone: 'warning', pulse: true };
    if (transferring) return { label: 'Transferring', tone: 'warning', pulse: true };
    switch (power) {
        case 'running':
            return { label: 'Online', tone: 'success' };
        case 'starting':
            return { label: 'Starting', tone: 'warning', pulse: true };
        case 'stopping':
            return { label: 'Stopping', tone: 'warning', pulse: true };
        case 'offline':
            return { label: 'Offline', tone: 'danger' };
        default:
            return { label: 'Connecting', tone: 'neutral', pulse: true };
    }
}

/** Dot plus label (never colour alone); announced politely when it changes. */
export default function BotStatusPill({ status, className }: { status: Status; className?: string }) {
    return (
        <span
            role={'status'}
            aria-live={'polite'}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground',
                className
            )}
        >
            <span
                aria-hidden
                className={cn(
                    'size-2 rounded-full',
                    dot[status.tone],
                    status.pulse && 'animate-pulse motion-reduce:animate-none'
                )}
            />
            {status.label}
        </span>
    );
}
