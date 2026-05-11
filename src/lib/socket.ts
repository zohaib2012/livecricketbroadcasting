import Pusher, { Channel } from 'pusher-js';

let pusherClient: Pusher | null = null;
const channels = new Map<string, Channel>();

export function getPusherClient(): Pusher {
  if (!pusherClient && typeof window !== 'undefined') {
    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherClient!;
}

export function getMatchChannel(matchId: string): Channel {
  const client = getPusherClient();
  const name = `match-${matchId}`;
  if (!channels.has(name)) {
    channels.set(name, client.subscribe(name));
  }
  return channels.get(name)!;
}

export function unsubscribeMatch(matchId: string): void {
  const name = `match-${matchId}`;
  if (pusherClient && channels.has(name)) {
    pusherClient.unsubscribe(name);
    channels.delete(name);
  }
}

export async function emitOverlayDisplay(matchId: string, mode: string): Promise<void> {
  await fetch('/api/overlay/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, event: 'overlay_display', data: { mode } }),
  });
}

export async function emitOverlayAnimate(matchId: string, type: string): Promise<void> {
  await fetch('/api/overlay/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, event: 'overlay_animate', data: { type } }),
  });
}

export async function emitOverlayDecision(matchId: string, decision: string): Promise<void> {
  await fetch('/api/overlay/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, event: 'overlay_decision', data: { decision } }),
  });
}

// Legacy helpers used in compact overlay
export function onOverlayDisplay(cb: (data: { mode: string }) => void) {
  // subscribed per-page via getMatchChannel
}
export function onOverlayAnimate(cb: (data: { type: string }) => void) {}
export function offOverlayDisplay(cb: (data: { mode: string }) => void) {}
export function offOverlayAnimate(cb: (data: { type: string }) => void) {}

// Kept for any remaining imports — no-op on Pusher
export function getSocket() { return null as any; }
export function disconnectSocket() { if (pusherClient) { pusherClient.disconnect(); pusherClient = null; } }
