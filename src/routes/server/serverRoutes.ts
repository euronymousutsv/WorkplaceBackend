import express from "express";
import {
  getLoggedInUserServer,
  joinServer,
  registerServer,
} from "../../controllers/server/serverController";
import {
  addANewSalary,
  getAEmployeeSalary,
} from "../../controllers/server/payrollController";
import { verifyLoginStatus } from "../../utils/jwtGenerater";

const router = express.Router();
router.post("/register", verifyLoginStatus, registerServer);
router.get("/getLoggedInUserServer/", verifyLoginStatus, getLoggedInUserServer);
router.post("/joinServer", verifyLoginStatus, joinServer);
router.post("/payroll/addANewSalary", verifyLoginStatus, addANewSalary);
router.get(
  "/payroll/getAEmployeeSalary",
  verifyLoginStatus,
  getAEmployeeSalary
);

export default router;
