import { useEffect, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type Table,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/** Extra per-column metadata understood by DataTable. */
export interface ColumnMetaExt {
  icon?: LucideIcon
  align?: 'left' | 'right'
  /** keep this column pinned to the left while scrolling horizontally */
  sticky?: boolean
  /** fixed pixel width */
  width?: number
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData, TValue> extends ColumnMetaExt {}
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any
  getRowId: (row: T) => string
  /** show a leading checkbox column */
  selectable?: boolean
  selection?: RowSelectionState
  onSelectionChange?: (s: RowSelectionState) => void
  onRowClick?: (row: T) => void
  globalFilter?: string
  initialSorting?: SortingState
  pageSize?: number
  /** rendered above the header row, receives the table instance */
  toolbar?: (table: Table<T>) => React.ReactNode
  emptyMessage?: string
  className?: string
}

const SELECT_WIDTH = 40

/**
 * Data table matching the capture: 36px rows, 13px text, muted header with column icons,
 * sticky header, optional sticky leading columns, row checkboxes, sortable headers and
 * a "Rows per page · 1–N of M · Previous / Next" footer.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  selectable,
  selection,
  onSelectionChange,
  onRowClick,
  globalFilter,
  initialSorting = [],
  pageSize = 50,
  toolbar,
  emptyMessage = 'No results.',
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [internalSel, setInternalSel] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize })
  const rowSelection = selection ?? internalSel

  const allColumns = useMemo<ColumnDef<T, any>[]>(() => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!selectable) return columns
    return [
      {
        id: '__select',
        size: SELECT_WIDTH,
        meta: { sticky: true, width: SELECT_WIDTH },
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
        enableSorting: false,
      },
      ...columns,
    ]
  }, [columns, selectable])

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, rowSelection, globalFilter, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      if (onSelectionChange) onSelectionChange(next)
      else setInternalSel(next)
    },
    enableRowSelection: !!selectable,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Reset to first page when the filter changes
  useEffect(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [globalFilter])

  // Compute left offsets for sticky columns
  const stickyLeft = useMemo(() => {
    const offsets: Record<string, number> = {}
    let left = 0
    for (const col of table.getVisibleLeafColumns()) {
      if (!col.columnDef.meta?.sticky) break
      offsets[col.id] = left
      left += col.columnDef.meta.width ?? col.getSize()
    }
    return offsets
  }, [table, allColumns]) // eslint-disable-line react-hooks/exhaustive-deps

  const rows = table.getRowModel().rows
  const total = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize: size } = table.getState().pagination
  const from = total === 0 ? 0 : pageIndex * size + 1
  const to = Math.min(total, (pageIndex + 1) * size)

  const cellStyle = (id: string, width?: number) => {
    const left = stickyLeft[id]
    return {
      width: width,
      minWidth: width,
      maxWidth: width,
      ...(left !== undefined ? { position: 'sticky' as const, left, zIndex: 1 } : {}),
    }
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      {toolbar?.(table)}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-max min-w-full border-separate border-spacing-0 text-[13px]">
          <thead className="sticky top-0 z-[2] bg-background">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const meta = h.column.columnDef.meta
                  const sorted = h.column.getIsSorted()
                  const canSort = h.column.getCanSort()
                  const Icon = meta?.icon
                  return (
                    <th
                      key={h.id}
                      style={cellStyle(h.column.id, meta?.width ?? (h.column.id === '__select' ? SELECT_WIDTH : undefined))}
                      className={cn(
                        'h-9 border-b border-r bg-background px-2 text-left font-normal text-muted-foreground last:border-r-0',
                        h.column.id === '__select' && 'px-3',
                        meta?.align === 'right' && 'text-right',
                      )}
                    >
                      {h.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={cn(
                            'flex w-full items-center gap-1.5 whitespace-nowrap hover:text-foreground',
                            meta?.align === 'right' && 'justify-end',
                          )}
                        >
                          {Icon && <Icon className="size-3.5 shrink-0" />}
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sorted === 'asc' && <ArrowUp className="size-3.5" />}
                          {sorted === 'desc' && <ArrowDown className="size-3.5" />}
                        </button>
                      ) : (
                        <div className={cn('flex items-center gap-1.5 whitespace-nowrap', meta?.align === 'right' && 'justify-end')}>
                          {Icon && <Icon className="size-3.5 shrink-0" />}
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={allColumns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className={cn(
                  'group',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta
                  return (
                    <td
                      key={cell.id}
                      style={cellStyle(cell.column.id, meta?.width ?? (cell.column.id === '__select' ? SELECT_WIDTH : undefined))}
                      className={cn(
                        'h-9 truncate border-b border-r bg-background px-2 last:border-r-0 group-hover:bg-table-background-hover group-data-[state=selected]:bg-neutral-50',
                        cell.column.id === '__select' && 'px-3',
                        meta?.align === 'right' && 'text-right tabular-nums',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* footer */}
      <div className="flex h-11 shrink-0 items-center justify-between border-t px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          Rows per page
          <Select
            className="h-7 w-[68px] text-xs"
            value={String(size)}
            onValueChange={(v) => table.setPageSize(Number(v))}
            options={[10, 25, 50, 100].map((n) => ({ value: String(n), label: String(n) }))}
          />
          <span className="ml-2">
            {from}–{to} of {total}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex h-7 items-center gap-1 rounded-md px-2 hover:bg-accent disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" /> Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex h-7 items-center gap-1 rounded-md px-2 hover:bg-accent disabled:opacity-40"
          >
            Next <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
