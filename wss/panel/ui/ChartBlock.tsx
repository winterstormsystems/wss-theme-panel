import type { ReactNode } from 'react';
import { useServerStatus } from '@/state/server';
import { chartPhrases } from '../wording';

interface Props {
    title: string;
    legend?: ReactNode;
    children: ReactNode;
}

/**
 * WSS presentation of core's console ChartBlock (seam in components/server/console/ChartBlock.tsx):
 * a WSS card with a sentence-case title. The chart inside (core AreaChart, live WebSocket stats,
 * rolling window) is untouched. While the bot is offline core clears the series; the card says
 * so instead of showing an unexplained empty plot.
 */
export default function ChartBlock({ title, legend, children }: Props) {
    const offline = useServerStatus() === 'offline';

    return (
        <section
            className={'rounded-lg border border-border bg-card pt-3 pb-2'}
            aria-label={chartPhrases.get(title) ?? title}
        >
            <header className={'flex items-center justify-between gap-3 px-4 pb-1'}>
                <h3 className={'text-sm font-semibold text-foreground'}>{chartPhrases.get(title) ?? title}</h3>
                {offline ? (
                    <span className={'text-xs text-muted-foreground'}>No live data while offline</span>
                ) : (
                    legend && <div className={'flex items-center gap-1 text-sm'}>{legend}</div>
                )}
            </header>
            <div className={'px-2'}>{children}</div>
        </section>
    );
}
