import { OfficeLocation } from "../models/officeLocation";
import { GeolocationValidationPayload } from "../types/controllerTypes";
import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import {
  addDays,
  startOfWeek,
  differenceInMinutes,
  isWeekend,
  format,
} from "date-fns";
import { Employee } from "../models/employeeModel";
import { Shift } from "../models/roster-clockinout-shifts/shiftsModel";
import { TimeOff } from "../models/roster-clockinout-shifts/timeOffModel";
import { SystemSetting } from "../models/systemSetting";

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const validateGeolocation = async (
  payload: GeolocationValidationPayload
): Promise<boolean> => {
  const location = await OfficeLocation.findByPk(payload.locationId);
  if (!location) return false;

  const lat1 = parseFloat(String(payload.latitude));
  const lon1 = parseFloat(String(payload.longitude));
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

// 🔧 Express controller to use in routes
export const validateGeolocationHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const isValid = await validateGeolocation(req.body);
    res.status(200).json({ valid: isValid });
  } catch (error) {
    console.error("validateGeolocationHandler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ 1. Get Leave Balance (demo data)
export const getLeaveBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employeeId = req.params.employeeId;
    // You can replace this with a real calculation later
    const result = {
      annualLeave: 18,
      sickLeave: 8,
      personalLeave: 2,
    };
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ✅ 2. Get Weekly Roster
export const getWeeklyRoster = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const inputDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date();
    const weekStart = startOfWeek(inputDate);
    const weekEnd = addDays(weekStart, 6);
    const employees = await Employee.findAll();

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date: format(date, "yyyy-MM-dd"),
        dayOfWeek: format(date, "EEE"),
        isWeekend: isWeekend(date),
      };
    });

    const roster = await Promise.all(
      employees.map(async (employee) => {
        const shifts = await Shift.findAll({
          where: {
            employeeId: employee.id,
            startTime: { [Op.gte]: weekStart },
            endTime: { [Op.lte]: weekEnd },
          },
        });

        const shiftsByDay = days.map((day, i) => {
          const shift = shifts.find(
            (s) => format(s.startTime, "yyyy-MM-dd") === day.date
          );
          if (shift) {
            return {
              dayIndex: i,
              start: format(shift.startTime, "HH:mm"),
              end: format(shift.endTime, "HH:mm"),
              location: shift.locationId ?? "Unknown",
              isOff: false,
            };
          } else {
            return {
              dayIndex: i,
              start: "",
              end: "",
              location: "",
              isOff: true,
            };
          }
        });

        const totalHours = shifts.reduce(
          (acc, s) => acc + differenceInMinutes(s.endTime, s.startTime) / 60,
          0
        );

        return {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          type: employee.employeeType,
          shifts: shiftsByDay,
          totalHours,
        };
      })
    );

    res.json({
      startDate: format(weekStart, "yyyy-MM-dd"),
      endDate: format(weekEnd, "yyyy-MM-dd"),
      days,
      employees: roster,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ 3. Get Dashboard Summary
export const getDashboardSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = addDays(weekStart, 6);

    const employees = await Employee.findAll();
    const shifts = await Shift.findAll();

    const activeShifts = shifts.filter(
      (s) => s.startTime <= now && s.endTime >= now
    );
    const unassignedShifts = shifts.filter((s) => !s.employeeId);

    let weeklyPayroll = 0;

    for (const emp of employees) {
      const weeklyShifts = shifts.filter(
        (s) =>
          s.employeeId === emp.id &&
          s.startTime >= weekStart &&
          s.endTime <= weekEnd
      );
      for (const shift of weeklyShifts) {
        const hours = differenceInMinutes(shift.endTime, shift.startTime) / 60;
        let multiplier = isWeekend(shift.startTime) ? 1.5 : 1;
        weeklyPayroll += hours * Number(emp.baseRate) * multiplier;
      }
    }

    const timeOffRequests = await TimeOff.findAll({
      where: { status: "pending" },
    });

    res.json({
      totalEmployees: employees.length,
      activeShifts: activeShifts.length,
      unassignedShifts: unassignedShifts.length,
      weeklyPayroll,
      pendingRequests: timeOffRequests.length,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ 4. Calculate Payrate
export const calculatePayrate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    const shifts = await Shift.findAll({
      where: {
        employeeId,
        startTime: { [Op.gte]: new Date(startDate) },
        endTime: { [Op.lte]: new Date(endDate) },
      },
    });

    const config = await SystemSetting.findAll();
    const weekendRate = Number(
      config.find((c) => c.key === "weekendRateMultiplier")?.value || 1.5
    );
    const nightRate = Number(
      config.find((c) => c.key === "nightShiftRateMultiplier")?.value || 1.5
    );

    let baseHours = 0,
      penaltyHours = 0,
      totalPay = 0;
    const breakdown: any[] = [];

    for (const shift of shifts) {
      const hours = differenceInMinutes(shift.endTime, shift.startTime) / 60;
      let multiplier = 1;
      let isPenalty = false;

      if (isWeekend(shift.startTime)) {
        multiplier = weekendRate;
        isPenalty = true;
      }

      const hour = shift.startTime.getHours();
      if (hour >= 22 || hour < 6) {
        multiplier = Math.max(multiplier, nightRate);
        isPenalty = true;
      }

      const effectiveRate = Number(employee.baseRate) * multiplier;
      const amount = hours * effectiveRate;
      if (isPenalty) penaltyHours += hours;
      else baseHours += hours;
      totalPay += amount;

      breakdown.push({
        date: format(shift.startTime, "yyyy-MM-dd"),
        hours,
        rate: Number(employee.baseRate),
        penalty: multiplier,
        amount,
      });
    }

    res.json({
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeType: employee.employeeType,
      },
      baseHours,
      penaltyHours,
      baseRate: Number(employee.baseRate),
      totalPay,
      breakdown,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ 5. Assign Shifts
export const assignShifts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date, locationId } = req.body;
    const targetDate = new Date(date);
    const employees = await Employee.findAll();
    const location = await OfficeLocation.findByPk(locationId);

    if (!location) {
      res.status(404).json({
        message: "Location not found",
        success: false,
        assignedShifts: 0,
      });
      return;
    }

    let assigned = 0;

    for (const emp of employees) {
      if (emp.employmentStatus !== "Active") continue;

      const existingShift = await Shift.findOne({
        where: {
          employeeId: emp.id,
          startTime: {
            [Op.gte]: new Date(targetDate.setHours(0, 0, 0, 0)),
            [Op.lte]: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      if (existingShift) continue;

      const hasTimeOff = await TimeOff.findOne({
        where: {
          employeeId: emp.id,
          status: "approved",
          startDate: { [Op.lte]: targetDate },
          endDate: { [Op.gte]: targetDate },
        },
      });

      if (hasTimeOff) continue;

      let startTime = new Date(targetDate);
      let endTime = new Date(targetDate);
      if (emp.employeeType === "full-time" && !isWeekend(targetDate)) {
        startTime.setHours(9);
        endTime.setHours(17);
      } else if (emp.employeeType === "part-time") {
        startTime.setHours(12);
        endTime.setHours(18);
      } else if (
        emp.employeeType === "casual" &&
        (isWeekend(targetDate) || Math.random() > 0.5)
      ) {
        startTime.setHours(18);
        endTime.setHours(23);
      } else {
        continue;
      }

      await Shift.create({
        employeeId: emp.id,
        locationId: location.id,
        startTime,
        endTime,
        status: "assigned",
        notes: "Auto-assigned",
      });

      assigned++;
    }

    res.json({
      success: true,
      assignedShifts: assigned,
      message: `Successfully assigned ${assigned} shifts.`,
    });
  } catch (error) {
    next(error);
  }
};
