import e, { Request, Response } from "express";
import { Employee } from "../../models/employeeModel";
import JoinedOffice from "../../models/joinedOfficeModel";
import LeaveRequest, {
  LeaveRequestAttributes,
  LeaveTypeAttributes,
} from "../../models/leave/LeaveRequest";
import ApiError from "../../utils/apiError";
import ApiResponse from "../../utils/apiResponse";
import { getAccessToken } from "../../utils/helper";
import { verifyAccessToken } from "../../utils/jwtGenerater";
import { createNotification } from "../notificationController";

interface CreateLeaveReqPayload {
  startDate: Date;
  endDate: Date;
  reason?: string;
  leaveType?: LeaveTypeAttributes;
}

// Create a leave request
const createALeaveRequest = async (
  req: Request<{}, {}, CreateLeaveReqPayload>,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, reason, leaveType } = req.body;

    console.log("Leave Request Body:", leaveType);

    if (!reason) {
      throw new ApiError(400, {}, "Reason is required");
    }

    if (!leaveType) {
      throw new ApiError(400, {}, "What type of leave are you requesting?");
    }
    const token = getAccessToken(req);
    const employeeId = verifyAccessToken(token)?.userId;
    if (!employeeId) {
      throw new ApiError(401, {}, "Employee id not found");
    }

    // searfch office for employee
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      throw new ApiError(404, {}, "Employee not found");
    }

    const joinedOffice = await JoinedOffice.findOne({
      where: {
        id: employeeId,
      },
    });

    if (!joinedOffice) {
      throw new ApiError(404, {}, "Employee not found in any office");
    }

    if (!startDate || !endDate) {
      throw new ApiError(400, {}, "Start date and end date are required");
    }
    if (new Date(startDate) > new Date(endDate)) {
      throw new ApiError(400, {}, "Start date cannot be after end date");
    }

    if (!Object.values(LeaveTypeAttributes).includes(leaveType)) {
      throw new ApiError(400, {}, "Invalid leave type");
    }

    const leaveRequest = await LeaveRequest.create({
      officeId: joinedOffice.officeId,
      employeeId,
      startDate,
      endDate,
      reason,
      leaveType,
    });

    if (!leaveRequest) {
      throw new ApiError(500, {}, "Failed to create leave request");
    }

    res
      .status(201)
      .json(
        new ApiResponse(201, leaveRequest, "Leave request created successfully")
      );
  } catch (error) {
    console.error("Leave request error:", error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(500)
        .json(
          new ApiError(
            500,
            {},
            "An error occurred while creating leave request"
          )
        );
    }
  }
};

// Fetch all leave requests within an office
const fetchAllLeaveRequestInAnOffice = async (
  req: Request<{}, {}, {}, { officeId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { officeId } = req.query;

    if (!officeId) {
      throw new ApiError(400, {}, "Office id is required");
    }

    const leaveRequests = await LeaveRequest.findAll({
      where: {
        officeId,
      },
      include: [
        {
          model: Employee,
          attributes: {
            exclude: ["password"],
          },
        },
      ],
    });

    if (!leaveRequests) {
      throw new ApiError(404, {}, "No leave requests found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          leaveRequests,
          "Leave requests fetched successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res.status(500).send("An error occurred while fetching leave requests.");
    }
  }
};

// Fetch leave requests for a specific employee
const updateLeaveRequestDetails = async (
  req: Request<{}, {}, LeaveRequestAttributes>,
  res: Response
): Promise<void> => {
  try {
    const {
      id,
      startDate,
      endDate,
      reason,
      leaveType,
      employeeId,
      isApproved,
    } = req.body;

    if (!id) {
      throw new ApiError(400, {}, "Leave request ID is required");
    }

    const leaveRequest = await LeaveRequest.findByPk(id);
    if (!leaveRequest) {
      throw new ApiError(404, {}, "Leave request not found");
    }

    // Update only if values are provided
    if (startDate !== undefined) leaveRequest.startDate = new Date(startDate);
    if (endDate !== undefined) leaveRequest.endDate = new Date(endDate);
    if (reason !== undefined) leaveRequest.reason = reason;
    if (leaveType !== undefined) leaveRequest.leaveType = leaveType;
    if (employeeId !== undefined) leaveRequest.employeeId = employeeId;
    if (isApproved !== undefined) leaveRequest.isApproved = isApproved;

    await leaveRequest.save();

    await createNotification(
      leaveRequest.employeeId,
      "Your Leave has some new updates. ",
      ""
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, leaveRequest, "Leave request updated successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("Update Error:", error);
      res
        .status(500)
        .send("An error occurred while updating the leave request.");
    }
  }
};

// delete leave request
const deleteLeaveRequest = async (
  req: Request<{}, {}, {}, { id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

    if (!id) {
      throw new ApiError(400, {}, "Leave request ID is required");
    }

    const leaveRequest = await LeaveRequest.findByPk(id);
    if (!leaveRequest) {
      throw new ApiError(404, {}, "Leave request not found");
    }

    await leaveRequest.destroy();

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Leave request deleted successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("Delete Error:", error);
      res
        .status(500)
        .send("An error occurred while deleting the leave request.");
    }
  }
};

// fetch leave request for loggedIn employee
const fetchLeaveRequestForLoggedInEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = getAccessToken(req);
    const employeeId = verifyAccessToken(token)?.userId;
    if (!employeeId) {
      throw new ApiError(401, {}, "Employee id not found");
    }

    const leaveRequests = await LeaveRequest.findAll({
      where: {
        employeeId,
      },
      include: [
        {
          model: Employee,
          attributes: {
            exclude: ["password"],
          },
        },
      ],
    });

    if (!leaveRequests) {
      throw new ApiError(404, {}, "No leave requests found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          leaveRequests,
          "Leave requests fetched successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res.status(500).send("An error occurred while fetching leave requests.");
    }
  }
};

export {
  createALeaveRequest,
  fetchAllLeaveRequestInAnOffice,
  updateLeaveRequestDetails,
  deleteLeaveRequest,
  fetchLeaveRequestForLoggedInEmployee,
};
