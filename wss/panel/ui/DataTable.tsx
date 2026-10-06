import { isValidElement, type ReactNode } from 'react';
import { flexRender, type Header, type RowData, type Table } from '@tanstack/react-table';
import { Empty, EmptyDescription } from '@/components/ui/empty';
import { cn } from '@/lib/cn';
import { isString } from '@/lib/objects';
import { rewordNode } from '../wording';

interface Props<TData extends RowData> {
    table: Table<TData>;
    emptyState: ReactNode;
    className?: string;
    tableClassName?: string;
    isFetching?: boolean;
}

// Core column meta carries viewport rules ("hidden md:table-cell") written for its scrolling
// table. The WSS list decides visibility by its own container width instead, so drop them.
const viewportVisibility = /(^|\s)(?:[a-z0-9]+:)?(?:hidden|table-cell)(?=\s|$)/g;
const keepLayout = (className?: string): string | undefined => className?.replace(viewportVisibility, ' ').trim();

/** Plain text of a column header, used as the field label in the stacked (narrow) layout. */
function headerLabel<TData extends RowData>(header: Header<TData, unknown>): string {
    const definition = header.column.columnDef.header;
    if (isString(definition)) return definition;
    if (definition instanceof Function) {
        // Core headers are small render functions returning <DataTableColumnHeader title=…/>.
        const rendered: unknown = definition(header.getContext());
        if (isString(rendered)) return rendered;
        if (isValidElement<{ title?: unknown; children?: unknown }>(rendered)) {
            const { title, children } = rendered.props;
            if (isString(title)) return title;
            if (isString(children)) return children;
        }
    }
    return header.column.id.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * WSS presentation of core's DataTable (seam in components/elements/table/DataTable.tsx).
 * Same table instance, columns, cells and actions; only the layout differs: a table when the
 * list is wide, labelled stacked rows when it is narrow (container query), so no page needs
 * horizontal scrolling. Empty states pass through the presentation wording.
 */
export default function DataTable<TData extends RowData>({
    table,
    emptyState,
    className,
    tableClassName,
    isFetching = false,
}: Props<TData>) {
    const rows = table.getRowModel().rows;
    const headers = table.getHeaderGroups().at(-1)?.headers ?? [];
    const labels = new Map(headers.map((header) => [header.column.id, headerLabel(header)]));
    const firstColumn = headers[0]?.column.id;

    return (
        <div
            data-wss-list
            aria-busy={isFetching}
            className={cn('@container overflow-hidden rounded-lg border border-border bg-card', className)}
        >
            {rows.length === 0 ? (
                <div className={cn('flex transition-opacity', isFetching && 'opacity-55')}>
                    {isString(emptyState) ? (
                        <Empty className={'gap-3 p-8'}>
                            <EmptyDescription>{rewordNode(emptyState)}</EmptyDescription>
                        </Empty>
                    ) : (
                        rewordNode(emptyState)
                    )}
                </div>
            ) : (
                <table className={cn('w-full border-collapse text-left text-sm @max-2xl:block', tableClassName)}>
                    <thead className={'border-b border-border @max-2xl:sr-only'}>
                        {table.getHeaderGroups().map((group) => (
                            <tr key={group.id}>
                                {group.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        scope={'col'}
                                        className={cn(
                                            'h-10 whitespace-nowrap px-4 text-xs font-medium text-muted-foreground',
                                            keepLayout(header.column.columnDef.meta?.headerClassName)
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody
                        className={cn(
                            'divide-y divide-border transition-opacity @max-2xl:block',
                            isFetching && 'opacity-55'
                        )}
                    >
                        {rows.map((row) => (
                            <tr
                                key={row.id}
                                className={
                                    'transition-colors hover:bg-secondary/40 @max-2xl:flex @max-2xl:flex-col @max-2xl:gap-2 @max-2xl:p-4'
                                }
                            >
                                {row.getVisibleCells().map((cell) => {
                                    const id = cell.column.id;
                                    const isFirst = id === firstColumn;
                                    const isActions = id === 'actions';
                                    return (
                                        <td
                                            key={cell.id}
                                            className={cn(
                                                'px-4 py-3 align-middle text-foreground',
                                                keepLayout(cell.column.columnDef.meta?.cellClassName),
                                                '@max-2xl:flex @max-2xl:w-auto @max-2xl:min-w-0 @max-2xl:items-center @max-2xl:gap-4 @max-2xl:p-0 @max-2xl:text-left',
                                                isFirst && '@max-2xl:font-medium',
                                                isActions
                                                    ? '@max-2xl:justify-end @max-2xl:border-t @max-2xl:border-border @max-2xl:pt-3'
                                                    : '@max-2xl:justify-between'
                                            )}
                                        >
                                            {!isFirst && !isActions && (
                                                <span className={'shrink-0 text-xs text-muted-foreground @2xl:hidden'}>
                                                    {labels.get(id)}
                                                </span>
                                            )}
                                            <div className={cn('min-w-0', !isFirst && '@max-2xl:text-right')}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
