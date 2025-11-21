import { Server as HTTPServer } from 'http';
import { SocketServer } from './socket.server.js';

let socketServerInstance: SocketServer | null = null;

/**
 * Initialize Socket.IO service with HTTP server
 * @param httpServer - HTTP server instance from Express
 * @returns SocketServer instance
 */
export function initializeSocketService(httpServer: HTTPServer): SocketServer {
  if (socketServerInstance) {
    console.warn('Socket service already initialized. Returning existing instance.');
    return socketServerInstance;
  }

  console.log('Initializing Socket.IO service...');
  socketServerInstance = new SocketServer(httpServer);
  console.log('✅ Socket.IO service initialized successfully');

  return socketServerInstance;
}

/**
 * Get the Socket.IO server instance
 * @returns SocketServer instance or null if not initialized
 */
export function getSocketServer(): SocketServer | null {
  return socketServerInstance;
}

