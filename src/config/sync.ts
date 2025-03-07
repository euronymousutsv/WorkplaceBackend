import sequelize from "../config/db";

import {Employee} from '../models/employeeModel';
import {Payroll} from '../models/payrollModel';
import {AttendanceEvent} from '../models/attendancModel';
import {OfficeLocation} from '../models/officeLocation';
import {Roster} from '../models/rosterModel';
import '../models/association';
const syncDatabase = async () => {
  try {
    console.log("🔄 Connecting to the database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
    


    console.log("🛠 Dropping foreign key constraints to prevent dependency errors...");
    await sequelize.query('DROP SCHEMA IF EXISTS workplacedb CASCADE;'); // ✅ Drops all tables and foreign key constraints

    console.log("🛠 Recreating schema...");
    await sequelize.query('CREATE SCHEMA workplacedb;'); // ✅ Ensures schema is created before tables

   
    console.log("🔄 Recreating tables...");
    await Employee.sync({ alter: true });
    await Roster.sync({ alter: true });
    await Payroll.sync({ alter: true });
    await AttendanceEvent.sync({ alter: true });
    await OfficeLocation.sync({ alter: true });

    console.log("✅ Database synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }

};

export default syncDatabase;
