import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : (import.meta.env.DEV ? 'http://localhost:5000' : 'https://estatexai.onrender.com');

let socket = null;

export function getSocket() {
    if (!socket) {
        socket = io(BACKEND_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });
    }
    return socket;
}

export function connectSocket(userId) {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
        s.emit('join', userId);
    }
}

export function disconnectSocket() {
    if (socket && socket.connected) {
        socket.disconnect();
    }
}
