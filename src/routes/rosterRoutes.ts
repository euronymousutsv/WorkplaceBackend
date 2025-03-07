import express from 'express';
import {createShift, updateShift, deleteShift, getShifts, autoAssignShifts } from '../controllers/rosterController';
import {authMiddleware} from "../middleware/authmiddleware";


const router = express.Router();
router.post('/createShift', createShift);
router.get("/",authMiddleware, getShifts);
router.post("/", createEmployee);

export default router;
