import { Link } from '@tanstack/react-router';
import { Bot, UserRound } from 'lucide-react';
import Slot from '@/extensions/Slot';
import NavLink from '@/router/NavLink';
import { brand } from '../brand';
import { terms } from '../terminology';
import BrandMark from './BrandMark';
import { navIconClass, navLinkClass, navSectionLabelClass } from './navStyles';

interface Props {
    /** Receives the portal target for the current area's section navigation. */
    sectionRef: (element: HTMLDivElement | null) => void;
}

/**
 * Sidebar: brand, primary navigation, links contributed by extensions through the
 * `nav.items.*` slots (Billing / Support when configured), and the section navigation of the
 * current area (bot or account), which the area layout portals in so it keeps its own
 * permission context (see workspace/WorkspaceLayout.tsx).
 */
export default function Sidebar({ sectionRef }: Props) {
    return (
        <div className={'flex h-full flex-col'}>
            <Link
                to={'/'}
                className={
                    'flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 no-underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring'
                }
            >
                <BrandMark />
                <span className={'min-w-0 leading-tight'}>
                    <span className={'block truncate text-sm font-semibold text-foreground'}>{brand.company}</span>
                    <span className={'block truncate text-xs text-muted-foreground'}>{brand.product}</span>
                </span>
            </Link>
            <nav aria-label={'Main'} className={'flex-1 overflow-y-auto px-3 pb-6'}>
                <div className={navSectionLabelClass}>Navigation</div>
                <div className={'flex flex-col gap-0.5'}>
                    <NavLink to={'/'} exact className={navLinkClass}>
                        <Bot className={navIconClass} aria-hidden />
                        {terms.myBots}
                    </NavLink>
                    <NavLink to={'/account'} className={navLinkClass}>
                        <UserRound className={navIconClass} aria-hidden />
                        {terms.account}
                    </NavLink>
                    <div className={'wss-nav-slot flex flex-col gap-0.5'}>
                        <Slot name={'nav.items.before'} />
                        <Slot name={'nav.items.after'} />
                    </div>
                </div>
                <div ref={sectionRef} />
            </nav>
        </div>
    );
}
