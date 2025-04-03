import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { Employee } from "../employeeModel";
import { OfficeLocation } from "../officeLocation";
export interface ShiftRequestAttributes {
  id: string;
  employeeId: string;
  requestDate: Date;
  startTime: Date;
  endTime: Date;
  locationId?: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  managerId?: string;
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
  public id!: string;
  public employeeId!: string;
  public requestDate!: Date;
  public startTime!: Date;
  public endTime!: Date;
  public locationId?: string;
  public status!: "pending" | "approved" | "rejected";
  public notes?: string;
  public managerId?: string;
  public responseNotes?: string;
  public responseDate?: Date;
  public createdAt?: Date;
}

ShiftRequest.init(
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
      type: DataTypes.UUID,

      allowNull: true,
      references: { model: OfficeLocation, key: "id" },
      onDelete: "CASCADE",
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
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
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
    // schema: "workplacedb",
    timestamps: false,
  }
);
