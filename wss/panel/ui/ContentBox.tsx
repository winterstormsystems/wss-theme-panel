import type { HTMLAttributes } from 'react';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { cn } from '@/lib/cn';
import Card from './Card';

type Props = HTMLAttributes<HTMLDivElement> & {
    title?: string;
    borderColor?: string;
    showLoadingOverlay?: boolean;
};

/**
 * WSS presentation of core's ContentBox (seam in components/elements/ContentBox.tsx): the title
 * moves inside a single bordered card instead of floating above a shadowed box. Layout classes
 * the page passes (widths, margins) are kept on the outer element.
 */
export default function ContentBox({
    title,
    borderColor: _borderColor,
    showLoadingOverlay,
    children,
    className,
    ...props
}: Props) {
    return (
        <div className={cn('min-w-0', className)} {...props}>
            <Card title={title} as={'div'} className={'h-full'}>
                <SpinnerOverlay visible={showLoadingOverlay || false} />
                {children}
            </Card>
        </div>
    );
}
