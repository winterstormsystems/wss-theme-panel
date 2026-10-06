import { Circle } from 'lucide-react';
import type { ReactNode } from 'react';
import Can from '@/components/elements/Can';
import NamedIcon from '@/components/elements/NamedIcon';
import { ScreenBadge, ScreenGate } from '@/extensions/screenNavigation';
import Slot from '@/extensions/Slot';
import { cn } from '@/lib/cn';
import { getAreaNav, type AreaNavEntry } from '@/router/nav';
import NavLink from '@/router/NavLink';
import type { Server } from '@/api/server/types';
import { navIconClass, navLinkClass, navSectionLabelClass } from '../shell/navStyles';
import {
    accountSectionOrder,
    accountSections,
    botSectionOrder,
    botSections,
    type SectionPresentation,
} from './sections';

type Variant = 'sidebar' | 'tabs';

const tabClass = [
    'inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium no-underline',
    'text-muted-foreground transition-colors hover:text-foreground',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
    'data-[status=active]:border-primary data-[status=active]:text-foreground',
].join(' ');

function ordered(entries: AreaNavEntry[], order: string[]): AreaNavEntry[] {
    const rank = (segment: string) => {
        const index = order.indexOf(segment);
        return index === -1 ? order.length : index;
    };
    return [...entries].sort((a, b) => rank(a.segment) - rank(b.segment));
}

function Entry({
    entry,
    to,
    presentation,
    variant,
}: {
    entry: AreaNavEntry;
    to: string;
    presentation?: SectionPresentation;
    variant: Variant;
}) {
    const { segment, label, exact = false, permission, screen, icon, badge } = entry;
    const IconComponent = presentation?.icon;
    const link = (
        <NavLink
            to={to}
            exact={exact}
            hash={segment === 'files' ? '/' : ''}
            className={variant === 'sidebar' ? navLinkClass : tabClass}
        >
            {IconComponent ? (
                <IconComponent className={navIconClass} aria-hidden />
            ) : icon ? (
                <NamedIcon name={icon} className={navIconClass} aria-hidden />
            ) : (
                <Circle className={navIconClass} aria-hidden />
            )}
            <span className={'truncate'}>{presentation?.label ?? label}</span>
            {(screen || badge) && <ScreenBadge screen={screen} badge={badge} />}
        </NavLink>
    );

    const gated = permission ? (
        <Can action={permission} matchAny>
            {link}
        </Can>
    ) : (
        link
    );

    return <ScreenGate screen={screen}>{gated}</ScreenGate>;
}

function Frame({ variant, label, children }: { variant: Variant; label: string; children: ReactNode }) {
    if (variant === 'tabs') {
        return (
            <nav
                aria-label={label}
                className={
                    'flex overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                }
            >
                {children}
            </nav>
        );
    }
    return (
        <nav aria-label={label}>
            <div className={navSectionLabelClass}>{label}</div>
            <div className={'flex flex-col gap-0.5'}>{children}</div>
        </nav>
    );
}

/** Bot section navigation from core's nav registry (routes, permissions, extension screens). */
export function BotNav({ server, variant }: { server: Server; variant: Variant }) {
    const id = server.attributes.identifier;
    return (
        <Frame variant={variant} label={variant === 'sidebar' ? server.attributes.name : 'Bot sections'}>
            {variant === 'sidebar' && <Slot name={'server.navigation.before'} data={server} />}
            {ordered(getAreaNav('server'), botSectionOrder).map((entry) => (
                <Entry
                    key={entry.segment || '/'}
                    entry={entry}
                    to={`/server/${id}${entry.segment ? `/${entry.segment}` : ''}`}
                    presentation={botSections.get(entry.segment)}
                    variant={variant}
                />
            ))}
            {variant === 'sidebar' && <Slot name={'server.navigation.after'} data={server} />}
        </Frame>
    );
}

/** Account section navigation from core's nav registry. */
export function AccountNav({ variant }: { variant: Variant }) {
    return (
        <Frame variant={variant} label={'Account'}>
            {variant === 'sidebar' && <Slot name={'account.navigation.before'} />}
            {ordered(getAreaNav('account'), accountSectionOrder).map((entry) => (
                <Entry
                    key={entry.segment || '/'}
                    entry={entry}
                    to={`/account${entry.segment ? `/${entry.segment}` : ''}`}
                    presentation={accountSections.get(entry.segment)}
                    variant={variant}
                />
            ))}
            {variant === 'sidebar' && <Slot name={'account.navigation.after'} />}
        </Frame>
    );
}

export const sidebarSectionClass = cn('mt-2 border-t border-border pt-1');
