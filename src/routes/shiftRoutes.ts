import * as shiftController from "../controllers/shiftController";
import express from "express";

const router = express.Router();

router.get("/shifts", shiftController.getAllShifts);
router.get("/shifts/:id", shiftController.getShift);
router.get("/shifts/:id/details", shiftController.getShiftWithDetails);
router.get("/shifts/details", shiftController.getAllShiftsWithDetails);
router.get(
  "/shifts/employee/:employeeId",
  shiftController.getShiftsByEmployeeId
);
router.get("/shifts/range", shiftController.getShiftsByDateRange);
router.post("/shifts", shiftController.createShift);
router.put("/shifts/:id", shiftController.updateShift);
router.post("/shifts/repeat", shiftController.createRepeatingShifts);

/************************Employee Availibility Routes************************************ */
router.get("/availability/:id", shiftController.getEmployeeAvailability);
router.get(
  "/availability/employee/:employeeId",
  shiftController.getAvailabilityByEmployeeId
);
router.get(
  "/availability/employee/:employeeId/details",
  shiftController.getEmployeeWithAvailability
);
router.post("/availability", shiftController.createEmployeeAvailability);
router.patch("/availability/:id", shiftController.updateEmployeeAvailability);
router.delete("/availability/:id", shiftController.deleteEmployeeAvailability);

// --- Break Periods ---
router.get("/breaks/:id", shiftController.getBreakPeriod);
router.get("/breaks/shift/:shiftId", shiftController.getBreakPeriodsByShiftId);
router.get(
  "/breaks/employee/:employeeId",
  shiftController.getBreakPeriodsByEmployeeId
);
router.post("/breaks", shiftController.createBreakPeriod);
router.patch("/breaks/:id", shiftController.updateBreakPeriod);

// --- Clock In/Out ---
router.get("/clock/:id", shiftController.getClockInOut);
router.get(
  "/clock/employee/:employeeId",
  shiftController.getClockInOutByEmployeeId
);
router.get(
  "/clock/employee/:employeeId/latest",
  shiftController.getLatestClockByEmployeeId
);
router.post("/clock", shiftController.createClockInOut);

// --- Penalty Rates ---
router.get("/penalty-rates/:id", shiftController.getPenaltyRate);
router.get("/penalty-rates", shiftController.getAllPenaltyRates);
router.post("/penalty-rates", shiftController.createPenaltyRate);
router.patch("/penalty-rates/:id", shiftController.updatePenaltyRate);

// --- Time Off ---
router.get("/time-off/:id", shiftController.getTimeOff);
router.get(
  "/time-off/employee/:employeeId",
  shiftController.getTimeOffByEmployeeId
);
router.post("/time-off", shiftController.createTimeOff);
router.patch("/time-off/:id", shiftController.updateTimeOff);

// --- Shift Requests ---
router.get("/shift-requests/:id", shiftController.getShiftRequest);
router.get(
  "/shift-requests/employee/:employeeId",
  shiftController.getShiftRequestsByEmployeeId
);
router.get("/shift-requests/pending", shiftController.getPendingShiftRequests);
router.post("/shift-requests", shiftController.createShiftRequest);
router.patch("/shift-requests/:id", shiftController.updateShiftRequest);

export default router;
