import { AttendanceEvent } from "./attendancModel";
import Channel from "./channelModel";
import Chat from "./chatModel";
import { Employee } from "./employeeModel";
import { EmployeeDetails } from "./employeeDetails";
import { OfficeLocation } from "./officeLocation";
import { Payroll } from "./payrollModel";
import { RefreshToken } from "./refreshModel";
import { Roster } from "./rosterModel";
import Document from "./documentModel";
import Server from "./serverModel";
import JoinedServer from "./joinedServerModel";
import { ExpoDeviceToken } from "./deviceTokenModel";
import Notification from "./Notifications";
import JoinedOffice from "./joinedOfficeModel";

import { BreakPeriod } from "./roster-clockinout-shifts/BreakPeriodModel";
import { ClockInOut } from "./roster-clockinout-shifts/clockModel";
import { EmployeeAvailability } from "./roster-clockinout-shifts/employeeAvailabilityModel";
import { ShiftRequest } from "./roster-clockinout-shifts/shiftRequestModel";
import { Shift } from "./roster-clockinout-shifts/shiftsModel";
import LeaveRequest from "./leave/LeaveRequest";
import LeaveType from "./leave/LeaveTypes";
import TimeLog from "./roster-clockinout-shifts/TimeLogModel";
import { TimeOff } from "./roster-clockinout-shifts/timeOffModel";
// Define associations AFTER models are imported
export const associateModels = () => {
  Employee.hasOne(EmployeeDetails, {
    foreignKey: "employeeId",
    as: "detailsEmployee",
  });
  EmployeeDetails.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employeeDetails",
  });
  Employee.hasMany(Roster, { foreignKey: "employeeId", onDelete: "CASCADE" });
  Employee.hasMany(Payroll, { foreignKey: "employeeId", onDelete: "CASCADE" });
  Employee.hasMany(AttendanceEvent, {
    foreignKey: "employeeId",
    onDelete: "CASCADE",
  });
  Roster.belongsTo(Employee, { foreignKey: "employeeId" });
  Roster.belongsTo(OfficeLocation, {
    foreignKey: "officeId",
    as: "officeLocation",
  });

  // joined server
  Employee.hasOne(JoinedServer, { foreignKey: "id", onDelete: "CASCADE" });
  JoinedServer.belongsTo(Employee, { foreignKey: "id" });
  JoinedOffice.belongsTo(OfficeLocation, { foreignKey: "officeId" });
  Employee.hasOne(JoinedOffice, {
    foreignKey: "id",
    onDelete: "CASCADE",
  });

  JoinedOffice.belongsTo(Employee, {
    foreignKey: "id", // `id` in JoinedOffice refers to Employee's id
    targetKey: "id",
    as: "employee",
  });
  // notificaiton
  Notification.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });

  // timelog model
  TimeLog.belongsTo(Employee, { foreignKey: "employeeId" });
  Employee.hasMany(TimeLog, { foreignKey: "employeeId" });

  //leave request
  LeaveRequest.belongsTo(Employee, { foreignKey: "employeeId" });
  LeaveRequest.belongsTo(LeaveType, { foreignKey: "leaveTypeId" });

  // expo device token
  Employee.hasOne(ExpoDeviceToken, { foreignKey: "id", onDelete: "CASCADE" });
  ExpoDeviceToken.belongsTo(Employee, { foreignKey: "id" });

  Server.hasMany(JoinedServer, { foreignKey: "serverId" });
  JoinedServer.belongsTo(Server, { foreignKey: "serverId" });
  Server.hasMany(OfficeLocation, { foreignKey: "serverId" });
  OfficeLocation.belongsTo(Server, { foreignKey: "serverId" });

  // Channel.belongsTo(Server, { foreignKey: "serverId" });
  Channel.belongsTo(OfficeLocation, { foreignKey: "officeId" });

  Chat.belongsTo(Channel, { foreignKey: "channelId", as: "channels" });
  Channel.hasMany(Chat, { foreignKey: "channelId" });

  Employee.hasMany(Chat, { foreignKey: "userId", onDelete: "CASCADE" });
  Chat.belongsTo(Employee, { foreignKey: "userId" });

  //Location
  OfficeLocation.hasMany(Roster, { foreignKey: "officeId" });
  //Shift
  OfficeLocation.hasMany(Shift, { foreignKey: "officeId", as: "shifts" });
  Shift.belongsTo(OfficeLocation, {
    foreignKey: "officeId",
    as: "officeLocation",
  });

  Employee.hasMany(Shift, {
    foreignKey: "employeeId",
    as: "shifts",
    onDelete: "CASCADE",
  });
  Shift.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

  Shift.belongsTo(Shift, { foreignKey: "parentShiftId", as: "parentShift" });
  Shift.hasMany(Shift, { foreignKey: "parentShiftId", as: "recurringShifts" });

  // ClockIn/Out
  Employee.hasMany(ClockInOut, { foreignKey: "employeeId", as: "clockEvents" });
  ClockInOut.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

  Shift.hasMany(ClockInOut, { foreignKey: "shiftId", as: "clockEvents" });
  ClockInOut.belongsTo(Shift, { foreignKey: "shiftId", as: "shift" });

  // Employee Availability
  Employee.hasMany(EmployeeAvailability, {
    foreignKey: "employeeId",
    as: "availability",
  });
  EmployeeAvailability.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });

  // Break Periods
  Employee.hasMany(BreakPeriod, { foreignKey: "employeeId", as: "breaks" });
  BreakPeriod.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

  Shift.hasMany(BreakPeriod, { foreignKey: "shiftId", as: "breaks" });
  BreakPeriod.belongsTo(Shift, { foreignKey: "shiftId", as: "shift" });

  // Shift Requests
  Employee.hasMany(ShiftRequest, {
    foreignKey: "employeeId",
    as: "shiftRequests",
  });
  ShiftRequest.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });

  Employee.hasMany(ShiftRequest, {
    foreignKey: "managerId",
    as: "managedShiftRequests",
  });
  ShiftRequest.belongsTo(Employee, { foreignKey: "managerId", as: "manager" });

  OfficeLocation.hasMany(ShiftRequest, {
    foreignKey: "locationId",
    as: "shiftRequests",
  });
  ShiftRequest.belongsTo(OfficeLocation, {
    foreignKey: "locationId",
    as: "location",
  });

  // Time Off
  Employee.hasMany(TimeOff, {
    foreignKey: "employeeId",
    as: "timeOffRequests",
  });
  TimeOff.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

  //RefreshToke
  RefreshToken.belongsTo(Employee, { foreignKey: "employeeId" });
  Employee.hasOne(RefreshToken, {
    foreignKey: "employeeId",
    onDelete: "CASCADE",
  });

  // employeeModel.ts
  Employee.hasMany(Document, { foreignKey: "employeeId", onDelete: "CASCADE" });

  // documentModel.ts
  Document.belongsTo(Employee, {
    foreignKey: "employeeId",
    onDelete: "CASCADE",
  });
  //EmployeeModel.ts
  EmployeeDetails.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });

  Employee.hasOne(EmployeeDetails, {
    foreignKey: "employeeId",
    as: "employeeDetails",
  });
};
