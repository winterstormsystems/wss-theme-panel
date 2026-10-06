import { expect, it, vi } from 'vitest';
import type { ExtensionSetupContext } from '@pterodactyl/sdk';
import extension from './index';
import DashboardOverview from './components/DashboardOverview';
import { configuredLinks } from './components/ExternalLinks';

function context(config: ExtensionSetupContext['config'] = {}): ExtensionSetupContext {
    return {
        meta: { id: 'wss' },
        config,
        slots: { register: vi.fn() },
        screens: { register: vi.fn() },
        columns: { register: vi.fn() },
        components: { replace: vi.fn() },
    };
}

it('registers only through supported extension points', () => {
    const ctx = context();
    extension.setup(ctx);

    expect(ctx.components.replace).toHaveBeenCalledWith('dashboard.serverCard', { load: expect.any(Function) });
    expect(ctx.slots.register).toHaveBeenCalledWith('dashboard.before', DashboardOverview);
    expect(ctx.components.replace).toHaveBeenCalledWith('server.files.manager', { load: expect.any(Function) });
    expect(ctx.components.replace).toHaveBeenCalledWith('server.files.details', { load: expect.any(Function) });
    expect(ctx.components.replace).toHaveBeenCalledWith('server.files.editor', { load: expect.any(Function) });
    expect(ctx.screens.register).toHaveBeenCalledWith('overview', expect.any(Function));
    // No billing/support links until they are configured.
    expect(ctx.slots.register).not.toHaveBeenCalledWith('nav.items.after', expect.anything());
});

it('adds sidebar links only for configured HTTPS URLs', () => {
    const ctx = context({ billing_url: 'https://billing.example.com', support_url: 'javascript:alert(1)' });
    extension.setup(ctx);
    expect(ctx.slots.register).toHaveBeenCalledWith('nav.items.after', expect.any(Function));

    expect(
        configuredLinks({ billing_url: 'https://billing.example.com', support_url: 'http://plain.example.com' })
    ).toEqual([{ label: 'Billing', href: 'https://billing.example.com', icon: 'credit-card' }]);
    expect(configuredLinks({ billing_url: '', support_url: null })).toEqual([]);
});
