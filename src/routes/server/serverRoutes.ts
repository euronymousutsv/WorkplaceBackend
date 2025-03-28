import express from "express";
import {
  changeServerOwnership,
  deleteServer,
  getLoggedInUserServer,
  joinServer,
  kickEmployee,
  registerServer,
  updateRole,
} from "../../controllers/server/serverController";
import {
  addANewSalary,
  getAEmployeeSalary,
} from "../../controllers/server/payrollController";
import { verifyLoginStatus } from "../../middleware/verifyLoginMiddleware";
import {
  checkPermission,
  Role,
} from "../../middleware/accessCheckerMiddleware";

const router = express.Router();

// Server Routes
router.post("/register", verifyLoginStatus, registerServer);
router.get("/getLoggedInUserServer/", verifyLoginStatus, getLoggedInUserServer);
router.post("/joinServer", verifyLoginStatus, joinServer);

// change and delete server
router.put("/changeServerOwnership", verifyLoginStatus, changeServerOwnership);
router.delete(
  "/deleteServer",
  verifyLoginStatus,
  checkPermission(Role.ADMIN),
  deleteServer
);

// kick Employee from a server
router.delete("/kickEmployee", verifyLoginStatus, kickEmployee);
router.put(
  "/updateRole",
  verifyLoginStatus,
  checkPermission(Role.ADMIN),
  updateRole
);

// Send server wide notifications / annoucement
// Payroll Routes
router.post("/payroll/addANewSalary", verifyLoginStatus, addANewSalary);
router.get(
  "/payroll/getAEmployeeSalary",
  verifyLoginStatus,
  getAEmployeeSalary
);

export default router;
