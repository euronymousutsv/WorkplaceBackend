import express, { Request, Response } from "express";

import { refreshToken } from "../utils/jwtGenerater";
import { verifyLoginStatus } from "../middleware/verifyLoginMiddleware";
import {
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

export default router;
