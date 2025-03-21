import { AttendanceEvent } from "./attendancModel.js";
import Channel from "./channelModel.js";
import Chat from "./chatModel.js";
import { Employee } from "./employeeModel.js";
import { OfficeLocation } from "./officeLocation.js";
import { Payroll } from "./payrollModel.js";
import { Roster } from "./rosterModel.js";
import Server from "./serverModel.js";

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

Channel.belongsTo(Server, { foreignKey: "serverId" });
Chat.belongsTo(Channel, { foreignKey: "channelId", as: "channels" });
Channel.hasMany(Chat, { foreignKey: "channelId" });

Employee.hasMany(Chat, { foreignKey: "userId", onDelete: "CASCADE" });
Chat.belongsTo(Employee, { foreignKey: "userId" });

OfficeLocation.hasMany(Roster, { foreignKey: "officeId" });

export default {};
