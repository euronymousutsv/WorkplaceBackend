import { time } from "console";
import { differenceInMinutes } from "date-fns";
import { Request, Response } from "express";
import { col, fn, Op, where } from "sequelize";
import { Employee } from "../../models/employeeModel";
import JoinedOffice from "../../models/joinedOfficeModel";
import { Shift } from "../../models/roster-clockinout-shifts/shiftsModel";
import TimeLog, {
  ClockStatus,
} from "../../models/roster-clockinout-shifts/TimeLogModel";
import ApiError from "../../utils/apiError";
import ApiResponse from "../../utils/apiResponse";
import { getAccessToken } from "../../utils/helper";
import { verifyAccessToken } from "../../utils/jwtGenerater";
import { OfficeLocation } from "../../models/officeLocation";
import { calculateDistance } from "../businessLogic";

interface ClockInRequestPayload {
  clockInTime: Date;
  long?: number;
  lat?: number;
}

interface ClockOutRequestPayload {
  clockOutTime: Date;
  timeLogId: string;
  long?: number;
  lat?: number;
}

export const validateGeolocation = async (
  longitude: number | string,
  latitude: number | string,
  officeId: string
): Promise<boolean> => {
  const location = await OfficeLocation.findByPk(officeId);
  if (!location) return false;

  const lat1 = parseFloat(String(latitude));
  const lon1 = parseFloat(String(longitude));
  const lat2 = parseFloat(String(location.latitude));
  const lon2 = parseFloat(String(location.longitude));
  const radius = Number(location.radius);

  if ([lat1, lon1, lat2, lon2, radius].some(isNaN)) {
    console.warn("Invalid coordinates or radius.");
    return false;
  }

  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radius;
};

// clock in , clock out
// employee clock in
const clockIn = async (
  req: Request<{}, {}, ClockInRequestPayload>,
  res: Response
): Promise<void> => {
  try {
    const { clockInTime, long, lat } = req.body;
    if (!clockInTime) {
      throw new ApiError(400, { clockInTime }, "Clock-in time is required");
    }

    if (!long || !lat) {
      throw new ApiError(400, { long, lat }, "Location is required");
    }

    const token = getAccessToken(req);

    const employeeId = verifyAccessToken(token)?.userId;
    if (!employeeId) {
      throw new ApiError(400, {}, "Employee ID is required");
    }

    // find the employee
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      throw new ApiError(404, {}, "Employee not found");
    }
    const joinedOffice = await JoinedOffice.findOne({
      where: { id: employeeId },
    });

    if (!joinedOffice) {
      throw new ApiError(404, {}, "Employee not found in any office");
    }
    const officeId = joinedOffice.officeId;
    const validateLocation = await validateGeolocation(
      long as unknown as number,
      lat as unknown as number,
      officeId
    );

    if (!validateLocation) {
      throw new ApiError(400, {}, "Please clock in within the office area.");
    }

    const targetDate = new Date(clockInTime);
    const formattedDate = targetDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'

    //  check if the employee has a shift
    const shift = await Shift.findOne({
      where: {
        employeeId,
        [Op.and]: [where(fn("DATE", col("startTime")), formattedDate)],
      },
    });

    const scheduledStart = shift ? new Date(shift.startTime) : null;
    const actualClockIn = new Date(clockInTime);
    const diffMinutes = scheduledStart
      ? differenceInMinutes(actualClockIn, scheduledStart)
      : 0;

    let status;
    if (diffMinutes >= -5 && diffMinutes <= 5) {
      status = ClockStatus.ON_TIME;
    } else if (diffMinutes < -5) {
      status = ClockStatus.EARLY;
    } else {
      status = ClockStatus.LATE;
    }

    // check if the employee has already clocked in
    const existingTimeLog = await TimeLog.findOne({
      where: {
        employeeId,
        clockIn: {
          [Op.and]: [
            {
              [Op.gte]: new Date(formattedDate + "T00:00:00Z"),
            },
            {
              [Op.lte]: new Date(formattedDate + "T23:59:59Z"),
            },
          ],
        },
      },
    });
    if (existingTimeLog) {
      throw new ApiError(400, {}, "Already clocked in for today");
    }

    const createClockIn = await TimeLog.create({
      employeeId,
      officeId: officeId,
      clockIn: clockInTime,
      hasShift: shift ? true : false,
      clockInStatus: status,
      clockInDiffInMin: diffMinutes,
    });

    if (!createClockIn) {
      throw new ApiError(500, {}, "Failed to create clock-in record");
    }

    res
      .status(201)
      .json(new ApiResponse(201, createClockIn, "Clock-in successful"));
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message, false));
    } else {
      res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
  }
};

