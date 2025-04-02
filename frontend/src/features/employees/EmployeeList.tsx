import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"

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

export default function EmployeeList({ token }: Props) {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        console.log("Fetching employees with token:", token);

        fetch("http://localhost:8080/api/employees", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                console.log("Response status:", res.status);
                if (!res.ok) {
                    throw new Error("Failed to fetch employees");
                }
                return res.json();
            })
            .then((data) => {
                console.log("Employee data:", data);
                setEmployees(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err.message);
                setError(err.message);
                setLoading(false);
            });
    }, [token]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
        )
    }

    if (error) return <p className="text-destructive">Error: {error}</p>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Employees</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((emp) => (
                    <Card
                        key={emp.id}
                        className="hover:shadow-md cursor-pointer transition"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                        <CardContent className="p-4 space-y-2">
                            <p className="font-semibold text-lg">
                                {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-muted-foreground text-sm">{emp.email}</p>
                            <p className="text-sm">{emp.role}</p>
                            <p className="text-sm italic">{emp.department?.name ?? "No Dept"}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
