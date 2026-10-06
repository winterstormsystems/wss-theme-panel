import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';

/**
 * WSS Bot Hosting extension entry.
 *
 * Intentionally registers nothing yet: this is the foundation only. The redesign adds
 * its pieces here through the SDK's supported extension points, never by editing core:
 *
 * - components.replace('dashboard.serverCard', ...)   bot cards on the dashboard
 * - slots.register('dashboard.before' | 'nav.items.after' | 'server.console.*', ...)
 * - screens.register(id, importer)                    bot pages, declared in extension.json ui.screens
 *
 * See wss/README.md in the panel repository for the plan.
 */
export default definePterodactylExtension({
    setup() {},
});
