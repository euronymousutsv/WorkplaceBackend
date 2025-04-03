import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
export interface BreakPeriodAttributes {
  id: number;
  employeeId: number;
  shiftId: number;
  startTime: Date;
  endTime?: Date;
  breakType: "lunch" | "rest" | "personal";
  notes?: string;
  latitude?: string;
  longitude?: string;
  isValid: boolean;
  createdAt?: Date;
}

export interface BreakPeriodCreationAttributes
  extends Optional<
    BreakPeriodAttributes,
    "id" | "endTime" | "notes" | "latitude" | "longitude" | "createdAt"
  > {}

export class BreakPeriod
  extends Model<BreakPeriodAttributes, BreakPeriodCreationAttributes>
  implements BreakPeriodAttributes
{
  public id!: number;
  public employeeId!: number;
  public shiftId!: number;
  public startTime!: Date;
  public endTime?: Date;
  public breakType!: "lunch" | "rest" | "personal";
  public notes?: string;
  public latitude?: string;
  public longitude?: string;
  public isValid!: boolean;
  public createdAt?: Date;
}

BreakPeriod.init(
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
    shiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakType: {
      type: DataTypes.ENUM("lunch", "rest", "personal"),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "BreakPeriod",
    tableName: "break_periods",
    schema: "workplacedb",
    timestamps: false,
  }
);
