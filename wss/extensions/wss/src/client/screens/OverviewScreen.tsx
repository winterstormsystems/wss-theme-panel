import { useState } from 'react';
import {
    NamedIcon,
    PanelLink,
    ServerContentBlock,
    useCurrentServerRequired,
    useServerPermission,
    useServerResources,
    useServerWebsocketEvent,
} from '@pterodactyl/sdk';
import ResourceMeter from '../components/ResourceMeter';
import { formatBytes, formatPercent } from '../status';
import { lower, terms } from '../terminology';

interface Live {
    cpu: number;
    memory: number;
    disk: number;
    rx: number;
    tx: number;
    uptime: number;
    state: string;
}

const mib = 1024 * 1024;

function formatUptime(ms: number): string {
    const total = Math.floor(ms / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    return days > 0 ? `${days}d ${hours}h ${minutes}m` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${total % 60}s`;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className={'wss:rounded-lg wss:border wss:border-border wss:bg-card wss:p-5'}>
            <h3 className={'wss:text-sm wss:font-semibold wss:text-foreground'}>{title}</h3>
            <div className={'wss:mt-4'}>{children}</div>
        </section>
    );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className={'wss:flex wss:items-baseline wss:justify-between wss:gap-3 wss:py-1.5 wss:text-sm'}>
            <dt className={'wss:text-muted-foreground'}>{label}</dt>
            <dd className={'wss:min-w-0 wss:truncate wss:text-right wss:font-medium wss:text-foreground'}>{children}</dd>
        </div>
    );
}

/**
 * Bot overview (extension screen at /server/:id/overview). Resource state comes from the
 * panel's shared resources cache (the same entry the dashboard polls), then live WebSocket
 * `stats` events while the page is open. Nothing is estimated or invented.
 */
export default function OverviewScreen() {
    const server = useCurrentServerRequired();
    const { uuid, identifier, limits, docker_image: image, node, relationships } = server.attributes;
    const resources = useServerResources(uuid, (data) => data.attributes);
    const [live, setLive] = useState<Live | null>(null);
    const canFiles = useServerPermission('file.*', true);
    const canRuntime = useServerPermission('startup.*', true);

    useServerWebsocketEvent('stats', (data) => {
        try {
            const stats = JSON.parse(data);
            setLive({
                cpu: stats.cpu_absolute,
                memory: stats.memory_bytes,
                disk: stats.disk_bytes,
                rx: stats.network?.rx_bytes ?? 0,
                tx: stats.network?.tx_bytes ?? 0,
                uptime: stats.uptime ?? 0,
                state: stats.state,
            });
        } catch {
            // Ignore malformed frames; the cached values stay on screen.
        }
    });

    const cached = resources.data;
    const state = live?.state ?? cached?.current_state;
    const running = state === 'running' || state === 'starting' || state === 'stopping';
    const cpu = live?.cpu ?? cached?.resources.cpu_absolute ?? 0;
    const memory = live?.memory ?? cached?.resources.memory_bytes ?? 0;
    const disk = live?.disk ?? cached?.resources.disk_bytes ?? 0;
    const rx = live?.rx ?? cached?.resources.network_rx_bytes ?? 0;
    const tx = live?.tx ?? cached?.resources.network_tx_bytes ?? 0;
    const uptime = live?.uptime ?? cached?.resources.uptime ?? 0;

    const allocations = (relationships?.allocations as { data?: { attributes: Record<string, unknown> }[] } | undefined)?.data ?? [];
    const primary = allocations.find((allocation) => allocation.attributes.is_default)?.attributes;
    const address = primary ? `${primary.ip_alias || primary.ip}:${primary.port}` : null;

    return (
        <ServerContentBlock title={'Overview'}>
            <div className={'wss:grid wss:gap-4 wss:lg:grid-cols-3'}>
                <div className={'wss:lg:col-span-2'}>
                    <Card title={'Resources'}>
                        {resources.isPending && !live ? (
                            <div className={'wss:grid wss:gap-4 wss:sm:grid-cols-3'} aria-hidden={'true'}>
                                {[0, 1, 2].map((key) => (
                                    <div key={key} className={'wss:h-10 wss:animate-pulse wss:rounded-md wss:bg-muted'} />
                                ))}
                            </div>
                        ) : (
                            <div className={'wss:grid wss:gap-5 wss:sm:grid-cols-3'}>
                                <ResourceMeter
                                    label={'CPU'}
                                    value={running ? formatPercent(cpu) : '0%'}
                                    limit={limits.cpu ? formatPercent(limits.cpu) : undefined}
                                    current={running ? cpu : 0}
                                    max={limits.cpu}
                                    alarm={false}
                                />
                                <ResourceMeter
                                    label={'Memory'}
                                    value={running ? formatBytes(memory) : '0 B'}
                                    limit={limits.memory ? formatBytes(limits.memory * mib) : undefined}
                                    current={running ? memory : 0}
                                    max={limits.memory * mib}
                                    alarm={false}
                                />
                                <ResourceMeter
                                    label={'Storage'}
                                    value={formatBytes(disk)}
                                    limit={limits.disk ? formatBytes(limits.disk * mib) : undefined}
                                    current={disk}
                                    max={limits.disk * mib}
                                    alarm={false}
                                />
                            </div>
                        )}
                        <dl className={'wss:mt-5 wss:grid wss:gap-x-8 wss:border-t wss:border-border wss:pt-3 wss:sm:grid-cols-3'}>
                            <Fact label={'Uptime'}>{running && uptime > 0 ? formatUptime(uptime) : 'Offline'}</Fact>
                            <Fact label={'Network in'}>{running ? formatBytes(rx) : 'Offline'}</Fact>
                            <Fact label={'Network out'}>{running ? formatBytes(tx) : 'Offline'}</Fact>
                        </dl>
                        {resources.isError && !live && (
                            <p className={'wss:mt-3 wss:text-xs wss:text-muted-foreground'}>
                                Live resource data is temporarily unavailable.
                            </p>
                        )}
                    </Card>
                </div>
                <Card title={'Details'}>
                    <dl>
                        {address && <Fact label={'Address'}>{address}</Fact>}
                        <Fact label={'Node'}>{node}</Fact>
                        <Fact label={'Runtime image'}>
                            <span className={'wss:font-mono wss:text-xs'} title={image}>
                                {image.split('/').pop()}
                            </span>
                        </Fact>
                    </dl>
                </Card>
            </div>
            <nav aria-label={'Quick links'} className={'wss:mt-4 wss:grid wss:gap-3 wss:sm:grid-cols-3'}>
                {[
                    { show: true, to: '/server/$id' as const, label: 'Open console', hint: `Live output and commands`, icon: 'square-terminal' },
                    { show: canFiles, to: '/server/$id/files' as const, label: 'Manage files', hint: `Edit and upload your ${lower('bot')}'s code`, icon: 'folder-open' },
                    { show: canRuntime, to: '/server/$id/startup' as const, label: `${terms.runtime} settings`, hint: 'Startup command and variables', icon: 'sliders-horizontal' },
                ]
                    .filter((link) => link.show)
                    .map((link) => (
                        <PanelLink
                            key={link.to}
                            destination={{ to: link.to, params: { id: identifier } }}
                            className={
                                'wss:group wss:flex wss:items-center wss:gap-3 wss:rounded-lg wss:border wss:border-border wss:bg-card wss:p-4 wss:no-underline wss:transition-colors wss:hover:border-primary/60 wss:hover:bg-secondary'
                            }
                        >
                            <span className={'wss:flex wss:size-9 wss:items-center wss:justify-center wss:rounded-md wss:bg-background wss:text-brand'}>
                                <NamedIcon name={link.icon} size={18} aria-hidden={'true'} />
                            </span>
                            <span className={'wss:min-w-0'}>
                                <span className={'wss:block wss:text-sm wss:font-medium wss:text-foreground'}>{link.label}</span>
                                <span className={'wss:block wss:truncate wss:text-xs wss:text-muted-foreground'}>{link.hint}</span>
                            </span>
                        </PanelLink>
                    ))}
            </nav>
        </ServerContentBlock>
    );
}
