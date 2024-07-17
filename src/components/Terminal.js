import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import './Terminal.css';

const Terminal = ({ token }) => {
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [lastValidDirectory, setLastValidDirectory] = useState('/');
  const inputRef = useRef(null);

  useEffect(() => {
    // Function to fetch current working directory on component mount
    const fetchCurrentDirectory = async () => {
      try {
        const cdGetResponse = await axios.get('/api/cd', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cdGetResponse.status === 200 && cdGetResponse.data.cwd) {
          const cwd = cdGetResponse.data.cwd;
          setTerminalOutput((prevOutput) => prevOutput + '\n' + cwd);
          setLastValidDirectory(cwd);
        } else {
          setTerminalOutput((prevOutput) => prevOutput + '\n' + lastValidDirectory);
        }
      } catch (error) {
        console.error('Error fetching current directory:', error);
        setTerminalOutput((prevOutput) => prevOutput + '\n' + lastValidDirectory);
      }
    };

    // Call the fetch function when component mounts
    fetchCurrentDirectory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this effect runs only once on mount

  useEffect(() => {
    inputRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const handleCommandSubmit = async (e) => {
    e.preventDefault();

    try {
      if (command.trim().toLowerCase() === 'clear') {
        setTerminalOutput('');
        setCommand('');
        return;
      }

      const args = command.trim().split(' ');
      if (args[0].toLowerCase() === 'history') {
        let historyCommands = '';
        try {
          const historyResponse = await axios.get('/api/history', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (historyResponse.status === 200) {
            const limit = !isNaN(parseInt(args[1])) ? parseInt(args[1]) : historyResponse.data.length;
            const historyData = historyResponse.data.length === limit ? historyResponse.data.slice(0, limit) :
            historyResponse.data.reverse().slice(0, limit).reverse();; // Reverse and limit history data
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
        return;
      }

      if (args[0].toLowerCase() === 'ls') {
        try {
          const lsResponse = await axios.get('/api/ls', {
            params: {
              options: args.length > 1 ? args.slice(1).join(' ') : '', // Pass remaining arguments as options
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (lsResponse.status === 200) {
            setTerminalOutput((prevOutput) => prevOutput + '\n' + lsResponse?.data?.ls);
          } else {
            throw new Error(lsResponse.error);
          }
        } catch (error) {
          console.error('Error executing ls command:', error);
          setTerminalOutput((prevOutput) => prevOutput + '\n' + error?.response?.data?.error);
        }

        setCommand('');
        return;
      }

      // Handle other commands like cd, etc.
      const response = await axios.post('/api/cd', { command }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        const cwd = response.data.cwd;
        setTerminalOutput((prevOutput) => prevOutput + '\n' + cwd);
        setLastValidDirectory(cwd);
      } else {
        setTerminalOutput((prevOutput) => prevOutput + '\nCommand not found');
      }

      setCommand('');
    } catch (error) {
      console.error('Command execution error:', error);
      setTerminalOutput((prevOutput) => prevOutput + '\nCommand execution error');
      setCommand('');
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
        <pre>{terminalOutput}</pre>
        <div>
          <span className='last-valid-dir'>{lastValidDirectory}$&nbsp;</span>
          <form onSubmit={handleCommandSubmit}>
            <input
              type="text"
              value={command}
              ref={inputRef}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress} // Handle Enter key press
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
