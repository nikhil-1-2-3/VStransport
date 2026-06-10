import { io } from 'socket.io-client';

// In production, the backend might be on Render. The socket needs to connect to the domain root (without /api).
const apiDomain = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
const SOCKET_URL = apiDomain; 

export const socket = io(SOCKET_URL, {
  autoConnect: true,
});
