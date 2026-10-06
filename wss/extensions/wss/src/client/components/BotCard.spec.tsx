import { afterEach, expect, it } from 'vitest';
import { cleanup, render, renderHook, screen } from '@testing-library/react';
import { createComponentTestHost, createTestServerCard, type ComponentTestHost } from '@pterodactyl/sdk/testing';
import type { ServerCardModel } from '@pterodactyl/sdk';
import { useReportedBotStatuses } from '../botStates';
import BotCard from './BotCard';

let host: ComponentTestHost<'dashboard.serverCard'> | undefined;
afterEach(() => {
    cleanup();
    host?.dispose();
    host = undefined;
});

function renderCard(model: Partial<ServerCardModel>) {
    host = createComponentTestHost('dashboard.serverCard', {
        model: createTestServerCard(model),
        prefix: 'wss',
    });
    return render(<BotCard {...host.props} />, { wrapper: host.Wrapper });
}

const mib = 1024 * 1024;

it('shows name, status text and resource usage for a running bot', () => {
    renderCard({
        name: 'Support bot',
        address: '10.0.0.5:30001',
        state: {
            kind: 'ready',
            power: 'running',
            cpu: { value: 12.5, limit: 100, alarm: false },
            memory: { value: 128 * mib, limit: 256 * mib, alarm: false },
            disk: { value: 0, limit: 0, alarm: false },
        },
    });

    expect(screen.getByText('Support bot')).toBeTruthy();
    expect(screen.getByText('Online')).toBeTruthy();
    expect(screen.getByText('10.0.0.5:30001')).toBeTruthy();
    expect(screen.getByRole('meter', { name: 'RAM usage' }).getAttribute('aria-valuenow')).toBe('50');
    expect(screen.getByText('No limit')).toBeTruthy();
    expect(screen.queryByRole('meter', { name: 'Disk usage' })).toBeNull();
});

it('explains missing metrics while the bot is unavailable', () => {
    renderCard({ state: { kind: 'unavailable', reason: 'installing' } });

    expect(screen.getByText('Installing')).toBeTruthy();
    expect(screen.getByText(/Resource usage is shown once the bot is available/)).toBeTruthy();
});

it('publishes its status for the dashboard summary and withdraws it on unmount', () => {
    const { unmount } = renderCard({ uuid: 'card-uuid', state: { kind: 'unavailable', reason: 'suspended' } });
    const summary = renderHook(() => useReportedBotStatuses());
    expect(summary.result.current.map((status) => status.key)).toContain('suspended');

    unmount();
    summary.rerender();
    expect(summary.result.current.map((status) => status.key)).not.toContain('suspended');
});
