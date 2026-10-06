import type { ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, Lock, RefreshCw, SearchX, type LucideIcon } from 'lucide-react';
import Button from '@/components/elements/Button';
import { cn } from '@/lib/cn';
import { reword, rewordTitle } from '../wording';

export type StateTone = 'error' | 'denied' | 'missing' | 'neutral';

const toneIcons = {
    error: AlertTriangle,
    denied: Lock,
    missing: SearchX,
    neutral: AlertTriangle,
} satisfies Record<StateTone, LucideIcon>;

const toneClasses = {
    error: 'border-destructive/40 bg-destructive/10 text-destructive',
    denied: 'border-warning/40 bg-warning/10 text-warning',
    missing: 'border-border bg-muted text-muted-foreground',
    neutral: 'border-border bg-muted text-muted-foreground',
} satisfies Record<StateTone, string>;

interface StatePanelProps {
    tone: StateTone;
    title: ReactNode;
    message?: ReactNode;
    icon?: LucideIcon;
    actions?: ReactNode;
    className?: string;
}

/** WSS card for error, denied, not-found and offline states. The message is never hidden. */
export function StatePanel({ tone, title, message, icon, actions, className }: StatePanelProps) {
    const Icon = icon ?? toneIcons[tone];
    return (
        <div
            role={tone === 'error' ? 'alert' : undefined}
            className={cn(
                'flex flex-col items-center rounded-lg border border-border bg-card px-6 py-10 text-center',
                className
            )}
        >
            <span className={cn('flex size-11 items-center justify-center rounded-lg border', toneClasses[tone])}>
                <Icon aria-hidden className={'size-5'} />
            </span>
            <h2 className={'mt-4 text-base font-semibold text-foreground'}>{title}</h2>
            {message && <p className={'mt-1 max-w-md text-sm break-words text-muted-foreground'}>{message}</p>}
            {actions && <div className={'mt-5 flex flex-wrap justify-center gap-2'}>{actions}</div>}
        </div>
    );
}

interface ScreenBlockProps {
    title: string;
    image: string;
    message: string;
    onRetry?: () => void;
    onBack?: () => void;
}

function toneFor(title: string): StateTone {
    if (title === '404') return 'missing';
    if (title === 'Access Denied') return 'denied';
    return 'error';
}

/**
 * WSS presentation of core's ScreenBlock (ServerError, AccessDenied, NotFound and conflict
 * states such as suspended or installing). Seam in components/elements/ScreenBlock.tsx. Core's
 * message (including the API error text) is shown in full; only wording around "server" changes.
 */
export default function StateBlock({ title, message, onRetry, onBack }: ScreenBlockProps) {
    return (
        <div className={'mx-4 my-6 max-w-panel xl:mx-auto'}>
            <StatePanel
                tone={toneFor(title)}
                title={rewordTitle(title)}
                message={reword(message)}
                actions={
                    onRetry ? (
                        <Button.Text onClick={onRetry} className={'inline-flex items-center gap-2'}>
                            <RefreshCw aria-hidden className={'size-4'} /> Try again
                        </Button.Text>
                    ) : onBack ? (
                        <Button.Text onClick={onBack} className={'inline-flex items-center gap-2'}>
                            <ArrowLeft aria-hidden className={'size-4'} /> Go back
                        </Button.Text>
                    ) : undefined
                }
            />
        </div>
    );
}
