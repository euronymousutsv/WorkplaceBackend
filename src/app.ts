require("dotenv").config();
import syncDatabase from "./config/sync.js";

require("dotenv").config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./config/db.js";
import authRoutes from "./routes/loginRoute.js";
import rosterRoutes from "./routes/rosterRoutes.js";
import serverRouter from "./routes/server/serverRoutes.js";
import channelRouter from "./routes/server/channelRoutes.js";
import chatRouter from "./routes/server/chatRoutes.js";
import { app, server } from "./config/socket.js";
import clockRoute from "./routes/clockStatusRoutes.js";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/roster", rosterRoutes);
app.use("/api/v1/server", serverRouter);
app.use("/api/v1/channel", channelRouter);
app.use("/api/v1/chat", chatRouter);
app.use("api/clock", clockRoute);

// Start Server
const PORT = process.env.PORT || 5000;
syncDatabase();

sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
