require("dotenv").config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import employeeRoutes from "./routes/employeeRoutes";
import sequelize, { dbConnect } from "./config/db";
import authRoutes from "./routes/loginRoute";
import http from "http";
import { Server } from "socket.io";

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

// Start Server
const PORT = process.env.PORT || 5000;
dbConnect()
  .then(() => {
    // Start the Express server if the database connection is successful
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // If the connection fails, don't start the server
    console.error("Database connection failed. Server won't start.", err);
  });
// async function test() {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// }
// test();

sequelize.sync();
// .then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// });
