import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import {Employee} from "./employeeModel"; // Import Employee model

 interface PayrollAttributes {
  id: string;
  salary?: number;
  taxDeductions?: number;
  netPay?: number;
  employeeId?: number;
  totalHours?: number;
  hourlyRate?: number;
}

 interface PayrollCreationAttributes extends Optional<PayrollAttributes, "id"|"employeeId"|"hourlyRate"|"netPay"|"salary"|"taxDeductions"|"totalHours"> {}

class Payroll extends Model<PayrollAttributes, PayrollCreationAttributes> implements PayrollAttributes {
  public id!: string;
  public salary!: number;
  public taxDeductions!: number;
  public netPay!: number;
  public employeeId!: number;
  public totalHours!: number;
  public hourlyRate!: number;
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
      references:{model : Employee, key: 'id'}
    },
    totalHours: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hourlyRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

  },
  {
    sequelize,
    modelName: "Payroll",
    tableName: "payroll",
    schema: "workplacedb", // Use the correct schema
    timestamps: false,
  }
);
// Payroll.belongsTo(Employee,{foreignKey:'employeeId'})
export {Payroll, PayrollAttributes} 
