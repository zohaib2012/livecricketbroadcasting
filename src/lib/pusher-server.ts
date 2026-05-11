import Pusher from 'pusher';

let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return pusherServer;
}

export async function triggerMatchEvent(matchId: string, event: string, data: any) {
  const pusher = getPusherServer();
  await pusher.trigger(`match-${matchId}`, event, data);
}
