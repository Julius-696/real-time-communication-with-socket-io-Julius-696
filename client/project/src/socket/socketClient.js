import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://real-time-communication-with-socket-io-3lv2.onrender.com';

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