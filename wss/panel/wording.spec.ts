import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { reword, rewordNode, rewordTitle } from './wording';

describe('reword', () => {
    it('replaces "server" after a determiner, keeping case, plural and possessive', () => {
        expect(reword('This server doesn’t have any backups.')).toBe('This bot doesn’t have any backups.');
        expect(reword('You are using 1 of 3 allocations for this server.')).toBe(
            'You are using 1 of 3 allocations for this bot.'
        );
        expect(reword("this server's backup limit")).toBe("this bot's backup limit");
        expect(reword('Your servers')).toBe('Your bots');
        expect(reword('Create server backup')).toBe('Create bot backup');
    });

    it('renames subusers to team members', () => {
        expect(reword('Added a subuser')).toBe('Added a team member');
        expect(reword('Subusers')).toBe('Team members');
    });

    it('leaves technical and quoted text alone', () => {
        expect(reword('server:power.start')).toBe('server:power.start');
        expect(reword('SFTP server address')).toBe('SFTP server address');
        expect(reword('Restore "the server backup"')).toBe('Restore "the server backup"');
    });

    it('maps known titles', () => {
        expect(rewordTitle('Server Suspended')).toBe('Bot Suspended');
        expect(rewordTitle('404')).toBe('Page not found');
    });
});

describe('rewordNode', () => {
    it('rewrites string children deep in an element tree and keeps other props', () => {
        const tree = createElement('div', { className: 'x' }, createElement('p', null, 'No backups for this server.'));
        const result = rewordNode(tree) as ReturnType<typeof createElement>;
        const child = (result.props as { children: ReturnType<typeof createElement>[] }).children;
        expect((result.props as { className: string }).className).toBe('x');
        expect(JSON.stringify(child)).toContain('No backups for this bot.');
    });

    it('does not call render-prop children', () => {
        const render = () => 'this server';
        const tree = createElement('div', null, render as never);
        expect(rewordNode(tree)).toBe(tree);
    });
});
