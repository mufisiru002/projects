import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Store state in memory for now
  let resources: any[] = [
    { id: '1', type: 'EC2', name: 'Web-Server-01', x: 200, y: 150, cost: 45, specs: 't3.medium' },
    { id: '2', type: 'RDS', name: 'Primary-DB', x: 500, y: 300, cost: 80, specs: 'db.t3.small' },
  ];
  
  const users = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Send initial state
    socket.emit('init', { resources });

    socket.on('join', (userData) => {
      users.set(socket.id, { ...userData, id: socket.id });
      io.emit('users:update', Array.from(users.values()));
    });

    socket.on('resource:add', (resource) => {
      resources.push(resource);
      socket.broadcast.emit('resource:added', resource);
    });

    socket.on('resource:move', ({ id, x, y }) => {
      resources = resources.map(r => r.id === id ? { ...r, x, y } : r);
      socket.broadcast.emit('resource:moved', { id, x, y });
    });

    socket.on('resource:delete', (id) => {
      resources = resources.filter(r => r.id !== id);
      socket.broadcast.emit('resource:deleted', id);
    });

    socket.on('cursor:move', (pos) => {
      const user = users.get(socket.id);
      if (user) {
        user.x = pos.x;
        user.y = pos.y;
        socket.broadcast.emit('cursor:moved', { id: socket.id, x: pos.x, y: pos.y });
      }
    });

    socket.on('disconnect', () => {
      users.delete(socket.id);
      io.emit('users:update', Array.from(users.values()));
      console.log('User disconnected:', socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
