import { useState, FormEvent } from "react"
import axios from "axios"
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

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")
        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", {
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

                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
