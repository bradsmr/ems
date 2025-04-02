import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: { name: string };
};

type Props = {
    token: string;
};

export default function EmployeeDetails({ token }: Props) {
    const { id } = useParams();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`http://localhost:8080/api/employees/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch employee');
                }
                return res.json();
            })
            .then(setEmployee)
            .catch(err => setError(err.message));
    }, [id, token]);

    if (error) return <p>Error: {error}</p>;
    if (!employee) return <p>Loading...</p>;

    return (
        <div>
            <h2>{employee.firstName} {employee.lastName}</h2>
            <p>Email: {employee.email}</p>
            <p>Role: {employee.role}</p>
            <p>Department: {employee.department?.name || 'No Department'}</p>
        </div>
    );
}
