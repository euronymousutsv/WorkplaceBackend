import express from "express";
import {
  createShift,
  getShifts,
  deleteShift,
  autoAssignShifts,
  updateShift,
  getShiftsForLoggedInUser,
  getShiftsForOffice,
  getAllOffices,
  createOffice,
} from "../controllers/rosterController";
import { verifyLoginStatus } from "../middleware/verifyLoginMiddleware";

const router = express.Router();
router.post("/createShift", createShift);
// router.get("/",authMiddleware, getShifts);
router.get("/", getShifts);
router.delete("/deleteShift", verifyLoginStatus, deleteShift);
router.post("/autoShift", verifyLoginStatus, autoAssignShifts);
router.get("/getShiftsForOffice", verifyLoginStatus, getShiftsForOffice);

// working
router.get(
  "/getShiftsForLoggedInUser",
  verifyLoginStatus,
  getShiftsForLoggedInUser
);
router.put("/updateShift/:id", verifyLoginStatus, updateShift);
export default router;
