import { useEffect, useState } from 'react';
import type { Server } from '@/api/server/types';
import UptimeDuration from '@/components/server/UptimeDuration';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import { parseServerStatsPayload } from '@/components/server/console/stats';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import { useServerStatus, useSocketConnected, useSocketInstance } from '@/state/server';

interface Stats {
    cpu: number;
    memory: number;
    disk: number;
    rx: number;
    tx: number;
    uptime: number;
}

function Meter({
    label,
    value,
    limit,
    ratio,
}: {
    label: string;
    value: string;
    limit: string | null;
    ratio: number | null;
}) {
    const percent = ratio === null ? null : Math.round(Math.min(1, ratio) * 100);
    const tone =
        percent === null
            ? 'bg-primary'
            : percent >= 90
              ? 'bg-destructive'
              : percent >= 75
                ? 'bg-warning'
                : 'bg-primary';
    return (
        <div>
            <div className={'flex items-baseline justify-between gap-2 text-sm'}>
                <span className={'text-muted-foreground'}>{label}</span>
                <span className={'font-medium tabular-nums text-foreground'}>
                    {value}
                    <span className={'ml-1 text-xs font-normal text-muted-foreground'}>/ {limit ?? '∞'}</span>
                </span>
            </div>
            <div
                className={'mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted'}
                role={percent === null ? undefined : 'meter'}
                aria-label={percent === null ? undefined : `${label} usage`}
                aria-valuemin={percent === null ? undefined : 0}
                aria-valuemax={percent === null ? undefined : 100}
                aria-valuenow={percent ?? undefined}
                aria-valuetext={percent === null ? undefined : `${value} of ${limit} (${percent}%)`}
            >
                {percent !== null && (
                    <div
                        className={cn(
                            'h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none',
                            tone
                        )}
                        style={{ width: `${Math.max(percent, 2)}%` }}
                    />
                )}
            </div>
        </div>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className={'flex items-baseline justify-between gap-2 text-sm'}>
            <dt className={'text-muted-foreground'}>{label}</dt>
            <dd className={'truncate font-medium tabular-nums text-foreground'}>{children}</dd>
        </div>
    );
}

/**
 * Live resources beside the console. Values come from the same WebSocket `stats` events core's
 * ServerDetailsBlock uses (requested with `send stats` once connected); nothing is polled here.
 */
export default function ResourcePanel({ server, className }: { server: Server; className?: string }) {
    const [stats, setStats] = useState<Stats | null>(null);
    const status = useServerStatus();
    const connected = useSocketConnected();
    const instance = useSocketInstance();
    const limits = server.attributes.limits;
    const live = status !== null && status !== 'offline';

    useEffect(() => {
        if (connected && instance) instance.send(SocketRequest.SEND_STATS);
    }, [connected, instance]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        const parsed = parseServerStatsPayload(data);
        if (!parsed) return;
        setStats({
            cpu: parsed.cpu_absolute,
            memory: parsed.memory_bytes,
            disk: parsed.disk_bytes,
            rx: parsed.network.rx_bytes,
            tx: parsed.network.tx_bytes,
            uptime: parsed.uptime || 0,
        });
    });

    const memoryLimit = limits.memory ? mbToBytes(limits.memory) : 0;
    const diskLimit = limits.disk ? mbToBytes(limits.disk) : 0;
    const offline = <span className={'text-muted-foreground'}>Offline</span>;

    return (
        <section aria-label={'Resources'} className={cn('rounded-lg border border-border bg-card p-4', className)}>
            <h2 className={'text-sm font-semibold text-foreground'}>Resources</h2>
            <div className={'mt-4 space-y-4'}>
                <Meter
                    label={'CPU'}
                    value={live && stats ? `${stats.cpu.toFixed(1)}%` : '0%'}
                    limit={limits.cpu ? `${limits.cpu}%` : null}
                    ratio={limits.cpu && live && stats ? stats.cpu / limits.cpu : limits.cpu ? 0 : null}
                />
                <Meter
                    label={'Memory'}
                    value={live && stats ? bytesToString(stats.memory) : '0 B'}
                    limit={memoryLimit ? bytesToString(memoryLimit) : null}
                    ratio={memoryLimit ? (live && stats ? stats.memory / memoryLimit : 0) : null}
                />
                <Meter
                    label={'Storage'}
                    value={stats ? bytesToString(stats.disk) : '—'}
                    limit={diskLimit ? bytesToString(diskLimit) : null}
                    ratio={diskLimit && stats ? stats.disk / diskLimit : diskLimit ? 0 : null}
                />
            </div>
            <dl className={'mt-5 space-y-2 border-t border-border pt-4'}>
                <Row label={'Uptime'}>
                    {live && stats && stats.uptime > 0 ? <UptimeDuration uptime={stats.uptime / 1000} /> : offline}
                </Row>
                <Row label={'Network in'}>{live && stats ? bytesToString(stats.rx) : offline}</Row>
                <Row label={'Network out'}>{live && stats ? bytesToString(stats.tx) : offline}</Row>
            </dl>
        </section>
    );
}
