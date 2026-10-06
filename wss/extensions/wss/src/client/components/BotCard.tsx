import { useEffect } from 'react';
import { NamedIcon, type ReplacementProps } from '@pterodactyl/sdk';
import { reportBotStatus } from '../botStates';
import { botStatus, formatBytes, formatPercent } from '../status';
import { terms } from '../terminology';
import ResourceMeter from './ResourceMeter';
import StatusBadge from './StatusBadge';

type Props = ReplacementProps<'dashboard.serverCard'>;

/**
 * Replaces the dashboard's server card (`dashboard.serverCard`).
 *
 * The panel keeps the list, pagination, the surrounding link to the bot, its accessible
 * name, the live resource polling and the status bar; this component only presents the
 * model it is given. Everything inside is non-interactive because the whole card is a link.
 */
export default function BotCard({ model }: Props) {
    const status = botStatus(model.state);
    const { state } = model;

    useEffect(() => reportBotStatus(model.uuid, status), [model.uuid, status]);

    return (
        <div className={'wss:flex wss:flex-col wss:gap-4 wss:pr-4 wss:md:flex-row wss:md:items-center wss:md:gap-6'}>
            <div className={'wss:flex wss:min-w-0 wss:flex-1 wss:items-start wss:gap-3'}>
                <span
                    aria-hidden={'true'}
                    className={
                        'wss:flex wss:size-10 wss:shrink-0 wss:items-center wss:justify-center wss:rounded-md wss:border wss:border-border wss:bg-background wss:text-brand'
                    }
                >
                    <NamedIcon name={'bot'} size={20} />
                </span>
                <div className={'wss:min-w-0 wss:flex-1'}>
                    <div className={'wss:flex wss:flex-wrap wss:items-center wss:gap-x-2 wss:gap-y-1'}>
                        <p className={'wss:min-w-0 wss:truncate wss:text-base wss:font-semibold wss:text-foreground'}>
                            {model.name}
                        </p>
                        <StatusBadge status={status} />
                    </div>
                    {!!model.description && (
                        <p className={'wss:mt-0.5 wss:line-clamp-1 wss:text-sm wss:text-text-secondary'}>
                            {model.description}
                        </p>
                    )}
                    {!!model.address && (
                        <p
                            className={
                                'wss:mt-1 wss:flex wss:items-center wss:gap-1.5 wss:font-mono wss:text-xs wss:text-muted-foreground'
                            }
                        >
                            <NamedIcon name={'ethernet-port'} size={12} aria-hidden={'true'} />
                            <span className={'wss:truncate'}>{model.address}</span>
                        </p>
                    )}
                </div>
            </div>

            <div className={'wss:w-full wss:md:w-80 wss:lg:w-96 wss:shrink-0'}>
                {state.kind === 'ready' ? (
                    <div className={'wss:grid wss:grid-cols-3 wss:gap-3'}>
                        <ResourceMeter
                            label={'CPU'}
                            value={formatPercent(state.cpu.value)}
                            limit={state.cpu.limit > 0 ? formatPercent(state.cpu.limit) : undefined}
                            current={state.cpu.value}
                            max={state.cpu.limit}
                            alarm={state.cpu.alarm}
                        />
                        <ResourceMeter
                            label={'RAM'}
                            value={formatBytes(state.memory.value)}
                            limit={state.memory.limit > 0 ? formatBytes(state.memory.limit) : undefined}
                            current={state.memory.value}
                            max={state.memory.limit}
                            alarm={state.memory.alarm}
                        />
                        <ResourceMeter
                            label={'Disk'}
                            value={formatBytes(state.disk.value)}
                            limit={state.disk.limit > 0 ? formatBytes(state.disk.limit) : undefined}
                            current={state.disk.value}
                            max={state.disk.limit}
                            alarm={state.disk.alarm}
                        />
                    </div>
                ) : state.kind === 'loading' ? (
                    <div className={'wss:grid wss:grid-cols-3 wss:gap-3'} aria-hidden={'true'}>
                        {[0, 1, 2].map((key) => (
                            <div key={key} className={'wss:h-7 wss:animate-pulse wss:rounded-sm wss:bg-muted'} />
                        ))}
                    </div>
                ) : (
                    <p className={'wss:text-xs wss:text-muted-foreground'}>
                        Resource usage is shown once the {terms.bot.toLowerCase()} is available.
                    </p>
                )}
            </div>

            <span
                aria-hidden={'true'}
                className={
                    'wss:inline-flex wss:shrink-0 wss:items-center wss:gap-1 wss:self-end wss:text-sm wss:font-medium wss:text-brand wss:md:self-auto'
                }
            >
                {terms.manage}
                <NamedIcon name={'chevron-right'} size={16} />
            </span>
        </div>
    );
}
