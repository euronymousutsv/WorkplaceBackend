import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";

export interface ClockInOutAttributes {
  id: number;
  employeeId: number;
  shiftId?: number;
  timestamp: Date;
  status: "in" | "out" | "break-start" | "break-end";
  latitude?: string;
  longitude?: string;
  isValid: boolean;
}

export interface ClockInOutCreationAttributes
  extends Optional<
    ClockInOutAttributes,
    "id" | "shiftId" | "latitude" | "longitude"
  > {}

export class ClockInOut
  extends Model<ClockInOutAttributes, ClockInOutCreationAttributes>
  implements ClockInOutAttributes
{
  public id!: number;
  public employeeId!: number;
  public shiftId?: number;
  public timestamp!: Date;
  public status!: "in" | "out" | "break-start" | "break-end";
  public latitude?: string;
  public longitude?: string;
  public isValid!: boolean;
}

ClockInOut.init(
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
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("in", "out", "break-start", "break-end"),
      allowNull: false,
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
  },
  {
    sequelize,
    modelName: "ClockInOut",
    tableName: "clock_in_out",
    schema: "workplacedb",
    timestamps: false,
  }
);
