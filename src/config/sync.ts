import sequelize from "../config/db";

import { Employee } from "../models/employeeModel";
import { AttendanceEvent } from "../models/attendancModel";
import { OfficeLocation } from "../models/officeLocation";
import { Payroll } from "../models/payrollModel";
import { Roster } from "../models/rosterModel";
import "../models/association";
import Chat from "../models/chatModel";
import Server from "../models/serverModel";
import Channel from "../models/channelModel";
import JoinedServer from "../models/joinedServerModel";
import { RefreshToken } from "../models/refreshModel";
const syncDatabase = async () => {
  try {
    console.log("🔄 Connecting to the database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");

    //console.log("🛠 Dropping foreign key constraints to prevent dependency errors...");
    // await sequelize.query('DROP SCHEMA IF EXISTS workplacedb CASCADE;'); // ✅ Drops all tables and foreign key constraints

    // console.log("🛠 Recreating schema...");
    // sequelize.query('CREATE SCHEMA workplacedb;'); // ✅ Ensures schema is created before tables

    //  console.log("🔄 Recreating tables...");
    await Employee.sync({ alter: true });
    await RefreshToken.sync({
      alter: true,
    });
    await Payroll.sync({ alter: true });
    await AttendanceEvent.sync({ alter: true });
    await OfficeLocation.sync({ alter: true });
    await Roster.sync({ alter: true });
    await Chat.sync({ alter: true });
    await Server.sync({ alter: true });
    await Channel.sync({ alter: true });
    await JoinedServer.sync({ alter: true });

    console.log("✅ Database synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

export default syncDatabase;
