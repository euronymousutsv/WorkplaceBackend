import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { Employee } from "../employeeModel";
export interface TimeOffAttributes {
  id: string;
  employeeId: string;
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
  public id!: string;
  public employeeId!: string;
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
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
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
