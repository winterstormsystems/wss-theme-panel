import { useMemo } from 'react';
import type { ComponentPartProps, ReplacementProps } from '@pterodactyl/sdk';

/**
 * `server.files.manager` replacement: frames core's file browser as a WSS panel. Core keeps the
 * directory query, toolbar (breadcrumbs, new folder, upload, new file), rows, selection bar,
 * uploads and every action; this only wraps core's own parts:
 * - the list sits in a bordered frame whose hairlines separate core's rows,
 * - a summary line reports the counts core already has.
 */
export default function FileManager({ model, Default, parts }: ReplacementProps<'server.files.manager'>) {
    const folders = model.entries.filter((entry) => entry.kind === 'directory').length;
    const files = model.entries.length - folders;
    const CoreList = parts.list;
    // Stable per core part, so core's list (and any open rename/move dialog in it) never remounts.
    const List = useMemo(
        () =>
            function FramedList(props: ComponentPartProps<'server.files.manager'>) {
                return props.model.entries.length > 0 && !props.model.loading ? (
                    <div className={'wss:overflow-hidden wss:rounded-md wss:border wss:border-border wss:bg-border'}>
                        <CoreList {...props} />
                    </div>
                ) : (
                    <CoreList {...props} />
                );
            },
        [CoreList]
    );
    const listParts = useMemo(() => ({ list: List }), [List]);

    return (
        <div className={'wss:rounded-lg wss:border wss:border-border wss:bg-card wss:p-3 wss:sm:p-4'}>
            <Default parts={listParts} />
            {!model.loading && (
                <p className={'wss:pt-3 wss:text-xs wss:text-muted-foreground'} aria-live={'polite'}>
                    {folders} {folders === 1 ? 'folder' : 'folders'}, {files} {files === 1 ? 'file' : 'files'}
                    {model.truncated && ' (showing the first 250 entries)'}
                    {model.selection.length > 0 && ` · ${model.selection.length} selected`}
                </p>
            )}
        </div>
    );
}
