import { Link } from '@tanstack/react-router';
import { EthernetPort, ExternalLink } from 'lucide-react';
import { useCurrentUser } from '@/api/account/queries';
import { relationshipData } from '@/api/relationships';
import type { Server } from '@/api/server/types';
import Can from '@/components/elements/Can';
import CopyOnClick from '@/components/elements/CopyOnClick';
import PowerButtons from '@/components/server/console/PowerButtons';
import Slot from '@/extensions/Slot';
import { ip } from '@/lib/formatters';
import { useServerStatus } from '@/state/server';
import BotStatusPill, { resolveBotStatus } from './BotStatusPill';

export function primaryAddress(server: Server): string | null {
    const allocation = relationshipData(server.attributes.relationships?.allocations).find(
        (entry) => entry.attributes.is_default
    );
    return allocation
        ? `${allocation.attributes.ip_alias || ip(allocation.attributes.ip)}:${allocation.attributes.port}`
        : null;
}

/**
 * Bot identity, live status and power controls, shown on every bot page. Power controls are
 * core's PowerButtons (WebSocket `set state`, permission-gated); the console power slots are
 * kept around them on the console page.
 */
export default function BotHeader({ server, onConsole }: { server: Server; onConsole: boolean }) {
    const power = useServerStatus();
    const rootAdmin = useCurrentUser().rootAdmin;
    const { name, description, status, is_transferring: transferring, internal_id: internalId } = server.attributes;
    const address = primaryAddress(server);

    return (
        <div className={'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'}>
            <div className={'min-w-0'}>
                <div className={'flex flex-wrap items-center gap-x-3 gap-y-1.5'}>
                    <h1 className={'min-w-0 truncate text-xl font-semibold text-foreground sm:text-2xl'}>{name}</h1>
                    <BotStatusPill status={resolveBotStatus(power, status, transferring)} />
                </div>
                <div className={'mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'}>
                    {description && <p className={'line-clamp-1 max-w-prose'}>{description}</p>}
                    {address && (
                        <CopyOnClick text={address}>
                            <span className={'inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs'}>
                                <EthernetPort className={'size-3.5'} aria-hidden />
                                {address}
                            </span>
                        </CopyOnClick>
                    )}
                    {rootAdmin && (
                        <Link
                            to={'/panel/servers/$id'}
                            params={{ id: internalId }}
                            className={
                                'inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
                            }
                        >
                            <ExternalLink className={'size-3.5'} aria-hidden />
                            Administration
                        </Link>
                    )}
                </div>
            </div>
            <div className={'flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center'}>
                {onConsole && <Slot name={'server.console.power.before'} data={server} />}
                <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                    <PowerButtons className={'flex w-full gap-2 sm:w-auto [&_button]:min-w-24'} />
                </Can>
                {onConsole && <Slot name={'server.console.power.after'} data={server} />}
            </div>
        </div>
    );
}
