require("dotenv").config();
import syncDatabase from "./config/sync";
const cron = require("node-cron");
require("dotenv").config();
import { checkExpiringDocuments } from "./utils/expiryMailer";
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./config/db";
import authRoutes from "./routes/loginRoute";
import rosterRoutes from "./routes/rosterRoutes";
import serverRouter from "./routes/server/serverRoutes";
import channelRouter from "./routes/server/channelRoutes";
import chatRouter from "./routes/server/chatRoutes";
import { app, server } from "./config/socket";
import clockRoute from "./routes/clockStatusRoutes";
import documentRoutes from "./routes/documentRoutes";
import notificationRouter from "./routes/notificationRoutes";
import officeRoutes from "./routes/officeRoutes";
import timeLogRoutes from "./routes/timeLog/timeLogRoutes";
import businessRoutes from "./routes/businessLogicRoutes";
import shiftRoutes from "./routes/shiftRoutes";
import locationRoutes from "./routes/locationRoutes";
import systemSettingRoutes from "./routes/settingRoutes";
import ApiError from "./utils/apiError";
import { StatusCode } from "./utils/apiResponse";
import scheduleRoutes from "./routes/server/scheduleRoutes";
import fileRouter from "./routes/file/fileRoutes";
import leaveRouter from "./routes/timeLog/leaveRoutes";
import router from "./routes/payroll/payrollRoutes";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("<h1>WorkHive Api is working </h1>");
});
app.use("/api/businessLogic", businessRoutes);
app.use("/api/system-settings", systemSettingRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/shift", shiftRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/roster", rosterRoutes);
app.use("/api/v1/server", serverRouter);
app.use("/api/v1/channel", channelRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/notify", notificationRouter);
app.use("/api/v1/office", officeRoutes);
app.use("api/clock", clockRoute);
app.use("/api/document", documentRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/v1/file", fileRouter);
app.use("/api/v1/timeLog", timeLogRoutes);
app.use("/api/v1/leave", leaveRouter);
app.use("/api/v1/payroll", router);

// Global Error Handler - Must be after all routes but before server start
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err);
    return;
  }

  // Handle other types of errors
  res
    .status(StatusCode.INTERNAL_SERVER_ERROR)
    .json(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        err.message || "Internal Server Error"
      )
    );
};

app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
syncDatabase();

sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

cron.schedule("0 8 * * *", async () => {
  try {
    await checkExpiringDocuments();
    console.log(
      "Checked for expiring documents and sent notifications if needed."
    );
  } catch (error) {
    console.error("Error in running expiry tracker:", error);
  }
});
