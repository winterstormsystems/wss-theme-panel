import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import { cn } from '@/lib/cn';
import { brand } from '../brand';
import { WssShellContext } from '../context';
import { primitives } from '../ui/primitives';
import { useWssUiRoot } from '../ui/useWssUiRoot';
import { reword, rewordNode } from '../wording';

const wording = { text: reword, node: (value: ReactNode) => rewordNode(value) };
import BrandMark from './BrandMark';
import Footer from './Footer';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

const DESKTOP_QUERY = '(min-width: 64rem)';

function useIsDesktop(): boolean {
    const [matches, setMatches] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
    useEffect(() => {
        const media = window.matchMedia(DESKTOP_QUERY);
        const update = () => setMatches(media.matches);
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);
    return matches;
}

const iconButtonClass =
    'inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring';

/**
 * The WSS customer application shell: sidebar (drawer below `lg`), top bar, content, footer.
 * Rendered by the AuthenticatedLayout seam for every customer route; admin keeps core's layout.
 */
export default function AppShell({ children }: { children: ReactNode }) {
    const desktop = useIsDesktop();
    const [open, setOpen] = useState(false);
    const [sectionTarget, setSectionTarget] = useState<HTMLElement | null>(null);
    const menuButton = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);
    const { pathname } = useLocation();

    const closeNavigation = useCallback(() => setOpen(false), []);
    const context = useMemo(
        () => ({ sectionTarget, closeNavigation, primitives, wording }),
        [sectionTarget, closeNavigation]
    );
    useWssUiRoot();

    // Close the drawer on navigation and when switching to the desktop layout.
    useEffect(() => setOpen(false), [pathname, desktop]);

    useEffect(() => {
        if (!open) return;
        sidebar.current?.querySelector<HTMLElement>('a, button')?.focus();
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                menuButton.current?.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const drawerHidden = !desktop && !open;

    return (
        <WssShellContext.Provider value={context}>
            <a
                href={'#wss-main'}
                className={
                    'sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground'
                }
            >
                Skip to content
            </a>
            <div
                className={
                    'min-h-dvh bg-background lg:grid lg:grid-cols-[var(--wss-shell-sidebar-width,15rem)_minmax(0,1fr)]'
                }
            >
                <aside
                    id={'wss-sidebar'}
                    ref={sidebar}
                    aria-label={'Sidebar'}
                    inert={drawerHidden}
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-background transition-transform duration-200 motion-reduce:transition-none',
                        'lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-auto lg:max-w-none lg:translate-x-0',
                        open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                    )}
                >
                    <Sidebar sectionRef={setSectionTarget} />
                </aside>
                {open && (
                    <button
                        type={'button'}
                        aria-label={'Close navigation'}
                        className={'fixed inset-0 z-40 bg-background/80 lg:hidden'}
                        onClick={() => setOpen(false)}
                    />
                )}
                <div className={'flex min-h-dvh min-w-0 flex-col'}>
                    <header
                        className={
                            'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm sm:px-4'
                        }
                    >
                        <button
                            ref={menuButton}
                            type={'button'}
                            className={cn(iconButtonClass, 'lg:hidden')}
                            aria-controls={'wss-sidebar'}
                            aria-expanded={open}
                            aria-label={open ? 'Close navigation' : 'Open navigation'}
                            onClick={() => setOpen((value) => !value)}
                        >
                            {open ? <X className={'size-5'} /> : <Menu className={'size-5'} />}
                        </button>
                        <div className={'flex min-w-0 items-center gap-2 lg:hidden'}>
                            <BrandMark />
                            <span className={'truncate text-sm font-semibold text-foreground'}>{brand.company}</span>
                        </div>
                        <div className={'ml-auto flex items-center gap-1'}>
                            <SearchContainer className={iconButtonClass} />
                            <UserMenu />
                        </div>
                    </header>
                    <main id={'wss-main'} tabIndex={-1} className={'flex-1 outline-none sm:px-2 xl:px-8'}>
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
        </WssShellContext.Provider>
    );
}
