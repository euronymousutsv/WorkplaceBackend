import express from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import {
  createShift,
  getShifts,
  deleteShift,
  autoAssignShifts,
  updateShift,
  getShiftsForLoggedInUser,
} from "../controllers/rosterController.js";

const router = express.Router();
router.post("/createShift", createShift);
// router.get("/",authMiddleware, getShifts);
router.get("/", getShifts);
router.delete("/deleteShift", deleteShift);
router.post("/autoShift", autoAssignShifts);
router.get("/getShiftsForLoggedInUser", getShiftsForLoggedInUser);
router.put("/updateShift/:id", updateShift);
export default router;
