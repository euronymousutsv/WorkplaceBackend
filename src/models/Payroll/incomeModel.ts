import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
export interface PayrollAttributes {
  id: string;
  employeeId: string;
  basicSalary: number;
  bonus?: number;
  deductions: number;
  netPay: number;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PayrollCreationAttributes
  extends Optional<
    PayrollAttributes,
    "id" | "bonus" | "createdAt" | "updatedAt"
  > {}

class Income
  extends Model<PayrollAttributes, PayrollCreationAttributes>
  implements PayrollAttributes
{
  public id!: string;
  public employeeId!: string;
  public basicSalary!: number;
  public bonus?: number;
  public deductions!: number;
  public netPay!: number;
  public payPeriodStart!: Date;
  public payPeriodEnd!: Date;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Income.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    basicSalary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bonus: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    deductions: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    netPay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    payPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    payPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Payroll",
    tableName: "payrolls",
    timestamps: true,
  }
);

export default Income;
