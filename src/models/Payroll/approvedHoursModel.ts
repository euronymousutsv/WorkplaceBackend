// models/approvedHours.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import Income from "./incomeModel";

export interface ApprovedHoursAttributes {
  id: string;
  payrollId?: string;
  employeeId: string;
  officeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  totalHours: number;
  createdAt?: Date;
  updatedAt?: Date;
  bonus?: number;
  deductions?: number;
}

interface ApprovedHoursCreationAttributes
  extends Optional<ApprovedHoursAttributes, "id" | "createdAt" | "updatedAt"> {}

class ApprovedHours
  extends Model<ApprovedHoursAttributes, ApprovedHoursCreationAttributes>
  implements ApprovedHoursAttributes
{
  public id!: string;
  public employeeId!: string;
  public officeId!: string;
  public date!: string;
  public startTime!: string;
  public endTime!: string;
  public totalHours!: number;
  public payrollId?: string;
  public bonus?: number | 0;
  public deductions?: number | 0;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApprovedHours.init(
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

    payrollId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    officeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    bonus: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    deductions: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    totalHours: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ApprovedHours",
    tableName: "approved_hours",
    timestamps: true,
  }
);

export default ApprovedHours;
