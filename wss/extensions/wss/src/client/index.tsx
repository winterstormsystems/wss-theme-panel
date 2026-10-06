import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import DashboardOverview from './components/DashboardOverview';
import LoginBrand from './components/LoginBrand';

/**
 * WSS Bot Hosting extension entry. Everything here goes through the SDK's supported
 * extension points; core is never edited. See wss/docs/ARCHITECTURE.md.
 */
/**
 * Sidebar sub-navigation (documented SDK switch, `lg` and up) for the account and bot areas.
 * Off for now: with a sidebar, core's console stat column truncates values (address port,
 * memory limit) at laptop widths, and the console layout is not redesigned in this phase.
 * Turn on together with the bot detail redesign. See wss/docs/ARCHITECTURE.md ("Shell").
 */
const SIDE_NAVIGATION = false;

export default definePterodactylExtension({
    setup({ slots, components }) {
        if (SIDE_NAVIGATION) document.documentElement.dataset.subNavigation = 'side';

        // Dashboard
        components.replace('dashboard.serverCard', { load: () => import('./components/BotCard') });
        slots.register('dashboard.before', DashboardOverview);

        // Login identity
        slots.register('auth.login.before', LoginBrand);
    },
});
