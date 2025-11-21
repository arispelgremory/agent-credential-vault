import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '@/features/jwt/index.js';
import { AuthRepository } from '@/features/auth/auth.repository.js';
import { UserType } from '@/features/auth/auth.model.js';

interface AuthenticatedSocket extends Socket {
  user?: UserType;
}

export class SocketServer {
  private io: SocketIOServer;
  private authRepository: AuthRepository;

  constructor(httpServer: HTTPServer) {
    this.authRepository = new AuthRepository();
    
    // Initialize Socket.IO with CORS configuration
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware for socket connections
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth?.token || 
                     socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication token is required'));
        }

        // Verify JWT token
        const decodedToken = verifyToken(token);
        
        if ('statusCode' in decodedToken && decodedToken.statusCode === 401) {
          return next(new Error('Invalid or expired token'));
        }

        // Get user data from token
        const user = await this.authRepository.getUserDataByToken(token);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers for socket connections
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.user?.userId;
      const userEmail = socket.user?.userEmail;

      console.log(`Socket connected: ${userEmail} (${userId})`);

      // Join user's personal room
      if (userId) {
        socket.join(`user:${userId}`);
      }

      // Handle join room event
      socket.on('join:room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${userEmail} joined room: ${roomId}`);
        socket.to(roomId).emit('user:joined', {
          userId,
          userEmail,
          roomId
        });
      });

      // Handle leave room event
      socket.on('leave:room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`User ${userEmail} left room: ${roomId}`);
        socket.to(roomId).emit('user:left', {
          userId,
          userEmail,
          roomId
        });
      });

      // Handle custom events
      socket.on('message', (data: { roomId: string; message: string; timestamp?: Date }) => {
        const messageData = {
          userId,
          userEmail,
          message: data.message,
          timestamp: data.timestamp || new Date(),
          roomId: data.roomId
        };

        // Broadcast to room
        socket.to(data.roomId).emit('message', messageData);
        // Also send back to sender for confirmation
        socket.emit('message:sent', messageData);
      });

      // Handle disconnect
      socket.on('disconnect', (reason: string) => {
        console.log(`Socket disconnected: ${userEmail} (${userId}) - Reason: ${reason}`);
      });

      // Handle error
      socket.on('error', (error: Error) => {
        console.error(`Socket error for user ${userEmail}:`, error);
      });
    });
  }

  /**
   * Get the Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Emit event to a specific user
   */
  public emitToUser(userId: string, event: string, data: unknown): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit event to a specific room
   */
  public emitToRoom(roomId: string, event: string, data: unknown): void {
    this.io.to(roomId).emit(event, data);
  }

  /**
   * Emit event to all connected clients
   */
  public emitToAll(event: string, data: unknown): void {
    this.io.emit(event, data);
  }

  /**
   * Get number of connected clients
   */
  public getConnectedCount(): number {
    return this.io.sockets.sockets.size;
  }
}

