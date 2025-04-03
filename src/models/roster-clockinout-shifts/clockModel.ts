import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { Employee } from "../employeeModel";
import { Shift } from "./shiftsModel";
export interface ClockInOutAttributes {
  id: string;
  employeeId: string;
  shiftId?: string;
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
  public id!: string;
  public employeeId!: string;
  public shiftId?: string;
  public timestamp!: Date;
  public status!: "in" | "out" | "break-start" | "break-end";
  public latitude?: string;
  public longitude?: string;
  public isValid!: boolean;
}

ClockInOut.init(
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
    shiftId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Shift, key: "id" },
      onDelete: "CASCADE",
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
    // schema: "workplacedb",
    timestamps: false,
  }
);
