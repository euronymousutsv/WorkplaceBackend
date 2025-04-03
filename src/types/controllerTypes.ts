import { Employee } from "src/models/employeeModel";
import { EmployeeAvailability } from "src/models/roster-clockinout-shifts/employeeAvailabilityModel";
import { OfficeLocation } from "src/models/officeLocation";
import { Shift } from "src/models/roster-clockinout-shifts/shiftsModel";

export type ShiftWithDetails = Shift & {
  employee: Employee;
  location: Location;
};

export type EmployeeWithAvailability = Employee & {
  availability: EmployeeAvailability[];
};

// Payload types
export type ClockInOutPayload = {
  employeeId: number;
  shiftId?: number;
  status: "in" | "out";
  latitude?: number | string;
  longitude?: number | string;
};

export type GeolocationValidationPayload = {
  latitude: number | string;
  longitude: number | string;
  locationId: number;
};

export type PayrateCalculationPayload = {
  employeeId: number;
  startDate: string;
  endDate: string;
};

export type PayrateResponse = {
  employee: {
    id: number;
    name: string;
    employeeType: string;
  };
  baseHours: number;
  penaltyHours: number;
  baseRate: number;
  totalPay: number;
  breakdown: {
    date: string;
    hours: number;
    rate: number;
    penalty: number;
    amount: number;
  }[];
};

export type ShiftAssignmentPayload = {
  date: string;
  locationId: number;
  repeatFrequency?: "none" | "weekly" | "fortnightly";
  repeatEndDate?: string;
  considerAvailability?: boolean;
};

export type ShiftAssignmentResult = {
  success: boolean;
  assignedShifts: number;
  message: string;
};

export type TimeOffRequestPayload = {
  employeeId: number;
  startDate: string;
  endDate: string;
  type: string;
  notes?: string;
};

export type DashboardSummary = {
  totalEmployees: number;
  activeShifts: number;
  unassignedShifts: number;
  weeklyPayroll: number;
  pendingRequests: number;
};

export type WeeklyRoster = {
  startDate: string;
  endDate: string;
  days: {
    date: string;
    dayOfWeek: string;
    isWeekend: boolean;
  }[];
  employees: {
    id: number;
    name: string;
    type: string;
    shifts: {
      dayIndex: number;
      start: string;
      end: string;
      location: string;
      isOff: boolean;
    }[];
    totalHours: number;
  }[];
};

export type LeaveBalance = {
  annualLeave: number;
  sickLeave: number;
  personalLeave: number;
};

export type SystemConfig = {
  enableGeolocation: boolean;
  autoAssignShifts: boolean;
  sendEmailNotifications: boolean;
  weekendRateMultiplier: number;
  publicHolidayRateMultiplier: number;
  nightShiftRateMultiplier: number;
};
