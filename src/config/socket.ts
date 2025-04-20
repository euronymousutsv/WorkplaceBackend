import { Server } from "socket.io";
import http from "http";
import express from "express";
import { saveAndBroadcastMessage } from "../controllers/server/chatController";
import { uploadBase64ToS3 } from "../controllers/files/fileController";

const app = express();
const server = http.createServer(app);

// edit cors
const io = new Server(server, {
  cors: {
    origin: "https://workhive.space/",
    methods: ["GET", "POST"],
  },
});

export interface MessageData {
  messageId: string;
  isImage: boolean;
  message: string;
  channel: string;
  channelName: string;
  time: Date;
  author: AuthorDetail;
}

export interface AuthorDetail {
  id: string;
  name: string;
  profileImage: string;
}

// run when client connects
io.on("connection", (socket) => {
  const userIds: { [key: string]: string } = {};
  console.log("A new connection has been made: ", socket.id);

  socket.on("join_channel", (channel: string, userId: string) => {
    socket.join(channel);
    userIds[socket.id] = userId;
    console.log(`${socket.id} joined channel: ${channel}`);
  });

  // Sending a message to a channel
  socket.on("send_message", async (data: MessageData) => {
    if (data.isImage) {
      data.message = data.message.replace("data:image/png;base64,", "");
    }

    const uri = await uploadBase64ToS3(data.message, "workhive-chats");
    data.message = uri;

    saveAndBroadcastMessage(data, socket);
    // io.to(data.channel).emit("receive_message", data);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

export { io, app, server };
