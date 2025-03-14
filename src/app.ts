require("dotenv").config();
import syncDatabase from "./config/sync";

require("dotenv").config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import employeeRoutes from "./routes/employeeRoutes";
import sequelize from "./config/db";
import authRoutes from "./routes/loginRoute";
import http from "http";
import { Server } from "socket.io";
import rosterRoutes from "./routes/rosterRoutes";
import clockStatusRoutes from "./routes/clockStatusRoutes";
const app = express();
// Normally express uses this under the hood but to run a socket.io server we will need to use this.
const server = http.createServer(app);
const io = new Server(server);

// run when client connects
io.on("connection", (socket) => {
  console.log("New Web socket connection : ", socket.id);

  socket.on("send_message", (message) => {
    io.emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/roster", rosterRoutes);
app.use("/api/clockStatus", clockStatusRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
syncDatabase();

// async function test() {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// }
// test();

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
