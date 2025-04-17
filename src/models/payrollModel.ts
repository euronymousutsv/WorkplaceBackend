import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { Employee } from "./employeeModel"; // Import Employee model

interface PayrollAttributes {
  id: string;
  salary?: number;
  taxDeductions?: number;
  netPay?: number;
  employeeId?: string;
  totalHours?: number;
  hourlyRate?: number;
  startDate?: Date;
  endDate?: Date;
}

interface PayrollCreationAttributes
  extends Optional<
    PayrollAttributes,
    | "id"
    | "employeeId"
    | "hourlyRate"
    | "netPay"
    | "salary"
    | "taxDeductions"
    | "totalHours"
    | "startDate"
    | "endDate"
  > {}

class Payroll
  extends Model<PayrollAttributes, PayrollCreationAttributes>
  implements PayrollAttributes
{
  public id!: string;
  public salary!: number;
  public taxDeductions!: number;
  public netPay!: number;
  public employeeId!: string;
  public totalHours!: number;
  public hourlyRate!: number;
  public startDate!: Date;
  public endDate?: Date;
}

Payroll.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    taxDeductions: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    netPay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Employee, key: "id" },
    },
    totalHours: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hourlyRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Payroll",
    tableName: "payroll",
    schema: "workplacedb", // Use the correct schema
    paranoid: true,
    timestamps: false,
  }
);
// Payroll.belongsTo(Employee,{foreignKey:'employeeId'})
export { Payroll, PayrollAttributes };
