import { describe, expect, it } from 'vitest';
import { count, permissionGroupTitle, permissionLabel, terms } from './terminology';

describe('terminology', () => {
    it('names permission groups for customers without changing the keys', () => {
        expect(permissionGroupTitle('control')).toBe('Console & power');
        expect(permissionGroupTitle('allocation')).toBe('Network');
        expect(permissionGroupTitle('custom_group')).toBe('Custom group');
    });

    it('formats permission labels in sentence case', () => {
        expect(permissionLabel('read-content')).toBe('Read content');
        expect(permissionLabel('sftp')).toBe('Sftp');
    });

    it('counts bots', () => {
        expect(count(1, 'bot', 'bots')).toBe('1 bot');
        expect(count(3, 'bot', 'bots')).toBe('3 bots');
        expect(terms.teamAccess).toBe('Team Access');
    });
});
