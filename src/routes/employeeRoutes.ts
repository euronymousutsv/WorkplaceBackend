import express from "express";
import {
  createEmployee,
  getAllEmployees,
  loginEmployee,

} from "../controllers/employeeController";

const router = express.Router();
router.post('/login', loginEmployee);
router.get("/", getAllEmployees);
router.post("/", createEmployee);

export default router;
