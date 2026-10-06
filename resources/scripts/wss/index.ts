// WSS bridge (Winter Storm Systems). Not part of upstream. Kept self-contained (no imports from
// /wss) because SDK-exported components (PageContentBlock) import it and the SDK type
// generation compiles with rootDir resources/scripts. See wss/docs/CORE_PATCHES.md.
import { createContext, useContext } from 'react';

export interface WssShellContextValue {
    /** Sidebar element where area layouts portal their section navigation (bot / account). */
    sectionTarget: HTMLElement | null;
    /** Closes the mobile navigation drawer (no-op on desktop). */
    closeNavigation: () => void;
}

export const WssShellContext = createContext<WssShellContextValue | null>(null);

/** True inside the WSS customer shell (customer routes); false in admin and auth pages. */
export function useInWssShell(): boolean {
    return useContext(WssShellContext) !== null;
}

export function useWssShell(): WssShellContextValue | null {
    return useContext(WssShellContext);
}
