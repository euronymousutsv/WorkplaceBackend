import { NextFunction, Request, Response } from "express";
import { Shift } from "../models/roster-clockinout-shifts/shiftsModel";
import { Employee } from "../models/employeeModel";
import { OfficeLocation } from "../models/officeLocation";
import { EmployeeAvailability } from "../models/roster-clockinout-shifts/employeeAvailabilityModel";
import { Op } from "sequelize";
import { insertShiftSchema } from "src/validation";
import { nullable } from "zod";
import { BreakPeriod } from "../models/roster-clockinout-shifts/BreakPeriodModel";
import { ClockInOut } from "../models/roster-clockinout-shifts/clockModel";
import { PenaltyRate } from "../models/penaltyRates";
import { ShiftRequest } from "../models/roster-clockinout-shifts/shiftRequestModel";
import { TimeOff } from "../models/roster-clockinout-shifts/timeOffModel";
import ApiError from "../utils/apiError";
import ApiResponse, { StatusCode } from "../utils/apiResponse";

// GET /shifts/:id
export const getAllShifts = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shifts = await Shift.findAll();
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, shifts, "Shifts retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shifts"));
  }
};

export const getShift = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Shift not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, shift, "Shift retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shift"));
    }
  }
};

// GET /shifts/employee/:employeeId
export const getShiftsByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shifts = await Shift.findAll({
      where: { employeeId: req.params.employeeId },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, shifts, "Shifts retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shifts"));
  }
};
//Get /shift by serverid
export const getShiftByServer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shifts = await Shift.findAll({
      where: { serverId: req.params.id },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, shifts, "Shifts retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shifts"));
  }
};
// GET /shifts/range?start=...&end=...
export const getShiftsByDateRange = async (req: Request, res: Response, next: NextFunction) => {
  const { start, end } = req.query;
  if (!start || !end) {
    next(new ApiError(StatusCode.BAD_REQUEST, {}, "Missing date range parameters"));
    return;
  }
  try {
    const shifts = await Shift.findAll({
      where: {
        startTime: { [Op.gte]: new Date(start as string) },
        endTime: { [Op.lte]: new Date(end as string) },
      },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, shifts, "Shifts retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shifts"));
  }
};

// POST /shifts
export const createShift = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      employeeId,
      locationId,
      serverId,
      startTime,
      endTime,
      status = "pending",
      notes,
      repeatFrequency,
      parentShiftId,
      repeatEndDate,
    } = req.body;

    // Validate required fields
    if (!employeeId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Employee ID is required");
    }
    if (!serverId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server ID is required");
    }
    if (!startTime) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Start time is required");
    }
    if (!endTime) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "End time is required");
    }

    const newShift = await Shift.create({
      employeeId,
      locationId,
      serverId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status,
      notes: notes ?? undefined,
      repeatFrequency,
      parentShiftId,
      repeatEndDate: repeatEndDate ? new Date(repeatEndDate) : undefined,
    });

    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, newShift, "Shift created successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create shift"));
    }
  }
};

// PUT /shifts/:id

export const updateShift = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [count, updated] = await Shift.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (count === 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Shift not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, updated[0], "Shift updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to update shift"));
    }
  }
};

// GET /shifts/:id/details
export const getShiftWithDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shift = await Shift.findByPk(req.params.id, {
      include: [Employee, OfficeLocation],
    });
    if (!shift) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Shift not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, shift, "Shift details retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shift details"));
    }
  }
};

// GET /shifts/details
export const getAllShiftsWithDetails = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shifts = await Shift.findAll({
      include: [Employee, OfficeLocation],
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, shifts, "Shifts retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shifts"));
  }
};

// POST /shifts/repeat
export const createRepeatingShifts = async (req: Request, res: Response, next: NextFunction) => {
  const { repeatFrequency, repeatEndDate, ...shiftData } = req.body;
  const createdShifts = [];

  try {
    const intervalMs =
      repeatFrequency === "weekly"
        ? 7 * 24 * 60 * 60 * 1000
        : repeatFrequency === "fortnightly"
        ? 14 * 24 * 60 * 60 * 1000
        : null;

    if (!intervalMs) {
      const single = await Shift.create(shiftData);
      res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, [single], "Shift created successfully"));
      return;
    }

    let currentStart = new Date(shiftData.startTime);
    let currentEnd = new Date(shiftData.endTime);
    const end = new Date(repeatEndDate);

    while (currentStart <= end) {
      const newShift = await Shift.create({
        ...shiftData,
        startTime: new Date(currentStart),
        endTime: new Date(currentEnd),
        repeatFrequency,
        repeatEndDate: end,
      });
      createdShifts.push(newShift);
      currentStart = new Date(currentStart.getTime() + intervalMs);
      currentEnd = new Date(currentEnd.getTime() + intervalMs);
    }

    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, createdShifts, "Repeating shifts created successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create repeating shifts"));
  }
};

/****** Employeee Availibility Controllers **************************************************************************************/

// GET /availability/:id
export const getEmployeeAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const availability = await EmployeeAvailability.findByPk(req.params.id);
    if (!availability) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Availability not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, availability, "Availability retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve availability"));
    }
  }
};

// GET /availability/employee/:employeeId
export const getAvailabilityByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const availability = await EmployeeAvailability.findAll({
      where: { employeeId: req.params.employeeId },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, availability, "Availability retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve availability"));
  }
};

// POST /availability
export const createEmployeeAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newAvailability = await EmployeeAvailability.create(req.body);
    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, newAvailability, "Availability created successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create availability"));
  }
};

// PUT /availability/:id
export const updateEmployeeAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [count, updated] = await EmployeeAvailability.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (count === 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Availability not found");
    }

    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, updated[0], "Availability updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to update availability"));
    }
  }
};

