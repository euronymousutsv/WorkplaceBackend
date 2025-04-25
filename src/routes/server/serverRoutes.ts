import express from "express";
import {
  changeServerOwnership,
  deleteServer,
  getAllUsersInServer,
  getLoggedInUserServer,
  joinServer,
  kickEmployee,
  leaveServer,
  partialRegestrationEmployee,
  registerServer,
  searchServer,
  updateEmployeeDetails,
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
import {
  getEmployeeById,
  updateEmployeeInfo,
} from "../../models/employeeController";

const router = express.Router();

// Server Routes
// router.post("/register", verifyLoginStatus, registerServer);

router.post("/search", searchServer);
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
router.delete("/leaveServer", verifyLoginStatus, leaveServer);
router.get("/fetchAllUsers", verifyLoginStatus, getAllUsersInServer);

// employee details
router.get("/getEmployeeById/:id", verifyLoginStatus, getEmployeeById);

// updates additional infos
router.patch(
  "/updateEmployeeInfo",
  verifyLoginStatus,
  checkPermission(Role.MANAGER),
  updateEmployeeInfo
);
router.put(
  "/updateRole",
  verifyLoginStatus,
  checkPermission(Role.ADMIN),
  updateRole
);
router.put(
  "/updateEmployeeDetails",
  verifyLoginStatus,
  checkPermission(Role.ADMIN),
  updateEmployeeDetails
);
router.post("/partialRegestrationEmployee", partialRegestrationEmployee);

// Send server wide notifications / annoucement
// Payroll Routes
router.post("/payroll/addANewSalary", verifyLoginStatus, addANewSalary);
router.get(
  "/payroll/getAEmployeeSalary",
  verifyLoginStatus,
  getAEmployeeSalary
);

export default router;
