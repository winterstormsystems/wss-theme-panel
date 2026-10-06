import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import DashboardOverview from './components/DashboardOverview';
import { configuredLinks, createExternalLinks } from './components/ExternalLinks';

/**
 * WSS Bot Hosting extension entry. Everything here goes through the SDK's supported
 * extension points. The application shell itself (sidebar, header, login, bot workspace) is
 * WSS panel code in wss/panel, reached through the seams listed in wss/core-patches.json.
 */
export default definePterodactylExtension({
    setup({ slots, components, screens, config }) {
        // Dashboard
        components.replace('dashboard.serverCard', { load: () => import('./components/BotCard') });
        slots.register('dashboard.before', DashboardOverview);

        // Files: WSS frame around the native file browser
        components.replace('server.files.manager', { load: () => import('./components/FileManager') });

        // Bot overview page (declared in extension.json ui.screens)
        screens.register('overview', () => import('./screens/OverviewScreen'));

        // Billing / Support in the sidebar, only when configured in the extension settings.
        const links = configuredLinks(config);
        if (links.length > 0) slots.register('nav.items.after', createExternalLinks(links));
    },
});
