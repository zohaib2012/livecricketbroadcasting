import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = parseInt(process.env.PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  (global as any).__socketio = io;

  const matchRooms = new Map<string, Set<string>>();

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_match', ({ matchId }) => {
      socket.join(`match_${matchId}`);

      if (!matchRooms.has(matchId)) {
        matchRooms.set(matchId, new Set());
      }
      matchRooms.get(matchId)?.add(socket.id);

      console.log(`Socket ${socket.id} joined match_${matchId}`);
      console.log(`Total clients in match_${matchId}: ${matchRooms.get(matchId)?.size || 0}`);
    });

    socket.on('leave_match', ({ matchId }) => {
      socket.leave(`match_${matchId}`);
      matchRooms.get(matchId)?.delete(socket.id);

      if (matchRooms.get(matchId)?.size === 0) {
        matchRooms.delete(matchId);
      }

      console.log(`Socket ${socket.id} left match_${matchId}`);
    });

    socket.on('score_update', ({ matchId, data }) => {
      io.to(`match_${matchId}`).emit('score_updated', data);
    });

    socket.on('wicket', ({ matchId, data }) => {
      io.to(`match_${matchId}`).emit('wicket_fell', data);
    });

    socket.on('innings_complete', ({ matchId, data }) => {
      io.to(`match_${matchId}`).emit('innings_complete', data);
    });

    socket.on('match_complete', ({ matchId, data }) => {
      io.to(`match_${matchId}`).emit('match_complete', data);
    });

    socket.on('overlay_set_display', ({ matchId, mode }: { matchId: string, mode: string }) => {
      io.to(`match_${matchId}`).emit('overlay_display', { mode });
    });

    socket.on('overlay_trigger_animate', ({ matchId, type }: { matchId: string, type: string }) => {
      io.to(`match_${matchId}`).emit('overlay_animate', { type });
    });

    socket.on('overlay_set_decision', ({ matchId, decision }: { matchId: string, decision: string }) => {
      io.to(`match_${matchId}`).emit('overlay_decision', { decision });
    });

    socket.on('disconnect', () => {
      matchRooms.forEach((clients, matchId) => {
        if (clients.has(socket.id)) {
          clients.delete(socket.id);
          if (clients.size === 0) {
            matchRooms.delete(matchId);
          }
        }
      });
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Socket.io server ready on http://${hostname}:${port}`);
  });
});
