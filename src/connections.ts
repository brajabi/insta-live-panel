import { Context } from "elysia";
import { ServerWebSocket } from "bun";
import { UserInfo } from "./types";
import { ElysiaWS } from "elysia/dist/ws";

export const connections = new Map<string, ElysiaWS<any, any>>([]);

export const onlineClients = new Map<string, UserInfo>([]);

export const authSocketUser = ({ socketId }: { socketId: string }) => {
  const user = onlineClients.get(socketId);
  if (!user) {
    return null;
  }

  return user;
};
