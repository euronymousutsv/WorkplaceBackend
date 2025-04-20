import express, { Request, Response } from "express";
import { verifyLoginStatus } from "../middleware/verifyLoginMiddleware";
import {
  fetchAllNotifications,
  registerDevice,
  sendNotificationToEmployee,
  sendNotificationToOffice,
  sendNotificationToSelectedUsers,
  sendNotificationToServer,
} from "../controllers/notificationController";
import { checkPermission, Role } from "../middleware/accessCheckerMiddleware";

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
  .post(
    verifyLoginStatus,
    checkPermission(Role.ADMIN),
    sendNotificationToServer
  );
router.route("/sendNotificationToOffice").post(
  verifyLoginStatus,
  // checkPermission(Role.MANAGER),
  sendNotificationToOffice
);
router
  .route("/fetchAllNotifications")
  .get(verifyLoginStatus, fetchAllNotifications);

export default router;
