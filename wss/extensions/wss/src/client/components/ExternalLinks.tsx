import { NamedIcon, type ExtensionConfigValue } from '@pterodactyl/sdk';

export interface ExternalLink {
    label: string;
    href: string;
    icon: string;
}

/** The extension settings this module reads (string settings declared in WssProvider). */
export interface LinkSettings {
    readonly billing_url?: ExtensionConfigValue;
    readonly support_url?: ExtensionConfigValue;
}

/** Parses a setting into an absolute HTTPS URL, or null (anything else is ignored, not linked). */
function httpsUrl(value: ExtensionConfigValue | undefined): string | null {
    const text = value === null || value === undefined ? '' : String(value);
    return /^https:\/\/\S+$/.test(text) ? text : null;
}

export function configuredLinks(config: LinkSettings): ExternalLink[] {
    const candidates = [
        { label: 'Billing', href: httpsUrl(config.billing_url), icon: 'credit-card' },
        { label: 'Support', href: httpsUrl(config.support_url), icon: 'life-buoy' },
    ];
    return candidates.flatMap((link) => (link.href ? [{ ...link, href: link.href }] : []));
}

/** `nav.items.after`: Billing / Support links in the customer sidebar, from extension settings. */
export function createExternalLinks(links: ExternalLink[]) {
    return function ExternalLinks() {
        return (
            <>
                {links.map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                        className={
                            'wss:group wss:flex wss:min-h-10 wss:items-center wss:gap-3 wss:rounded-md wss:px-3 wss:text-sm wss:font-medium wss:text-muted-foreground wss:no-underline wss:transition-colors wss:hover:bg-secondary wss:hover:text-foreground'
                        }
                    >
                        <NamedIcon name={link.icon} size={16} aria-hidden={'true'} />
                        <span className={'wss:flex-1'}>{link.label}</span>
                        <NamedIcon name={'arrow-up-right'} size={14} aria-hidden={'true'} />
                        <span className={'wss:sr-only'}>(opens in a new tab)</span>
                    </a>
                ))}
            </>
        );
    };
}
