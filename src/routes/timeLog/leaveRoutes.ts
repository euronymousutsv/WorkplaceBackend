import { Router } from "express";
import {
  createALeaveRequest,
  fetchAllLeaveRequestInAnOffice,
  updateLeaveRequestDetails,
  deleteLeaveRequest,
  fetchLeaveRequestForLoggedInEmployee,
} from "../../controllers/timelog/leaveController";
import { verifyLoginStatus } from "../../middleware/verifyLoginMiddleware";

const router = Router();

router.post("/createALeaveRequest", verifyLoginStatus, createALeaveRequest);
router.get(
  "/fetchAllLeaveRequestInAnOffice",
  verifyLoginStatus,
  fetchAllLeaveRequestInAnOffice
);
router.post(
  "/updateLeaveRequestDetails",
  verifyLoginStatus,
  updateLeaveRequestDetails
);
router.delete("/delete", verifyLoginStatus, deleteLeaveRequest);
router.get(
  "/fetchLeaveRequestForLoggedInEmployee",
  verifyLoginStatus,
  fetchLeaveRequestForLoggedInEmployee
);

export default router;
