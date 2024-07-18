import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Terminal.css';

const Terminal = ({ token }) => {
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [lastValidDirectory, setLastValidDirectory] = useState('/');
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchCurrentDirectory = async () => {
      try {
        const cdGetResponse = await axios.get('/api/cd', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cdGetResponse.status === 200 && cdGetResponse.data.cwd) {
          setTerminalOutput((prevOutput) => prevOutput + '\n' + cdGetResponse.data.cwd);
          setLastValidDirectory(cdGetResponse.data.cwd);
        } else {
          setTerminalOutput((prevOutput) => prevOutput + '\n' + lastValidDirectory);
        }
      } catch (error) {
        setTerminalOutput((prevOutput) => prevOutput + '\n' + lastValidDirectory);
      }
    };

    fetchCurrentDirectory();
  }, [token]);

  useEffect(() => {
    if (inputRef.current && inputRef.current.scrollIntoView) {
      inputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput]);

  const handleHistoryCommand = async (args) => {
    let historyCommands = '';
    try {
      const historyResponse = await axios.get('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (historyResponse.status === 200) {
        const limit = !isNaN(parseInt(args[1])) ? parseInt(args[1]) : historyResponse.data.length;
        const historyData = historyResponse.data.slice(-limit);
        historyCommands = historyData.map((entry, index) => `${index + 1}. ${entry.command}`).join('\n');
        setTerminalOutput((prevOutput) => prevOutput + '\n' + historyCommands);
      } else {
        setTerminalOutput((prevOutput) => prevOutput + '\nCommand not found');
      }
    } catch (error) {
      console.error('Error fetching command history:', error);
      setTerminalOutput((prevOutput) => prevOutput + '\nCommand not found');
    }
    setCommand('');
  };

  const handleLsCommand = async (args) => {
    try {
      const lsResponse = await axios.get('/api/ls', {
        params: { options: args.slice(1).join(' ') },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (lsResponse.status === 200) {
        setTerminalOutput((prevOutput) => prevOutput + '\n' + lsResponse.data.ls);
      } else {
        throw new Error(lsResponse.error);
      }
    } catch (error) {
      console.error('Error executing ls command:', error);
      setTerminalOutput((prevOutput) => prevOutput + '\n' + error?.response?.data?.error || 'Command execution error');
    }
    setCommand('');
  };

  const handleOtherCommand = async () => {
    try {
      const response = await axios.post('/api/cd', { command }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setTerminalOutput((prevOutput) => prevOutput + '\n' + response.data.cwd);
        setLastValidDirectory(response.data.cwd);
      } else {
        setTerminalOutput((prevOutput) => prevOutput + '\nCommand not found');
      }
    } catch (error) {
      console.error('Command execution error:', error);
      setTerminalOutput((prevOutput) => prevOutput + '\nCommand execution error');
    }
    setCommand('');
  };

  const handleClearCommand = () => {
    setTerminalOutput('');
    setCommand('');
  };

  const handleCommandSubmit = async (e) => {
    e.preventDefault();

    const trimmedCommand = command.trim().toLowerCase();
    if (trimmedCommand === 'clear') {
      handleClearCommand();
      return;
    }

    const args = command.trim().split(' ');
    switch (args[0].toLowerCase()) {
      case 'history':
        await handleHistoryCommand(args);
        break;
      case 'ls':
        await handleLsCommand(args);
        break;
      default:
        await handleOtherCommand();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommandSubmit(e);
    }
  };

  return (
    <div className="terminal">
      <h2>Terminal</h2>
      <div className="terminal-screen">
        <pre data-testid="terminal-output">{terminalOutput}</pre>
        <div>
          <span className="last-valid-dir" data-testid="dir">{lastValidDirectory}$&nbsp;</span>
          <form onSubmit={handleCommandSubmit}>
            <input
              type="text"
              value={command}
              ref={inputRef}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
