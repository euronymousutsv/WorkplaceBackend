import { Router } from "express";

import { verifyLoginStatus } from "../../middleware/verifyLoginMiddleware";
import {
  approveHours,
  fetchAllPayrollForLoggedIn,
  fetchApproveHoursWithinDateRange,
  fetchApprovedHoursForEmployeeInDateRange,
  sendApprovedHoursToPayroll,
} from "../../controllers/payroll/payrollController";

const router = Router();

router.post("/approve-hours", verifyLoginStatus, approveHours);
router.get(
  "/fetch-approve-hours-within-date-range",
  verifyLoginStatus,
  fetchApproveHoursWithinDateRange
);
router.get(
  "/fetch-approved-hours-for-employee-in-date-range",
  verifyLoginStatus,
  fetchApprovedHoursForEmployeeInDateRange
);
router.post(
  "/send-approved-hours",
  verifyLoginStatus,
  sendApprovedHoursToPayroll
);

router.get(
  "/fetchAllPayrollForLoggedInEmployee",
  verifyLoginStatus,
  fetchAllPayrollForLoggedIn
);

export default router;
