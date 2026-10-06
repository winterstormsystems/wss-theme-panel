import type { ReplacementProps } from '@pterodactyl/sdk';

/**
 * `server.files.manager` replacement: frames the native browser (toolbar, list, selection bar)
 * as a WSS panel and adds a live summary line. The panel keeps the directory query, selection,
 * uploads, every mutation and navigation; `Default` renders its own parts unchanged.
 */
export default function FileManager({ model, Default }: ReplacementProps<'server.files.manager'>) {
    const folders = model.entries.filter((entry) => entry.kind === 'directory').length;
    const files = model.entries.length - folders;

    return (
        <div className={'wss:rounded-lg wss:border wss:border-border wss:bg-card wss:p-2 wss:sm:p-3'}>
            <Default />
            {!model.loading && (
                <p className={'wss:px-2 wss:pt-2 wss:text-xs wss:text-muted-foreground'} aria-live={'polite'}>
                    {folders} {folders === 1 ? 'folder' : 'folders'}, {files} {files === 1 ? 'file' : 'files'}
                    {model.truncated && ' (showing the first 250 entries)'}
                    {model.selection.length > 0 && ` · ${model.selection.length} selected`}
                </p>
            )}
        </div>
    );
}
