import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { ApiMessage } from './types';

let socket: Socket | null = null;

/**
 * Connects the socket using the given auth token. Call after login/signup/
 * boot-restore succeeds. Safe to call again with a new token — it replaces
 * any existing connection.
 */
export function connectSocket(token: string) {
  if (socket) {
    socket.disconnect();
  }
  socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

/**
 * Subscribes to incoming DMs. Returns an unsubscribe function — call it in
 * a useEffect cleanup so listeners don't pile up across screen mounts.
 */
export function onNewMessage(handler: (message: ApiMessage) => void) {
  socket?.on('new_message', handler);
  return () => {
    socket?.off('new_message', handler);
  };
}
