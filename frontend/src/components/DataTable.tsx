"use client"

import {useState} from "react"
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import {Button} from "@/components/ui/button.tsx"
import {Input} from "@/components/ui/input.tsx"
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table.tsx"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select.tsx"
import {Skeleton} from "@/components/ui/skeleton.tsx"

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[]
    data: TData[]
    loading?: boolean
    error?: string | null
    searchColumn?: string
    searchPlaceholder?: string
    pageSize?: number
    columnMapping?: { [key: string]: string }
}

// Internal component for sortable headers
function SortableHeader<TData>({column, title}: { column: Column<TData>, title: string }) {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:cursor-pointer"
        >
            {title}
            {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4"/>
            ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4"/>
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4"/>
            )}
        </Button>
    )
}

export function DataTable<TData>({
                                     columns,
                                     data,
                                     loading = false,
                                     error = null,
                                     searchColumn,
                                     searchPlaceholder = "Search...",
                                     pageSize: initialPageSize = 25,
                                     columnMapping = {},
                                 }: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [currentPageSize, setCurrentPageSize] = useState(initialPageSize)
    const [pageIndex, setPageIndex] = useState(0)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater(table.getState().pagination)
                setPageIndex(newState.pageIndex)
                setCurrentPageSize(newState.pageSize)
            }
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageSize: currentPageSize,
                pageIndex: pageIndex,
            },
        },
    })

    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full"/>
                <Skeleton className="h-8 w-full"/>
                <Skeleton className="h-8 w-full"/>
                <Skeleton className="h-8 w-full"/>
                <Skeleton className="h-8 w-full"/>
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>
    }

    const displayName = (columnId: string) => {
        return columnMapping[columnId] || columnId;
    };

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                {searchColumn && (
                    <Input
                        placeholder={searchPlaceholder}
                        value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {displayName(column.id)}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            header.column.getCanSort() ? (
                                                <SortableHeader
                                                    column={header.column}
                                                    title={displayName(header.column.id)}
                                                />
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            )
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={index % 2 === 0 ? "bg-muted/50" : ""}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="h-16"/>
            {/* Spacer to prevent content from being hidden under pagination */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div
                    className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 text-card-foreground rounded-lg border shadow-sm px-4 py-2">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium">Rows</p>
                            <Select
                                value={`${currentPageSize}`}
                                onValueChange={(value) => {
                                    const size = Number(value);
                                    setCurrentPageSize(size);
                                    table.setPageSize(size);
                                    setPageIndex(0);
                                    window.scrollTo(0, 0);
                                }}
                            >
                                <SelectTrigger className="h-7 w-[76px]">
                                    <SelectValue placeholder={currentPageSize}/>
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[50, 100, 250, 500].map((size) => (
                                        <SelectItem key={size} value={`${size}`}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-center font-medium min-w-[100px]">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft className="h-3.5 w-3.5"/>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft className="h-3.5 w-3.5"/>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-3.5 w-3.5"/>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-3.5 w-3.5"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
