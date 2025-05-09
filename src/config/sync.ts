import sequelize from "../config/db";

import { Employee } from "../models/employeeModel";
import { AttendanceEvent } from "../models/attendancModel";
import { OfficeLocation } from "../models/officeLocation";
import { Payroll } from "../models/payrollModel";
import { Roster } from "../models/rosterModel";
import { associateModels } from "../models/association";
import Chat from "../models/chatModel";
import Server from "../models/serverModel";
import Channel from "../models/channelModel";
import JoinedServer from "../models/joinedServerModel";
import { RefreshToken } from "../models/refreshModel";
import JoinedOffice from "../models/joinedOfficeModel";
import Document from "../models/documentModel";
import { BreakPeriod } from "../models/roster-clockinout-shifts/BreakPeriodModel";
import { ClockInOut } from "../models/roster-clockinout-shifts/clockModel";
import { EmployeeAvailability } from "../models/roster-clockinout-shifts/employeeAvailabilityModel";
import { ShiftRequest } from "../models/roster-clockinout-shifts/shiftRequestModel";
import { Shift } from "../models/roster-clockinout-shifts/shiftsModel";
import { TimeOff } from "../models/roster-clockinout-shifts/timeOffModel";
import { PenaltyRate } from "../models/penaltyRates";
import SystemSetting from "../models/systemSettingModel";
import { EmployeeDetails } from "../models/employeeDetails";
import TimeLog from "../models/roster-clockinout-shifts/TimeLogModel";
import LeaveRequest from "../models/leave/LeaveRequest";
import Income from "../models/Payroll/incomeModel";
import ApprovedHours from "../models/Payroll/approvedHoursModel";
const syncDatabase = async () => {
  associateModels();
  try {
    console.log("🔄 Connecting to the database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");

    console.log(
      "🛠 Dropping foreign key constraints to prevent dependency errors..."
    );
    //await sequelize.query("DROP SCHEMA IF EXISTS workplacedb CASCADE;");
    // await sequelize.query("DROP SCHEMA IF EXISTS production CASCADE;"); // ✅ Drops all tables and foreign key constraints

    console.log("🛠 Recreating schema...");
    //sequelize.query("CREATE SCHEMA production;"); // ✅ Ensures schema is created before tables

    console.log("🔄 Recreating tables...");
    await Employee.sync({ alter: true });
    await EmployeeDetails.sync({ alter: true });
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
    await JoinedOffice.sync({ alter: true });
    await TimeLog.sync({ alter: true });
    await TimeOff.sync({ alter: true });

    await Document.sync({ alter: true });
    await BreakPeriod.sync({ alter: true });
    await ClockInOut.sync({ alter: true });
    await EmployeeAvailability.sync({ alter: true });
    await ShiftRequest.sync({ alter: true });
    await Shift.sync({ alter: true });
    await PenaltyRate.sync({ alter: true });
    await SystemSetting.sync({ alter: true });
    await LeaveRequest.sync({ alter: true });
    await ApprovedHours.sync({ alter: true });
    await Income.sync({ alter: true });

    console.log("✅ Database synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

export default syncDatabase;
