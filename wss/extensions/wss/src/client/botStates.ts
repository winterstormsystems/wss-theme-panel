import { useSyncExternalStore } from 'react';
import type { BotStatus } from './status';

/**
 * Statuses reported by the bot cards currently mounted on the dashboard.
 *
 * The SDK has no hook for the account's server list, but each `dashboard.serverCard`
 * replacement receives the panel's own live state. Cards publish it here so the dashboard
 * overview can summarise the bots on screen without polling anything itself.
 */
const states = new Map<string, BotStatus>();
const listeners = new Set<() => void>();
let snapshot: readonly BotStatus[] = [];

function emit() {
    snapshot = [...states.values()];
    listeners.forEach((listener) => listener());
}

export function reportBotStatus(uuid: string, status: BotStatus): () => void {
    if (states.get(uuid) !== status) {
        states.set(uuid, status);
        emit();
    }
    return () => {
        if (states.delete(uuid)) emit();
    };
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useReportedBotStatuses(): readonly BotStatus[] {
    return useSyncExternalStore(
        subscribe,
        () => snapshot,
        () => snapshot
    );
}
