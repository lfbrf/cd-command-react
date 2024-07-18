import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './Login'; // Adjust the import path if necessary

jest.mock('axios');

describe('Login', () => {
  const onLoginMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: Router });
  };

  test('renders the login form', () => {
    renderWithRouter(<Login onLogin={onLoginMock} />);

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('allows the user to enter a username and password', () => {
    renderWithRouter(<Login onLogin={onLoginMock} />);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'testpassword' } });

    expect(screen.getByPlaceholderText('Username')).toHaveValue('testuser');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('testpassword');
  });

  test('calls onLogin with the token when login is successful', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'testtoken' } });

    renderWithRouter(<Login onLogin={onLoginMock} />);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(onLoginMock).toHaveBeenCalledWith('testtoken');
    });
  });
});
