import express from "express";
import {
  changeServerOwnership,
  deleteServer,
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

// Server Routes
router.post("/register", verifyLoginStatus, registerServer);
router.get("/getLoggedInUserServer/", verifyLoginStatus, getLoggedInUserServer);
router.post("/joinServer", verifyLoginStatus, joinServer);

// change and delete server
router.put("/changeServerOwnership", verifyLoginStatus, changeServerOwnership);
router.delete("/deleteServer", verifyLoginStatus, deleteServer);

// Payroll Routes
router.post("/payroll/addANewSalary", verifyLoginStatus, addANewSalary);
router.get(
  "/payroll/getAEmployeeSalary",
  verifyLoginStatus,
  getAEmployeeSalary
);

export default router;
