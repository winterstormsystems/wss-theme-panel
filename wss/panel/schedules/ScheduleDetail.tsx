import { useMemo } from 'react';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, CalendarClock, CircleCheck, CircleSlash, ListTodo, Loader, Power } from 'lucide-react';
import { httpErrorToHuman } from '@/api/http';
import { relationshipData } from '@/api/relationships';
import { useCurrentServerIdentifier, useCurrentServerUuid } from '@/api/server/queries';
import { type Schedule, useServerSchedule } from '@/api/server/schedules/queries';
import Button from '@/components/elements/Button';
import Can from '@/components/elements/Can';
import { Dialog } from '@/components/elements/dialog';
import { ServerError } from '@/components/elements/ScreenBlock';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import DataTable from '@/components/elements/table/DataTable';
import DeleteScheduleButton from '@/components/server/schedules/DeleteScheduleButton';
import EditScheduleModal from '@/components/server/schedules/EditScheduleModal';
import NewTaskButton from '@/components/server/schedules/NewTaskButton';
import RunScheduleButton from '@/components/server/schedules/RunScheduleButton';
import { scheduleTaskColumns } from '@/components/server/schedules/ScheduleTaskTable';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import dayjs from '@/lib/dayjs';
import { usePermissions } from '@/plugins/usePermissions';
import Card, { Badge } from '../ui/Card';

// Field order and names of a standard five-field cron expression, as core stores them.
const cronFields = [
    ['minute', 'Minute'],
    ['hour', 'Hour'],
    ['day_of_month', 'Day of month'],
    ['month', 'Month'],
    ['day_of_week', 'Day of week'],
] as const;

function RunTime({ label, value }: { label: string; value: string | null }) {
    const time = value ? dayjs(value) : null;
    return (
        <div className={'min-w-0'}>
            <dt className={'text-xs text-muted-foreground'}>{label}</dt>
            <dd className={'mt-0.5 text-sm text-foreground'}>
                {time ? (
                    <time dateTime={time.toISOString()} title={time.format('MMM Do, YYYY H:mm:ss')}>
                        {time.format('MMM D [at] h:mm A')}{' '}
                        <span className={'text-muted-foreground'}>({time.fromNow()})</span>
                    </time>
                ) : (
                    <span className={'text-muted-foreground'}>{label === 'Last run' ? 'Never' : 'Not scheduled'}</span>
                )}
            </dd>
        </div>
    );
}

function ScheduleStatus({ schedule }: { schedule: Schedule }) {
    const { is_processing: processing, is_active: active } = schedule.attributes;
    if (processing) {
        return (
            <Badge tone={'info'} icon={Loader}>
                Running
            </Badge>
        );
    }
    return active ? (
        <Badge tone={'success'} icon={CircleCheck}>
            Active
        </Badge>
    ) : (
        <Badge tone={'neutral'} icon={CircleSlash}>
            Inactive
        </Badge>
    );
}

