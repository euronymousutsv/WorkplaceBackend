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
import JoinedServer from "./joinedServerModel";
import { ExpoDeviceToken } from "./deviceTokenModel";
import Notification from "./Notifications";

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

// joined server
Employee.hasOne(JoinedServer, { foreignKey: "id", onDelete: "CASCADE" });
JoinedServer.belongsTo(Employee, { foreignKey: "id" });

// notificaiton
Notification.belongsTo(Employee, {
  foreignKey: "employeeId",
  as: "employee",
});

// expo device token
Employee.hasOne(ExpoDeviceToken, { foreignKey: "id", onDelete: "CASCADE" });
ExpoDeviceToken.belongsTo(Employee, { foreignKey: "id" });

Server.hasMany(JoinedServer, { foreignKey: "serverId" });
JoinedServer.belongsTo(Server, { foreignKey: "serverId" });

Channel.belongsTo(Server, { foreignKey: "serverId" });
Chat.belongsTo(Channel, { foreignKey: "channelId", as: "channels" });
Channel.hasMany(Chat, { foreignKey: "channelId" });

Employee.hasMany(Chat, { foreignKey: "userId", onDelete: "CASCADE" });
Chat.belongsTo(Employee, { foreignKey: "userId" });

OfficeLocation.hasMany(Roster, { foreignKey: "officeId" });

RefreshToken.belongsTo(Employee, { foreignKey: "employeeId" });
Employee.hasOne(RefreshToken, {
  foreignKey: "employeeId",
  onDelete: "CASCADE",
});

// employeeModel.ts
Employee.hasMany(Document, { foreignKey: "employeeId", onDelete: "CASCADE" });

// documentModel.ts
Document.belongsTo(Employee, { foreignKey: "employeeId", onDelete: "CASCADE" });

export default {};
