import { describe, expect, it } from 'vitest';
import { botStatus, formatBytes, formatPercent, usageRatio, usageTone } from './status';
import { count, lower } from './terminology';

const metric = { value: 0, limit: 0, alarm: false };

describe('botStatus', () => {
    it.each([
        ['running', 'Online', 'success'],
        ['starting', 'Starting', 'warning'],
        ['stopping', 'Stopping', 'warning'],
        ['stopped', 'Offline', 'danger'],
        ['offline', 'Offline', 'danger'],
    ] as const)('maps power state %s to %s', (power, label, tone) => {
        const status = botStatus({ kind: 'ready', power, cpu: metric, memory: metric, disk: metric });
        expect([status.label, status.tone]).toEqual([label, tone]);
    });

    it.each([
        ['installing', 'Installing', 'warning'],
        ['transferring', 'Transferring', 'warning'],
        ['restoring-backup', 'Restoring backup', 'warning'],
        ['maintenance', 'Maintenance', 'warning'],
        ['suspended', 'Suspended', 'danger'],
        ['connection-error', 'Unreachable', 'danger'],
        ['unavailable', 'Unavailable', 'neutral'],
    ] as const)('maps unavailable reason %s to %s', (reason, label, tone) => {
        const status = botStatus({ kind: 'unavailable', reason });
        expect([status.label, status.tone]).toEqual([label, tone]);
    });

    it('reports loading as a neutral transitional state', () => {
        expect(botStatus({ kind: 'loading' })).toMatchObject({
            label: 'Checking',
            tone: 'neutral',
            transitional: true,
        });
    });
});

describe('usage', () => {
    it('treats a zero limit as unlimited', () => {
        expect(usageRatio(500, 0)).toBeNull();
        expect(usageTone(null, false)).toBe('neutral');
    });

    it('clamps and bands usage, and honours the panel alarm flag', () => {
        expect(usageRatio(150, 100)).toBe(1);
        expect(usageTone(0.5, false)).toBe('neutral');
        expect(usageTone(0.8, false)).toBe('warning');
        expect(usageTone(0.95, false)).toBe('danger');
        expect(usageTone(0.1, true)).toBe('danger');
    });
});

describe('formatting', () => {
    it('formats binary sizes like the panel', () => {
        expect(formatBytes(0)).toBe('0 B');
        expect(formatBytes(408)).toBe('408 B');
        expect(formatBytes(256 * 1024 ** 2)).toBe('256 MiB');
        expect(formatBytes(1024 ** 3)).toBe('1 GiB');
        expect(formatBytes(10.7 * 1024 ** 2)).toBe('10.7 MiB');
    });

    it('formats CPU percentages', () => {
        expect(formatPercent(0)).toBe('0%');
        expect(formatPercent(12.34)).toBe('12.3%');
        expect(formatPercent(250)).toBe('250%');
    });
});

describe('terminology', () => {
    it('pluralises through the central vocabulary', () => {
        expect(count(1, 'bot', 'bots')).toBe('1 bot');
        expect(count(3, 'bot', 'bots')).toBe('3 bots');
        expect(lower('bots')).toBe('bots');
    });
});
