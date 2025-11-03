import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => {
    cb({ token: localStorage.getItem('token') });
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Socket connected successfully to:', SOCKET_URL);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  // Retry connection with polling if websocket fails
  if (socket.io.opts.transports.includes('websocket')) {
    console.log('Retrying with polling transport');
    socket.io.opts.transports = ['polling'];
  }
});

export default socket;