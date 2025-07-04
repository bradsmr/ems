import { useEffect, useState, useRef } from 'react';
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
import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { API_URL } from '../../utils/api';

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    active: boolean;
    jobTitle: string;
    departmentId: number;
    managerId?: number;
};

type Department = {
    id: number;
    name: string;
};

type Manager = {
    id: number;
    name: string;
};

type Props = {
    token: string;
};

/**
 * EmployeeDetails component: Handles employee details, including editing and deleting.
 * 
 * This component fetches employee data, departments, and managers, and allows authorized users to edit employee information.
 * It also includes a delete functionality for authorized users.
 */
export default function EmployeeDetails({ token }: Props) {
    const { id } = useParams<{ id: string }>();
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
        jobTitle: '',
        departmentId: 0,
        managerId: undefined
    });
    
    const [departments, setDepartments] = useState<Department[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(!isNewEmployee);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [initialEmployee, setInitialEmployee] = useState<Employee | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [managerName, setManagerName] = useState<string | null>(null);
    
    // Ref to track if data has been loaded
    const dataLoadedRef = useRef(false);
    
    // Permission checks
    const canEdit = user?.role === 'ADMIN' || 
                   user?.id === Number(id) || 
                   user?.id === employee.managerId;
    
    // Admin or self can edit all fields, managers can only edit some fields
    const canEditAllFields = user?.role === 'ADMIN' || (user?.id === Number(id) && user?.role !== 'EMPLOYEE');
    
    // Only admins can delete employees
    const canDelete = user?.role === 'ADMIN' && user?.id !== Number(id);
    
    // Check if user has permission to view this employee
    const canView = () => {
        if (user?.role === 'ADMIN') return true;
        if (user?.role === 'GUEST') return true;
        if (user?.id === Number(id)) return true; // self
        if (user?.id === employee.managerId) return true; // manager of employee
        if (employee.managerId === user?.id) return true; // employee is user's manager
        return false;
    };
    
    
    useEffect(() => {
        // Skip if no token or user, or if data has already been loaded
        if (!token || !user || dataLoadedRef.current) return;
        
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/departments`, {
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
                const response = await axios.get(`${API_URL}/api/employees`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const managersList = response.data.map((manager: any) => ({
                    id: manager.id,
                    name: `${manager.firstName} ${manager.lastName}`
                }));
                setManagers(managersList);
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
                const response = await axios.get(`${API_URL}/api/employees/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Create a properly formatted employee object from the API response
                const employeeData = {
                    ...response.data,
                    password: '', // Don't display actual password
                    departmentId: response.data.department?.id || null,
                    managerId: response.data.manager?.id || null
                };
                
                // If the employee has a manager that's not in the managers list, add it
                if (response.data.manager && !managers.some(m => m.id === response.data.manager.id)) {
                    const manager = response.data.manager;
                    const newManager = {
                        id: manager.id,
                        name: `${manager.firstName} ${manager.lastName}`
                    };
                    setManagers(prev => {
                        // Check if manager already exists in the list to prevent duplicates
                        if (prev.some(m => m.id === manager.id)) {
                            return prev;
                        }
                        return [...prev, newManager];
                    });
                    // Store manager name for display
                    setManagerName(`${manager.firstName} ${manager.lastName}`);
                }
                
                setEmployee(employeeData);
                setInitialEmployee(JSON.parse(JSON.stringify(employeeData))); // Deep copy for comparison
                setHasChanges(false);
                
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
        
        // Load data only once
        const loadData = async () => {
            await Promise.all([
                fetchDepartments(),
                fetchManagers()
            ]);
            await fetchEmployee();
            // Mark data as loaded
            dataLoadedRef.current = true;
        };
        
        loadData();
        
    // Only re-run if these dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, token, user, isNewEmployee]);
    
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
        
        // Prevent admin from setting themselves inactive
        if (user?.role === 'ADMIN' && user?.id === Number(id) && !employee.active) {
            errors.active = 'Admins cannot set themselves as inactive';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // Format payload for API request
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setSaving(true);
        
        try {
            // Create payload structure for backend API
            const payload = {
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                password: employee.password || null,
                role: employee.role,
                active: employee.active,
                jobTitle: employee.jobTitle,
                department: {
                    id: employee.departmentId
                },
                managerId: employee.managerId || null
            };
            
            if (isNewEmployee) {
                await axios.post(`${API_URL}/api/employees`, payload, {
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
                await axios.put(`${API_URL}/api/employees/${id}`, payload, {
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
            // Consolidate error handling to prevent double toasts
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
            await axios.delete(`${API_URL}/api/employees/${id}`, {
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
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Clear form error for this field when user makes changes
        if (formErrors[name]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
        
        setEmployee(prev => {
            const updatedEmployee = { ...prev, [name]: value };
            
            // Track changes for conditional update button
            if (initialEmployee && !isNewEmployee) {
                const normalizedInitial = { ...initialEmployee } as any;
                const normalizedCurrent = { ...updatedEmployee } as any;
                
                // Convert values to appropriate types for comparison
                if (name === 'active') {
                    normalizedCurrent.active = value === 'true';
                }
                if (name === 'departmentId' || name === 'managerId') {
                    normalizedCurrent[name] = value ? Number(value) : undefined;
                }
                
                // Determine if any fields have changed
                const hasAnyChanges = Object.keys(normalizedCurrent).some(key => {
                    // Skip empty password field
                    if (key === 'password' && !normalizedCurrent[key]) return false;
                    
                    // Skip id comparison
                    if (key === 'id') return false;
                    
                    return JSON.stringify(normalizedCurrent[key]) !== 
                           JSON.stringify(normalizedInitial[key]);
                });
                
                setHasChanges(hasAnyChanges);
            } else if (isNewEmployee) {
                // For new employees, check required fields
                const requiredFields = ['firstName', 'lastName', 'email', 'password'];
                const allRequiredFilled = requiredFields.every(field => 
                    updatedEmployee[field as keyof Employee] && 
                    String(updatedEmployee[field as keyof Employee]).trim() !== ''
                );
                setHasChanges(allRequiredFilled);
            }
            
            return updatedEmployee;
        });
    };
    
    const handleSelectChange = (name: string, value: string) => {
        // Clear form error for this field when user makes changes
        if (formErrors[name]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
        
        setEmployee(prev => {
            // Special handling for managerId
            let updatedValue;
            if (name === 'managerId') {
                updatedValue = value === 'none' ? undefined : value ? Number(value) : undefined;
            } else {
                updatedValue = name === 'departmentId' 
                    ? (value ? Number(value) : undefined) 
                    : name === 'active' 
                        ? value === 'true' 
                        : value;
            }
            
            const updatedEmployee = { ...prev, [name]: updatedValue };
            
            // Track changes for conditional update button
            if (initialEmployee && !isNewEmployee) {
                const normalizedInitial = { ...initialEmployee } as any;
                const normalizedCurrent = { ...updatedEmployee } as any;
                
                const hasAnyChanges = Object.keys(updatedEmployee).some(key => {
                    // Skip empty password field
                    if (key === 'password' && !normalizedCurrent[key]) return false;
                    
                    // Skip id comparison
                    if (key === 'id') return false;
                    
                    return JSON.stringify(normalizedCurrent[key]) !== 
                           JSON.stringify(normalizedInitial[key]);
                });
                
                setHasChanges(hasAnyChanges);
            }
            
            return updatedEmployee;
        });
    };
    
    const handleBack = () => {
        navigate('/employees');
    };
    
    if (loading) {
        return <div className="text-center py-10">Loading employee details...</div>;
    }
    
    if (error && !isNewEmployee) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBack}
                    className="flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                    Back to Employees
                </Button>
            </div>
            
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="relative">
                    <CardTitle>
                        {isNewEmployee ? 'New Employee' : `${employee.firstName} ${employee.lastName}`}
                    </CardTitle>
                    <CardDescription>
                        {isNewEmployee ? 'Create a new employee' : employee.email}
                    </CardDescription>
                    
                    {canDelete && !isNewEmployee && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600 hover:bg-transparent"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the employee.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardHeader>
                <form onSubmit={handleSubmit} autoComplete="off">
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
                                autoComplete="new-email"
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
                                autoComplete="new-password"
                            />
                            {formErrors.password && (
                                <p className="text-sm text-red-500">{formErrors.password}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                name="jobTitle"
                                value={employee.jobTitle}
                                onChange={handleInputChange}
                                disabled={!canEditAllFields}
                                className={formErrors.jobTitle ? 'border-red-500' : ''}
                            />
                            {formErrors.jobTitle && (
                                <p className="text-sm text-red-500">{formErrors.jobTitle}</p>
                            )}
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
                                value={employee.managerId ? employee.managerId.toString() : 'none'}
                                onValueChange={(value) => handleSelectChange('managerId', value === 'none' ? '' : value)}
                                disabled={!canEditAllFields}
                            >
                                <SelectTrigger>
                                    <SelectValue>
                                        {employee.managerId 
                                            ? (managers.find(m => m.id === employee.managerId)?.name || managerName || 'Loading...') 
                                            : 'No Manager'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Manager</SelectItem>
                                    {managers
                                        .filter(manager => manager.id !== employee.id) // Can't be own manager
                                        // Remove duplicates before mapping
                                        .filter((manager, index, self) => 
                                            index === self.findIndex(m => m.id === manager.id)
                                        )
                                        .map(manager => (
                                            <SelectItem key={manager.id} value={manager.id.toString()}>
                                                {manager.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {canEditAllFields && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={employee.role}
                                        onValueChange={(value) => handleSelectChange('role', value)}
                                        disabled={!canEditAllFields}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                            <SelectItem value="GUEST">Guest</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="active">Status</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <Select
                                                        value={employee.active ? 'true' : 'false'}
                                                        onValueChange={(value) => {
                                                            // Prevent admin from setting themselves inactive
                                                            if (user?.role === 'ADMIN' && user?.id === Number(id) && value === 'false') {
                                                                toast.error("Admins cannot set themselves as inactive", {
                                                                    description: "This would prevent you from accessing the system."
                                                                });
                                                                return;
                                                            }
                                                            handleSelectChange('active', value);
                                                        }}
                                                        disabled={!canEditAllFields || (user?.role === 'ADMIN' && user?.id === Number(id))}
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
                                            </TooltipTrigger>
                                            {user?.role === 'ADMIN' && user?.id === Number(id) && (
                                                <TooltipContent side="top" align="start" sideOffset={5}>
                                                    <p>Admins cannot set themselves as inactive to prevent system lockout.</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </>
                        )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-6 border-t mt-6">
                        <Button variant="outline" type="button" onClick={() => navigate('/employees')}>
                            Cancel
                        </Button>
                        
                        <div className="flex gap-2">
                            {canEdit && (
                                <Button 
                                    type="submit" 
                                    disabled={saving || !hasChanges} 
                                    onClick={handleSubmit}
                                    className={`${hasChanges ? 'bg-[#3CB371] hover:bg-[#2E8B57]' : 'bg-gray-400 cursor-not-allowed'}`}
                                >
                                    {saving ? 'Saving...' : (isNewEmployee ? 'Create' : 'Update')}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
