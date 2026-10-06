import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createExtensionTestHost, type ExtensionTestHost } from '@pterodactyl/sdk/testing';
import { http } from '@pterodactyl/sdk';
import DashboardOverview from './DashboardOverview';

let host: ExtensionTestHost | undefined;
beforeEach(() => {
    host = createExtensionTestHost({ extensionId: 'wss', prefix: 'wss' });
});
afterEach(() => {
    cleanup();
    host?.dispose();
    host = undefined;
    vi.restoreAllMocks();
});

it('asks only for the total and shows the summary', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({ data: { meta: { pagination: { total: 3 } } } });
    render(<DashboardOverview />, { wrapper: host!.Wrapper });

    expect(await screen.findByText('3')).toBeTruthy();
    expect(screen.getByText('Online')).toBeTruthy();
    expect(get).toHaveBeenCalledWith('/api/client', expect.objectContaining({ params: { page: 1, per_page: 1 } }));
});

it('renders nothing for an empty account (the empty state speaks for itself)', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({ data: { meta: { pagination: { total: 0 } } } });
    const { container } = render(<DashboardOverview />, { wrapper: host!.Wrapper });

    await waitFor(() => expect(container.querySelector('section')).toBeNull());
});

it('shows a calm error with a retry instead of the raw API error', async () => {
    vi.spyOn(http, 'get').mockRejectedValue(new Error('Request failed with status code 500'));
    render(<DashboardOverview />, { wrapper: host!.Wrapper });

    expect(await screen.findByText(/total is temporarily unavailable/, {}, { timeout: 4000 })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.queryByText(/status code 500/)).toBeNull();
});
