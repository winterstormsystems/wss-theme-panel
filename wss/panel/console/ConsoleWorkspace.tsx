import { useCurrentServer } from '@/api/server/queries';
import { Alert } from '@/components/elements/alert';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import Slot from '@/extensions/Slot';
import Features from '@feature/Features';
import { lower } from '../terminology';
import ResourcePanel from './ResourcePanel';

/**
 * Console page composition (replaces core's ServerConsoleContainer via a one-line seam).
 * The terminal, WebSocket handling, graphs and egg feature modals are core components; this
 * only arranges them: terminal first, live resources beside it, history below. Identity and
 * power controls live in the workspace header (workspace/BotHeader.tsx).
 */
export default function ConsoleWorkspace({ active = true }: { active?: boolean }) {
    const server = useCurrentServer()!;
    const {
        status,
        is_transferring: transferring,
        is_node_under_maintenance: maintenance,
        egg_features,
    } = server.attributes;
    const installing = status === 'installing' || status === 'install_failed';

    return (
        <ServerContentBlock title={active ? 'Console' : undefined}>
            {(maintenance || installing || transferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {maintenance
                        ? `The node hosting this ${lower('bot')} is under maintenance; actions are unavailable.`
                        : installing
                          ? `This ${lower('bot')} is installing; most actions are unavailable until it finishes.`
                          : `This ${lower('bot')} is being transferred; actions are unavailable.`}
                </Alert>
            )}
            <Slot name={'server.console.before'} data={server} />
            <div className={'grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]'}>
                {/* Core makes the terminal full-bleed below `sm` (negative margins), so only frame it from `sm` up. */}
                <div
                    className={
                        'flex min-h-[26rem] min-w-0 sm:overflow-hidden sm:rounded-lg sm:border sm:border-border lg:min-h-[32rem]'
                    }
                >
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </div>
                <ResourcePanel server={server} className={'self-start'} />
            </div>
            <section aria-label={'Performance history'} className={'mt-6'}>
                <h2 className={'mb-3 text-sm font-semibold text-foreground'}>Performance history</h2>
                <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
                    <Spinner.Suspense>
                        <StatGraphs />
                    </Spinner.Suspense>
                </div>
            </section>
            <Slot name={'server.console.after'} data={server} />
            <Features enabled={egg_features ?? []} />
        </ServerContentBlock>
    );
}
