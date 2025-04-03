import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {
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
import {ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Shield, User} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Skeleton} from "@/components/ui/skeleton.tsx"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {useCurrentUser} from "@/hooks/useCurrentUser"

type Employee = {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
    department: {
        name: string
    }
}

type Props = {
    token: string
}

const SortableHeader = ({column, title}: { column: any, title: string }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:cursor-pointer"
    >
        {title}
        {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
    </Button>
)

const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: "firstName",
        header: ({column}) => <SortableHeader column={column} title="First Name" />,
    },
    {
        accessorKey: "lastName",
        header: ({column}) => <SortableHeader column={column} title="Last Name" />,
    },
    {
        accessorKey: "email",
        header: ({column}) => <SortableHeader column={column} title="Email" />,
        cell: ({row}) => {
            const email = row.getValue("email") as string;
            const navigate = useNavigate();
            return (
                <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-primary"
                    onClick={() => navigate(`/employees/${row.original.id}`)}
                >
                    {email}
                </Button>
            )
        }
    },
    {
        accessorKey: "role",
        header: ({column}) => <SortableHeader column={column} title="Role" />,
        cell: ({row}) => {
            const role = row.getValue("role") as string;
            return (
                <div className="flex items-center">
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger>
                                {role === "ADMIN" ? (
                                    <Shield className="h-4 w-4 text-primary" />
                                ) : (
                                    <User className="h-4 w-4 text-muted-foreground" />
                                )}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="capitalize">{role.toLowerCase()}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
        },
    },
    {
        accessorKey: "department.name",
        header: ({column}) => <SortableHeader column={column} title="Department" />,
    },
    {
        id: "actions",
        cell: ({row}) => {
            const employee = row.original
            const navigate = useNavigate()

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                            View details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function EmployeeList({token}: Props) {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [pageSize, setPageSize] = useState(25)
    const navigate = useNavigate()
    const { user } = useCurrentUser()

    useEffect(() => {
        fetch("http://localhost:8080/api/employees", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch employees")
                }
                return res.json()
            })
            .then((data) => {
                setEmployees(data)
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [token])

    const table = useReactTable({
        data: employees,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination: {
                pageSize: pageSize,
                pageIndex: 0,
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

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter by name..."
                    value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("firstName")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className="flex items-center space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    const displayName = {
                                        firstName: "First Name",
                                        lastName: "Last Name",
                                        email: "Email",
                                        role: "Role",
                                        department_name: "Department",
                                        actions: "Actions"
                                    }[column.id] || column.id;

                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            {displayName}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {user?.role === "ADMIN" && (
                        <Button onClick={() => navigate("/employees/new")}>
                            Add Employee
                        </Button>
                    )}
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="hover:cursor-pointer">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={
                                        index === 0
                                            ? "bg-primary/5"
                                            : index % 2 === 0
                                            ? "bg-muted/50"
                                            : ""
                                    }
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
            <div className="flex items-center gap-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()} · Total {employees.length} records
                </div>
                <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                        <SelectItem value="250">250 per page</SelectItem>
                        <SelectItem value="500">500 per page</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
