import { useQuery } from '@tanstack/react-query';
import { Button, http } from '@pterodactyl/sdk';
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
        <div className={'wss:flex wss:items-center wss:gap-3 wss:rounded-lg wss:border wss:border-border wss:bg-card wss:px-4 wss:py-3'}>
            <span aria-hidden={'true'} className={`wss:h-8 wss:w-1 wss:shrink-0 wss:rounded-full ${toneBackground[tone]}`} />
            <div className={'wss:min-w-0'}>
                <dt className={'wss:truncate wss:text-xs wss:font-medium wss:text-muted-foreground'}>{label}</dt>
                <dd className={'wss:text-xl wss:font-semibold wss:tabular-nums wss:text-foreground'}>{value}</dd>
            </div>
        </div>
    );
}

/**
 * `dashboard.before`: live summary strip under the "My Bots" heading. Hidden for an empty
 * account, where the panel's empty state (WSS wording) says everything needed.
 */
export default function DashboardOverview() {
    const total = useBotTotal();
    const statuses = useReportedBotStatuses();

    if (total.data === 0) return null;

    const online = statuses.filter((status) => status.key === 'online').length;
    const changing = statuses.filter((status) => status.transitional && status.key !== 'checking').length;
    const offline = statuses.filter((status) => status.tone !== 'success' && !status.transitional).length;
    const partial = total.data !== undefined && statuses.length > 0 && statuses.length < total.data;

    return (
        <section aria-label={`${terms.bot} summary`} className={'wss:mb-5'}>
            <dl className={'wss:grid wss:grid-cols-3 wss:gap-2 wss:sm:gap-3 wss:lg:max-w-2xl'} aria-busy={total.isPending}>
                <Stat label={terms.bots} tone={'neutral'} value={total.isPending ? '…' : total.isError ? '—' : total.data} />
                <Stat label={'Online'} tone={'success'} value={online} />
                <Stat label={'Offline'} tone={'danger'} value={offline} />
            </dl>
            {(total.isError || changing > 0 || partial) && (
                <p className={'wss:mt-2 wss:flex wss:flex-wrap wss:items-center wss:gap-2 wss:text-xs wss:text-muted-foreground'}>
                    {total.isError && (
                        <>
                            The {lower('bot')} total is temporarily unavailable.
                            <Button size={'xsmall'} isSecondary onClick={() => total.refetch()}>
                                Retry
                            </Button>
                        </>
                    )}
                    {changing > 0 && <span>{count(changing, 'bot', 'bots')} starting, stopping or installing.</span>}
                    {partial && <span>Online and offline counts cover the {lower('bots')} on this page.</span>}
                </p>
            )}
        </section>
    );
}
