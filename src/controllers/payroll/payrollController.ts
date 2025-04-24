import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import { getAccessToken } from "../../utils/helper";
import { verifyAccessToken } from "../../utils/jwtGenerater";
import { Employee } from "../../models/employeeModel";
import ApiResponse from "../../utils/apiResponse";
import { Shift } from "../../models/roster-clockinout-shifts/shiftsModel";
import { EmployeeDetails } from "../../models/employeeDetails";
import ApprovedHours, {
  ApprovedHoursAttributes,
} from "../../models/Payroll/approvedHoursModel";
import JoinedOffice from "../../models/joinedOfficeModel";
import { Op } from "sequelize";
import Income from "../../models/Payroll/incomeModel";
import TimeLog from "../../models/roster-clockinout-shifts/TimeLogModel";
import { start } from "repl";

// approve an schedule hours to be paid
const approveHours = async (
  req: Request<
    {},
    {},
    {
      timeLogId: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { timeLogId } = req.body;

    if (!timeLogId) {
      throw new ApiError(400, {}, "Time Log ID is required");
    }

    const searchedSchedule = await TimeLog.findByPk(timeLogId);

    if (!searchedSchedule) {
      throw new ApiError(404, {}, "Time Log not found");
    }

    const employeeId = searchedSchedule.employeeId;
    const searchEmployee = await EmployeeDetails.findOne({
      where: { employeeId },
    });

    if (!searchEmployee) {
      throw new ApiError(404, {}, "Employee not found");
    }

    const joinedOffice = await JoinedOffice.findOne({
      where: {
        id: searchEmployee.employeeId,
      },
    });

    if (!joinedOffice) {
      throw new ApiError(404, {}, "Joined office not found");
    }

    if (!searchedSchedule.clockIn || !searchedSchedule.clockOut) {
      throw new ApiError(
        400,
        {},
        "Clock In and Clock Out times must be provided"
      );
    }

    const startDate = new Date(searchedSchedule.clockIn);
    const endDate = new Date(searchedSchedule.clockOut);

    // For calculation
    const start = startDate.getTime();
    const end = endDate.getTime();

    const diffMs = end - start;
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)); // Store as number, not string

    const approvedHours = await ApprovedHours.create({
      employeeId: searchEmployee.employeeId,
      officeId: joinedOffice.officeId,
      date: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().split(" ")[0],
      endTime: endDate.toTimeString().split(" ")[0],
      totalHours: totalHours,
    });

    if (!approvedHours) {
      throw new ApiError(500, {}, "Failed to create approved hours");
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          approvedHours,
          "Leave request created successfully"
        )
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

// for office
// get all approve hours for a specific date range
const fetchApproveHoursWithinDateRange = async (
  req: Request<
    {},
    {},
    {},
    { startDate: string; endDate: string; officeId: string }
  >,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, officeId } = req.query;

    if (!startDate || !endDate || !officeId) {
      throw new ApiError(
        400,
        {},
        "Start date, end date and office ID are required"
      );
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const approvedHours = await ApprovedHours.findAll({
      where: {
        officeId,
        date: {
          [Op.between]: [startDateObj, endDateObj],
        },
      },
    });

    if (!approvedHours) {
      throw new ApiError(404, {}, "No approved hours found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          approvedHours,
          "Approved hours fetched successfully"
        )
      );
  } catch (error) {
    console.error("Fetch approved hours error:", error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(500)
        .json(
          new ApiError(
            500,
            {},
            "An error occurred while fetching approved hours"
          )
        );
    }
  }
};

// get approved hours for a loggedIn employee
const fetchApprovedHoursForEmployeeInDateRange = async (
  req: Request<{}, {}, {}, { startDate: string; endDate: string }>,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ApiError(400, {}, "Start date and end date are required");
    }

    const accessToken = getAccessToken(req);
    const decodedToken = verifyAccessToken(accessToken);

    if (!decodedToken) {
      throw new ApiError(401, {}, "Invalid access token");
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const employeeId = verifyAccessToken(accessToken)?.userId;

    const approvedHours = await ApprovedHours.findAll({
      where: {
        employeeId,
        date: {
          [Op.between]: [startDateObj, endDateObj],
        },
      },
    });

    if (!approvedHours) {
      throw new ApiError(404, {}, "No approved hours found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          approvedHours,
          "Approved hours fetched successfully"
        )
      );
  } catch (error) {
    console.error("Fetch approved hours error:", error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(500)
        .json(
          new ApiError(
            500,
            {},
            "An error occurred while fetching approved hours"
          )
        );
    }
  }
};

