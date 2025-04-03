import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
export interface TimeOffAttributes {
  id: number;
  employeeId: number;
  startDate: Date;
  endDate: Date;
  type: string; // e.g., 'annual_leave', 'sick_leave'
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt?: Date;
}

export interface TimeOffCreationAttributes
  extends Optional<TimeOffAttributes, "id" | "notes" | "createdAt"> {}

export class TimeOff
  extends Model<TimeOffAttributes, TimeOffCreationAttributes>
  implements TimeOffAttributes
{
  public id!: number;
  public employeeId!: number;
  public startDate!: Date;
  public endDate!: Date;
  public type!: string;
  public status!: "pending" | "approved" | "rejected";
  public notes?: string;
  public createdAt?: Date;
}

TimeOff.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "TimeOff",
    tableName: "time_off",
    schema: "workplacedb",
    timestamps: false,
  }
);
