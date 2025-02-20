import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Employee from "./employeeModel"; // Import Employee model

export interface PayrollAttributes {
  PayrollID: number;
  Salary: number;
  TaxDeductions: number;
  NetPay: number;
  EmployeeID: number;
}

export interface PayrollCreationAttributes extends Optional<PayrollAttributes, "PayrollID"> {}

class Payroll extends Model<PayrollAttributes, PayrollCreationAttributes> implements PayrollAttributes {
  public PayrollID!: number;
  public Salary!: number;
  public TaxDeductions!: number;
  public NetPay!: number;
  public EmployeeID!: number;
}

Payroll.init(
  {
    PayrollID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    Salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    TaxDeductions: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    NetPay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    EmployeeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Payroll",
    schema: "workplacedb", // Use the correct schema
    timestamps: false,
  }
);

// Define the relationship (Foreign Key)
Payroll.belongsTo(Employee, { foreignKey: "EmployeeID", targetKey: "EmployeeID" });

export default Payroll;
