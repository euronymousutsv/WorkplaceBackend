import { NextFunction, Request, Response } from "express";
import {
  RepeatFrequency,
  Shift,
  ShiftStatus,
} from "../models/roster-clockinout-shifts/shiftsModel";
import ApiError from "../utils/apiError";
import ApiResponse, { StatusCode } from "../utils/apiResponse";
import { Op } from "sequelize";
import { Employee } from "../models/employeeModel";
import { OfficeLocation } from "../models/officeLocation";
import { EmployeeAvailability } from "../models/roster-clockinout-shifts/employeeAvailabilityModel";
import { BreakPeriod } from "../models/roster-clockinout-shifts/BreakPeriodModel";

// create a shift forn an employee inside an office
const createShift = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      employeeId,
      officeId,
      startTime,
      endTime,
      status = "pending",
      notes,
      repeatFrequency,
      repeatEndDate,
    } = req.body;

    // Validate required fields
    if (!employeeId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Employee ID is required");
    }
    if (!officeId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Office ID is required");
    }
    if (!startTime) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Start time is required");
    }
    if (!endTime) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "End time is required");
    }

    const newShift = await Shift.create({
      employeeId,
      officeId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status,
      notes: notes ?? undefined,
      repeatFrequency,
      //   parentShiftId,
      repeatEndDate: repeatEndDate ? new Date(repeatEndDate) : undefined,
    });

    res
      .status(StatusCode.CREATED)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          newShift,
          "Shift created successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to create shift"
        )
      );
    }
  }
};

// get shift by office
const getShiftsByOffice = async (
  req: Request<{}, {}, {}, { officeId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { officeId } = req.query;

    if (!officeId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Office ID is required");
    }

    const shifts = await Shift.findAll({
      where: { officeId },
      order: [["startTime", "ASC"]],
    });

    if (shifts.length === 0) {
      res
        .status(StatusCode.NOT_FOUND)
        .json(new ApiResponse(StatusCode.NOT_FOUND, {}, "No shifts found"));
      return;
    }

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(StatusCode.OK, shifts, "Shifts fetched successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to fetch shifts"
        )
      );
    }
  }
};

// get shift by employee
const getShiftsByEmployee = async (
  req: Request<{}, {}, {}, { employeeId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Employee ID is required");
    }

    const shifts = await Shift.findAll({
      where: { employeeId },
      order: [["startTime", "ASC"]],
    });

    if (shifts.length === 0) {
      res
        .status(StatusCode.NOT_FOUND)
        .json(new ApiResponse(StatusCode.NOT_FOUND, {}, "No shifts found"));
      return;
    }

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(StatusCode.OK, shifts, "Shifts fetched successfully")
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
            "Failed to fetch shifts"
          )
        );
    }
  }
};

// get employee shifts by date
const getEmployeeShiftsByDate = async (
  req: Request<{}, {}, {}, { employeeId: string; date: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId, date } = req.query;

    if (!employeeId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Employee ID is required");
    }

    if (!date) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Date is required");
    }

    const shifts = await Shift.findAll({
      where: {
        employeeId,
        startTime: {
          [Op.gte]: new Date(date as string),
          [Op.lt]: new Date(
            new Date(date as string).setDate(
              new Date(date as string).getDate() + 1
            )
          ),
        },
      },
      order: [["startTime", "ASC"]],
    });

    if (shifts.length === 0) {
      res
        .status(StatusCode.NOT_FOUND)
        .json(new ApiResponse(StatusCode.NOT_FOUND, {}, "No shifts found"));
      return;
    }

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(StatusCode.OK, shifts, "Shifts fetched successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to fetch shifts"
        )
      );
    }
  }
};

// GET /shifts/range?start=...&end=...
// for an office
const getShiftsByDateRangeForOffice = async (
  req: Request<{}, {}, {}, { start: string; end: string; officeId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { start, end, officeId } = req.query;
  if (!start || !end) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      {},
      "Missing date range parameters "
    );
  }

  if (!officeId) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      {},
      "Missing office ID parameter"
    );
  }

  try {
    const shifts = await Shift.findAll({
      where: {
        officeId,
        startTime: { [Op.gte]: new Date(start as string) },
        endTime: { [Op.lte]: new Date(end as string) },
      },
    });
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(StatusCode.OK, shifts, "Shifts retrieved successfully")
      );
  } catch (error) {
    next(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to retrieve shifts"
      )
    );
  }
};

// update shift within an office
// update shift by shiftId
const updateShift = async (
  req: Request<
    {},
    {},
    {
      employeeId?: string;
      officeId?: string;
      startTime?: string;
      endTime?: string;
      status?: ShiftStatus;
      notes?: string;
      repeatFrequency?: RepeatFrequency;
      repeatEndDate?: string;
    },
    { shiftId: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shiftId } = req.query;
    const {
      employeeId,
      officeId,
      startTime,
      endTime,
      status,
      notes,
      repeatFrequency,
      repeatEndDate,
    } = req.body;

    if (!shiftId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Shift ID is required");
    }

    const shift = await Shift.findByPk(shiftId);

    if (!shift) {
      res
        .status(StatusCode.NOT_FOUND)
        .json(new ApiResponse(StatusCode.NOT_FOUND, {}, "Shift not found"));
      return;
    }

    // Update only the fields that are provided in the request body
    if (employeeId) shift.employeeId = employeeId;
    if (officeId) shift.officeId = officeId;
    if (startTime) shift.startTime = new Date(startTime);
    if (endTime) shift.endTime = new Date(endTime);
    if (status) shift.status = status;
    if (notes) shift.notes = notes;
    if (repeatFrequency) shift.repeatFrequency = repeatFrequency;
    if (repeatEndDate) shift.repeatEndDate = new Date(repeatEndDate as string);

    await shift.save();

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(StatusCode.OK, shift, "Shift updated successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to update shift"
        )
      );
    }
  }
};

