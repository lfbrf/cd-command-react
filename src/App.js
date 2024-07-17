import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginForm from './components/Login';
import Register from './components/Register';
import Terminal from './components/Terminal';

const App = () => {
  const [token, setToken] = useState(null); // State to store JWT token

  const handleLogin = (token) => {
    setToken(token); // Store token in state upon successful login
  };
  
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
      {!token ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <Terminal token={token} />
      )}
        </Route>
        <Route path="/register">
          <Register />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
