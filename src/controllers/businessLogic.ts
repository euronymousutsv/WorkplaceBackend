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
import {
  Shift,
  ShiftStatus,
} from "../models/roster-clockinout-shifts/shiftsModel";
import { TimeOff } from "../models/roster-clockinout-shifts/timeOffModel";
import { SystemSetting } from "../models/systemSetting";
import { ClockInOut } from "../models/roster-clockinout-shifts/clockModel";
import { EmployeeDetails } from "../models/employeeDetails";
import {
  getAllEmployeeProfiles,
  getEmployeeProfileById,
} from "../types/EmployeeProfileViewModel";

export const calculateDistance = (
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
    res.status(500).json({ error: "Internal server error, Validation failed" });
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
    const employees = await getAllEmployeeProfiles();

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
              location: shift.officeId ?? "Unknown",
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
          type: employee.details?.employeeType,
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

    const employees = await getAllEmployeeProfiles();
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
        weeklyPayroll += hours * Number(emp.details?.baseRate) * multiplier;
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

    const employee = await getEmployeeProfileById(employeeId);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    const clockRecords = await ClockInOut.findAll({
      where: {
        employeeId,
        timestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
        isValid: true,
      },
      order: [["timestamp", "ASC"]],
    });
    console.log(clockRecords);

    const config = await SystemSetting.findAll();
    const weekendRate = Number(
      config.find((c) => c.key === "weekendRateMultiplier")?.value || 1.5
    );
    const nightRate = Number(
      config.find((c) => c.key === "nightShiftRateMultiplier")?.value || 1.5
    );
    const publicRate = Number(
      config.find((c) => c.key === "publicRateMultipier")?.value || 2.5
    );

    let baseHours = 0,
      penaltyHours = 0,
      totalPay = 0;

    const breakdown: any[] = [];

    // Pair "in" and "out" records
    let sessionStart: Date | null = null;
    let breaks: { start: Date; end: Date }[] = [];
    let currentBreakStart: Date | null = null;
    for (const record of clockRecords) {
      console.log(record);
      if (record.status === "in") {
        sessionStart = record.timestamp;
        breaks = [];
      }

      if (record.status === "break-start") {
        currentBreakStart = record.timestamp;
      }

      if (record.status === "break-end" && currentBreakStart) {
        breaks.push({ start: currentBreakStart, end: record.timestamp });
        currentBreakStart = null;
      } else if (record.status === "out" && sessionStart) {
        const totalMinutes = differenceInMinutes(
          record.timestamp,
          sessionStart
        );

        let multiplier = 1;
        let isPenalty = false;
        let breakMinutes = 0;
        for (const brk of breaks) {
          breakMinutes += differenceInMinutes(brk.end, brk.start);
        }
        const netMinutes = totalMinutes - breakMinutes;
        const hours = netMinutes / 60;
        if (isWeekend(sessionStart)) {
          multiplier = weekendRate;
          isPenalty = true;
        }

        const hour = sessionStart.getHours();
        if (hour >= 22 || hour < 6) {
          multiplier = Math.max(multiplier, nightRate);
          isPenalty = true;
        }

        const effectiveRate = Number(employee.details?.baseRate) * multiplier;
        const amount = hours * effectiveRate;

        if (isPenalty) penaltyHours += hours;
        else baseHours += hours;

        totalPay += amount;

        breakdown.push({
          date: format(sessionStart, "yyyy-MM-dd"),
          startTime: format(sessionStart, "HH:mm"),
          endTime: format(record.timestamp, "HH:mm"),
          breakTime: breakMinutes / 60,
          hours,
          rate: Number(employee.details?.baseRate),
          penalty: multiplier,
          amount,
        });

        sessionStart = null;
        breaks = [];
      }
    }

    res.json({
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeType: employee.details?.employeeType,
      },
      baseHours,
      penaltyHours,
      baseRate: Number(employee.details?.baseRate),
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
    const employees = await getAllEmployeeProfiles();
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
      if (emp.details?.employeeType === "full-time" && !isWeekend(targetDate)) {
        startTime.setHours(9);
        endTime.setHours(17);
      } else if (emp.details?.employeeType === "part-time") {
        startTime.setHours(12);
        endTime.setHours(18);
      } else if (
        emp.details?.employeeType === "casual" &&
        (isWeekend(targetDate) || Math.random() > 0.5)
      ) {
        startTime.setHours(18);
        endTime.setHours(23);
      } else {
        continue;
      }

      await Shift.create({
        employeeId: emp.id,
        officeId: location.id,
        startTime,
        endTime,
        status: ShiftStatus.ACTIVE,
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
