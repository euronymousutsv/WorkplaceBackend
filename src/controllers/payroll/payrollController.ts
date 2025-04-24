import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import { getAccessToken } from "../../utils/helper";
import { verifyAccessToken } from "../../utils/jwtGenerater";
import { Employee } from "../../models/employeeModel";
import ApiResponse from "../../utils/apiResponse";
import { Shift } from "src/models/roster-clockinout-shifts/shiftsModel";
import { EmployeeDetails } from "src/models/employeeDetails";
import ApprovedHours from "src/models/Payroll/approvedHoursModel";
import { where } from "sequelize";
import JoinedOffice from "../../models/joinedOfficeModel";

const addHoursForPayment = async (
  req: Request<
    {},
    {},
    {
      scheduleId: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { scheduleId } = req.body;

    if (!scheduleId) {
      throw new ApiError(400, {}, "Schedule ID is required");
    }

    const searchedSchedule = await Shift.findByPk(scheduleId);

    if (!searchedSchedule) {
      throw new ApiError(404, {}, "Schedule not found");
    }

    const employeeId = searchedSchedule.employeeId;
    const searchEmployee = await EmployeeDetails.findOne({
      where: { employeeId },
    });

    if (!searchEmployee) {
      throw new ApiError(404, {}, "Employee not found");
    }

    const joinedOffice = await JoinedOffice.findOne({
        where : {
            id: searchEmployee.employeeId
        }
    });

    if (!joinedOffice) {
      throw new ApiError(404, {}, "Joined office not found");
    }

    const startDate = new Date(searchedSchedule.startTime);
const endDate = new Date(searchedSchedule.endTime);

// For calculation
const start = startDate.getTime();
const end = endDate.getTime();

const diffMs = end - start;
const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)); // Store as number, not string

const approvedHours = await ApprovedHours.create({
  employeeId: searchEmployee.employeeId,
  officeId: joinedOffice.officeId,
  date: startDate.toISOString().split('T')[0],
  startTime: startDate.toTimeString().split(' ')[0],
  endTime: endDate.toTimeString().split(' ')[0],
  totalHours: totalHours
});







   
        // id: string;
        // employeeId: string;
        // officeId: string;
        // date: string; // YYYY-MM-DD
        // startTime: string; // HH:mm:ss
        // endTime: string; // HH:mm:ss
        // totalHours: number;
        // createdAt?: Date;
        // updatedAt?: Date;
      }




    // id: string;
    // employeeId: string;
    // approvedHoursId: string;
    // basicSalary: number;
    // bonus?: number;
    // deductions: number;
    // netPay: number;
    // payPeriodStart: Date;
    // payPeriodEnd: Date;
    // createdAt?: Date;
    // updatedAt?: Date;

    res
      .status(201)
      .json(new ApiResponse(201, {}, "Leave request created successfully"));
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
