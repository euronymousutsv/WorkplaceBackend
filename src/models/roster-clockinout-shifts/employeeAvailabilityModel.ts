import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { Employee } from "../employeeModel";
export interface EmployeeAvailabilityAttributes {
  id: string;
  employeeId: string;
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  createdAt?: Date;
}

export interface EmployeeAvailabilityCreationAttributes
  extends Optional<EmployeeAvailabilityAttributes, "id" | "createdAt"> {}

export class EmployeeAvailability
  extends Model<
    EmployeeAvailabilityAttributes,
    EmployeeAvailabilityCreationAttributes
  >
  implements EmployeeAvailabilityAttributes
{
  public id!: string;
  public employeeId!: string;
  public dayOfWeek!:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  public startTime!: string;
  public endTime!: string;
  public isAvailable!: boolean;
  public createdAt?: Date;
}

EmployeeAvailability.init(
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
    dayOfWeek: {
      type: DataTypes.ENUM(
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
      ),
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    isAvailable: {
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
    modelName: "EmployeeAvailability",
    tableName: "employee_availability",
    schema: "workplacedb",
    timestamps: false,
  }
);