// get shift with details
// get shift by shiftId
const getShiftWithDetails = async (
  req: Request<{}, {}, {}, { id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.query;
    const shift = await Shift.findByPk(id, {
      include: [
        { model: Employee, as: "employee" },
        { model: OfficeLocation, as: "officeLocation" },
      ],
    });
    if (!shift) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Shift not found");
    }
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          shift,
          "Shift details retrieved successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to retrieve shift details"
        )
      );
    }
  }
};

// get all shifts with details within an office
const getAllShiftsWithDetailsWithinAnOffice = async (
  _req: Request<{}, {}, {}, { officeId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { officeId } = _req.query;
    const shifts = await Shift.findAll({
      where: {
        officeId,
      },
      include: [
        { model: Employee, as: "employee" },
        { model: OfficeLocation, as: "officeLocation" },
      ],
    });
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(StatusCode.OK, shifts, "Shifts retrieved successfully")
      );
  } catch (error) {
    next(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to retrieve shifts"
      )
    );
  }
};

// create repeating shifts
const createRepeatingShifts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      res
        .status(StatusCode.CREATED)
        .json(
          new ApiResponse(
            StatusCode.CREATED,
            [single],
            "Shift created successfully"
          )
        );
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

    res
      .status(StatusCode.CREATED)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          createdShifts,
          "Repeating shifts created successfully"
        )
      );
  } catch (error) {
    next(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to create repeating shifts"
      )
    );
  }
};

// get employee availability
const getEmployeeAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const availability = await EmployeeAvailability.findByPk(id);
    if (!availability) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Availability not found");
    }
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          availability,
          "Availability retrieved successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to retrieve availability"
        )
      );
    }
  }
};

const createEmployeeAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newAvailability = await EmployeeAvailability.create(req.body);
    res
      .status(StatusCode.CREATED)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          newAvailability,
          "Availability created successfully"
        )
      );
  } catch (error) {
    next(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to create availability"
      )
    );
  }
};

const updateEmployeeAvailability = async (
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

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          updated[0],
          "Availability updated successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to update availability"
        )
      );
    }
  }
};
// get employee availability by employeeId
const getAvailabilityByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const availability = await EmployeeAvailability.findAll({
      where: { employeeId: req.params.employeeId },
    });
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          availability,
          "Availability retrieved successfully"
        )
      );
  } catch (error) {
    next(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to retrieve availability"
      )
    );
  }
};

const deleteEmployeeAvailability = async (
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

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(StatusCode.OK, {}, "Availability deleted successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to delete availability"
        )
      );
    }
  }
};

// --- Break Period ---
const getBreakPeriod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const record = await BreakPeriod.findByPk(id);
    if (!record) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Break period not found");
    }
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          record,
          "Break period retrieved successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to retrieve break period"
        )
      );
    }
  }
};

const getBreakPeriodsByShiftId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shiftId } = req.params;
    const records = await BreakPeriod.findAll({
      where: { shiftId: shiftId },
    });
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          records,
          "Break periods retrieved successfully"
        )
      );
  } catch (error) {
    next(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to retrieve break periods"
      )
    );
  }
};

const getBreakPeriodsByEmployeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { employeeId } = req.params;
  try {
    const records = await BreakPeriod.findAll({
      where: { employeeId },
    });
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          records,
          "Break periods retrieved successfully"
        )
      );
  } catch (error) {
    next(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to retrieve break periods"
      )
    );
  }
};

//Create Break Period
const createBreakPeriod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId, shiftId, startTime, endTime, breakType, notes } =
      req.body;

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
    res
      .status(StatusCode.CREATED)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          record,
          "Break period created successfully"
        )
      );
  } catch (error) {
    next(
      new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to create break period"
      )
    );
  }
};

const updateBreakPeriod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [count, rows] = await BreakPeriod.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (count === 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Break period not found");
    }
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          rows[0],
          "Break period updated successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          "Failed to update break period"
        )
      );
    }
  }
};

export {
  createShift,
  getShiftsByOffice,
  getShiftsByEmployee,
  getEmployeeShiftsByDate,
  getShiftsByDateRangeForOffice,
  updateShift,
  getShiftWithDetails,
  getAllShiftsWithDetailsWithinAnOffice,
  createRepeatingShifts,
  getEmployeeAvailability,
  getAvailabilityByEmployeeId,
  getBreakPeriod,
  getBreakPeriodsByShiftId,
  getBreakPeriodsByEmployeeId,
  createBreakPeriod,
  updateBreakPeriod,
  createEmployeeAvailability,
  updateEmployeeAvailability,
  deleteEmployeeAvailability,
};
