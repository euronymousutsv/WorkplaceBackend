import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Server from "./serverModel";

interface NotificationAttributes {
  id: string;
  employeeId: string;
  title: string;
  body: string;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, "id"> {}

export default class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string;
  public employeeId!: string;
  public title!: string;
  public body!: string;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "employee",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: true,
  }
);
