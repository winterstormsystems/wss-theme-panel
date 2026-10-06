import { defineExtensionConfig } from '@pterodactyl/sdk/vite';

const config = defineExtensionConfig({ entry: 'src/client/index.tsx' });

// The SDK preset leaves Vite's base at '/', so the modulepreload links Vite injects for lazy
// chunks point at the site root (/chunk.*.js) and 404 as text/html. The dynamic import
// itself is relative and works; only the preload hint is wrong. Disable it until the preset
// is fixed upstream (wss/docs/GAPS.md).
export default {
    ...config,
    build: { ...config.build, modulePreload: false },
};
