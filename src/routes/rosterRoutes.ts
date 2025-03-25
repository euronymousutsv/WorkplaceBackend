import express from "express";
import {
  createShift,
  getShifts,
  deleteShift,
  autoAssignShifts,
  updateShift,
  getShiftsForLoggedInUser,
} from "../controllers/rosterController";
import { verifyLoginStatus } from "../utils/jwtGenerater";

const router = express.Router();
router.post("/createShift", createShift);
// router.get("/",authMiddleware, getShifts);
router.get("/", getShifts);
router.delete("/deleteShift", verifyLoginStatus, deleteShift);
router.post("/autoShift", verifyLoginStatus, autoAssignShifts);
router.get(
  "/getShiftsForLoggedInUser",
  verifyLoginStatus,
  getShiftsForLoggedInUser
);
router.put("/updateShift/:id", verifyLoginStatus, updateShift);
export default router;
