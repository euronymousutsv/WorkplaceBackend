import express, { Request, Response } from "express";

import {
  editCurrentUserDetail,
  getCurrentUserDetails,
  loginUser,
  registerUser,
  validateVerificationCode,
  verificationCode,
} from "../controllers/authController";
import { refreshToken, verifyLoginStatus } from "../utils/jwtGenerater";

const router = express.Router();
// Test route to verify registration
router.get("/", (req: Request, res: Response) => {
  console.log("Login route accessed");
  res.send("Login route is working");
});

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/sendVerificationCode").post(verificationCode);
router.route("/validateVerificationCode").post(validateVerificationCode);
router
  .route("/editCurrentUserDetail")
  .post(verifyLoginStatus, editCurrentUserDetail);
router
  .route("/getCurrentUserDetails")
  .get(verifyLoginStatus, getCurrentUserDetails);
router.route("/refreshToken").get(verifyLoginStatus, refreshToken);

export default router;

// NOTE: All TODO comments indicate where to add database integration later.

// below this is the new login routes
