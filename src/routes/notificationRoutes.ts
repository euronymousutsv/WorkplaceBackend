import express, { Request, Response } from "express";
import { verifyLoginStatus } from "../middleware/verifyLoginMiddleware";
import {
  fetchAllNotifications,
  registerDevice,
  sendNotificationToEmployee,
  sendNotificationToSelectedUsers,
  sendNotificationToServer,
} from "../controllers/notificationController";

const router = express.Router();
router.route("/registerDevice").post(verifyLoginStatus, registerDevice);
router
  .route("/sendNotificationToEmployee")
  .post(verifyLoginStatus, sendNotificationToEmployee);
router
  .route("/sendNotificationToSelectedUsers")
  .post(verifyLoginStatus, sendNotificationToSelectedUsers);
router
  .route("/sendNotificationToServer")
  .post(verifyLoginStatus, sendNotificationToServer);
router
  .route("/fetchAllNotifications")
  .get(verifyLoginStatus, fetchAllNotifications);

export default router;
