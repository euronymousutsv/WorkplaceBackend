import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import ApiResponse, { StatusCode } from "../../utils/apiResponse";
import { verifyAccessToken } from "../../utils/jwtGenerater";
import { Payroll } from "../../models/payrollModel";
import { getAccessToken } from "../../utils/helper";
import { createNotification } from "../notificationController";

// change accessToken to userId
export const addANewSalary = async (
  req: Request<
    {},
    {},
    {
      startDate: Date;
      endDate: Date;
      hourlyRate: number;
      totalHours: number;
    }
  >,
  res: Response
): Promise<void> => {
  const { startDate, endDate, hourlyRate, totalHours } = req.body;
  const accessToken = getAccessToken(req);
  try {
    if (!accessToken)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Access Token cannot be empty."
      );

    if (!startDate || !endDate || !hourlyRate || !totalHours)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {
          accessToken: "",
          startDate: "",
          endDate: "",
          hourlyRate: "",
          totalHours: "",
        },
        "Make sure all the fields are filled"
      );

    const decoded = verifyAccessToken(accessToken);
    const userId = decoded?.userId ?? "";

    const salary = hourlyRate * totalHours;
    const tax = (18 / 100) * salary;
    const netPay = salary - tax;

    const payroll = await Payroll.create({
      employeeId: userId,
      hourlyRate,
      totalHours,
      startDate,
      endDate,
      netPay,
      salary,
      taxDeductions: tax,
    });

    if (!payroll)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Unable to save to the server"
      );
    res
      .status(201)
      .json(
        new ApiResponse(StatusCode.CREATED, payroll.dataValues!, "Server found")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong."
          )
        );
    }
  }
};

export const getAEmployeeSalary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accessToken = getAccessToken(req);
    const decoded = verifyAccessToken(accessToken);
    const userId = decoded?.userId ?? "";

    const searced = await Payroll.findAll({ where: { employeeId: userId } });

    if (!searced)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Unable to save to the server"
      );
    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          searced,
          "All employee salary fetched"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong."
          )
        );
    }
  }
};
