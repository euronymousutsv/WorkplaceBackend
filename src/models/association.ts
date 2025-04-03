import { AttendanceEvent } from "./attendancModel";
import Channel from "./channelModel";
import Chat from "./chatModel";
import { Employee } from "./employeeModel";
import { OfficeLocation } from "./officeLocation";
import { Payroll } from "./payrollModel";
import { RefreshToken } from "./refreshModel";
import { Roster } from "./rosterModel";
import Document from "./documentModel";
import Server from "./serverModel";
import { BreakPeriod } from "./roster-clockinout-shifts/BreakPeriodModel";
import { ClockInOut } from "./roster-clockinout-shifts/clockModel";
import { EmployeeAvailability } from "./roster-clockinout-shifts/employeeAvailabilityModel";
import { ShiftRequest } from "./roster-clockinout-shifts/shiftRequestModel";
import { Shift } from "./roster-clockinout-shifts/shiftsModel";
import { TimeOff } from "./roster-clockinout-shifts/timeOffModel";
// Define associations AFTER models are imported

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

//channel and chats

Channel.belongsTo(Server, { foreignKey: "serverId" });
Chat.belongsTo(Channel, { foreignKey: "channelId", as: "channels" });
Channel.hasMany(Chat, { foreignKey: "channelId" });

Employee.hasMany(Chat, { foreignKey: "userId", onDelete: "CASCADE" });
Chat.belongsTo(Employee, { foreignKey: "userId" });

//Location
OfficeLocation.hasMany(Roster, { foreignKey: "officeId" });
//Shift
OfficeLocation.hasMany(Shift, { foreignKey: "employeeId", as: "shifts" });
Shift.belongsTo(OfficeLocation, { foreignKey: "locationId", as: " location" });

Employee.hasMany(Shift, { foreignKey: "employeeId", as: "shifts" });
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
ShiftRequest.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

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
Employee.hasMany(TimeOff, { foreignKey: "employeeId", as: "timeOffRequests" });
TimeOff.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

//RefreshToke
RefreshToken.belongsTo(Employee, { foreignKey: "employeeId" });
Employee.hasOne(RefreshToken, { foreignKey: "employeeId" });

// Employee Documents
Employee.hasMany(Document, { foreignKey: "employeeId" });
Document.belongsTo(Employee, { foreignKey: "employeeId" });

export default {};
