import express from "express";
import {
  getShiftsForOffice,
  createOffice,
  getAllOffices,
  updateOfficeDetails,
  joinAnEmployeeToOffice,
  getAllEmployeesInOffice,
} from "../controllers/server/officeController";
import { verifyLoginStatus } from "../middleware/verifyLoginMiddleware";
import { checkPermission, Role } from "../middleware/accessCheckerMiddleware";
const router = express.Router();

router.get("/getShiftsForOffice", verifyLoginStatus, getShiftsForOffice);
router.get(
  "/getAllEmployeeInOffice",
  verifyLoginStatus,
  getAllEmployeesInOffice
);

router.get("/getAllOffices", verifyLoginStatus, getAllOffices);
router.get(
  "/getAllEmployeesInOffice",
  verifyLoginStatus,
  getAllEmployeesInOffice
);

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

router.post(
  "/joinOffice",
  verifyLoginStatus,
  // checkPermission(Role.MANAGER),
  joinAnEmployeeToOffice
);

export default router;