// employee clock out
const clockOut = async (
  req: Request<{}, {}, ClockOutRequestPayload>,
  res: Response
): Promise<void> => {
  try {
    const { timeLogId, clockOutTime, long, lat } = req.body;
    const token = getAccessToken(req);
    const employeeId = verifyAccessToken(token)?.userId;

    if (!employeeId || !timeLogId || !clockOutTime) {
      throw new ApiError(
        400,
        { employeeId, timeLogId, clockOutTime },
        "Employee ID, time log ID, and clock-out time are required"
      );
    }

    if (!long || !lat) {
      throw new ApiError(400, { long, lat }, "Location is required");
    }

    const loggedTime = await TimeLog.findOne({
      where: {
        id: timeLogId,
      },
    });
    if (!loggedTime) {
      throw new ApiError(404, {}, "Time log not found");
    }

    if (loggedTime.clockOut) {
      throw new ApiError(400, {}, "Already clocked out");
    }

    // find the employee
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw new ApiError(404, {}, "Employee not found");
    }

    const joinedOffice = await JoinedOffice.findOne({
      where: { id: employeeId },
    });

    if (!joinedOffice) {
      throw new ApiError(404, {}, "Employee not found in any office");
    }
    const officeId = joinedOffice.officeId;
    const validateLocation = await validateGeolocation(
      long as unknown as number,
      lat as unknown as number,
      officeId
    );

    if (!validateLocation) {
      throw new ApiError(400, {}, "Please clock out within the office area.");
    }

    const targetDate = new Date(clockOutTime);
    const formattedDate = targetDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'

    //  check if the employee has a shift
    const shift = await Shift.findOne({
      where: {
        employeeId,
        [Op.and]: [where(fn("DATE", col("endTime")), formattedDate)],
      },
    });

    const scheduledEnd = shift ? new Date(shift.endTime) : null;
    const actualClockOut = new Date(clockOutTime);
    const diffMinutes = scheduledEnd
      ? differenceInMinutes(actualClockOut, scheduledEnd)
      : 0;

    let status;
    if (diffMinutes >= -5 && diffMinutes <= 5) {
      status = ClockStatus.ON_TIME;
    } else if (diffMinutes < -5) {
      status = ClockStatus.EARLY;
    } else {
      status = ClockStatus.LATE;
    }

    loggedTime.clockOut = clockOutTime;
    loggedTime.clockOutStatus = status;
    loggedTime.clockOutDiffInMin = diffMinutes;

    const updatedTimeLog = await loggedTime.save();

    if (!updatedTimeLog) {
      throw new ApiError(500, {}, "Failed to save clock-out record");
    }

    res
      .status(201)
      .json(new ApiResponse(201, updatedTimeLog, "Clock-out successful"));
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    } else {
      res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
  }
};

// start break
const startBreak = async (
  req: Request<
    {},
    {},
    {
      timeLogId: string;
      breakStartTime: Date;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { timeLogId, breakStartTime } = req.body;
    const token = getAccessToken(req);
    const employeeId = verifyAccessToken(token)?.userId;

    if (!employeeId || !breakStartTime || !timeLogId) {
      throw new ApiError(
        400,
        { employeeId, breakStartTime, timeLogId },
        "Employee ID, break-in time, and time log ID are required"
      );
    }

    // find the employee
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw new ApiError(404, {}, "Employee not found");
    }

    const findTimeLog = await TimeLog.findByPk(timeLogId);
    if (!findTimeLog) {
      throw new ApiError(404, {}, "Time log not found");
    }

    if (findTimeLog.breakStart !== null) {
      throw new ApiError(400, {}, "Already on break");
    }

    findTimeLog.breakStart = breakStartTime;
    const updatedTimeLog = await findTimeLog.save();

    if (!updatedTimeLog) {
      throw new ApiError(500, {}, "Failed to save break start record");
    }

    res
      .status(201)
      .json(new ApiResponse(201, {}, "Break started successfully"));
  } catch (error) {
    console.error("Clock-in Error:", error);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    } else {
      res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
  }
};

