import express from "express";
import {
  getShiftsForOffice,
  createOffice,
  getAllOffices,
  updateOfficeDetails,
} from "../controllers/officeController";
import { verifyLoginStatus } from "../middleware/verifyLoginMiddleware";
import { checkPermission, Role } from "../middleware/accessCheckerMiddleware";
const router = express.Router();

router.get("/getShiftsForOffice", verifyLoginStatus, getShiftsForOffice);
router.get("/getAllOffices", verifyLoginStatus, getAllOffices);

// Only Admin can access this route
router.post(
  "/createOffice",
  verifyLoginStatus,
  checkPermission(Role.ADMIN),
  createOffice
);

// Only Admin can access this route
router.patch(
  "/updateOfficeDetails",
  verifyLoginStatus,
  checkPermission(Role.ADMIN),
  updateOfficeDetails
);

export default router;
