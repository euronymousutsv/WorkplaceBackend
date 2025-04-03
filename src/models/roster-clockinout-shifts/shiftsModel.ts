import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { Employee } from "../employeeModel";
import { OfficeLocation } from "../officeLocation";
export interface ShiftAttributes {
  id: string;
  employeeId?: string;
  locationId?: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "assigned" | "active" | "completed" | "cancelled";
  notes?: string;
  repeatFrequency?: "none" | "weekly" | "fortnightly";
  parentShiftId?: number;
  repeatEndDate?: Date;
  createdAt?: Date;
}

export interface ShiftCreationAttributes
  extends Optional<
    ShiftAttributes,
    | "id"
    | "employeeId"
    | "locationId"
    | "notes"
    | "repeatFrequency"
    | "parentShiftId"
    | "repeatEndDate"
    | "createdAt"
  > {}

export class Shift
  extends Model<ShiftAttributes, ShiftCreationAttributes>
  implements ShiftAttributes
{
  public id!: string;
  public employeeId?: string;
  public locationId?: string;
  public startTime!: Date;
  public endTime!: Date;
  public status!: "pending" | "assigned" | "active" | "completed" | "cancelled";
  public notes?: string;
  public repeatFrequency?: "none" | "weekly" | "fortnightly";
  public parentShiftId?: number;
  public repeatEndDate?: Date;
  public createdAt?: Date;
}

Shift.init(
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
    locationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: OfficeLocation, key: "id" },
      onDelete: "CASCADE",
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "assigned",
        "active",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repeatFrequency: {
      type: DataTypes.ENUM("none", "weekly", "fortnightly"),
      allowNull: true,
      defaultValue: "none",
    },
    parentShiftId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Shift, key: "id" },
      onDelete: "CASCADE",
    },
    repeatEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Shift",
    tableName: "shifts",
    schema: "workplacedb",
    timestamps: false,
  }
);
