import {FormEvent, useState} from "react"
import axios from "axios"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import { API_URL } from '../../utils/api';

interface Props {
    onSetupComplete: (token: string) => void
}

export default function Setup({onSetupComplete}: Props) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        try {
            const res = await axios.post(`${API_URL}/api/setup/initialize`, {
                firstName,
                lastName,
                email,
                password,
            })
            onSetupComplete(res.data.token)
        } catch (err: any) {
            if (err.response) {
                setError(err.response.data?.message || "Setup failed. Please try again.")
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
                        <h2 className="text-2xl font-semibold">Initech EMS - First-time Setup</h2>
                        <p className="text-sm text-muted-foreground">
                            Create your administrator account to get started
                        </p>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium">
                                First Name
                            </label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium">
                                Last Name
                            </label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>

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

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm font-medium text-center py-1">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            Create Administrator Account
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
