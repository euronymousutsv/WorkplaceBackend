import express from "express";
import {
  createEmployee,
  getAllEmployees,
  loginEmployee,

} from "../controllers/employeeController";
import {authMiddleware} from "../middleware/authmiddleware";

const router = express.Router();
router.post('/login', loginEmployee);
router.get("/",authMiddleware, getAllEmployees);
router.post("/", createEmployee);

export default router;
