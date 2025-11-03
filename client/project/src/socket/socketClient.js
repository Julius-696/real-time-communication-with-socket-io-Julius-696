import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: localStorage.getItem('token') });
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;