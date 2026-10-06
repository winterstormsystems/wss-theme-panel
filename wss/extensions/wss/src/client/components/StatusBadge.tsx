import { toneBackground, type BotStatus } from '../status';

/** Coloured dot plus a text label: status never relies on colour alone. */
export default function StatusBadge({ status, className = '' }: { status: BotStatus; className?: string }) {
    return (
        <span
            className={`wss:inline-flex wss:items-center wss:gap-1.5 wss:rounded-full wss:border wss:border-border wss:bg-background wss:px-2 wss:py-0.5 wss:text-xs wss:font-medium wss:text-foreground ${className}`}
            data-status={status.key}
        >
            <span
                aria-hidden={'true'}
                className={`wss:size-2 wss:shrink-0 wss:rounded-full ${status.tone === 'neutral' ? 'wss:bg-muted-foreground' : toneBackground[status.tone]} ${
                    status.transitional ? 'wss:animate-pulse wss:motion-reduce:animate-none' : ''
                }`}
            />
            {status.label}
        </span>
    );
}
