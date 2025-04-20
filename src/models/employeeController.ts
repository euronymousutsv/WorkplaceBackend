import { Request, Response } from "express";
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

export enum UpdateProfileType {
  USERNAME = "username",
  BASERATE = "baseRate",
  CONTRACTHOURS = "contractHours",
  EMPLOYEETYPE = "employeeType",
  DEPARTMENT = "department",
  POSITION = "position",
  HIREDATE = "hireDate",
}

const updateEmployeeInfo = async (
  req: Request<
    {},
    {},
    {
      editType: UpdateProfileType;
      employeeId: string;
      newDetails: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { editType, employeeId, newDetails } = req.body;
  try {
    if (!employeeId) {
      throw new ApiError(400, {}, "Employee ID is required");
    }

    if (!editType) {
      throw new ApiError(400, {}, "Edit type is required");
    }

    const employeeDetails = await EmployeeDetails.findByPk(employeeId);

    if (!employeeDetails) {
      throw new ApiError(400, {}, "EmployeeDetails not found");
    }

    switch (editType) {
      case UpdateProfileType.USERNAME:
        employeeDetails.username = newDetails;
        break;
      case UpdateProfileType.BASERATE:
        employeeDetails.baseRate = newDetails;
        break;
      case UpdateProfileType.CONTRACTHOURS:
        employeeDetails.contractHours = newDetails;
        break;
      case UpdateProfileType.EMPLOYEETYPE:
        employeeDetails.employeeType = newDetails as EmploymentType;
        break;
      case UpdateProfileType.DEPARTMENT:
        employeeDetails.department = newDetails;
        break;
      case UpdateProfileType.POSITION:
        employeeDetails.position = newDetails;
        break;
      case UpdateProfileType.HIREDATE:
        employeeDetails.hireDate = newDetails as unknown as Date;
        break;
      default:
        throw new ApiError(400, {}, "Invalid edit type");
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
