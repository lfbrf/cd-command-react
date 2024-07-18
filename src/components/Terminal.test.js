import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import Terminal from './Terminal';

jest.mock('axios');

describe('Terminal Component', () => {
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  test('Default user directory', async () => {
    // Render the component
    render(<Terminal token={token} />);

    // Wait for the text to appear in terminal output
    const lastValidDirElement = await screen.findByTestId('dir');
    expect(lastValidDirElement.textContent.trim()).toEqual('/$');

  });

  test('Typing and submitting a cd command', async () => {
    // Mock axios.post response for command execution
    const command = 'cd /home/user';
    const lsResponse = { data: { ls: 'file1 file2 file3' } };
    axios.post.mockResolvedValueOnce({ status: 200, data: { cwd: '/home/user' } });
    axios.get.mockResolvedValueOnce(lsResponse);

    // Render the component
    render(<Terminal token={token} />);

    // Wait for the text to appear in terminal output
    const lastValidDirElement = await screen.findByTestId('dir');
    expect(lastValidDirElement.textContent.trim()).toEqual('/$');

    // Type the command into the input field
    const inputField = screen.getByRole('textbox');
    fireEvent.change(inputField, { target: { value: command } });

    // Submit the form (simulate pressing Enter)
    fireEvent.submit(inputField.closest('form'));
    // Wait for the terminal output to update
    const terminalOutput = await screen.findByTestId('dir');
    expect(terminalOutput.textContent.trim()).toEqual('/home/user$');

    jest.restoreAllMocks();
  });

  test('Typing and submitting a ls command', async () => {
    // Mock axios.post response for command execution
    const command = 'ls';
    axios.post.mockResolvedValueOnce({ status: 200, data: { cwd: '/home/user' } });
    axios.get.mockResolvedValueOnce({ status: 200, data: { ls: '/felipe/luiz', cwd: '/' } });

    // Render the component
    render(<Terminal token={token} />);

    // Wait for the text to appear in terminal output
    const lastValidDirElement = await screen.findByTestId('dir');
    expect(lastValidDirElement.textContent.trim()).toEqual('/$');

    // Type the command into the input field
    const inputField = screen.getByRole('textbox');

    fireEvent.change(inputField, { target: { value: 'cd /home' } });
    fireEvent.submit(inputField.closest('form'));

    await screen.findByTestId('terminal-output');

    fireEvent.change(inputField, { target: { value: command } });

    // Submit the form (simulate pressing Enter)
    fireEvent.submit(inputField.closest('form'));
    // Wait for the terminal output to update
    const terminalOutput = await screen.findByTestId('terminal-output');
    expect(terminalOutput.textContent.trim()).toContain('/home/user');

    jest.restoreAllMocks();
  });

  test('Typing and submitting a history command', async () => {
    // Mock axios.post response for command execution
    const command = 'history 3';
    axios.post.mockResolvedValueOnce({ status: 200, data: { cwd: '/home/user' } });
    axios.get.mockResolvedValueOnce({ status: 200, data: { ls: '/felipe/luiz', cwd: '/test' } });
    axios.get.mockResolvedValueOnce({ status: 200, data: [{command: 'cd /test', cwd: '/test/from/history'}] });

    // Render the component
    render(<Terminal token={token} />);

    // Wait for the text to appear in terminal output
    const lastValidDirElement = await screen.findByTestId('dir');
    expect(lastValidDirElement.textContent.trim()).toEqual('/test$');

    // Type the command into the input field
    const inputField = screen.getByRole('textbox');

    fireEvent.change(inputField, { target: { value: 'cd /test' } });
    fireEvent.submit(inputField.closest('form'));

    await screen.findByTestId('terminal-output');

    fireEvent.change(inputField, { target: { value: command } });

    // Submit the form (simulate pressing Enter)
    fireEvent.submit(inputField.closest('form'));
    // Wait for the terminal output to update
    const terminalOutput = await screen.findByTestId('terminal-output');
    expect(terminalOutput.textContent.trim()).toContain('1. cd /test');

    jest.restoreAllMocks();
  });

  test('Clear command', async () => {
    // Mock axios.post response for command execution
    const command = 'clear';
    axios.post.mockResolvedValueOnce({ status: 200, data: { cwd: '/home/user' } });
  
    // Render the component
    render(<Terminal token={token} />);
  
    // Wait for the text to appear in terminal output
    const lastValidDirElement = await screen.findByTestId('dir');
    expect(lastValidDirElement.textContent.trim()).toEqual('/$');
  
    // Type the command into the input field
    const inputField = screen.getByRole('textbox');
    fireEvent.change(inputField, { target: { value: command } });
  
    // Submit the form (simulate pressing Enter)
    fireEvent.submit(inputField.closest('form'));
  
    // Wait for the terminal output to update
    const terminalOutput = await screen.findByTestId('terminal-output');
    expect(terminalOutput.textContent.trim()).toEqual('');
  
    // Check that the last valid directory remains unchanged
    const updatedLastValidDirElement = await screen.findByTestId('dir');
    expect(updatedLastValidDirElement.textContent.trim()).toEqual('/$');
  
    jest.restoreAllMocks();
  });

  test('Error handling', async () => {
    // Mock axios.post response for command execution
    const command = 'invalid_command';
    axios.post.mockRejectedValueOnce({ response: { status: 500, data: { error: 'Server Error' } } });
  
    // Render the component
    render(<Terminal token={token} />);
  
    // Wait for the text to appear in terminal output
    const lastValidDirElement = await screen.findByTestId('dir');
    expect(lastValidDirElement.textContent.trim()).toEqual('/$');
  
    // Type the command into the input field
    const inputField = screen.getByRole('textbox');
    fireEvent.change(inputField, { target: { value: command } });
  
    // Submit the form (simulate pressing Enter)
    fireEvent.submit(inputField.closest('form'));
  
    // Wait for the terminal output to update
    const terminalOutput = await screen.findByTestId('terminal-output');
    expect(terminalOutput.textContent.trim()).toContain('Command execution error');
  
    jest.restoreAllMocks();
  });

  test('Empty command', async () => {
    // Render the component
    render(<Terminal token={token} />);
  
    // Wait for the text to appear in terminal output
    const lastValidDirElement = await screen.findByTestId('dir');
    expect(lastValidDirElement.textContent.trim()).toEqual('/$');
  
    // Submit the form with an empty command
    const inputField = screen.getByRole('textbox');
    fireEvent.submit(inputField.closest('form'));
  
    // Wait for the terminal output to update
    const terminalOutput = await screen.findByTestId('terminal-output');
    expect(terminalOutput.textContent.trim()).toContain('/');
  
    jest.restoreAllMocks();
  });
  
  test('Typing and submitting multiple commands in sequence', async () => {
    // Mock axios responses for commands
    const commands = [
      { command: 'cd /home', response: { status: 200, data: { cwd: '/home' } } },
      { command: 'ls', response: { status: 200, data: { ls: 'file1 file2 file3' } } },
      { command: 'history', response: { status: 200, data: [{ command: 'cd /home' }, { command: 'ls' }] } }
    ];
  
    axios.post.mockResolvedValueOnce(commands[0].response);
    axios.get.mockResolvedValueOnce(commands[1].response);
    axios.get.mockResolvedValueOnce(commands[2].response);
  
    // Render the component
    render(<Terminal token={token} />);
  
    // Wait for the text to appear in terminal output
    const lastValidDirElement = await screen.findByTestId('dir');
    expect(lastValidDirElement.textContent.trim()).toEqual('/$');
  
    // Execute each command in sequence
    const inputField = screen.getByRole('textbox');
    fireEvent.change(inputField, { target: { value: commands[2].command } });
    fireEvent.submit(inputField.closest('form'));
    await screen.findByTestId('terminal-output');

    fireEvent.change(inputField, { target: { value: commands[1].command } });
    fireEvent.submit(inputField.closest('form'));
    await screen.findByTestId('terminal-output');

    fireEvent.change(inputField, { target: { value: commands[0].command } });
    fireEvent.submit(inputField.closest('form'));
    await screen.findByTestId('terminal-output');
  
    // Check the final output
    const terminalOutput = await screen.findByTestId('terminal-output');
    expect(terminalOutput.textContent.trim()).toContain('/home');
    expect(terminalOutput.textContent.trim()).toContain('1. cd /home');
    expect(terminalOutput.textContent.trim()).toContain('2. ls');
  
    jest.restoreAllMocks();
  });


  test('Unauthorized access', async () => {
    // Mock axios.get response for unauthorized access
    axios.get.mockRejectedValueOnce({ response: { status: 401, data: { error: 'Unauthorized' } } });
    // Render the component
    render(<Terminal token={token} />);
  

    // Type the command into the input field
    const inputField = screen.getByRole('textbox');
    fireEvent.change(inputField, { target: { value: 'cd /test/1' } });
  
    // Submit the form (simulate pressing Enter)
    fireEvent.submit(inputField.closest('form'));

    // Wait for the text to appear in terminal output
    const terminalOutput = await screen.findByTestId('terminal-output');
    expect(terminalOutput.textContent.trim()).toContain('Command execution error');
  
    jest.restoreAllMocks();
  });
  test('Handling commands with special characters', async () => {
  const command = 'ls -l | grep file';

  axios.get.mockResolvedValueOnce({ status: 200, data: { cwd: '/home/user' } });
  axios.get.mockResolvedValueOnce({ status: 200, data: { ls: 'file1 file2' } });

  render(<Terminal token={token} />);

  const inputField = screen.getByRole('textbox');
  fireEvent.change(inputField, { target: { value: command } });
  fireEvent.submit(inputField.closest('form'));

  const terminalOutput = await screen.findByTestId('terminal-output');
  expect(terminalOutput.textContent.trim()).toContain('file1 file2');

  jest.restoreAllMocks();
});

test('Handling commands with incorrect parameters', async () => {
  const command = 'ls -invalidparam';

  axios.get.mockResolvedValueOnce({ status: 200, data: { cwd: '/home/user' } });
  axios.get.mockRejectedValueOnce({ response: { status: 400, data: { error: 'Invalid parameter' } } });

  render(<Terminal token={token} />);

  const inputField = screen.getByRole('textbox');
  fireEvent.change(inputField, { target: { value: command } });
  fireEvent.submit(inputField.closest('form'));

  const terminalOutput = await screen.findByTestId('terminal-output');
  expect(terminalOutput.textContent.trim()).toContain('Invalid parameter');

  jest.restoreAllMocks();
});

test('Handling very long command output', async () => {
  const command = 'ls -l /long/directory/path';

  const longOutput = Array.from({ length: 100 }, (_, i) => `file${i}`).join(' ');

  axios.get.mockResolvedValueOnce({ status: 200, data: { cwd: '/home/user' } });
  axios.get.mockResolvedValueOnce({ status: 200, data: { ls: longOutput } });

  render(<Terminal token={token} />);

  const inputField = screen.getByRole('textbox');
  fireEvent.change(inputField, { target: { value: command } });
  fireEvent.submit(inputField.closest('form'));

  const terminalOutput = await screen.findByTestId('terminal-output');
  expect(terminalOutput.textContent.trim()).toContain(`file99`); // Check for a part of the long output

  jest.restoreAllMocks();
});

});