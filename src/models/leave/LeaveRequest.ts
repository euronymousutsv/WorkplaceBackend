import { Model, DataTypes, Optional } from "sequelize";
import { Employee } from "../employeeModel";
import sequelize from "../../config/db";
import { OfficeLocation } from "../officeLocation";

export enum LeaveTypeAttributes {
  PAID_LEAVE = "paid_leave",
  UNPAID_LEAVE = "unpaid_leave",
  SICK_LEAVE = "sick_leave",
  VACATION_LEAVE = "vacation_leave",
  PARANTIAL_LEAVE = "parental_leave",
}

export interface LeaveRequestAttributes {
  id: string;
  officeId: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isApproved?: boolean;
  leaveType?: LeaveTypeAttributes;
}

interface LeaveRequestCreationAttributes
  extends Optional<LeaveRequestAttributes, "id" | "reason" | "isApproved"> {}

class LeaveRequest extends Model<
  LeaveRequestAttributes,
  LeaveRequestCreationAttributes
> {
  public id!: string;
  public employeeId!: string;
  public officeId!: string;
  public startDate!: Date;
  public endDate!: Date;
  public reason?: string;
  public isApproved?: boolean;
  public leaveType?: LeaveTypeAttributes;
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
    },

    officeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: OfficeLocation,
        key: "id",
      },

      onDelete: "CASCADE",
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
      allowNull: true,
    },

    leaveType: {
      type: DataTypes.ENUM(
        LeaveTypeAttributes.PAID_LEAVE,
        LeaveTypeAttributes.UNPAID_LEAVE,
        LeaveTypeAttributes.SICK_LEAVE,
        LeaveTypeAttributes.VACATION_LEAVE,
        LeaveTypeAttributes.PARANTIAL_LEAVE
      ),
      allowNull: true,
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