function ScheduleDetails({ schedule }: { schedule: Schedule }) {
    const navigate = useNavigate();
    const id = useCurrentServerIdentifier() ?? '';
    const [canUpdate] = usePermissions('schedule.update');
    const { attributes } = schedule;

    // Same ordering core uses (sequence_id); the table instance and columns are core's.
    const tasks = useMemo(() => relationshipData(attributes.relationships?.tasks), [attributes]);
    const orderedTasks = useMemo(
        () => [...tasks].sort((a, b) => a.attributes.sequence_id - b.attributes.sequence_id),
        [tasks]
    );
    const columns = useMemo(() => scheduleTaskColumns(schedule), [schedule]);
    const table = useReactTable({
        data: orderedTasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (task) => String(task.attributes.id),
    });
    const expression = cronFields.map(([key]) => attributes.cron[key]).join(' ');

    return (
        <ServerContentBlock title={'Schedules'}>
            <Link
                to={'/server/$id/schedules'}
                params={{ id }}
                className={'mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'}
            >
                <ArrowLeft aria-hidden className={'size-4'} /> All schedules
            </Link>
            <div className={'space-y-6'}>
                <Card bodyClassName={'pt-0'}>
                    <div className={'flex flex-col gap-4 pt-5 sm:flex-row sm:items-start sm:justify-between'}>
                        <div className={'flex min-w-0 items-start gap-3'}>
                            <span
                                aria-hidden
                                className={
                                    'flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-primary'
                                }
                            >
                                <CalendarClock className={'size-5'} />
                            </span>
                            <div className={'min-w-0'}>
                                <div className={'flex flex-wrap items-center gap-2'}>
                                    <h2 className={'text-lg font-semibold break-words text-foreground'}>
                                        {attributes.name}
                                    </h2>
                                    <ScheduleStatus schedule={schedule} />
                                    {attributes.only_when_online && (
                                        <Badge tone={'neutral'} icon={Power}>
                                            Only when online
                                        </Badge>
                                    )}
                                </div>
                                <dl className={'mt-3 grid gap-3 sm:grid-cols-2 sm:gap-8'}>
                                    <RunTime label={'Last run'} value={attributes.last_run_at} />
                                    <RunTime label={'Next run'} value={attributes.next_run_at} />
                                </dl>
                            </div>
                        </div>
                        <Can action={'schedule.update'}>
                            <div className={'flex shrink-0 gap-2 [&>*]:flex-1 sm:[&>*]:flex-none'}>
                                <Dialog.Trigger
                                    trigger={({ onClick }) => <Button.Text onClick={onClick}>Edit</Button.Text>}
                                >
                                    {({ open, onClose }) => (
                                        <EditScheduleModal open={open} schedule={schedule} onClose={onClose} />
                                    )}
                                </Dialog.Trigger>
                                <NewTaskButton schedule={schedule} />
                            </div>
                        </Can>
                    </div>
                    <div className={'mt-5 border-t border-border pt-4'}>
                        <div className={'flex flex-wrap items-baseline justify-between gap-2'}>
                            <h3 className={'text-sm font-semibold text-foreground'}>Timing</h3>
                            <code className={'rounded-sm bg-muted px-2 py-0.5 font-mono text-xs text-foreground'}>
                                {expression}
                            </code>
                        </div>
                        <dl className={'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5'}>
                            {cronFields.map(([key, label]) => (
                                <div key={key} className={'rounded-md border border-border bg-background/40 px-3 py-2'}>
                                    <dt className={'text-xs text-muted-foreground'}>{label}</dt>
                                    <dd className={'mt-0.5 font-mono text-sm text-foreground'}>
                                        {attributes.cron[key]}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </Card>

                <Card
                    title={'Tasks'}
                    description={'Run in order when the schedule fires. Delays are counted from the previous task.'}
                    aside={
                        orderedTasks.length > 0 ? (
                            <Badge tone={'neutral'} icon={ListTodo}>
                                {orderedTasks.length} {orderedTasks.length === 1 ? 'task' : 'tasks'}
                            </Badge>
                        ) : undefined
                    }
                    bodyClassName={'p-0 pt-2'}
                >
                    <DataTable
                        table={table}
                        emptyState={
                            <Empty className={'gap-3 p-8'}>
                                <EmptyHeader>
                                    <EmptyMedia variant={'icon'}>
                                        <ListTodo />
                                    </EmptyMedia>
                                    <EmptyTitle>No tasks</EmptyTitle>
                                    <EmptyDescription>
                                        Add a task to tell this schedule what to do when it runs.
                                    </EmptyDescription>
                                </EmptyHeader>
                                {canUpdate && (
                                    <EmptyContent>
                                        <NewTaskButton schedule={schedule} />
                                    </EmptyContent>
                                )}
                            </Empty>
                        }
                    />
                </Card>

                <div className={'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'}>
                    <Can action={'schedule.delete'}>
                        <DeleteScheduleButton
                            scheduleId={attributes.id}
                            onDeleted={() => navigate({ to: '/server/$id/schedules', params: { id } })}
                        />
                    </Can>
                    {orderedTasks.length > 0 && (
                        <Can action={'schedule.update'}>
                            <RunScheduleButton schedule={schedule} />
                        </Can>
                    )}
                </div>
            </div>
        </ServerContentBlock>
    );
}

/**
 * Schedule detail page (replaces core's ScheduleEditContainer via a one-line seam). Same query,
 * same task ordering, same core actions (edit, new task, run now, delete, task edit/delete in
 * the task table) behind the same permissions; only the presentation is WSS. The cron fields
 * are shown exactly as stored; next/last run times come from the API, not from a WSS parser.
 */
export default function ScheduleDetail() {
    const { scheduleId } = useParams({ strict: false });
    const uuid = useCurrentServerUuid() ?? '';
    const { data: schedule, error, isFetching, refetch } = useServerSchedule(uuid, Number(scheduleId));

    if (schedule) return <ScheduleDetails schedule={schedule} />;
    if (error && !isFetching) return <ServerError message={httpErrorToHuman(error)} onRetry={() => refetch()} />;

    return (
        <ServerContentBlock title={'Schedules'}>
            <Spinner size={'large'} centered />
        </ServerContentBlock>
    );
}
