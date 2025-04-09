import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    active: boolean;
    departmentId: number;
    managerId?: number;
};

type Department = {
    id: number;
    name: string;
};

type Manager = {
    id: number;
    firstName: string;
    lastName: string;
};

type Props = {
    token: string;
};

export default function EmployeeDetails({ token }: Props) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useCurrentUser();
    const isNewEmployee = id === 'new';
    
    const [employee, setEmployee] = useState<Employee>({
        id: 0,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        active: true,
        departmentId: 0,
        managerId: undefined
    });
    
    const [departments, setDepartments] = useState<Department[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(!isNewEmployee);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    
    // Determine if the current user can edit this employee
    const canEdit = user?.role === 'ADMIN' || 
                   (user?.role === 'MANAGER' && employee.managerId === user.id) || 
                   (user?.id === employee.id);
                   
    // Determine if the current user can edit all fields or just password
    const canEditAllFields = user?.role === 'ADMIN';
    
    // Determine if the current user can delete this employee
    const canDelete = user?.role === 'ADMIN' && user.id !== employee.id;

    // Check if user has permission to view this employee
    const canView = () => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        if (user.id === Number(id)) return true; // Self
        if (user.id === employee.managerId) return true; // Manager of this employee
        if (employee.managerId === user.id) return true; // This is user's manager
        
        // Check if in same department (would need to fetch user's department)
        return false;
    };
    
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/departments', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setDepartments(response.data);
            } catch (err) {
                console.error('Error fetching departments:', err);
                setError('Failed to load departments');
            }
        };
        
        const fetchManagers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/employees?role=MANAGER,ADMIN', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setManagers(response.data.map((manager: any) => ({
                    id: manager.id,
                    firstName: manager.firstName,
                    lastName: manager.lastName
                })));
            } catch (err) {
                console.error('Error fetching managers:', err);
                setError('Failed to load managers');
            }
        };
        
        const fetchEmployee = async () => {
            if (isNewEmployee) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(`http://localhost:8080/api/employees/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setEmployee({
                    ...response.data,
                    password: '', // Don't display actual password
                    departmentId: response.data.department?.id || null,
                    managerId: response.data.manager?.id || null
                });
                
                // Check if user has permission to view this employee
                if (!canView()) {
                    setError("You don't have permission to view this employee");
                    navigate('/employees');
                }
            } catch (err) {
                console.error('Error fetching employee:', err);
                setError('Failed to load employee details');
                navigate('/employees');
            } finally {
                setLoading(false);
            }
        };
        
        if (token && user) {
            fetchDepartments();
            fetchManagers();
            fetchEmployee();
        }
    }, [id, token, user, isNewEmployee, navigate]);
    
    const validateForm = () => {
        const errors: {[key: string]: string} = {};
        
        if (!employee.firstName.trim()) {
            errors.firstName = 'First name is required';
        }
        
        if (!employee.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }
        
        if (!employee.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(employee.email)) {
            errors.email = 'Email is invalid';
        }
        
        // Password is required for new employees
        if (isNewEmployee && !employee.password.trim()) {
            errors.password = 'Password is required for new employees';
        } else if (employee.password && employee.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        if (!employee.departmentId) {
            errors.departmentId = 'Department is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setSaving(true);
        setError(null);
        
        try {
            // Format the payload according to what the backend expects
            const payload = {
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                password: employee.password,
                role: employee.role,
                active: employee.active,
                // The backend expects a department object with an id
                department: {
                    id: employee.departmentId
                },
                // Manager is just the ID
                managerId: employee.managerId || null
            };
            
            console.log('Sending payload:', payload);
            
            if (isNewEmployee) {
                await axios.post('http://localhost:8080/api/employees', payload, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                toast.success('Employee created successfully', {
                    description: 'The new employee account has been created.',
                    duration: 5000
                });
                navigate("/employees");
            } else {
                await axios.put(`http://localhost:8080/api/employees/${id}`, payload, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                toast.success('Employee updated successfully', {
                    description: 'The employee information has been updated.',
                    duration: 5000
                });
                navigate("/employees");
            }
        } catch (error) {
            console.error("Error saving employee:", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error("Response data:", error.response.data);
                toast.error('Error saving employee', {
                    description: error.response.data?.message || "An unknown error occurred",
                    duration: 8000
                });
            } else {
                toast.error('Error saving employee', {
                    description: "Could not connect to the server",
                    duration: 8000
                });
            }
        } finally {
            setSaving(false);
        }
    };
    
    const handleDelete = async () => {
        setError(null);
        
        try {
            await axios.delete(`http://localhost:8080/api/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Employee deleted successfully', {
                description: 'The employee has been removed from the system.',
                duration: 5000
            });
            navigate("/employees");
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error('Error deleting employee', {
                description: axios.isAxiosError(error) ? error.response?.data?.message : "An unknown error occurred",
                duration: 8000
            });
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmployee(prev => ({ ...prev, [name]: value }));
        
        // Clear field-specific error when user types
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    const handleSelectChange = (name: string, value: string) => {
        setEmployee(prev => ({ ...prev, [name]: value === 'null' ? null : Number(value) }));
        
        // Clear field-specific error when user selects
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    if (loading) {
        return <div className="text-center py-10">Loading employee details...</div>;
    }
    
    if (error && !isNewEmployee) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }
    
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isNewEmployee ? 'Create Employee' : 'Employee Details'}</CardTitle>
                <CardDescription>
                    {isNewEmployee 
                        ? 'Add a new employee to the system' 
                        : 'View and manage employee information'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={employee.firstName}
                                onChange={handleInputChange}
                                disabled={!canEditAllFields}
                                className={formErrors.firstName ? 'border-red-500' : ''}
                            />
                            {formErrors.firstName && (
                                <p className="text-sm text-red-500">{formErrors.firstName}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={employee.lastName}
                                onChange={handleInputChange}
                                disabled={!canEditAllFields}
                                className={formErrors.lastName ? 'border-red-500' : ''}
                            />
                            {formErrors.lastName && (
                                <p className="text-sm text-red-500">{formErrors.lastName}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={employee.email}
                            onChange={handleInputChange}
                            disabled={!canEditAllFields}
                            className={formErrors.email ? 'border-red-500' : ''}
                        />
                        {formErrors.email && (
                            <p className="text-sm text-red-500">{formErrors.email}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {isNewEmployee ? 'Password' : 'New Password'}
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={employee.password}
                            onChange={handleInputChange}
                            disabled={!canEdit}
                            placeholder={!isNewEmployee ? "Leave blank to keep current password" : ""}
                            className={formErrors.password ? 'border-red-500' : ''}
                        />
                        {formErrors.password && (
                            <p className="text-sm text-red-500">{formErrors.password}</p>
                        )}
                    </div>
                    
                    {canEditAllFields && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={employee.role}
                                    onValueChange={(value) => setEmployee(prev => ({ ...prev, role: value }))}
                                    disabled={!canEditAllFields}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="departmentId">Department</Label>
                                <Select
                                    value={employee.departmentId ? employee.departmentId.toString() : ''}
                                    onValueChange={(value) => handleSelectChange('departmentId', value)}
                                    disabled={!canEditAllFields}
                                >
                                    <SelectTrigger className={formErrors.departmentId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.departmentId && (
                                    <p className="text-sm text-red-500">{formErrors.departmentId}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="managerId">Manager</Label>
                                <Select
                                    value={employee.managerId ? employee.managerId.toString() : 'null'}
                                    onValueChange={(value) => handleSelectChange('managerId', value)}
                                    disabled={!canEditAllFields}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">No Manager</SelectItem>
                                        {managers
                                            .filter(manager => manager.id !== employee.id) // Can't be own manager
                                            .map(manager => (
                                                <SelectItem key={manager.id} value={manager.id.toString()}>
                                                    {manager.firstName} {manager.lastName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="active">Status</Label>
                                <Select
                                    value={employee.active ? 'true' : 'false'}
                                    onValueChange={(value) => setEmployee(prev => ({ ...prev, active: value === 'true' }))}
                                    disabled={!canEditAllFields}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </CardContent>
                
                <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => navigate('/employees')}
                        >
                            Cancel
                        </Button>
                        
                        {canDelete && !isNewEmployee && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" type="button">
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the employee
                                            and remove their data from the system.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    
                    {canEdit && (
                        <Button 
                            type="submit" 
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : (isNewEmployee ? 'Create' : 'Save Changes')}
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}
