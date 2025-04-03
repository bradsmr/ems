import { useEffect, useState } from 'react'
import axios from 'axios'

interface Employee {
    id: number
    email: string
    firstName: string
    lastName: string
    role: string
}

export function useCurrentUser() {
    const [user, setUser] = useState<Employee | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        axios.get('http://localhost:8080/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setUser(response.data)
                setLoading(false)
            })
            .catch(err => {
                setError(err)
                setLoading(false)
            })
    }, [])

    return { user, loading, error }
}
