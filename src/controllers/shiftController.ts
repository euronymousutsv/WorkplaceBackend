import { NextFunction, Request, Response } from "express";
import { Shift } from "../models/roster-clockinout-shifts/shiftsModel";
import { Employee } from "../models/employeeModel";
import { OfficeLocation } from "../models/officeLocation";
import { EmployeeAvailability } from "../models/roster-clockinout-shifts/employeeAvailabilityModel";
import { Op } from "sequelize";
import { insertShiftSchema } from "src/validation";
import { nullable } from "zod";
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
