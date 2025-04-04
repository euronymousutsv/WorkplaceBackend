import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import sequelize from "../config/db";
import Server from "./serverModel";

export enum PayFrequency {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  FORTHNIGHTLY = "forthnightly",
}

export enum PayStatus {
  PENDING = "pending",
  PAID = "paid",
}

interface ChannelAttributes {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payFrequency: PayFrequency;
  hoursWorked: number;
  hourlyRate: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  status: PayStatus;
}

class Channel extends Model<
  ChannelAttributes,
  Optional<ChannelAttributes, "id">
> {}

Channel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employeeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    payPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    payFrequency: {
      type: DataTypes.ENUM(...Object.values(PayFrequency)),
      allowNull: false,
    },
    hoursWorked: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hourlyRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bonuses: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    deductions: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    grossPay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PayStatus)),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Pay",
    tableName: "pay",
    timestamps: true,
  }
);

export default Channel;
