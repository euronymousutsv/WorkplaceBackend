import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// edit cors
const io = new Server(server, {
  cors: {
    origin: ["http://192.168.1.104:3000"],
  },
});

// run when client connects
io.on("connection", (socket) => {
  console.log("A new connection has been made: ", socket.id);

  socket.on("sendMessage", (message) => {
    console.log("Received message:", message);

    // Broadcast the message to all connected clients
    io.emit("receiveMessage", message);
  });

  socket.join("room");

  // io.to("room").emit("send Message", (message) => {
  //   console.log(message);
  // });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

export { io, app, server };
