/**
 * Presentation-only file type hints for the file manager: an icon name (lucide, rendered by the
 * panel's NamedIcon) and a short type label. Derived from the entry kind and the file extension
 * only; nothing here reads file contents or changes how a file is opened.
 */
export type FileKind = 'file' | 'directory' | 'archive' | 'symlink';

export interface FileTypeHint {
    icon: string;
    label: string;
    tone: 'folder' | 'code' | 'config' | 'media' | 'archive' | 'plain';
}

const byExtension = new Map<string, Omit<FileTypeHint, 'icon'> & { icon: string }>([
    ...[
        'js',
        'mjs',
        'cjs',
        'ts',
        'mts',
        'cts',
        'jsx',
        'tsx',
        'py',
        'rb',
        'go',
        'rs',
        'java',
        'kt',
        'php',
        'lua',
        'cs',
    ].map((ext) => [ext, { icon: 'file-code', label: 'Source', tone: 'code' as const }] as const),
    ...['sh', 'bash', 'zsh', 'ps1', 'bat', 'cmd'].map(
        (ext) => [ext, { icon: 'file-terminal', label: 'Script', tone: 'code' as const }] as const
    ),
    ['json', { icon: 'file-json', label: 'JSON', tone: 'config' }],
    ...['yml', 'yaml', 'toml', 'ini', 'cfg', 'conf', 'properties', 'env', 'xml'].map(
        (ext) => [ext, { icon: 'file-cog', label: 'Config', tone: 'config' as const }] as const
    ),
    ...['md', 'txt', 'log', 'csv'].map(
        (ext) => [ext, { icon: 'file-text', label: 'Text', tone: 'plain' as const }] as const
    ),
    ...['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'].map(
        (ext) => [ext, { icon: 'file-image', label: 'Image', tone: 'media' as const }] as const
    ),
    ...['mp3', 'ogg', 'wav', 'mp4', 'webm'].map(
        (ext) => [ext, { icon: 'file-video', label: 'Media', tone: 'media' as const }] as const
    ),
    ['lock', { icon: 'file-lock', label: 'Lockfile', tone: 'config' }],
]);

export function fileTypeHint(name: string, kind: FileKind): FileTypeHint {
    if (kind === 'directory') return { icon: 'folder', label: 'Folder', tone: 'folder' };
    if (kind === 'symlink') return { icon: 'link', label: 'Link', tone: 'plain' };
    if (kind === 'archive') return { icon: 'file-archive', label: 'Archive', tone: 'archive' };
    const lower = name.toLowerCase();
    if (lower === '.env' || lower.startsWith('.env.')) return { icon: 'file-cog', label: 'Config', tone: 'config' };
    if (lower === 'dockerfile') return { icon: 'file-cog', label: 'Config', tone: 'config' };
    const dot = lower.lastIndexOf('.');
    const ext = dot > 0 ? lower.slice(dot + 1) : '';
    return byExtension.get(ext) ?? { icon: 'file', label: 'File', tone: 'plain' };
}

export const toneClass = {
    folder: 'wss:text-brand',
    code: 'wss:text-status-success',
    config: 'wss:text-status-warning',
    media: 'wss:text-text-secondary',
    archive: 'wss:text-status-warning',
    plain: 'wss:text-muted-foreground',
} satisfies Record<FileTypeHint['tone'], string>;
