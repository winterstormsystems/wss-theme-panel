import { brand } from '../brand';

/**
 * Customer footer. Pterodactyl is MIT licensed: the licence asks for the copyright notice in
 * copies of the software (LICENSE.md is kept), not for UI attribution. A subtle "Powered by"
 * line is kept anyway as honest, nominative attribution. See wss/docs/CORE_PATCHES.md.
 */
export default function Footer() {
    return (
        <footer className={'border-t border-border px-4 py-4 text-xs text-muted-foreground sm:px-6'}>
            <div className={'mx-auto flex max-w-panel flex-wrap items-center justify-between gap-2'}>
                <p>
                    &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> {brand.company}
                </p>
                <p>
                    Powered by{' '}
                    <a
                        href={'https://pterodactyl.io'}
                        target={'_blank'}
                        rel={'noopener nofollow noreferrer'}
                        className={'text-muted-foreground underline-offset-2 hover:text-foreground hover:underline'}
                    >
                        Pterodactyl
                    </a>
                </p>
            </div>
        </footer>
    );
}
