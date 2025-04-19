import {useEffect, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import axios from "axios"
import {toast} from "sonner"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {useCurrentUser} from "@/hooks/useCurrentUser"
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog"
import { Trash2 } from 'lucide-react'
import { API_URL } from '../../utils/api';

type Department = {
    id: number
    name: string
    description: string
}

type Props = {
    token: string
}

/**
 * DepartmentDetails component: Handles department details, including editing and deleting.
 * 
 * This component fetches department data and allows authorized users to edit department information.
 * It also includes a delete functionality for authorized users.
 */
export default function DepartmentDetails({token}: Props) {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate()
    const {user} = useCurrentUser()
    const isNewDepartment = id === "new"
    
    const [department, setDepartment] = useState<Department>({
        id: 0,
        name: "",
        description: ""
    })
    
    const [loading, setLoading] = useState(!isNewDepartment)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [initialDepartment, setInitialDepartment] = useState<Department | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    
    // Permission checks
    // Only admins can edit departments
    const canEdit = user?.role === "ADMIN"
    // Only admins can delete departments
    const canDelete = user?.role === "ADMIN"
    
    // Add a back button handler
    const handleBack = () => {
        navigate('/departments');
    };
    
    useEffect(() => {
        if (isNewDepartment) {
            setLoading(false)
            return
        }
        
        const fetchDepartment = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/departments/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                })
                
                setDepartment(response.data)
                setInitialDepartment(JSON.parse(JSON.stringify(response.data)))
                setHasChanges(false)
            } catch (err) {
                console.error("Error fetching department:", err)
                setError("Failed to load department details")
            } finally {
                setLoading(false)
            }
        }
        
        fetchDepartment()
    }, [id, isNewDepartment, token])
    
    const validateForm = () => {
        const errors: {[key: string]: string} = {}
        
        if (!department.name.trim()) {
            errors.name = "Department name is required"
        }
        
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        setSaving(true)
        setError(null)
        
        try {
            let payload;
            let response;
            
            if (isNewDepartment) {
                // New department payload
                payload = {
                    name: department.name,
                    description: department.description
                };
                
                response = await axios.post(`${API_URL}/api/departments`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                toast.success("Department created successfully!");
                navigate(`/departments/${response.data.id}`);
            } else {
                // Update existing department
                payload = {
                    id: Number(id),
                    name: department.name,
                    description: department.description
                };
                
                response = await axios.put(`${API_URL}/api/departments/${id}`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setInitialDepartment(JSON.parse(JSON.stringify(response.data)));
                setHasChanges(false);
                toast.success("Department updated successfully!");
            }
        } catch (err: any) {
            console.error("Error saving department:", err)
            setError("Failed to save department")
            
            if (axios.isAxiosError(err)) {
                const errorData = err.response?.data
                toast.error("Error saving department", {
                    description: typeof errorData === 'string' ? errorData : "An error occurred while saving the department.",
                    duration: 8000
                })
            } else {
                toast.error("Error saving department", {
                    description: "An unknown error occurred",
                    duration: 8000
                })
            }
        } finally {
            setSaving(false)
        }
    }
    
    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        
        try {
            await axios.delete(`${API_URL}/api/departments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setShowDeleteDialog(false);
            toast.success("Department deleted successfully!");
            navigate("/departments");
        } catch (err: any) {
            console.error("Error deleting department:", err)
            
            // Show error message using toast, not in the dialog
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data || "An unknown error occurred"
                
                if (err.response?.status === 403) {
                    toast.error("Permission denied", {
                        description: "You don't have permission to delete departments.",
                        duration: 8000
                    })
                } else {
                    toast.error("Error deleting department", {
                        description: typeof errorMessage === 'string' ? errorMessage : "An unknown error occurred",
                        duration: 8000
                    })
                }
            } else {
                toast.error("Error deleting department", {
                    description: "An unknown error occurred",
                    duration: 8000
                })
            }
            
            setShowDeleteDialog(false)
        } finally {
            setDeleting(false)
        }
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        
        // Clear field-specific error when user types
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = {...prev}
                delete newErrors[name]
                return newErrors
            })
        }
        
        setDepartment(prev => {
            const updatedDepartment = {...prev, [name]: value}
            
            // Check if there are any changes compared to the initial data
            if (initialDepartment && !isNewDepartment) {
                const hasAnyChanges = Object.keys(updatedDepartment).some(key => {
                    // Skip id field
                    if (key === 'id') return false
                    
                    return JSON.stringify(updatedDepartment[key as keyof Department]) !== 
                           JSON.stringify(initialDepartment[key as keyof Department])
                })
                
                setHasChanges(hasAnyChanges)
            } else if (isNewDepartment) {
                // For new departments, check if name is filled (required field)
                setHasChanges(!!updatedDepartment.name.trim())
            }
            
            return updatedDepartment
        })
    }
    
    if (loading) {
        return <div className="text-center py-10">Loading department details...</div>
    }
    
    if (error && !isNewDepartment) {
        return <div className="text-center py-10 text-red-500">{error}</div>
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
                    Back to Departments
                </Button>
            </div>
            
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="relative">
                    <CardTitle>
                        {isNewDepartment ? 'New Department' : department.name}
                    </CardTitle>
                    <CardDescription>
                        {isNewDepartment ? 'Create a new department' : 'Department details and management'}
                    </CardDescription>
                    
                    {canDelete && !isNewDepartment && (
                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
                                        This action cannot be undone. This will permanently delete the department.
                                        Any employees assigned to this department will be updated to have no department.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={handleDelete} 
                                        disabled={deleting}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {deleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Department Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={department.name}
                                onChange={handleInputChange}
                                disabled={!canEdit}
                                className={formErrors.name ? "border-red-500" : ""}
                            />
                            {formErrors.name && (
                                <p className="text-sm text-red-500">{formErrors.name}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={department.description}
                                onChange={handleInputChange}
                                disabled={!canEdit}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-6 border-t mt-6">
                        <Button 
                            variant="outline" 
                            type="button" 
                            onClick={() => navigate("/departments")}
                        >
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
                                    {saving ? "Saving..." : (isNewDepartment ? "Create" : "Update")}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}