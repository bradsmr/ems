import { useEffect, useState } from 'react';

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: {
        name: string;
    };
};

type Props = {
    token: string;
};

export default function EmployeeList({ token }: Props) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://localhost:8080/api/employees', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch employees');
                }
                return res.json();
            })
            .then(setEmployees)
            .catch(err => setError(err.message));
    }, [token]);

    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Employees</h2>
            <ul>
                {employees.map(emp => (
                    <li key={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.email} - {emp.role} ({emp.department?.name || 'No Department'})
                    </li>
                ))}
            </ul>
        </div>
    );
}
