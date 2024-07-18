import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import Register from './Register'; // Adjust the import path if necessary

jest.mock('axios');
jest.spyOn(window, 'alert').mockImplementation(() => {});
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the register form', () => {
    render(<Register />);

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('allows the user to enter a username and password', () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'testpassword' } });

    expect(screen.getByLabelText('Username:')).toHaveValue('testuser');
    expect(screen.getByLabelText('Password:')).toHaveValue('testpassword');
  });

  test('registers the user successfully', async () => {
    axios.post.mockResolvedValueOnce({ status: 201 });

    render(<Register />);

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/register', { username: 'testuser', password: 'testpassword' });
      expect(window.alert).toHaveBeenCalledWith('User registered successfully!');
      expect(window.location.href).toBe('/');
    });
  });

  test('handles registration error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Registration error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Register />);

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/register', { username: 'testuser', password: 'testpassword' });
      expect(consoleSpy).toHaveBeenCalledWith('Registration error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
