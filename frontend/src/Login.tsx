import { useState, FormEvent } from 'react';
import axios from 'axios';

interface Props {
    onLogin: (token: string) => void;
}

export default function Login({ onLogin }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password,
            });
            onLogin(res.data.token);
        } catch {
            alert('Login failed');
        }
    };

    return (
        <form onSubmit={submit}>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <br />
            <button type="submit">Login</button>
        </form>
    );
}
