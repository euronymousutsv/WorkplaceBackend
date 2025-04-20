import express from "express";
const router = express.Router();

import { verifyLoginStatus } from "../../middleware/verifyLoginMiddleware";
import {
  checkPermission,
  Role,
} from "../../middleware/accessCheckerMiddleware";
import {
  createShift,
  getShiftsByOffice,
  getShiftsByEmployee,
  getEmployeeShiftsByDate,
  getShiftsByDateRangeForOffice,
  updateShift,
  getShiftWithDetails,
  getAllShiftsWithDetailsWithinAnOffice,
  createRepeatingShifts,
  getEmployeeAvailability,
  getAvailabilityByEmployeeId,
  getBreakPeriod,
  getBreakPeriodsByShiftId,
  getBreakPeriodsByEmployeeId,
  createBreakPeriod,
  updateBreakPeriod,
  createEmployeeAvailability,
  updateEmployeeAvailability,
  deleteEmployeeAvailability,
} from "../../controllers/scheduleController";

router.post(
  "/create",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  createShift
);
router.get(
  "/getShiftsByOffice",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  getShiftsByOffice
);
router.get("/getShiftsByEmployee", verifyLoginStatus, getShiftsByEmployee);
router.get(
  "/getEmployeeShiftsByDate",
  verifyLoginStatus,
  getEmployeeShiftsByDate
);
router.get(
  "/getShiftsByDateRangeForOffice",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  getShiftsByDateRangeForOffice
);
router.put(
  "/updateShift",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  updateShift
);
router.get("/getShiftWithDetails", verifyLoginStatus, getShiftWithDetails);
router.get(
  "/getAllShiftsWithDetailsWithinAnOffice",
  verifyLoginStatus,

  getAllShiftsWithDetailsWithinAnOffice
);

router.post(
  "/createRepeatingShifts",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  createRepeatingShifts
);
router.get(
  "/getEmployeeAvailability",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  getEmployeeAvailability
);
router.get(
  "/getAvailabilityByEmployeeId",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  getAvailabilityByEmployeeId
);
router.get(
  "/getBreakPeriod",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  getBreakPeriod
);
router.get(
  "/getBreakPeriodsByShiftId",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  getBreakPeriodsByShiftId
);
router.get(
  "/getBreakPeriodsByEmployeeId",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  getBreakPeriodsByEmployeeId
);
router.post(
  "/createBreakPeriod",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  createBreakPeriod
);
router.patch(
  "/updateBreakPeriod",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  updateBreakPeriod
);

router.post(
  "/createEmployeeAvailability",
  verifyLoginStatus,

  createEmployeeAvailability
);
router.patch(
  "/updateEmployeeAvailability",
  verifyLoginStatus,

  updateEmployeeAvailability
);

router.delete(
  "/deleteEmployeeAvailability",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  deleteEmployeeAvailability
);

// Add more routes as needed

export default router;
