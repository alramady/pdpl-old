/**
 * WebSocket server — real-time notifications via socket.io
 * Broadcasts events: new_leak, status_change, scan_complete, job_complete, system
 */
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export function initWebSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    path: "/api/ws",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join user-specific room if authenticated
    socket.on("join", (userId: number) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[WebSocket] User ${userId} joined room`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[WebSocket] Server initialized on /api/ws");
  return io;
}

export function getIO(): Server | null {
  return io;
}

/**
 * Broadcast a notification to all connected clients
 */
export function broadcastNotification(notification: {
  id?: number;
  type: string;
  title: string;
  titleAr: string;
  message?: string;
  messageAr?: string;
  severity: string;
  relatedId?: string;
  createdAt?: string;
}) {
  if (!io) return;
  io.emit("notification", notification);
}

/**
 * Send a notification to a specific user
 */
export function sendUserNotification(userId: number, notification: {
  id?: number;
  type: string;
  title: string;
  titleAr: string;
  message?: string;
  messageAr?: string;
  severity: string;
  relatedId?: string;
  createdAt?: string;
}) {
  if (!io) return;
  io.to(`user:${userId}`).emit("notification", notification);
}

/**
 * Broadcast a monitoring job status update
 */
export function broadcastJobUpdate(jobUpdate: {
  jobId: string;
  status: string;
  lastResult?: string;
  leaksFound?: number;
}) {
  if (!io) return;
  io.emit("job_update", jobUpdate);
}
