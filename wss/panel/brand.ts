/**
 * Brand assets and names. Logo files are theme assets (themes/wss/assets/brand, published to
 * /assets/theme/brand by `p:theme:apply wss`); replace them there without touching code.
 * Source artwork: wss/brand/wss-logo-source.webp (provided by Winter Storm Systems).
 */
export const brand = {
    company: 'Winter Storm Systems',
    product: 'Bot Hosting',
    productLong: 'Bot Hosting Panel',
    monogram: 'WSS',
    mark: {
        small: '/assets/theme/brand/wss-mark-40.png',
        medium: '/assets/theme/brand/wss-mark-80.webp',
        large: '/assets/theme/brand/wss-mark-240.webp',
    },
} as const;
