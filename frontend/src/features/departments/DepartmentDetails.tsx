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

type Department = {
    id: number
    name: string
    description: string
}

type Props = {
    token: string
}

export default function DepartmentDetails({token}: Props) {
    const {id} = useParams()
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
    
    // Only admins can edit departments
    const canEdit = user?.role === "ADMIN"
    
    // Only admins can delete departments
    const canDelete = user?.role === "ADMIN"
    
    useEffect(() => {
        const fetchDepartment = async () => {
            if (isNewDepartment) return
            
            setLoading(true)
            setError(null)
            
            try {
                const response = await axios.get(`http://localhost:8080/api/departments/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                setDepartment(response.data)
            } catch (err) {
                console.error("Error fetching department:", err)
                setError("Failed to load department details")
                navigate("/departments")
            } finally {
                setLoading(false)
            }
        }
        
        fetchDepartment()
    }, [id, isNewDepartment, token, navigate])
    
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
            // For new departments, don't send an ID
            const payload = isNewDepartment
                ? {
                    name: department.name,
                    description: department.description || ""
                  }
                : {
                    id: Number(id), // Use the ID from the URL for updates
                    name: department.name,
                    description: department.description || ""
                  }
            
            console.log("Department payload:", payload)
            
            if (isNewDepartment) {
                await axios.post("http://localhost:8080/api/departments", payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                
                toast.success("Department created", {
                    description: "The new department has been created successfully.",
                    duration: 5000
                })
                
                navigate("/departments")
            } else {
                await axios.put(`http://localhost:8080/api/departments/${id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                
                toast.success("Department updated", {
                    description: "The department has been updated successfully.",
                    duration: 5000
                })
                
                navigate("/departments")
            }
        } catch (err) {
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
        setDeleting(true)
        
        try {
            await axios.delete(`http://localhost:8080/api/departments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            // Close the dialog
            setShowDeleteDialog(false)
            
            // Show success message
            toast.success("Department deleted", {
                description: "The department has been deleted successfully. Any employees assigned to this department have been updated.",
                duration: 5000
            })
            
            // Navigate back to the departments list
            navigate("/departments")
        } catch (err) {
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
            
            // Close the dialog on error too
            setShowDeleteDialog(false)
        } finally {
            setDeleting(false)
        }
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        setDepartment(prev => ({...prev, [name]: value}))
        
        // Clear field-specific error when user types
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = {...prev}
                delete newErrors[name]
                return newErrors
            })
        }
    }
    
    if (loading) {
        return <div className="text-center py-10">Loading department details...</div>
    }
    
    if (error && !isNewDepartment) {
        return <div className="text-center py-10 text-red-500">{error}</div>
    }
    
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isNewDepartment ? "Create Department" : "Department Details"}</CardTitle>
                <CardDescription>
                    {isNewDepartment 
                        ? "Add a new department to the system" 
                        : "View and manage department information"}
                </CardDescription>
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
                
                <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => navigate("/departments")}
                        >
                            Cancel
                        </Button>
                        
                        {canDelete && !isNewDepartment && (
                            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" type="button">
                                        Delete
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
                                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                                            {deleting ? "Deleting..." : "Delete"}
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
                            {saving ? "Saving..." : (isNewDepartment ? "Create" : "Save Changes")}
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    )
}