// DELETE /availability/:id
export const deleteEmployeeAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await EmployeeAvailability.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Availability not found");
    }

    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, {}, "Availability deleted successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to delete availability"));
    }
  }
};

// GET /availability/employee/:employeeId/details
export const getEmployeeWithAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employee = await Employee.findByPk(req.params.employeeId, {
      include: [EmployeeAvailability],
    });

    if (!employee) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Employee not found");
    }

    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, employee, "Employee with availability retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve employee with availability"));
    }
  }
};

// --- Break Period ---
export const getBreakPeriod = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const record = await BreakPeriod.findByPk(req.params.id);
    if (!record) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Break period not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, record, "Break period retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve break period"));
    }
  }
};

export const getBreakPeriodsByShiftId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const records = await BreakPeriod.findAll({
      where: { shiftId: req.params.shiftId },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, records, "Break periods retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve break periods"));
  }
};

export const getBreakPeriodsByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const records = await BreakPeriod.findAll({
      where: { employeeId: req.params.employeeId },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, records, "Break periods retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve break periods"));
  }
};
//Create Break Period
export const createBreakPeriod = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      employeeId,
      shiftId,
      startTime,
      endTime,
      breakType,
      notes,
    } = req.body;

    // Validate required fields
    if (!employeeId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Employee ID is required");
    }
    if (!shiftId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Shift ID is required");
    }
    if (!startTime) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Start time is required");
    }
    if (!endTime) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "End time is required");
    }
    if (!breakType) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Break type is required");
    }

    const record = await BreakPeriod.create({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, record, "Break period created successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create break period"));
  }
};

export const updateBreakPeriod = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [count, rows] = await BreakPeriod.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (count === 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Break period not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, rows[0], "Break period updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to update break period"));
    }
  }
};

// --- Clock In/Out ---
export const getClockInOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clock = await ClockInOut.findByPk(req.params.id);
    if (!clock) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Clock in/out record not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, clock, "Clock in/out record retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve clock in/out record"));
    }
  }
};

export const getClockInOutByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const records = await ClockInOut.findAll({
      where: { employeeId: req.params.employeeId },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, records, "Clock in/out records retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve clock in/out records"));
  }
};

export const createClockInOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const record = await ClockInOut.create({
      ...req.body,
      timestamp: new Date(),
    });
    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, record, "Clock in/out record created successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create clock in/out record"));
  }
};

export const getLatestClockByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const records = await ClockInOut.findAll({
      where: { employeeId: req.params.employeeId },
      order: [["timestamp", "DESC"]],
      limit: 1,
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, records[0] || null, "Latest clock in/out record retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve latest clock in/out record"));
  }
};

// --- Penalty Rate ---
export const getPenaltyRate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rate = await PenaltyRate.findByPk(req.params.id);
    if (!rate) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Penalty rate not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, rate, "Penalty rate retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve penalty rate"));
    }
  }
};

export const getAllPenaltyRates = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rates = await PenaltyRate.findAll();
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, rates, "Penalty rates retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve penalty rates"));
  }
};

export const createPenaltyRate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, multiplier, description } = req.body;
    if (!name || multiplier == null) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Both 'name' and 'multiplier' are required");
    }
    const rate = await PenaltyRate.create({
      name,
      multiplier,
      description,
      createdAt: new Date(),
    });
    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, rate, "Penalty rate created successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create penalty rate"));
    }
  }
};

export const updatePenaltyRate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const penaltyId = req.params.id;
    const [count, rows] = await PenaltyRate.update(req.body, {
      where: { id: penaltyId },
      returning: true,
    });
    if (count === 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Penalty rate not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, rows[0], "Penalty rate updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to update penalty rate"));
    }
  }
};

// --- Time Off ---
export const getTimeOff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const timeOff = await TimeOff.findByPk(req.params.id);
    if (!timeOff) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Time off record not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, timeOff, "Time off record retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve time off record"));
    }
  }
};

export const getTimeOffByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const records = await TimeOff.findAll({
      where: { employeeId: req.params.employeeId },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, records, "Time off records retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve time off records"));
  }
};

export const createTimeOff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const record = await TimeOff.create({ ...req.body, createdAt: new Date() });
    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, record, "Time off record created successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create time off record"));
  }
};

export const updateTimeOff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [count, rows] = await TimeOff.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (count === 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Time off record not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, rows[0], "Time off record updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to update time off record"));
    }
  }
};

// --- Shift Request ---
export const getShiftRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = await ShiftRequest.findByPk(req.params.id);
    if (!request) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Shift request not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, request, "Shift request retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shift request"));
    }
  }
};

export const getShiftRequestsByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const records = await ShiftRequest.findAll({
      where: { employeeId: req.params.employeeId },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, records, "Shift requests retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve shift requests"));
  }
};

export const getPendingShiftRequests = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const records = await ShiftRequest.findAll({
      where: { status: "pending" },
    });
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, records, "Pending shift requests retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve pending shift requests"));
  }
};

export const createShiftRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      employeeId,
      requestDate,
      startTime,
      endTime,
      locationId,
      status = "pending",
      notes,
      managerId,
      responseNotes,
      responseDate,
    } = req.body;

    // Validate required fields
    if (!employeeId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Employee ID is required");
    }
    if (!requestDate) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Request date is required");
    }
    if (!startTime) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Start time is required");
    }
    if (!endTime) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "End time is required");
    }

    const record = await ShiftRequest.create({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, record, "Shift request created successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create shift request"));
  }
};

export const updateShiftRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [count, rows] = await ShiftRequest.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (count === 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Shift request not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, rows[0], "Shift request updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to update shift request"));
    }
  }
};
