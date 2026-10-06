import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from '@tanstack/react-router';
import { useCurrentServer } from '@/api/server/queries';
import { useWssShell } from '../context';
import { AccountNav, BotNav, sidebarSectionClass } from './AreaNav';
import BotHeader from './BotHeader';
import { botSections } from './sections';

// Same horizontal rhythm as core's ContentContainer, so headers align with page content.
const containerClass = 'mx-4 max-w-panel xl:mx-auto';

function SidebarSection({ children }: { children: ReactNode }) {
    const shell = useWssShell();
    if (!shell?.sectionTarget) return null;
    return createPortal(<div className={sidebarSectionClass}>{children}</div>, shell.sectionTarget);
}

function BotWorkspace({ children }: { children: ReactNode }) {
    const server = useCurrentServer();
    const { pathname } = useLocation();
    if (!server) return <>{children}</>;

    const base = `/server/${server.attributes.identifier}`;
    const segment = pathname.startsWith(base) ? (pathname.slice(base.length).split('/')[1] ?? '') : '';
    const section = botSections.get(segment);

    return (
        <>
            <SidebarSection>
                <BotNav server={server} variant={'sidebar'} />
            </SidebarSection>
            <div className={'border-b border-border bg-card/40'}>
                <div className={`${containerClass} py-5`}>
                    <BotHeader server={server} onConsole={segment === ''} />
                </div>
                <div className={`${containerClass} lg:hidden`}>
                    <BotNav server={server} variant={'tabs'} />
                </div>
            </div>
            {section?.title && (
                <div className={`${containerClass} pt-6`}>
                    <h2 className={'text-lg font-semibold text-foreground'}>{section.title}</h2>
                    {section.description && (
                        <p className={'mt-0.5 text-sm text-muted-foreground'}>{section.description}</p>
                    )}
                </div>
            )}
            {children}
        </>
    );
}

function AccountWorkspace({ children }: { children: ReactNode }) {
    return (
        <>
            <SidebarSection>
                <AccountNav variant={'sidebar'} />
            </SidebarSection>
            <div className={`${containerClass} pt-4 lg:hidden`}>
                <AccountNav variant={'tabs'} />
            </div>
            {children}
        </>
    );
}

/**
 * Replaces core's SubNavigationLayout inside the WSS shell (seam in
 * components/elements/SubNavigationLayout.tsx). Core's own tab bar is not rendered; the
 * section navigation goes to the shell sidebar on desktop and a tab strip on smaller screens.
 */
export default function WorkspaceLayout({ children }: { children?: ReactNode }) {
    const { pathname } = useLocation();
    return pathname.startsWith('/server/') ? (
        <BotWorkspace>{children}</BotWorkspace>
    ) : (
        <AccountWorkspace>{children}</AccountWorkspace>
    );
}
