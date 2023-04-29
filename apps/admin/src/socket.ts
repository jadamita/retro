import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export const initiateSocketConnection = () => {
  socket = io(import.meta.env.VITE_WS_HOST);
  console.log(`Connecting socket...`);
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  if (socket) socket.disconnect();
};

export const subscribeToUpdates = (cb: any) => {
  socket.on("BOX_LIST", (data) => {
    return cb(null, data);
  });
};

export const sendUpdate = (
  id: string,
  x: number,
  y: number,
  color: string,
  content: string
) => {
  socket.emit("NEW_BOX", {
    id: id,
    x: x,
    y: y,
    color: color,
    content: content,
  });
};

export const sendRemove = (id: string) => {
  socket.emit("REMOVE_BOX", { id: id });
};

export const sendColorChange = (id: string, color: string) => {
  socket.emit("COLOR_BOX", { id: id, color: color });
};

export const sendContentChange = (id: string, content: string) => {
  socket.emit("CONTENT_BOX", { id: id, content: content });
};

export const setPositionChange = (id: string, x: number, y: number) => {
  socket.emit("MOVE_BOX", { id: id, x: x, y: y });
};

export const sendReset = () => {
  socket.emit("RESET");
};
