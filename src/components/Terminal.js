import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import './Terminal.css'; // Make sure to import your CSS file

const Terminal = ({ token }) => {
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const inputRef = useRef(null);
  const [lastValidDirectory, setLastValidDirectory] = useState('/'); // Default to root

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
            const historyData = historyResponse.data.reverse().slice(0, limit); // Reverse and limit history data
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
        if (lastValidDirectory === '/') {
          try {
            const historyResponse = await axios.get('/api/history', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (historyResponse.status === 200 && historyResponse.data.length > 0) {
              // Find the last valid cd command output in history
              const lastCdCommand = historyResponse.data.reverse().find(entry => entry.command.startsWith('cd '));
              if (lastCdCommand) {
                setTerminalOutput((prevOutput) => prevOutput + '\n' + lastCdCommand.cwd);
                setLastValidDirectory(lastCdCommand.cwd); // Update last valid directory
              } else {
                setTerminalOutput((prevOutput) => prevOutput + '\n' + lastValidDirectory);
              }
            } else {
              setTerminalOutput((prevOutput) => prevOutput + '\n' + lastValidDirectory);
            }
          } catch (error) {
            console.error('Error fetching history:', error);
            setTerminalOutput((prevOutput) => prevOutput + '\n' + lastValidDirectory);
          }
        } else {
          setTerminalOutput((prevOutput) => prevOutput + '\n' + lastValidDirectory);
        }

        setCommand('');
        return;
      }

      const response = await axios.post('/api/cd', { command }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        const cwd = response.data.cwd;
        setTerminalOutput((prevOutput) => prevOutput + '\n' + cwd);
        setLastValidDirectory(cwd); // Update last valid directory
        setCommand('');
      } else {
        setTerminalOutput((prevOutput) => prevOutput + '\nCommand not found');
        setCommand('');
      }
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
        <div ref={inputRef}></div> {/* Empty div to keep input fixed at the bottom */}
      </div>
      <form onSubmit={handleCommandSubmit}>
        <label>
          $&nbsp;
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress} // Handle Enter key press
          />
        </label>
      </form>
    </div>
  );
};

export default Terminal;
