import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { Employee } from "../employeeModel";
import { OfficeLocation } from "../officeLocation";
import Server from "../serverModel";
export interface ShiftAttributes {
  id: string;
  employeeId?: string;
  officeId?: string;
  startTime: Date;
  endTime: Date;
  status: ShiftStatus;
  notes?: string;
  repeatFrequency?: RepeatFrequency;
  // parentShiftId?: number;
  repeatEndDate?: Date;
}
export enum ShiftStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
export enum RepeatFrequency {
  NONE = "none",
  WEEKLY = "weekly",
  FORTNIGHTLY = "fortnightly",
}

export interface ShiftCreationAttributes
  extends Optional<
    ShiftAttributes,
    | "id"
    | "employeeId"
    | "officeId"
    | "notes"
    | "repeatFrequency"
    // | "parentShiftId"
    | "repeatEndDate"
    // | "createdAt"
    // | "serverId"
  > {}

export class Shift
  extends Model<ShiftAttributes, ShiftCreationAttributes>
  implements ShiftAttributes
{
  public id!: string;
  public employeeId?: string;
  public officeId?: string;
  public startTime!: Date;
  public endTime!: Date;
  public status!: ShiftStatus;
  public notes?: string;
  public repeatFrequency?: RepeatFrequency;
  // public parentShiftId?: number;
  public repeatEndDate?: Date;
  // public createdAt?: Date;
  // public serverId?: string;
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
    // serverId: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references: { model: Server, key: "id" },
    //   onDelete: "CASCADE",
    // },
    officeId: {
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
    // parentShiftId: {
    //   type: DataTypes.UUID,
    //   allowNull: true,
    //   references: { model: Shift, key: "id" },
    //   onDelete: "CASCADE",
    // },
    repeatEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // createdAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
  },
  {
    sequelize,
    modelName: "Shift",
    tableName: "shifts",
    //schema: "workplacedb",
    timestamps: true,
  }
);
