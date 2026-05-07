import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types/cricket';

let socket: Socket | null = null;

function getSocketUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinMatchRoom(matchId: string): void {
  const socket = getSocket();
  socket.emit('join_match', { matchId });
}

export function leaveMatchRoom(matchId: string): void {
  const socket = getSocket();
  socket.emit('leave_match', { matchId });
}

export function onScoreUpdate(callback: (data: SocketEvents['score_updated']) => void): void {
  const socket = getSocket();
  socket.on('score_updated', callback);
}

export function onWicketFell(callback: (data: SocketEvents['wicket_fell']) => void): void {
  const socket = getSocket();
  socket.on('wicket_fell', callback);
}

export function onInningsComplete(callback: (data: SocketEvents['innings_complete']) => void): void {
  const socket = getSocket();
  socket.on('innings_complete', callback);
}

export function onMatchComplete(callback: (data: SocketEvents['match_complete']) => void): void {
  const socket = getSocket();
  socket.on('match_complete', callback);
}

export function onMatchStatus(callback: (data: SocketEvents['match_status']) => void): void {
  const socket = getSocket();
  socket.on('match_status', callback);
}

export function offScoreUpdate(callback: (data: SocketEvents['score_updated']) => void): void {
  const socket = getSocket();
  socket.off('score_updated', callback);
}

export function emitOverlayDisplay(matchId: string, mode: string): void {
  getSocket().emit('overlay_set_display', { matchId, mode });
}

export function emitOverlayAnimate(matchId: string, type: string): void {
  getSocket().emit('overlay_trigger_animate', { matchId, type });
}

export function emitOverlayDecision(matchId: string, decision: string): void {
  getSocket().emit('overlay_set_decision', { matchId, decision });
}

export function onOverlayDisplay(callback: (data: { mode: string }) => void): void {
  getSocket().on('overlay_display', callback);
}

export function onOverlayAnimate(callback: (data: { type: string }) => void): void {
  getSocket().on('overlay_animate', callback);
}

export function onOverlayDecision(callback: (data: { decision: string }) => void): void {
  getSocket().on('overlay_decision', callback);
}

export function offOverlayDisplay(callback: (data: { mode: string }) => void): void {
  getSocket().off('overlay_display', callback);
}

export function offOverlayAnimate(callback: (data: { type: string }) => void): void {
  getSocket().off('overlay_animate', callback);
}
