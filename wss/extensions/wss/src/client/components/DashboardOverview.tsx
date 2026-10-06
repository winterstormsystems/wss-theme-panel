import { useQuery } from '@tanstack/react-query';
import { Button, http, useCurrentUser } from '@pterodactyl/sdk';
import { useReportedBotStatuses } from '../botStates';
import { toneBackground, type StatusTone } from '../status';
import { count, lower, terms } from '../terminology';

/**
 * Total bots on the account. The SDK exposes no hook for the server list, so this is one
 * small request (a single row; only `meta.pagination.total` is read). Live state is not
 * fetched here: it comes from the cards the panel already renders and polls.
 */
function useBotTotal() {
    return useQuery({
        queryKey: ['wss', 'dashboard', 'bot-total'],
        queryFn: async ({ signal }) => {
            const { data } = await http.get('/api/client', { params: { page: 1, per_page: 1 }, signal });
            return Number(data?.meta?.pagination?.total ?? 0);
        },
        staleTime: 30_000,
        retry: 1,
    });
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone: StatusTone }) {
    return (
        <div className={'wss:min-w-0 wss:px-4 wss:first:pl-0 wss:sm:px-5'}>
            <dt
                className={
                    'wss:flex wss:items-center wss:gap-1.5 wss:text-xs wss:font-medium wss:text-muted-foreground'
                }
            >
                <span aria-hidden={'true'} className={`wss:size-1.5 wss:rounded-full ${toneBackground[tone]}`} />
                {label}
            </dt>
            <dd className={'wss:mt-0.5 wss:text-2xl wss:font-semibold wss:tabular-nums wss:text-foreground'}>
                {value}
            </dd>
        </div>
    );
}

/** `dashboard.before`: welcome context and a live summary above the panel's bot list. */
export default function DashboardOverview() {
    const user = useCurrentUser();
    const total = useBotTotal();
    const statuses = useReportedBotStatuses();

    const online = statuses.filter((status) => status.key === 'online').length;
    const changing = statuses.filter((status) => status.transitional && status.key !== 'checking').length;
    const notRunning = statuses.filter((status) => status.tone !== 'success' && !status.transitional).length;
    const partial = total.data !== undefined && statuses.length > 0 && statuses.length < total.data;
    const name = user.firstName || user.username;

    return (
        <section aria-labelledby={'wss-overview-title'} className={'wss:mb-4'}>
            <div className={'wss:overflow-hidden wss:rounded-lg wss:border wss:border-border wss:bg-card'}>
                <div aria-hidden={'true'} className={'wss:h-1 wss:brand-gradient'} />
                <div
                    className={'wss:flex wss:flex-col wss:gap-4 wss:p-4 wss:sm:p-5 wss:lg:flex-row wss:lg:items-center'}
                >
                    <div className={'wss:min-w-0 wss:flex-1'}>
                        <h2 id={'wss-overview-title'} className={'wss:text-lg wss:font-semibold wss:text-foreground'}>
                            Welcome back, {name}
                        </h2>
                        <p className={'wss:mt-0.5 wss:text-sm wss:text-text-secondary'}>
                            {total.data === 0
                                ? `There are no ${lower('bots')} on this account yet. When a ${lower('bot')} service is added to your account it appears below, ready to manage.`
                                : `Status and resource usage for your ${lower('bots')}. Select a ${lower('bot')} to open its console, files and settings.`}
                        </p>
                        {total.isError && (
                            <p
                                className={
                                    'wss:mt-2 wss:flex wss:flex-wrap wss:items-center wss:gap-2 wss:text-xs wss:text-muted-foreground'
                                }
                            >
                                The {lower('bot')} summary is temporarily unavailable.
                                <Button size={'xsmall'} isSecondary onClick={() => total.refetch()}>
                                    Retry
                                </Button>
                            </p>
                        )}
                    </div>
                    <dl
                        className={'wss:grid wss:grid-cols-3 wss:divide-x wss:divide-border wss:lg:shrink-0'}
                        aria-busy={total.isPending}
                    >
                        <Stat
                            label={terms.bots}
                            tone={'neutral'}
                            value={total.isPending ? '…' : total.isError ? '—' : total.data}
                        />
                        <Stat label={'Online'} tone={'success'} value={online} />
                        <Stat label={'Offline'} tone={'danger'} value={notRunning} />
                    </dl>
                </div>
                {(changing > 0 || partial) && (
                    <p
                        className={
                            'wss:border-t wss:border-border wss:px-4 wss:py-2 wss:text-xs wss:text-muted-foreground wss:sm:px-5'
                        }
                    >
                        {changing > 0 && `${count(changing, 'bot', 'bots')} starting, stopping or installing. `}
                        {partial && `Online and offline counts cover the ${lower('bots')} on this page.`}
                    </p>
                )}
            </div>
        </section>
    );
}
