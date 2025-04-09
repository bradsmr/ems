import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {ColumnDef} from "@tanstack/react-table"
import {MoreHorizontal} from "lucide-react"
import {Button} from "@/components/ui/button"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {Badge} from "@/components/ui/badge"
import {DataTable} from "@/components/DataTable"
import {useCurrentUser} from "@/hooks/useCurrentUser"

type Department = {
    id: number
    name: string
    description: string
}

type Props = {
    token: string
}

const columns: ColumnDef<Department>[] = [
    {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        cell: ({row}) => {
            const name = row.getValue("name") as string;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const navigate = useNavigate();
            return (
                <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/departments/${row.original.id}`)}
                >
                    {name}
                </Button>
            )
        }
    },
    {
        accessorKey: "description",
        header: "Description",
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({row}) => {
            const department = row.original
            // eslint-disable-next-line react-hooks/rules-of-hooks
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
                        <DropdownMenuItem onClick={() => navigate(`/departments/${department.id}`)}>
                            View details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export function DepartmentList({token}: Props) {
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const {user} = useCurrentUser()

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/departments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`)
                }

                const data = await response.json()
                setDepartments(data)
            } catch (err) {
                console.error("Error fetching departments:", err)
                setError(err instanceof Error ? err.message : "Failed to fetch departments")
            } finally {
                setLoading(false)
            }
        }

        if (token && user) {
            fetchDepartments()
        }
    }, [token, user])

    const navigate = useNavigate()

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm bg-white shadow-sm px-3 py-1">
                        Total Departments: {departments.length}
                    </Badge>
                </div>
                {user?.role === "ADMIN" && (
                    <Button onClick={() => navigate("/departments/new")}>
                        Add Department
                    </Button>
                )}
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <DataTable
                    columns={columns}
                    data={departments}
                    loading={loading}
                    error={error}
                    searchColumn="name"
                    searchPlaceholder="Filter by name..."
                    pageSize={50}
                    columnMapping={{
                        name: "Name",
                        description: "Description",
                        actions: "Actions"
                    }}
                />
            </div>
        </div>
    )
}
