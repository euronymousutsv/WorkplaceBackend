import { AttendanceEvent } from "./attendancModel";
import { Employee } from "./employeeModel";
import { OfficeLocation } from "./officeLocation";
import { Payroll } from "./payrollModel";
import { Roster } from "./rosterModel";

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

OfficeLocation.hasMany(Roster, { foreignKey: "officeId" });

export default {};
