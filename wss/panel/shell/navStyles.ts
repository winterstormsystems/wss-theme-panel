/** Shared classes for WSS sidebar links (primary and section navigation). */
export const navLinkClass = [
    'group flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium no-underline',
    'text-muted-foreground transition-colors duration-150',
    'hover:bg-secondary hover:text-foreground',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'data-[status=active]:bg-[var(--wss-surface-selected)] data-[status=active]:text-foreground',
    'data-[status=active]:shadow-[inset_3px_0_0_var(--primary)]',
].join(' ');

export const navIconClass = 'size-4 shrink-0 text-muted-foreground group-data-[status=active]:text-primary';

export const navSectionLabelClass =
    'px-3 pb-1.5 pt-5 text-[0.6875rem] font-semibold [text-transform:uppercase] tracking-wider text-muted-foreground';
