import { getChatMessages, startChat } from "@/handlers/chat";
import { sendMessage } from "@/handlers/message";
import { getChats } from "@/handlers/chat";
import { UserInfo } from "@/types";
import { SocketMessage } from "@/types";

export const handlerExcuter = (
  userInfo: UserInfo,
  message: SocketMessage
): any => {
  switch (message.event) {
    case "startChat":
      return startChat({ userInfo, payload: message.payload });
    case "sendMessage":
      return sendMessage({ userInfo, payload: message.payload });
    case "getChatMessages":
      return getChatMessages({ userInfo, payload: message.payload });
    case "getChats":
      return getChats({ userInfo, payload: message.payload });
    default:
      return {
        id: message.id,
        event: "response",
        data: {
          ok: false,
          message: "Event not found",
        },
      };
  }
};
