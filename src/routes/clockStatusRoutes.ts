import express from "express";
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getEmployeeAttendance,
  getAllAttendance,
} from "../controllers/clockStatusController";
import { verifyLoginStatus } from "../middleware/verifyLoginMiddleware";

const router = express.Router();
router.post("/clockIn", verifyLoginStatus, clockIn);
router.put("/clockOut", verifyLoginStatus, clockOut);
router.post("/startBreak", verifyLoginStatus, startBreak);
router.post("/endBreak", verifyLoginStatus, endBreak);
router.get("/employeeAttendance", getEmployeeAttendance);
router.get("/allAttendance", getAllAttendance);
export default router;
