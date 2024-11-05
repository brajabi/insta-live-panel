export type SocketMessage = {
  id: string;
  event: string;
  payload: any;
};

export type UserInfo = {
  id: string;
  connectionId: string;
  sessionId: string;
  userId: string;
  mobile?: string;
};

export type HandlerType = {
  userInfo: UserInfo;
  payload: any;
};
