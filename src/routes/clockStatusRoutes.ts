import express from "express";
import { authMiddleware } from "../middleware/authmiddleware";
import { clockIn, clockOut, startBreak, endBreak, getEmployeeAttendance, getAllAttendance, } from "../controllers/clockStatusController";

const router = express.Router();

router.post("/clockIn", clockIn);
router.put("clockOut", clockOut);


export default router;