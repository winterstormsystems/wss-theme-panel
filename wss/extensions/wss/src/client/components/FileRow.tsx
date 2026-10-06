import type { ReplacementProps } from '@pterodactyl/sdk';
import { NamedIcon } from '@pterodactyl/sdk';
import { formatBytes } from '../status';
import { fileTypeHint, toneClass } from './fileTypes';

const HOUR = 3_600_000;

/** Same rule as core: relative time for recent changes, a date for older ones. */
function modifiedLabel(iso: string): string {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    if (Number.isNaN(date.getTime())) return '—';
    if (Math.abs(diff) > 48 * HOUR) {
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    const minutes = Math.round(-diff / 60_000);
    if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
    return rtf.format(Math.round(-diff / HOUR), 'hour');
}

/**
 * `server.files.details` replacement: the content of one file manager row (core keeps the row,
 * its link, selection checkbox, context menu and every action). Shows a type icon, the full
 * name, and size / modified time; on narrow screens those move under the name.
 */
export default function FileRow({ model }: ReplacementProps<'server.files.details'>) {
    const hint = fileTypeHint(model.name, model.kind);
    const isFolder = model.kind === 'directory';
    const size = isFolder ? null : formatBytes(model.size);
    const modified = modifiedLabel(model.modifiedAt);
    const absolute = new Date(model.modifiedAt).toLocaleString();

    return (
        // pl-9 leaves room for core's selection checkbox, which sits over the start of the row.
        <div className={'wss:flex wss:min-w-0 wss:flex-1 wss:items-center wss:gap-3 wss:py-0.5 wss:pl-9'}>
            <span
                aria-hidden={'true'}
                className={`wss:flex wss:size-8 wss:shrink-0 wss:items-center wss:justify-center wss:rounded-md wss:border wss:border-border wss:bg-background ${toneClass[hint.tone]}`}
            >
                <NamedIcon name={hint.icon} className={'wss:size-4'} />
            </span>
            <span className={'wss:min-w-0 wss:flex-1'}>
                <span className={'wss:block wss:truncate wss:font-medium wss:text-foreground'} title={model.name}>
                    {model.name}
                </span>
                <span className={'wss:block wss:truncate wss:text-xs wss:text-muted-foreground wss:md:hidden'}>
                    {hint.label}
                    {size && ` · ${size}`}
                    {` · ${modified}`}
                </span>
            </span>
            <span className={'wss:hidden wss:w-20 wss:shrink-0 wss:text-xs wss:text-muted-foreground wss:md:block'}>
                {hint.label}
            </span>
            <span
                className={
                    'wss:hidden wss:w-24 wss:shrink-0 wss:text-right wss:text-sm wss:tabular-nums wss:text-muted-foreground wss:md:block'
                }
            >
                {size ?? '—'}
            </span>
            <span
                className={
                    'wss:hidden wss:w-32 wss:shrink-0 wss:text-right wss:text-sm wss:text-muted-foreground wss:md:block'
                }
                title={absolute}
            >
                {modified}
            </span>
        </div>
    );
}
