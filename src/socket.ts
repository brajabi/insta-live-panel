import Elysia, { Context } from "elysia";
import { authSocketUser, connections, onlineClients } from "./connections";
import { ElysiaWS } from "elysia/dist/ws";
import { checkUserToken } from "./handlers/userAuth";
import { SocketMessage } from "./types";
import { handlerExcuter } from "./ws/handlerExcuter";
import { getGrades } from "./handlers/getGrades";

export const socketApp = new Elysia().ws("/socket", {
  async message(ws: ElysiaWS<any, any>, message: unknown) {
    // invalid message
    if (typeof message !== "object" || message === null) return;
    const rawData = message as any;

    // invalid message
    if (!rawData.event) return;

    const request = message as SocketMessage;
    // console.log("request", request);

    try {
      const payload = request.payload;

      switch (request.event) {
        case "ping":
          ws.send({
            id: request.id,
            event: "response",
            payload: {
              ok: true,
              message: request.payload.message,
            },
          });
          return;
        case "auth":
          console.log(`User ${ws.id} is trying to login`);
          // authenticate user
          if (!payload.token) {
            return;
          }
          // if auth is ok, add user in onlineClients
          const auth = await checkUserToken({
            token: payload.token,
          });
          if (!auth.ok || !auth.session || !auth.user) {
            ws.send({
              id: request.id,
              event: "response",
              payload: {
                ok: false,
                message: "Invalid token",
              },
            });
            return;
          }

          const session = auth.session;
          const user = auth.user;

          // add user in onlineClients
          onlineClients.set(ws.id, {
            id: session.id,
            connectionId: ws.id,
            sessionId: session.id,
            userId: user.id,
            mobile: user.mobile,
          });

          ws.send({
            id: request.id,
            event: "response",
            payload: {
              ok: true,
              message: "Authenticated",
            },
          });
          return;

        case "getGrades":
          const grades = await getGrades();

          ws.send({
            id: request.id,
            event: "response",
            payload: grades,
          });
          break;
      }

      const user = authSocketUser({ socketId: ws.id });
      console.log("user", user);
      if (!user) {
        return;
      }

      // authenticated events excuter
      const response = await handlerExcuter(user, request);
      if (response) {
        ws.send({
          id: request.id,
          event: "response",
          payload: response,
        });
      }
    } catch (error) {
      console.log("fatal error", error);
      ws.send({
        id: request.id,
        event: "response",
        payload: {
          ok: false,
          message: "Error",
        },
      });
    }
  },
  open(ws) {
    console.log("Client connected");
    // add connection in connections
    connections.set(ws.id, ws);
  },
  close(ws) {
    console.log("Client disconnected");
    // remove
    connections.delete(ws.id);
    onlineClients.delete(ws.id);
  },
});
