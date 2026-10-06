import { useState } from 'react';
import { cn } from '@/lib/cn';
import { brand } from '../brand';

interface Props {
    size?: 'sm' | 'lg';
    className?: string;
}

/** WSS logo mark; falls back to the "WSS" monogram if the theme asset is missing. */
export default function BrandMark({ size = 'sm', className }: Props) {
    const [failed, setFailed] = useState(false);
    const height = size === 'sm' ? 'h-7' : 'h-24';

    if (failed) {
        return (
            <span
                aria-hidden
                className={cn(
                    'inline-flex items-center justify-center rounded-md bg-primary font-bold text-primary-foreground',
                    size === 'sm' ? 'h-7 px-1.5 text-xs' : 'h-16 px-4 text-2xl',
                    className
                )}
            >
                {brand.monogram}
            </span>
        );
    }

    return (
        <img
            src={size === 'sm' ? brand.mark.medium : brand.mark.large}
            alt={''}
            aria-hidden
            className={cn(height, 'w-auto shrink-0 select-none', className)}
            onError={() => setFailed(true)}
        />
    );
}
