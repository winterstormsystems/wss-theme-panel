import type React from 'react';
import type { LucideIcon } from 'lucide-react';
import Icon from '@/components/elements/Icon';
import { cn } from '@/lib/cn';
import { cardTitleClass } from '@/components/ui/typography';
import { isString } from '@/lib/objects';
import { useInWssShell } from '@/wss';

interface Props {
    icon?: LucideIcon;
    title: string | React.ReactNode;
    className?: string;
    contentClassName?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className, contentClassName }: Props) => {
    // WSS core patch: inside the WSS shell, render as a WSS panel (bordered card, sentence-case title).
    const wss = useInWssShell();

    return (
        <div
            className={cn(wss ? 'rounded-lg border border-border bg-card' : 'rounded-sm shadow-md bg-card', className)}
        >
            <div className={wss ? 'px-5 pt-4' : 'bg-muted rounded-t-sm p-3 border-b border-border'}>
                {isString(title) ? (
                    <h2 className={wss ? 'font-header text-sm font-semibold text-foreground' : cardTitleClass}>
                        {icon && <Icon icon={icon} className={'mr-2 text-muted-foreground'} />}
                        {title}
                    </h2>
                ) : (
                    title
                )}
            </div>
            <div className={cn(wss ? 'p-5 pt-3' : 'p-3', contentClassName)}>{children}</div>
        </div>
    );
};

export default TitledGreyBox;
