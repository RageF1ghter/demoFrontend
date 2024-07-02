import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux'

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    // const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            // dispatch(login());
            navigate('/mainpage');
        } else {
            setMessage('Username or Password is incorrect');
        }
    }
    return (
        <div className="login">
            <div className="login-container">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <input type="text" 
                        placeholder="Username" 
                        onChange={(e) => setUsername(e.target.value)}
                        required/>
                    <input type="password" 
                        placeholder="Password" 
                        onChange={(e) => setPassword(e.target.value)}
                        required/>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}
export default LoginPage;