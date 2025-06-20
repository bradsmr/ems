import React, { useState, FormEvent } from "react"
import axios from "axios"
import { API_URL } from '../../utils/api';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
    onLogin: (token: string) => void
}

export default function Login({ onLogin }: Props) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            })
            onLogin(res.data.token)
        } catch (err: any) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError("Invalid email or password.")
                } else if (err.response.status === 403) {
                    setError("Your account is inactive. Please contact your administrator.")
                } else if (err.response.status === 429) {
                    setError("Your account is temporarily locked due to too many failed login attempts. Please try again later.")
                } else {
                    setError("Login failed. Please try again.")
                }
            } else {
                setError("Network error. Please try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleGuestAccess = async () => {
        setError("")
        setIsLoading(true)
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {
                email: "guest@demo.com",
                password: "guest123"
            })
            onLogin(res.data.token)
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                setError("Guest account not found. Please contact your administrator.")
            } else {
                setError("Failed to access demo mode. Please try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-6 space-y-6">
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-semibold">Initech EMS</h2>
                        <p className="text-sm text-muted-foreground">
                            Sign in to access your dashboard
                        </p>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm font-medium text-center py-1">
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={isLoading}
                        >
                            {isLoading ? "Loading..." : "Login"}
                        </Button>
                        
                        <div className="mt-4 relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or
                                </span>
                            </div>
                        </div>
                        
                        <Button 
                            type="button" 
                            onClick={handleGuestAccess} 
                            variant="outline" 
                            className="w-full mt-4"
                            disabled={isLoading}
                        >
                            Try Demo Mode
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
