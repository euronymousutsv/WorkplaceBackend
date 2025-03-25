import { AttendanceEvent } from "./attendancModel";
import Channel from "./channelModel";
import Chat from "./chatModel";
import { Employee } from "./employeeModel";
import { OfficeLocation } from "./officeLocation";
import { Payroll } from "./payrollModel";
import { RefreshToken } from "./refreshModel";
import { Roster } from "./rosterModel";
import Server from "./serverModel";

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

RefreshToken.belongsTo(Employee, { foreignKey: "employeeId" });
Employee.hasOne(RefreshToken, { foreignKey: "employeeId" });
export default {};
