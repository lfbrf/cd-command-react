import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/register', { username, password });
      
      if (response.status === 201) {
        alert('User registered successfully!');
        window.location.href = '/';
        // Optionally redirect or perform other actions upon successful registration
      } else {
        // Handle other status codes, e.g., display error message
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Handle error, e.g., display error message
    }
  };

  return (
    <div className="register-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <br />
        <div class='register-btn'>
        <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
