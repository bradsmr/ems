import { useState } from 'react';
import Login from './Login';
import EmployeeList from './EmployeeList';

export default function App() {
    const [token, setToken] = useState<string | null>(null);

    return (
        <div>
            {token ? (
                <EmployeeList token={token} />
            ) : (
                <Login onLogin={setToken} />
            )}
        </div>
    );
}
