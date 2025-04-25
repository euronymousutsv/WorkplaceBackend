import { Router } from "express";
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  updateTimeLog,
  getTimeLogByDateRange,
  getTimeLogByDateRangeForEmployee,
  getLoggedInUserTodaysTimeLog,
} from "../../controllers/timelog/timelogController";
import { verifyLoginStatus } from "../../middleware/verifyLoginMiddleware";

const router = Router();
router.post("/clock-in", verifyLoginStatus, clockIn);
router.post("/clock-out", verifyLoginStatus, clockOut);
router.post("/start-break", verifyLoginStatus, startBreak);
router.post("/end-break", verifyLoginStatus, endBreak);
router.patch("/update", verifyLoginStatus, updateTimeLog);

// chnage into get
router.post("/date-range", verifyLoginStatus, getTimeLogByDateRange);
router.post(
  "/date-range-logged-in-user",
  verifyLoginStatus,
  getTimeLogByDateRangeForEmployee
);
router.get("/today", verifyLoginStatus, getLoggedInUserTodaysTimeLog);
export default router;
