import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Change in production

export const socket = io(SOCKET_URL, {
  autoConnect: true,
});
