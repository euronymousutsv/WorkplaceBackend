import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../config/db";
import { Employee } from "../employeeModel";
import { OfficeLocation } from "../officeLocation";

export enum ClockStatus {
  ON_TIME = "on_time",
  LATE = "late",
  EARLY = "early",
  NO_SHIFT = "no_shift",
}

interface TimeLogAttributes {
  id: string;
  officeId?: string;
  employeeId: string;
  clockIn: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  hasShift?: boolean;
  clockInStatus?: ClockStatus;
  clockOutStatus?: ClockStatus;
  clockInDiffInMin?: number;
  clockOutDiffInMin?: number;
}

interface TimeLogCreationAttributes
  extends Optional<
    TimeLogAttributes,
    | "id"
    | "clockOut"
    | "breakStart"
    | "breakEnd"
    | "hasShift"
    | "clockInStatus"
    | "clockOutStatus"
    | "clockInDiffInMin"
    | "clockOutDiffInMin"
  > {}

class TimeLog extends Model<TimeLogAttributes, TimeLogCreationAttributes> {
  public id!: string;
  public employeeId!: string;
  public clockIn!: Date;
  public clockOut?: Date;
  public breakStart?: Date;
  public breakEnd?: Date;
  public hasShift?: boolean;
  public clockInStatus?: ClockStatus;
  public clockOutStatus?: ClockStatus;
  public clockInDiffInMin?: number;
  public clockOutDiffInMin?: number;
  public officeId?: string;
}

TimeLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Employee,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    clockIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakStart: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    hasShift: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    clockInStatus: {
      type: DataTypes.ENUM(...Object.values(ClockStatus)),
      allowNull: true,
    },
    clockOutStatus: {
      type: DataTypes.ENUM(...Object.values(ClockStatus)),
      allowNull: true,
    },

    clockInDiffInMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    clockOutDiffInMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    officeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: OfficeLocation,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "timeLogs",
    timestamps: true,
    paranoid: true,
  }
);

export default TimeLog;
