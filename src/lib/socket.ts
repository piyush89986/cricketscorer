import { io as ClientIO, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = ClientIO({
      path: "/api/socket/io",
      addTrailingSlash: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export function emitMatchUpdate(matchId: string, eventName: string, data: any) {
  if (typeof global !== "undefined" && (global as any).io) {
    (global as any).io.to(`match:${matchId}`).emit(eventName, data);
  }
}

export function emitTournamentUpdate(tournamentId: string, eventName: string, data: any) {
  if (typeof global !== "undefined" && (global as any).io) {
    (global as any).io.to(`tournament:${tournamentId}`).emit(eventName, data);
  }
}

