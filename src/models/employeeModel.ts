import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { Roster } from "./rosterModel";
import { AttendanceEvent } from "./attendancModel";
import { Payroll } from "./payrollModel";

interface EmployeeAttributes {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  googleId?: string;
  phoneNumber?: string;
  employmentStatus: EmployeeStatus;
  role: "admin" | "employee" | "manager";
  password?: string;
  profileImage?: string;
}
export enum EmployeeStatus {
  ACTIVE = "Active",
  INACTIVE = "InActive",
  LEAVE = "Leave",
  TERMINATED = "Terminated",
}

// Optional fields when creating a new Employee
interface EmployeeCreationAttributes
  extends Optional<
    EmployeeAttributes,
    | "id"
    | "firstName"
    | "lastName"
    | "employmentStatus"
    | "email"
    | "googleId"
    | "password"
    | "phoneNumber"
    | "role"
    | "profileImage"
  > {}

class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: string;
  public firstName?: string;
  public lastName?: string;
  public email!: string;
  public googleId?: string;
  public phoneNumber?: string;
  public employmentStatus!: EmployeeStatus;
  public role!: "admin" | "employee" | "manager";
  public password?: string;
  profileImage?: string;
}
const checkEnumExists = async () => {
  const [results] = await sequelize.query(
    `SELECT 1 FROM pg_type WHERE typname = 'enum_employee_role';`
  );
  return results.length > 0;
};
async () => {
  const enumExists = await checkEnumExists();
  if (!enumExists) {
    await sequelize.query(
      "CREATE TYPE enum_employee_role AS ENUM ('admin','employee','manager');"
    );
  }
};
Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employmentStatus: {
      type: DataTypes.ENUM("Active", "InActive", "Leave", "Terminated"),
      allowNull: false,
      defaultValue: "InActive",
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "employee", "manager"),
      allowNull: false,
      defaultValue: "employee",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employee",
    schema: process.env.DB_SCHEMA, // Use the correct schema
    timestamps: false,
  }
);

// Employee.hasMany(Roster, { foreignKey: 'employeeId', onDelete:"CASCADE" });
// Employee.hasMany(AttendanceEvent, { foreignKey: 'employeeId',onDelete:"CASCADE" });
// Employee.hasMany(Payroll, { foreignKey: 'employeeId',onDelete:"CASCADE" });

export { Employee, EmployeeAttributes };