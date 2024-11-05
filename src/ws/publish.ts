import { connections } from "@/connections";
import cuid from "cuid";

export const publishToUser = async ({
  coonectionId,
  event,
  payload,
}: {
  coonectionId: string;
  event: string;
  payload: any;
}) => {
  try {
    // find connection
    const connection = connections.get(coonectionId);
    if (!connection) {
      return;
    }

    connection.send({
      id: cuid(),
      event: event,
      payload: payload,
    });
  } catch (error) {
    console.log(error);
  }
};

export const publishToAll = async (message: any) => {
  try {
    connections.forEach((ws) => {
      ws.send(message);
    });
  } catch (error) {
    console.log(error);
  }
};
