import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";

export interface ShiftRequestAttributes {
  id: number;
  employeeId: number;
  requestDate: Date;
  startTime: Date;
  endTime: Date;
  locationId?: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  managerId?: number;
  responseNotes?: string;
  responseDate?: Date;
  createdAt?: Date;
}

export interface ShiftRequestCreationAttributes
  extends Optional<
    ShiftRequestAttributes,
    | "id"
    | "locationId"
    | "managerId"
    | "notes"
    | "responseNotes"
    | "responseDate"
    | "createdAt"
  > {}

export class ShiftRequest
  extends Model<ShiftRequestAttributes, ShiftRequestCreationAttributes>
  implements ShiftRequestAttributes
{
  public id!: number;
  public employeeId!: number;
  public requestDate!: Date;
  public startTime!: Date;
  public endTime!: Date;
  public locationId?: number;
  public status!: "pending" | "approved" | "rejected";
  public notes?: string;
  public managerId?: number;
  public responseNotes?: string;
  public responseDate?: Date;
  public createdAt?: Date;
}

ShiftRequest.init(
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
    requestDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    responseNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ShiftRequest",
    tableName: "shift_requests",
    schema: "workplacedb",
    timestamps: false,
  }
);
