import { Request, Response } from "express";
import ApiError from "../../utils/apiError.js";
import ApiResponse, { StatusCode } from "../../utils/apiResponse.js";
import { verifyAccessToken } from "../../utils/jwtGenerater.js";
import JoinedServer from "../../models/joinedServerModel.js";
import { Payroll } from "../../models/payrollModel.js";
import { Pay } from "twilio/lib/twiml/VoiceResponse.js";

// change accessToken to userId
export const addANewSalary = async (
  req: Request<
    {},
    {},
    {
      accessToken: string;
      startDate: Date;
      endDate: Date;
      hourlyRate: number;
      totalHours: number;
    }
  >,
  res: Response
): Promise<void> => {
  const { accessToken, startDate, endDate, hourlyRate, totalHours } = req.body;

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
  req: Request<{}, {}, {}, { accessToken: string }>,
  res: Response
): Promise<void> => {
  const { accessToken } = req.query;

  try {
    if (!accessToken)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Access Token cannot be empty."
      );

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
      .json(new ApiResponse(StatusCode.CREATED, searced, "Server found"));
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
