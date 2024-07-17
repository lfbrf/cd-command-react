import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', { username, password });
      const { token } = response.data;
      onLogin(token); // Pass token back to parent component (App.js)
    } catch (error) {
      console.error('Login error:', error);
      // Handle login error
    }
  };

  return (
    <div className="login-form">
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p>Don't have an account? <Link to="/register">Sign Up</Link></p> {/* Link to Register component */}
    </div>
  );
};

export default LoginForm;
