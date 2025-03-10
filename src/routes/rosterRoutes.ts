import express from "express";
import { authMiddleware } from "../middleware/authmiddleware";
import { createShift, getShifts, deleteShift, autoAssignShifts, updateShift } from '../controllers/rosterController';


const router = express.Router();
router.post('/createShift', createShift);
router.get("/",authMiddleware, getShifts);
router.delete("/deleteShift", deleteShift);
router.post("/autoShift", autoAssignShifts);
router.put("/updateShift", updateShift);
export default router;
