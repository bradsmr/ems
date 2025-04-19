import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {ColumnDef} from "@tanstack/react-table"
import {MoreHorizontal, Shield, User} from "lucide-react"
import {Button} from "@/components/ui/button"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip"
import {DataTable} from "@/components/DataTable.tsx"
import {Badge} from "@/components/ui/badge"
import {useCurrentUser} from "@/hooks/useCurrentUser"
import {API_URL} from "@/utils/api"

type Employee = {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
    jobTitle: string
    department: {
        name: string
    }
    manager?: {
        id: number
        firstName: string
        lastName: string
        email: string
        jobTitle: string
    }
}

type Props = {
    token: string
}

const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: "firstName",
        header: "First Name",
        enableSorting: true,
    },
    {
        accessorKey: "lastName",
        header: "Last Name",
        enableSorting: true,
    },
    {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
        cell: ({row}) => {
            const email = row.getValue("email") as string;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const navigate = useNavigate();
            return (
                <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/employees/${row.original.id}`)}
                >
                    {email}
                </Button>
            )
        }
    },
    {
        accessorKey: "role",
        header: "Role",
        enableSorting: true,
        cell: ({row}) => {
            const role = row.getValue("role") as string;
            return (
                <div className="flex items-center">
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger>
                                {role === "ADMIN" ? (
                                    <Shield className="h-4 w-4 text-primary"/>
                                ) : (
                                    <User className="h-4 w-4 text-muted-foreground"/>
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
        accessorKey: "jobTitle",
        header: "Job Title",
        enableSorting: true,
    },
    {
        accessorKey: "department.name",
        id: "Department",
        header: "Department",
        enableSorting: true,
    },
    {
        id: "manager",
        header: "Manager",
        enableSorting: true,
        accessorFn: (row) => {
            const manager = row.manager;
            if (!manager) return ""; // Empty string for null managers
            // Format as "FirstName LastName" for consistent sorting
            return `${manager.firstName} ${manager.lastName}`;
        },
        cell: ({row}) => {
            const manager = row.original.manager;
            if (!manager) return "-";
            
            const navigate = useNavigate();
            return (
                <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/employees/${manager.id}`)}
                >
                    {`${manager.firstName} ${manager.lastName}`}
                </Button>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({row}) => {
            const employee = row.original
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
                        <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                            View details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

/**
 * EmployeeList component: Displays a list of employees with filtering and sorting capabilities.
 * 
 * This component fetches all employees and implements role-based access control:
 * - ADMIN/MANAGER roles can view all employees
 * - EMPLOYEE role can only view themselves and their manager
 */
export default function EmployeeList({token}: Props) {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const {user} = useCurrentUser()

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${API_URL}/api/employees`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json"
                    }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error("You don't have permission to view employees");
                    }
                    throw new Error(`Failed to fetch employees: ${response.statusText}`);
                }

                const data = await response.json();

                // Filter based on user role
                if (user?.role === "EMPLOYEE") {
                    setEmployees(data.filter((employee: Employee) => employee.id === user.id));
                } else {
                    setEmployees(data);
                }
            } catch (err) {
                console.error("Error fetching employees:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch employees");
            } finally {
                setLoading(false);
            }
        };

        if (token && user) {
            fetchEmployees();
        }
    }, [token, user]);

    const navigate = useNavigate();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm bg-white shadow-sm px-3 py-1">
                        Total Employees: {employees.length}
                    </Badge>
                </div>
                {user?.role === "ADMIN" && (
                    <Button onClick={() => navigate("/employees/new")}>
                        Add Employee
                    </Button>
                )}
            </div>
            <DataTable
                columns={columns}
                data={employees}
                loading={loading}
                error={error}
                searchColumn="firstName"
                searchPlaceholder="Filter by name..."
                pageSize={50}
                columnMapping={{
                    firstName: "First Name",
                    lastName: "Last Name",
                    email: "Email",
                    role: "Role",
                    jobTitle: "Job Title",
                    "department.name": "Department",
                    manager: "Manager",
                    actions: "Actions"
                }}
            />
        </div>
    )
}
