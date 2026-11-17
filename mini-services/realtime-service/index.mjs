import { createServer } from 'http';
import { Server } from 'socket.io';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'astral-family-secret-key-change-in-production'
);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000', '*'];

const httpServer = createServer((req, res) => {
  if (req.url && (req.url.startsWith('/health') || req.url === '/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'astral-realtime-service',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Auth middleware - validate token if provided or in dev mode
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    // In dev / initial handshake, allow connection with guest state
    socket.data = { user: null };
    return next();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    socket.data = { user: payload };
    next();
  } catch (err) {
    // If token invalid, allow graceful connection or reject
    socket.data = { user: null };
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`[Realtime] User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    if (typeof roomId === 'string' && roomId.trim()) {
      socket.join(roomId);
      console.log(`[Realtime] ${socket.id} joined room: ${roomId}`);
    }
  });

  socket.on('leave-room', (roomId) => {
    if (typeof roomId === 'string') {
      socket.leave(roomId);
    }
  });

  // Broadcast events with room targeting if specified
  socket.on('profile-created', (data) => {
    if (data?.roomId) {
      socket.to(data.roomId).emit('profile-updated', { type: 'created', ...data });
    } else {
      io.emit('profile-updated', { type: 'created', ...data });
    }
  });

  socket.on('profile-deleted', (data) => {
    if (data?.roomId) {
      socket.to(data.roomId).emit('profile-updated', { type: 'deleted', ...data });
    } else {
      io.emit('profile-updated', { type: 'deleted', ...data });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Realtime] User disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`[Realtime] Socket error (${socket.id}):`, error);
  });
});

const PORT = 3003;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Realtime] Astral Realtime Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  httpServer.close(() => process.exit(0));
});
