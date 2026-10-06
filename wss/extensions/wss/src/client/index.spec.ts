import { expect, it, vi } from 'vitest';
import type { ExtensionSetupContext } from '@pterodactyl/sdk';
import extension from './index';
import DashboardOverview from './components/DashboardOverview';
import LoginBrand from './components/LoginBrand';

it('registers only through supported extension points', () => {
    const context: ExtensionSetupContext = {
        meta: { id: 'wss' },
        config: {},
        slots: { register: vi.fn() },
        screens: { register: vi.fn() },
        columns: { register: vi.fn() },
        components: { replace: vi.fn() },
    };

    extension.setup(context);

    expect(context.components.replace).toHaveBeenCalledWith('dashboard.serverCard', { load: expect.any(Function) });
    expect(context.slots.register).toHaveBeenCalledWith('dashboard.before', DashboardOverview);
    expect(context.slots.register).toHaveBeenCalledWith('auth.login.before', LoginBrand);
    expect(context.screens.register).not.toHaveBeenCalled();
    // Sidebar navigation stays off until the bot detail redesign (see index.tsx).
    expect(document.documentElement.dataset.subNavigation).toBeUndefined();
});
