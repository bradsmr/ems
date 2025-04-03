import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {Skeleton} from "@/components/ui/skeleton"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"

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

export default function EmployeeList({token}: Props) {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

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

    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({length: 6}).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md"/>
                ))}
            </div>
        )
    }

    if (error) return <p className="text-destructive">Error: {error}</p>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Employees</h2>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Department</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((emp) => (
                            <TableRow
                                key={emp.id}
                                className="cursor-pointer hover:bg-muted transition-colors"
                                onClick={() => navigate(`/employees/${emp.id}`)}
                            >
                                <TableCell className="font-medium">
                                    {emp.firstName} {emp.lastName}
                                </TableCell>
                                <TableCell>{emp.email}</TableCell>
                                <TableCell>{emp.role}</TableCell>
                                <TableCell>{emp.department?.name ?? "No Department"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
