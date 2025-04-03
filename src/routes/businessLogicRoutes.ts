import express from "express";
import {
  validateGeolocationHandler,
  getLeaveBalance,
  getWeeklyRoster,
  getDashboardSummary,
  calculatePayrate,
  assignShifts,
} from "../controllers/businessLogic";

const router = express.Router();

router.post("/validate-geolocation", validateGeolocationHandler);

// GET leave balance for an employee
router.get("/leave-balance/:employeeId", getLeaveBalance);

// GET weekly roster
router.get("/weekly-roster", getWeeklyRoster);

// GET dashboard summary
router.get("/dashboard-summary", getDashboardSummary);

// POST calculate payrate
router.post("/payrate", calculatePayrate);

// POST auto-assign shifts
router.post("/auto-assign-shifts", assignShifts);

export default router;
