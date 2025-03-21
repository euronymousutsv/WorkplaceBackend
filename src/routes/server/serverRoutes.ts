import express from "express";
import {
  getLoggedInUserServer,
  joinServer,
  registerServer,
} from "../../controllers/server/serverController.js";
import {
  addANewSalary,
  getAEmployeeSalary,
} from "../../controllers/server/payrollController.js";

const router = express.Router();
router.post("/register", registerServer);
router.get("/getLoggedInUserServer/", getLoggedInUserServer);
router.post("/joinServer", joinServer);
router.post("/payroll/addANewSalary", addANewSalary);
router.get("/payroll/getAEmployeeSalary", getAEmployeeSalary);

export default router;
