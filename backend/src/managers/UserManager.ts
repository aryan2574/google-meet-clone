import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

export interface User {
  socket: Socket;
  name: string;
}

export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;

  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, socket: Socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);

    socket.emit("lobby");
    this.clearQueue();
    this.initHandlers(socket);
  }

  removeUser(socketId: string) {
    this.users = this.users.filter((x) => x.socket.id !== socketId);
    this.queue = this.queue.filter((x) => x !== socketId);
  }

  clearQueue() {
    if (this.queue.length < 2) return;

    const user1 = this.users.find((x) => x.socket.id === this.queue.shift());
    const user2 = this.users.find((x) => x.socket.id === this.queue.shift());

    if (!user1 || !user2) return;

    this.roomManager.createRoom(user1, user2);
    this.clearQueue();
  }

  initHandlers(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onOffer(roomId, sdp, socket.id);
    });

    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onAnswer(roomId, sdp, socket.id);
    });

    socket.on(
      "ice-candidate",
      ({
        roomId,
        candidate,
        type,
      }: {
        roomId: string;
        candidate: any;
        type: "sender" | "receiver";
      }) => {
        this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
      }
    );

    socket.on("disconnect", () => {
      this.removeUser(socket.id);
    });
  }
}
