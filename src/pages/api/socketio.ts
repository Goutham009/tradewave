import type { NextApiRequest, NextApiResponse } from 'next';
import { initSocketServer, type NextApiResponseWithSocket } from '@/lib/socket/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

type SocketApiResponse = NextApiResponseWithSocket & NextApiResponse;

export default function handler(_req: NextApiRequest, res: SocketApiResponse) {
  if (!res.socket?.server) {
    return res.status(500).json({ success: false, error: 'Socket server unavailable' });
  }

  if (!res.socket.server.io) {
    res.socket.server.io = initSocketServer(res.socket.server);
  }

  return res.status(200).json({ success: true, initialized: true });
}
