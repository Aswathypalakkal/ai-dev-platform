// backend/src/server.ts
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbService } from './services/dbService';
import { aiService } from './services/aiService';
import { dockerService } from './services/dockerService';
import fileRoutes from './routes/fileRoutes';
import taskRoutes from './routes/taskRoutes';
import aiRoutes from './routes/aiRoutes';
import dockerRoutes from './routes/dockerRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Register REST routes
app.use('/api/files', fileRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/docker', dockerRoutes);

// Simple health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Emit real‑time metrics (CPU, RAM, Docker stats) every second
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  const interval = setInterval(async () => {
    const dockerStats = await dockerService.getStats();
    socket.emit('metrics', {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      docker: dockerStats,
    });
  }, 1000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