const sendApprovedHoursToPayroll = async (
  req: Request<
    {},
    {},
    {},
    { startDate: string; endDate: string; officeId: string }
  >,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, officeId } = req.query;

    if (!startDate || !endDate || !officeId) {
      throw new ApiError(
        400,
        {},
        "Start date, end date and office ID are required"
      );
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const approvedHours = await ApprovedHours.findAll({
      where: {
        officeId,
        date: {
          [Op.between]: [startDateObj, endDateObj],
        },
      },
    });

    if (!approvedHours || approvedHours.length === 0) {
      throw new ApiError(404, {}, "No approved hours found");
    }

    const groupedByEmployee = approvedHours.reduce((acc, curr) => {
      if (!acc[curr.employeeId]) {
        acc[curr.employeeId] = [];
      }
      acc[curr.employeeId].push(curr);
      return acc;
    }, {} as Record<string, ApprovedHoursAttributes[]>);

    for (const [employeeId, hoursList] of Object.entries(groupedByEmployee)) {
      const employeeDetails = await EmployeeDetails.findOne({
        where: { employeeId },
      });

      if (!employeeDetails) {
        console.warn(`Employee details not found for ID ${employeeId}`);
        continue; // skip if details missing
      }

      const totalHours = hoursList.reduce((sum, h) => sum + h.totalHours, 0);
      const baseRate = parseFloat(employeeDetails.baseRate);
      const basicSalary = totalHours * baseRate;

      const bonus = 0; // add logic if needed
      const deductions = 0; // add logic if needed
      const netPay = basicSalary + bonus - deductions;

      // Assuming multiple approvedHour IDs for a single employee
      for (const [employeeId, hoursList] of Object.entries(groupedByEmployee)) {
        const employeeDetails = await EmployeeDetails.findOne({
          where: { employeeId },
        });

        if (!employeeDetails) {
          console.warn(`Employee details not found for ID ${employeeId}`);
          continue;
        }

        const totalHours = hoursList.reduce((sum, h) => sum + h.totalHours, 0);
        const baseRate = parseFloat(employeeDetails.baseRate);
        const basicSalary = totalHours * baseRate;

        const bonus = 0;
        const deductions = 0;
        const netPay = basicSalary + bonus - deductions;

        await Income.create({
          employeeId,
          basicSalary,
          bonus,
          deductions,
          netPay,
          payPeriodStart: new Date(startDate),
          payPeriodEnd: new Date(endDate),
        });
      }
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "Payroll records successfully created"));
  } catch (error) {
    console.error("Send to payroll error:", error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(500)
        .json(
          new ApiError(
            500,
            {},
            "An error occurred while sending approved hours to payroll"
          )
        );
    }
  }
};

const fetchAllPayrollForLoggedIn = async (
  req: Request<{}, {}, {}, {}>,
  res: Response
): Promise<void> => {
  try {
    const accessToken = getAccessToken(req);
    const decodedToken = verifyAccessToken(accessToken);
    if (!decodedToken) {
      throw new ApiError(401, {}, "Invalid access token");
    }
    const employeeId = verifyAccessToken(accessToken)?.userId;

    const payrolls = await Income.findAll({
      where: {
        employeeId,
      },

      include: [{ model: ApprovedHours }],
    });
    if (payrolls.length === 0) {
      throw new ApiError(404, {}, "No payrolls found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, payrolls, "Payrolls fetched successfully"));
  } catch (error) {
    console.error("Fetch payrolls error:", error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(500)
        .json(
          new ApiError(500, {}, "An error occurred while fetching payrolls")
        );
    }
  }
};

export {
  approveHours,
  fetchApproveHoursWithinDateRange,
  fetchApprovedHoursForEmployeeInDateRange,
  sendApprovedHoursToPayroll,
  fetchAllPayrollForLoggedIn,
};
