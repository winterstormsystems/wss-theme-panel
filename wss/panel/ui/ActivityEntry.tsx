import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import {
    Activity,
    Archive,
    CalendarClock,
    Database,
    FileText,
    FolderOpen,
    KeyRound,
    type LucideIcon,
    Network,
    Power,
    Settings,
    Terminal,
    Users,
} from 'lucide-react';
import type { ActivityLog } from '@/api/activity';
import { relationshipAttributes } from '@/api/relationships';
import ActivityLogMetaButton from '@/components/elements/activity/ActivityLogMetaButton';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import type { TranslationValue, TranslationValues } from '@/components/elements/Translate';
import i18n from '@/i18n';
import dayjs from '@/lib/dayjs';
import { isNumber, isString } from '@/lib/objects';
import { reword } from '../wording';

type ActorAttributes = { username?: string; email?: string };

// Rewords activity translations ("Stopped the server" -> "Stopped the bot"). Values are wrapped
// in <strong> before translation (as core does), so user data inside them is never touched.
const POST_PROCESSOR = 'wss-wording';
i18n.use({
    type: 'postProcessor',
    name: POST_PROCESSOR,
    process: (value: string) =>
        value
            .split(/(<strong>[\s\S]*?<\/strong>)/)
            .map((part) => (part.startsWith('<strong>') ? part : reword(part)))
            .join(''),
});

// Same emphasis rule as core's ActivityLogEntry: values bold, counts left as numbers.
function wrapProperty(value: TranslationValue): TranslationValue {
    if (value === null || isString(value) || isNumber(value)) {
        return `<strong>${String(value)}</strong>`;
    }
    if (Array.isArray(value)) return value.map(wrapProperty);
    if (value === true || value === false) return value;
    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
            key,
            key === 'count' || key.endsWith('_count') ? item : wrapProperty(item),
        ])
    );
}

const categories: [string, LucideIcon][] = [
    ['power', Power],
    ['console', Terminal],
    ['sftp', FolderOpen],
    ['file', FileText],
    ['backup', Archive],
    ['database', Database],
    ['subuser', Users],
    ['schedule', CalendarClock],
    ['task', CalendarClock],
    ['allocation', Network],
    ['settings', Settings],
    ['startup', Settings],
    ['reinstall', Settings],
    ['auth', KeyRound],
    ['user', KeyRound],
    ['api-key', KeyRound],
    ['ssh-key', KeyRound],
];

function eventIcon(event: string): LucideIcon {
    const [, rest = event] = event.split(':');
    const group = rest.split('.')[0] ?? '';
    return categories.find(([prefix]) => group.startsWith(prefix))?.[1] ?? Activity;
}

/**
 * WSS presentation of an activity log entry (seam in elements/activity/ActivityLogEntry.tsx):
 * an audit row with the event description first, then actor, event code (links to the same
 * filter core uses), IP address and time. Same data, same metadata dialog.
 */
export default function ActivityEntry({ activity, children }: { activity: ActivityLog; children?: ReactNode }) {
    const { attributes } = activity;
    const { t } = useTranslation('activity');
    const actor = relationshipAttributes<ActorAttributes>(attributes.relationships?.actor);
    const values = Object.fromEntries(
        Object.entries(attributes.properties as TranslationValues).map(([key, value]) => [key, wrapProperty(value)])
    );
    const Icon = eventIcon(attributes.event);
    const timestamp = dayjs(attributes.timestamp);
    const eventLabel = attributes.event.replace(/^server:/, '');

    return (
        <div
            className={
                'flex gap-3 border-x border-b border-border px-4 py-3 first:rounded-t-lg first:border-t last:rounded-b-lg sm:gap-4'
            }
        >
            <span
                aria-hidden
                className={
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground'
                }
            >
                <Icon className={'size-4'} />
            </span>
            <div className={'min-w-0 flex-1'}>
                <p
                    className={
                        'text-sm break-words text-foreground [&_strong]:break-all [&_strong]:font-semibold [&_strong]:text-foreground'
                    }
                >
                    <Trans
                        t={t}
                        i18nKey={attributes.event.replace(':', '.')}
                        values={values}
                        tOptions={{ postProcess: POST_PROCESSOR }}
                    />
                </p>
                <div className={'mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'}>
                    <Tooltip placement={'top'} content={actor?.email || 'System'}>
                        <span className={'font-medium text-foreground/85'}>{actor?.username || 'System'}</span>
                    </Tooltip>
                    <Link
                        to={'.'}
                        search={{ event: attributes.event }}
                        title={'Show only this event'}
                        className={
                            'rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground transition-colors hover:text-accent'
                        }
                    >
                        {eventLabel}
                    </Link>
                    {attributes.ip && <span className={'font-mono'}>{attributes.ip}</span>}
                    <Tooltip placement={'top'} content={timestamp.format('MMM Do, YYYY H:mm:ss')}>
                        <time dateTime={timestamp.toISOString()}>{timestamp.fromNow()}</time>
                    </Tooltip>
                    {attributes.is_api && (
                        <span className={'inline-flex items-center gap-1'}>
                            <Terminal aria-hidden className={'size-3.5'} /> API key
                        </span>
                    )}
                    {attributes.event.startsWith('server:sftp.') && (
                        <span className={'inline-flex items-center gap-1'}>
                            <FolderOpen aria-hidden className={'size-3.5'} /> SFTP
                        </span>
                    )}
                    {children && <span className={'inline-flex [&_svg]:size-3.5'}>{children}</span>}
                </div>
            </div>
            {attributes.has_additional_metadata && <ActivityLogMetaButton meta={attributes.properties} />}
        </div>
    );
}
