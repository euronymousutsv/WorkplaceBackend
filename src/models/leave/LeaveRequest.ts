import { Model, DataTypes, Optional } from "sequelize";
import { Employee } from "../employeeModel";
import LeaveType from "./LeaveTypes";
import sequelize from "../../config/db";

interface LeaveRequestAttributes {
  id: string;
  employeeId: string;
  leaveTypeId: number;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isApproved: boolean;
}

interface LeaveRequestCreationAttributes
  extends Optional<LeaveRequestAttributes, "id" | "reason" | "isApproved"> {}

class LeaveRequest extends Model<
  LeaveRequestAttributes,
  LeaveRequestCreationAttributes
> {
  public id!: string;
  public employeeId!: string;
  public leaveTypeId!: string;
  public startDate!: Date;
  public endDate!: Date;
  public reason?: string;
  public isApproved!: boolean;
}

LeaveRequest.init(
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
    leaveTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: LeaveType,
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "leaveRequests",
    timestamps: true,
    paranoid: true,
  }
);

export default LeaveRequest;
