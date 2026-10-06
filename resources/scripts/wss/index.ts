// WSS bridge (Winter Storm Systems). Not part of upstream. Kept self-contained (no imports from
// /wss) because SDK-exported components (PageContentBlock) import it and the SDK type
// generation compiles with rootDir resources/scripts. See wss/docs/CORE_PATCHES.md.
import { type ComponentType, createContext, type ReactNode, useContext } from 'react';

/** Core primitives the WSS shell can present differently (see useWssPrimitive). */
export type WssPrimitiveName = 'DataTable' | 'ListToolbar' | 'ActivityLogEntry' | 'ScreenBlock' | 'ContentBox';

// Props are checked at the seam through useWssPrimitive<P>(); the registry itself is untyped.
export type WssPrimitives = Partial<Record<WssPrimitiveName, ComponentType<never>>>;

export interface WssShellContextValue {
    /** Sidebar element where area layouts portal their section navigation (bot / account). */
    sectionTarget: HTMLElement | null;
    /** Closes the mobile navigation drawer (no-op on desktop). */
    closeNavigation: () => void;
    /** WSS presentations of core primitives, provided by the shell (never imported statically). */
    primitives?: WssPrimitives;
    /** Presentation wording for core-authored text (wss/panel/wording.ts). */
    wording?: WssWording;
}

export interface WssWording {
    text: (value: string) => string;
    node: (value: ReactNode) => ReactNode;
}

export const WssShellContext = createContext<WssShellContextValue | null>(null);

/** True inside the WSS customer shell (customer routes); false in admin and auth pages. */
export function useInWssShell(): boolean {
    return useContext(WssShellContext) !== null;
}

export function useWssShell(): WssShellContextValue | null {
    return useContext(WssShellContext);
}

/**
 * The WSS presentation of a core primitive while inside the shell, otherwise undefined.
 * Seams render it with their own props: `const Wss = useWssPrimitive<Props>('DataTable')`.
 */
export function useWssPrimitive<P>(name: WssPrimitiveName): ComponentType<P> | undefined {
    return useContext(WssShellContext)?.primitives?.[name] as ComponentType<P> | undefined;
}

/** Presentation wording while inside the WSS shell, otherwise undefined (core text unchanged). */
export function useWssWording(): WssWording | undefined {
    return useContext(WssShellContext)?.wording;
}
