import { useLayoutEffect } from 'react';

const ZOOMABLE_VIEWPORT = 'width=device-width, initial-scale=1';

/**
 * Marks <html data-wss-ui> while a WSS layout is mounted so the theme's WSS UI rules apply,
 * including inside dialogs portalled to <body>. Removed on unmount, so the admin area never
 * receives WSS rules.
 *
 * Also lets customers zoom: core's page template sets `maximum-scale=1, user-scalable=no`
 * (WCAG 1.4.4). The original viewport is restored when the WSS layout unmounts.
 */
export function useWssUiRoot(): void {
    useLayoutEffect(() => {
        const root = document.documentElement;
        const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
        const original = viewport?.content;
        root.dataset.wssUi = '';
        if (viewport) viewport.content = ZOOMABLE_VIEWPORT;
        return () => {
            delete root.dataset.wssUi;
            if (viewport && original !== undefined) viewport.content = original;
        };
    }, []);
}
