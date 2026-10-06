import { expect, it } from 'vitest';
import { fileTypeHint } from './fileTypes';

it('derives presentation hints from the entry kind and extension only', () => {
    expect(fileTypeHint('src', 'directory')).toMatchObject({ icon: 'folder', label: 'Folder' });
    expect(fileTypeHint('index.js', 'file')).toMatchObject({ icon: 'file-code', label: 'Source' });
    expect(fileTypeHint('package.json', 'file')).toMatchObject({ icon: 'file-json', label: 'JSON' });
    expect(fileTypeHint('.env', 'file')).toMatchObject({ label: 'Config' });
    expect(fileTypeHint('settings.YML', 'file')).toMatchObject({ label: 'Config' });
    expect(fileTypeHint('backup.tar.gz', 'archive')).toMatchObject({ icon: 'file-archive' });
    expect(fileTypeHint('README', 'file')).toMatchObject({ icon: 'file', label: 'File' });
    expect(fileTypeHint('current', 'symlink')).toMatchObject({ icon: 'link' });
});
