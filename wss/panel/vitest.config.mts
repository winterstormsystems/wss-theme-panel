import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Unit tests for WSS panel code (wss/panel). Run from the repository root:
//   npx vitest run --config wss/panel/vitest.config.mts
export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('../../resources/scripts', import.meta.url)),
            '@feature': fileURLToPath(new URL('../../resources/scripts/components/server/features', import.meta.url)),
        },
    },
    test: {
        root: fileURLToPath(new URL('.', import.meta.url)),
        environment: 'node',
        include: ['**/*.spec.{ts,tsx}'],
    },
});
