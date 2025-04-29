import e, { Request, Response } from "express";
import { Employee } from "./employeeModel";
import ApiError from "../utils/apiError";

import ApiResponse from "../utils/apiResponse";
import { getEmployeeProfileById } from "../types/EmployeeProfileViewModel";
import { EmployeeDetails, EmploymentType } from "./employeeDetails";

const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = req.params.id;

    if (!employeeId) {
      throw new ApiError(400, {}, "Employee ID is required");
    }

    const employee = await Employee.findOne({
      where: { id: employeeId },
      attributes: { exclude: ["password"] },
      include: [{ model: EmployeeDetails, as: "detailsEmployee" }],
    });

    if (!employee) {
      throw new ApiError(400, {}, "Employee is not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, employee, "Employee fetched successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      const statusCode = 500;
      res
        .status(statusCode)
        .json(new ApiError(statusCode, {}, "Internal Server Error"));
    }
  }
};

// export enum UpdateProfileType {
//   USERNAME = "username",
//   BASERATE = "baseRate",
//   CONTRACTHOURS = "contractHours",
//   EMPLOYEETYPE = "employeeType",
//   DEPARTMENT = "department",
//   POSITION = "position",
//   HIREDATE = "hireDate",
// }

const updateEmployeeInfo = async (
  req: Request<
    {},
    {},
    {
      userName: string;
      baseRate: string;
      contractHours: string;
      employeeType: EmploymentType;
      department: string;
      position: string;
      hireDate: Date | string;
      employeeId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const {} = req.body;
  try {
    const {
      employeeId,
      userName,
      baseRate,
      contractHours,
      employeeType,
      department,
      position,
      hireDate,
    } = req.body;

    if (!employeeId) {
      throw new ApiError(400, {}, "Employee ID is required");
    }
    console.log("employeeId", employeeId);
    const employeeDetails = await EmployeeDetails.findOne({
      where: { employeeId: employeeId },
    });

    if (!employeeDetails) {
      throw new ApiError(400, {}, "EmployeeDetails not found");
    }

    if (userName && userName !== employeeDetails.username) {
      employeeDetails.username = userName;
    }
    if (baseRate && baseRate !== employeeDetails.baseRate) {
      employeeDetails.baseRate = baseRate;
    }
    if (contractHours && contractHours !== employeeDetails.contractHours) {
      employeeDetails.contractHours = contractHours;
    }
    if (employeeType && employeeType !== employeeDetails.employeeType) {
      employeeDetails.employeeType = employeeType;
    }
    if (department && department !== employeeDetails.department) {
      employeeDetails.department = department;
    }
    if (position && position !== employeeDetails.position) {
      employeeDetails.position = position;
    }
    if (hireDate) {
      const parsedDate =
        typeof hireDate === "string" ? new Date(hireDate) : hireDate;
      if (parsedDate.getTime() !== employeeDetails.hireDate.getTime()) {
        employeeDetails.hireDate = parsedDate;
      }
    }

    const saved = await employeeDetails.save();
    if (!saved) {
      throw new ApiError(400, {}, "Failed to update EmployeeDetails");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          employeeDetails,
          "EmployeeDetails updated successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      const statusCode = 500;
      res
        .status(statusCode)
        .json(new ApiError(statusCode, {}, "Internal Server Error"));
    }
  }
};

export { getEmployeeById, updateEmployeeInfo };
