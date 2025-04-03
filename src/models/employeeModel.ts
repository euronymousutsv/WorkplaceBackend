import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface EmployeeAttributes {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  googleId?: string;
  phoneNumber?: string;
  employmentStatus: "Active" | "Inactive";
  role: "admin" | "employee" | "manager";
  password?: string;
  profileImage?: string;
  baseRate: string;
  contractHours?: string;
  employeeType: "full-time" | "part-time" | "casual";
  department: string;
  position: string;
  managerId?: string;
  hireDate: Date;
  createdAt?: Date;
}

// Optional fields when creating a new Employee
interface EmployeeCreationAttributes
  extends Optional<
    EmployeeAttributes,
    | "id"
    | "managerId"
    | "contractHours"
    | "createdAt"
    | "googleId"
    | "employmentStatus"
  > {}

class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: string;
  public username!: string;
  public firstName?: string;
  public lastName?: string;
  public email!: string;
  public googleId?: string;
  public phoneNumber?: string;
  public employmentStatus!: "Active" | "Inactive";
  public role!: "admin" | "employee" | "manager";
  public password?: string;
  public profileImage?: string;
  public baseRate!: string;
  public contractHours?: string;
  public employeeType!: "full-time" | "part-time" | "casual";
  public department!: string;
  public position!: string;
  public managerId?: string;
  public hireDate!: Date;
  public createdAt?: Date;
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
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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
      type: DataTypes.ENUM("Active", "InActive"),
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
    baseRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    contractHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    employeeType: {
      type: DataTypes.ENUM("full-time", "part-time", "casual"),
      allowNull: false,
      defaultValue: "casual",
    },
    department: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.STRING(100), allowNull: false },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
    },
    hireDate: { type: DataTypes.DATE, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employee",
    schema: "workplacedb", // Use the correct schema
    timestamps: false,
  }
);

// Employee.hasMany(Roster, { foreignKey: 'employeeId', onDelete:"CASCADE" });
// Employee.hasMany(AttendanceEvent, { foreignKey: 'employeeId',onDelete:"CASCADE" });
// Employee.hasMany(Payroll, { foreignKey: 'employeeId',onDelete:"CASCADE" });
export { Employee, EmployeeAttributes };
