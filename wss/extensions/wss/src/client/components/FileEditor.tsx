import { useEffect, useMemo, useRef } from 'react';
import type { ComponentPartProps, ReplacementProps } from '@pterodactyl/sdk';
import { Button, NamedIcon } from '@pterodactyl/sdk';
import { fileTypeHint, toneClass } from './fileTypes';

/**
 * `server.files.editor` replacement: a WSS frame around core's editor. Core keeps CodeMirror,
 * the language picker, save / create (and Ctrl+S), the unsaved-changes guard, read-only rules and
 * errors; this adds the file identity and its state (unsaved changes, read-only) above them.
 */
/**
 * Actions part: core's own save path (`model.save()`, the same call core's button and Ctrl+S
 * make), with WSS wording. Hidden for read-only files, exactly like core.
 */
function SaveAction({ model }: ComponentPartProps<'server.files.editor'>) {
    if (model.readOnly) return null;
    return (
        <Button
            className={'wss:w-full wss:sm:w-auto'}
            disabled={model.saving}
            isLoading={model.saving}
            onClick={() => void model.save()}
        >
            {model.isNew ? 'Create file' : 'Save'}
        </Button>
    );
}

export default function FileEditor({ model, Default, parts }: ReplacementProps<'server.files.editor'>) {
    const name = model.isNew ? 'New file' : model.name;
    const frame = useRef<HTMLElement>(null);
    const CoreLanguage = parts.language;
    // Core's language picker, given an accessible name by wrapping it in a label.
    const editorParts = useMemo(
        () => ({
            actions: SaveAction,
            language: function LabelledLanguage(props: ComponentPartProps<'server.files.editor'>) {
                return (
                    <label className={'wss:block wss:w-full wss:sm:w-64'}>
                        <span className={'wss:sr-only'}>Syntax highlighting</span>
                        <CoreLanguage {...props} />
                    </label>
                );
            },
        }),
        [CoreLanguage]
    );

    // CodeMirror's content is contenteditable (already reachable with Tab); an explicit tabindex
    // lets assistive tooling recognise the scrolling editor as keyboard accessible.
    useEffect(() => {
        const node = frame.current;
        if (!node) return;
        const mark = () => {
            const content = node.querySelector<HTMLElement>('.cm-content');
            if (content && !content.hasAttribute('tabindex')) content.tabIndex = 0;
            return Boolean(content);
        };
        if (mark()) return;
        const observer = new MutationObserver(() => mark() && observer.disconnect());
        observer.observe(node, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);
    const hint = fileTypeHint(model.name || 'file', 'file');

    return (
        <section
            ref={frame}
            aria-label={`Editing ${name}`}
            className={'wss:rounded-lg wss:border wss:border-border wss:bg-card'}
        >
            <header
                className={
                    'wss:flex wss:flex-wrap wss:items-center wss:gap-3 wss:border-b wss:border-border wss:px-4 wss:py-3'
                }
            >
                <span
                    aria-hidden={'true'}
                    className={`wss:flex wss:size-8 wss:shrink-0 wss:items-center wss:justify-center wss:rounded-md wss:border wss:border-border wss:bg-background ${toneClass[hint.tone]}`}
                >
                    <NamedIcon name={hint.icon} className={'wss:size-4'} />
                </span>
                <div className={'wss:min-w-0 wss:flex-1'}>
                    <h2 className={'wss:truncate wss:text-sm wss:font-semibold wss:text-foreground'}>{name}</h2>
                    <p
                        className={'wss:truncate wss:font-mono wss:text-xs wss:text-muted-foreground'}
                        title={model.path}
                    >
                        {model.path}
                    </p>
                </div>
                <div className={'wss:flex wss:flex-wrap wss:gap-2'} aria-live={'polite'}>
                    {model.readOnly && (
                        <span
                            className={
                                'wss:inline-flex wss:items-center wss:gap-1.5 wss:rounded-full wss:border wss:border-border wss:px-2 wss:py-0.5 wss:text-xs wss:text-muted-foreground'
                            }
                        >
                            <NamedIcon name={'lock'} className={'wss:size-3.5'} /> Read only
                        </span>
                    )}
                    {model.dirty && !model.readOnly && (
                        <span
                            className={
                                'wss:inline-flex wss:items-center wss:gap-1.5 wss:rounded-full wss:border wss:border-status-warning/40 wss:bg-status-warning/10 wss:px-2 wss:py-0.5 wss:text-xs wss:text-status-warning'
                            }
                        >
                            <NamedIcon name={'circle-dot'} className={'wss:size-3.5'} /> Unsaved changes
                        </span>
                    )}
                </div>
            </header>
            <div className={'wss:p-3 wss:sm:p-4'}>
                <Default parts={editorParts} />
            </div>
        </section>
    );
}
