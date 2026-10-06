import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { rewordNode } from '../wording';

interface Props {
    summary?: ReactNode;
    children?: ReactNode;
    className?: string;
}

/**
 * WSS presentation of core's ListToolbar (seam in components/elements/ListToolbar.tsx): the
 * usage summary core computes (for example "1 of 3 allowed allocations") and the page's
 * primary actions, in the WSS rhythm. The summary passes through the presentation wording.
 */
export default function ListToolbar({ summary, children, className }: Props) {
    return (
        <div className={cn('mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
            {summary && (
                <p className={'flex items-start gap-2 text-sm text-muted-foreground'}>
                    <Info aria-hidden className={'mt-0.5 size-4 shrink-0'} />
                    <span>{rewordNode(summary)}</span>
                </p>
            )}
            {children && (
                <div
                    className={
                        'flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center [&>*]:w-full sm:[&>*]:w-auto'
                    }
                >
                    {children}
                </div>
            )}
        </div>
    );
}
