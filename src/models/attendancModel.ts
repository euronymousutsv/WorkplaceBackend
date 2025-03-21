import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db.js";
import { Employee } from "./employeeModel.js";

interface AttendanceEventAttributes {
  id: string;
  employeeId: string;
  eventDate: Date;
  eventTime: Date;
  clockStatus: "clock_in" | "clock_out" | "break_start" | "break_end";
}

interface AttendanceEventCreationAttributes
  extends Optional<
    AttendanceEventAttributes,
    "id" | "clockStatus" | "eventDate" | "eventTime" | "employeeId"
  > {}

class AttendanceEvent
  extends Model<AttendanceEventAttributes, AttendanceEventCreationAttributes>
  implements AttendanceEventAttributes
{
  public id!: string;
  public employeeId!: string;
  public eventDate!: Date;
  public eventTime!: Date;
  public clockStatus!: "clock_in" | "clock_out" | "break_start" | "break_end";
}

AttendanceEvent.init(
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
        model: Employee, // Assuming you have a Users table
        key: "id",
      },
      onDelete: "CASCADE",
    },
    eventDate: {
      type: DataTypes.DATEONLY, // Stores only the date (YYYY-MM-DD)
      allowNull: false,
    },
    eventTime: {
      type: DataTypes.DATE, // Stores full timestamp (YYYY-MM-DD HH:mm:ss)
      allowNull: false,
    },
    clockStatus: {
      type: DataTypes.ENUM("clock_in", "clock_out", "break_start", "break_end"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "AttendanceEvent",
    tableName: "attendance_events",
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// AttendanceEvent.belongsTo(Employee,{foreignKey:'employeeId'})

export { AttendanceEvent, AttendanceEventAttributes };
