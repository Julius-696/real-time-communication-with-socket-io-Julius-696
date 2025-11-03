import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Chat from './components/Chat';
import socket from './socket/socketClient';

function App() {
  const { login, user } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    return () => socket.off('connect');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting login with:', username);
      await login(username.trim());
      socket.connect();
      socket.emit('join', { username: username.trim() });
      console.log('Login successful, socket connected');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
    }
  };

  // Debug logs
  console.log('Current state:', { user, isConnected, username });

  if (user && isConnected) {
    console.log('Rendering chat component');
    return <Chat />;
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Enter Chat Room</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
        <button type="submit">Join Chat</button>
      </form>
    </div>
  );
}

export default App;