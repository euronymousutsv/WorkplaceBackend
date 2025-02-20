import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Employee from "./employeeModel";

export interface TimeTrackingAttributes {
  TimeTrackingID: number;
  ClockIn: Date | null;
  ClockOut: Date | null;
  TotalHours: number;
  EmployeeID: number;
  breakStartTime: Date | null;
  breakEndTime: Date | null;
}

export interface TimeTrackingCreationAttributes extends Optional<TimeTrackingAttributes, "TimeTrackingID"> {}

class TimeTracking extends Model<TimeTrackingAttributes, TimeTrackingCreationAttributes> implements TimeTrackingAttributes {
  public TimeTrackingID!: number;
  public ClockIn!: Date | null;
  public ClockOut!: Date | null;
  public TotalHours!: number;
  public EmployeeID!: number;
  public breakStartTime!: Date | null;
  public breakEndTime!: Date | null;
}

TimeTracking.init(
  {
    TimeTrackingID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    ClockIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ClockOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    TotalHours: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    EmployeeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    breakStartTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakEndTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "TimeTracking",
    schema: "workplacedb", // Use the correct schema
    timestamps: false,
  }
);

// Define the relationship (Foreign Key)
TimeTracking.belongsTo(Employee, { foreignKey: "EmployeeID", targetKey: "EmployeeID" });

export default TimeTracking;
