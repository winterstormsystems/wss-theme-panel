import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
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

it('asks only for the total and explains an empty account', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({ data: { meta: { pagination: { total: 0 } } } });
    render(<DashboardOverview />, { wrapper: host!.Wrapper });

    expect(await screen.findByText(/There are no bots on this account yet/)).toBeTruthy();
    expect(get).toHaveBeenCalledWith('/api/client', expect.objectContaining({ params: { page: 1, per_page: 1 } }));
});

it('shows a calm error with a retry instead of the raw API error', async () => {
    vi.spyOn(http, 'get').mockRejectedValue(new Error('Request failed with status code 500'));
    render(<DashboardOverview />, { wrapper: host!.Wrapper });

    expect(await screen.findByText(/summary is temporarily unavailable/, {}, { timeout: 4000 })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(screen.queryByText(/status code 500/)).toBeNull();
});
