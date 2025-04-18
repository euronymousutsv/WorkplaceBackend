import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

// Interface for attributes
export interface SystemSettingAttributes {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt?: Date;
}

// Optional fields for creation
export interface SystemSettingCreationAttributes
  extends Optional<SystemSettingAttributes, "id" | "createdAt"> {}

export class SystemSetting
  extends Model<SystemSettingAttributes, SystemSettingCreationAttributes>
  implements SystemSettingAttributes
{
  public id!: number;
  public key!: string;
  public value!: string;
  public description?: string;
  public createdAt?: Date;
}

SystemSetting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "SystemSetting",
    tableName: "system_settings",
    timestamps: false,
  }
);

export default SystemSetting;
