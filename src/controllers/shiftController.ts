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

// GET /shifts/:id
export const getAllShifts = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shifts = await Shift.findAll();
    res.status(200).json(shifts);
  } catch (error) {
    next(error);
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
      res.status(404).json({ message: "Shift not found" });
      return;
    }
    res.status(200).json(shift);
  } catch (error) {
    next(error);
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
    res.status(200).json(shifts);
  } catch (error) {
    // console.error("getShiftsByEmployeeId error:", error);
    // res.status(500).json({ error: "Internal server error" });
    next(error);
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
    res.status(200).json(shifts);
  } catch (error) {
    next(error);
  }
};
// GET /shifts/range?start=...&end=...
export const getShiftsByDateRange = async (req: Request, res: Response) => {
  const { start, end } = req.query;
  if (!start || !end) {
    res.status(400).json({ error: "Missing date range" });
    return;
  }
  try {
    const shifts = await Shift.findAll({
      where: {
        startTime: { [Op.gte]: new Date(start as string) },
        endTime: { [Op.lte]: new Date(end as string) },
      },
    });
    res.status(200).json(shifts);
  } catch (error) {
    console.error("getShiftsByDateRange error:", error);
    res.status(500).json({ error: "Internal server error" });
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

    res.status(201).json(newShift);
  } catch (error) {
    next(error);
  }
};

// PUT /shifts/:id

export const updateShift = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await Shift.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (updated[0] === 0) {
      res.status(404).json({ message: "Shift not found" });
      return;
    }
    res.status(200).json(updated[1][0]);
  } catch (error) {
    next(error);
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
      res.status(404).json({ error: "Shift not found" });
      return;
    }
    res.status(200).json(shift);
  } catch (error) {
    // console.error("getShiftWithDetails error:", error);
    // res.status(500).json({ error: "Internal server error" });
    next(error);
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
    res.status(200).json(shifts);
  } catch (error) {
    // console.error("getAllShiftsWithDetails error:", error);
    // res.status(500).json({ error: "Internal server error" });
    next(error);
  }
};

// POST /shifts/repeat
export const createRepeatingShifts = async (req: Request, res: Response) => {
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
      res.status(201).json([single]);
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

    res.status(201).json(createdShifts);
  } catch (error) {
    console.error("createRepeatingShifts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/****** Employeee Availibility Controllers **************************************************************************************/

// GET /availability/:id
export const getEmployeeAvailability = async (req: Request, res: Response) => {
  try {
    const availability = await EmployeeAvailability.findByPk(req.params.id);
    if (!availability) {
      res.status(404).json({ error: "Availability not found" });
      return;
    }
    res.status(200).json(availability);
  } catch (error) {
    console.error("getEmployeeAvailability error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /availability/employee/:employeeId
export const getAvailabilityByEmployeeId = async (
  req: Request,
  res: Response
) => {
  try {
    const availability = await EmployeeAvailability.findAll({
      where: { employeeId: req.params.employeeId },
    });
    res.status(200).json(availability);
  } catch (error) {
    console.error("getAvailabilityByEmployeeId error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /availability
export const createEmployeeAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const newAvailability = await EmployeeAvailability.create(req.body);
    res.status(201).json(newAvailability);
  } catch (error) {
    console.error("createEmployeeAvailability error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /availability/:id
export const updateEmployeeAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const [count, updated] = await EmployeeAvailability.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (count === 0) {
      res.status(404).json({ error: "Availability not found" });
      return;
    }

    res.status(200).json(updated[0]);
  } catch (error) {
    console.error("updateEmployeeAvailability error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /availability/:id
export const deleteEmployeeAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const deleted = await EmployeeAvailability.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      res.status(404).json({ error: "Availability not found" });
      return;
    }

    res.status(200).json({ message: "Availability deleted successfully" });
  } catch (error) {
    console.error("deleteEmployeeAvailability error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /availability/employee/:employeeId/details
export const getEmployeeWithAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const employee = await Employee.findByPk(req.params.employeeId, {
      include: [EmployeeAvailability],
    });

    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("getEmployeeWithAvailability error:", error);
    res.status(500).json({ error: "Internal server error" });
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
      res.status(404).json({ message: "Break period not found" });

      return;
    }
    res.json(record);
  } catch (error) {
    next(error);
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
    res.json(records);
  } catch (error) {
    next(error);
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
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export const createBreakPeriod = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Incoming Body", req.body);
    const record = await BreakPeriod.create({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
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
      res.status(404).json({ message: "Break period not found" });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
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
      res.status(404).json({ message: "Record not found" });
      return;
    }
    res.json(clock);
  } catch (error) {
    next(error);
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
    res.json(records);
  } catch (error) {
    next(error);
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
    res.status(201).json(record);
  } catch (error) {
    next(error);
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
    res.json(records[0] || null);
  } catch (error) {
    next(error);
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
      res.status(404).json({ message: "Penalty rate not found" });
      return;
    }
    res.json(rate);
  } catch (error) {
    next(error);
  }
};

export const getAllPenaltyRates = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rates = await PenaltyRate.findAll();
    res.json(rates);
  } catch (error) {
    next(error);
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
      res
        .status(400)
        .json({ message: "Both 'name' and 'multiplier' are required." });
      return;
    }
    const rate = await PenaltyRate.create({
      name,
      multiplier,
      description,
      createdAt: new Date(),
    });
    res.status(201).json(rate);
  } catch (error) {
    next(error);
  }
};

export const updatePenaltyRate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const penaltyId = req.params.id;
    console.log("penaltyID", penaltyId);
    const [count, rows] = await PenaltyRate.update(req.body, {
      where: { id: penaltyId },
      returning: true,
    });
    if (count === 0) {
      res.status(404).json({ message: "Penalty rate not found" });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
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
      res.status(404).json({ message: "Time off not found" });
      return;
    }
    res.json(timeOff);
  } catch (error) {
    next(error);
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
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export const createTimeOff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const record = await TimeOff.create({ ...req.body, createdAt: new Date() });
    res.status(201).json(record);
  } catch (error) {
    next(error);
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
      res.status(404).json({ message: "Time off not found" });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
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
      res.status(404).json({ message: "Shift request not found" });
      return;
    }
    res.json(request);
  } catch (error) {
    next(error);
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
    res.json(records);
  } catch (error) {
    next(error);
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
    res.json(records);
  } catch (error: any) {
    console.error("getPendingShiftRequests error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const createShiftRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const record = await ShiftRequest.create({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
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
      res.status(404).json({ message: "Shift request not found" });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};
