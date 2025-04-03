import express from "express";
import {
  getShift,
  getAllShifts,
  getShiftsByEmployeeId,
  getShiftsByDateRange,
  createShift,
  updateShift,
  getShiftWithDetails,
  getAllShiftsWithDetails,
  createRepeatingShifts,
  getEmployeeAvailability,
  getAvailabilityByEmployeeId,
  createEmployeeAvailability,
  updateEmployeeAvailability,
  deleteEmployeeAvailability,
  getEmployeeWithAvailability,
} from "../controllers/shiftController";

const router = express.Router();

router.get("/shifts", getAllShifts);
router.get("/shifts/:id", getShift);
router.get("/shifts/:id/details", getShiftWithDetails);
router.get("/shifts/details", getAllShiftsWithDetails);
router.get("/shifts/employee/:employeeId", getShiftsByEmployeeId);
router.get("/shifts/range", getShiftsByDateRange);
router.post("/shifts", createShift);
router.put("/shifts/:id", updateShift);
router.post("/shifts/repeat", createRepeatingShifts);

export default router;

/************************Employee Availibility Routes************************************ */
router.get("/availability/:id", getEmployeeAvailability);
router.get("/availability/employee/:employeeId", getAvailabilityByEmployeeId);
router.get(
  "/availability/employee/:employeeId/details",
  getEmployeeWithAvailability
);
router.post("/availability", createEmployeeAvailability);
router.put("/availability/:id", updateEmployeeAvailability);
router.delete("/availability/:id", deleteEmployeeAvailability);
