import { Outlet } from '@tanstack/react-router';
import BrandMark from '../shell/BrandMark';
import { brand } from '../brand';
import { useWssUiRoot } from '../ui/useWssUiRoot';

/**
 * Authentication layout (replaces core's AuthLayout via a one-line seam): brand panel on the
 * WSS gradient from `lg` up, the form on the dark surface. Login, password reset and 2FA
 * routes render into the Outlet unchanged, with their own logic and route slots.
 */
export default function AuthLayout() {
    const year = new Date().getFullYear();
    useWssUiRoot();

    return (
        <div className={'min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'}>
            <aside
                className={
                    'relative hidden overflow-hidden bg-[image:var(--wss-gradient-brand-diagonal)] p-12 text-[var(--wss-text-on-brand)] lg:flex lg:flex-col lg:justify-between'
                }
            >
                <div className={'flex items-center gap-3'}>
                    <BrandMark />
                    <span className={'text-sm font-semibold tracking-wide'}>{brand.company}</span>
                </div>
                <div className={'max-w-sm'}>
                    <BrandMark size={'lg'} className={'mb-8 drop-shadow-lg'} />
                    <p className={'text-xs font-semibold [text-transform:uppercase] tracking-[0.2em] opacity-80'}>
                        {brand.company}
                    </p>
                    <h2 className={'mt-2 text-3xl font-semibold leading-tight'}>{brand.productLong}</h2>
                    <p className={'mt-4 text-sm leading-relaxed opacity-90'}>
                        Run, monitor and manage your bots from one place: live console, files, runtime settings and
                        backups.
                    </p>
                </div>
                <p className={'text-xs opacity-80'}>
                    &copy; <span suppressHydrationWarning>{year}</span> {brand.company}
                </p>
            </aside>
            <main className={'flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:px-8'}>
                <div className={'mb-8 flex flex-col items-center gap-3 text-center lg:hidden'}>
                    <BrandMark size={'lg'} className={'h-16'} />
                    <div>
                        <p className={'text-sm font-semibold text-foreground'}>{brand.company}</p>
                        <p className={'text-xs text-muted-foreground'}>{brand.productLong}</p>
                    </div>
                </div>
                <div className={'w-full max-w-md'}>
                    <Outlet />
                </div>
                <p className={'mt-10 text-xs text-muted-foreground'}>
                    <span className={'lg:hidden'}>
                        &copy; <span suppressHydrationWarning>{year}</span> {brand.company} ·{' '}
                    </span>
                    Powered by{' '}
                    <a
                        href={'https://pterodactyl.io'}
                        target={'_blank'}
                        rel={'noopener nofollow noreferrer'}
                        className={'text-muted-foreground hover:text-foreground'}
                    >
                        Pterodactyl
                    </a>
                </p>
            </main>
        </div>
    );
}