// end break
const endBreak = async (
  req: Request<
    {},
    {},
    {
      timeLogId: string;
      breakEndTime: Date;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { timeLogId, breakEndTime } = req.body;
    const token = getAccessToken(req);
    const employeeId = verifyAccessToken(token)?.userId;

    if (!employeeId || !breakEndTime || !timeLogId) {
      throw new ApiError(
        400,
        { employeeId, breakEndTime, timeLogId },
        "Employee ID, break-in time, and time log ID are required"
      );
    }

    // find the employee
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw new ApiError(404, {}, "Employee not found");
    }

    const findTimeLog = await TimeLog.findByPk(timeLogId);
    if (!findTimeLog) {
      throw new ApiError(404, {}, "Time log not found");
    }

    if (findTimeLog.breakStart === null) {
      throw new ApiError(400, {}, "Start a break first.");
    }

    if (findTimeLog.breakEnd !== null) {
      throw new ApiError(400, {}, "Break already ended");
    }

    findTimeLog.breakEnd = breakEndTime;

    const updatedTimeLog = await findTimeLog.save();

    if (!updatedTimeLog) {
      throw new ApiError(500, {}, "Failed to save break end record");
    }

    res.status(200).json(new ApiResponse(200, {}, "Break ended successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    } else {
      res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
  }
};

// update time log by admin
const updateTimeLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      timeLogId,
      clockIn,
      clockOut,
      breakStart,
      breakEnd,
      hasShift,
      clockInStatus,
      clockOutStatus,
      clockInDiffInMin,
      clockOutDiffInMin,
    } = req.body;

    if (!timeLogId) {
      throw new ApiError(400, {}, "Time log ID is required");
    }

    const timeLog = await TimeLog.findByPk(timeLogId);
    if (!timeLog) {
      throw new ApiError(404, {}, "Time log not found");
    }

    // Update only the fields that are passed
    if (clockIn !== undefined) timeLog.clockIn = new Date(clockIn);
    if (clockOut !== undefined) timeLog.clockOut = new Date(clockOut);
    if (breakStart !== undefined) timeLog.breakStart = new Date(breakStart);
    if (breakEnd !== undefined) timeLog.breakEnd = new Date(breakEnd);
    if (hasShift !== undefined) timeLog.hasShift = hasShift;
    if (clockInStatus !== undefined) timeLog.clockInStatus = clockInStatus;
    if (clockOutStatus !== undefined) timeLog.clockOutStatus = clockOutStatus;
    if (clockInDiffInMin !== undefined)
      timeLog.clockInDiffInMin = clockInDiffInMin;
    if (clockOutDiffInMin !== undefined)
      timeLog.clockOutDiffInMin = clockOutDiffInMin;

    await timeLog.save();

    res
      .status(200)
      .json(new ApiResponse(200, timeLog, "Time log updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    } else {
      res.status(500).json(new ApiError(500, {}, "Failed to update time log"));
    }
  }
};

// get all time log within an office location for a specific date range
const getTimeLogByDateRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, officeId } = req.body;

    if (!startDate || !endDate || !officeId) {
      throw new ApiError(
        400,
        { startDate, endDate, officeId },
        "Start date, end date and office ID are required"
      );
    }

    const timeLogs = await TimeLog.findAll({
      where: {
        officeId,
        clockIn: {
          [Op.and]: [
            {
              [Op.gte]: new Date(startDate),
            },
            {
              [Op.lte]: new Date(endDate),
            },
          ],
        },
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

    if (!timeLogs) {
      throw new ApiError(404, {}, "No time logs found");
    }

    res.status(200).json(new ApiResponse(200, timeLogs, "Time logs fetched"));
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    } else {
      res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
  }
};

// get all time log for an employee within a date range
const getTimeLogByDateRangeForEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, employeeId } = req.body;

    if (!startDate || !endDate || !employeeId) {
      throw new ApiError(
        400,
        { startDate, endDate, employeeId },
        "Start date, end date and employee ID are required"
      );
    }

    const timeLogs = await TimeLog.findAll({
      where: {
        employeeId,
        clockIn: {
          [Op.and]: [
            {
              [Op.gte]: new Date(startDate),
            },
            {
              [Op.lte]: new Date(endDate),
            },
          ],
        },
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

    if (!timeLogs) {
      throw new ApiError(404, {}, "No time logs found");
    }

    res.status(200).json(new ApiResponse(200, timeLogs, "Time logs fetched"));
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    } else {
      res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
  }
};

// get todays time log for logged in employee
const getLoggedInUserTodaysTimeLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = getAccessToken(req);
    const employeeId = verifyAccessToken(token)?.userId;

    if (!employeeId) {
      throw new ApiError(400, {}, "Employee ID is required");
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const timeLogs = await TimeLog.findAll({
      where: {
        employeeId,
        clockIn: {
          [Op.and]: [
            {
              [Op.gte]: startOfDay,
            },
            {
              [Op.lte]: endOfDay,
            },
          ],
        },
      },
    });

    if (!timeLogs) {
      throw new ApiError(404, {}, "No time logs found");
    }

    res.status(200).json(new ApiResponse(200, timeLogs, "Time logs fetched"));
  } catch (error) {
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    } else {
      res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
  }
};

export {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  updateTimeLog,
  getTimeLogByDateRange,
  getTimeLogByDateRangeForEmployee,
  getLoggedInUserTodaysTimeLog,
};
