import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CardProps {
    title?: ReactNode;
    description?: ReactNode;
    icon?: LucideIcon;
    /** Right side of the header: a status badge or a small action. */
    aside?: ReactNode;
    tone?: 'default' | 'danger';
    className?: string;
    bodyClassName?: string;
    children?: ReactNode;
    as?: 'section' | 'div';
}

/**
 * The WSS panel card: one border, header inside the card, sentence-case title. Lists rendered
 * inside (WSS DataTable) drop their own frame, so cards never show a double border.
 */
export default function Card({
    title,
    description,
    icon: Icon,
    aside,
    tone = 'default',
    className,
    bodyClassName,
    children,
    as: Tag = 'section',
}: CardProps) {
    return (
        <Tag
            className={cn(
                'relative rounded-lg border bg-card',
                tone === 'danger' ? 'border-destructive/45' : 'border-border',
                '[&_[data-wss-list]]:rounded-none [&_[data-wss-list]]:border-0 [&_[data-wss-list]]:bg-transparent',
                className
            )}
        >
            {(title || aside) && (
                <header className={'flex items-start gap-3 px-5 pt-4'}>
                    {Icon && (
                        <span
                            aria-hidden
                            className={cn(
                                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border',
                                tone === 'danger'
                                    ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                    : 'border-border bg-muted text-primary'
                            )}
                        >
                            <Icon className={'size-4'} />
                        </span>
                    )}
                    <div className={'min-w-0 flex-1'}>
                        {title && (
                            <h3
                                className={cn(
                                    'text-sm font-semibold',
                                    tone === 'danger' ? 'text-destructive' : 'text-foreground'
                                )}
                            >
                                {title}
                            </h3>
                        )}
                        {description && <p className={'mt-0.5 text-sm text-muted-foreground'}>{description}</p>}
                    </div>
                    {aside && <div className={'shrink-0'}>{aside}</div>}
                </header>
            )}
            <div className={cn('p-5', (title || aside) && 'pt-4', bodyClassName)}>{children}</div>
        </Tag>
    );
}

/** Status badge for card headers: icon + text, never colour alone. */
export function Badge({
    tone,
    icon: Icon,
    children,
}: {
    tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
    icon?: LucideIcon;
    children: ReactNode;
}) {
    const tones = {
        success: 'border-success/40 bg-success/10 text-success',
        warning: 'border-warning/40 bg-warning/10 text-warning',
        danger: 'border-destructive/40 bg-destructive/10 text-destructive',
        info: 'border-primary/40 bg-primary/10 text-primary',
        neutral: 'border-border bg-muted text-muted-foreground',
    } satisfies Record<string, string>;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                tones[tone]
            )}
        >
            {Icon && <Icon aria-hidden className={'size-3.5'} />}
            {children}
        </span>
    );
}
