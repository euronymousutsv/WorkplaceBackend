import express from "express";
import {
  createEmployee,
  getAllEmployees,

} from "../controllers/userController";

const router = express.Router();

router.get("/", getAllEmployees);
router.post("/", createEmployee);

export default router;
