import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

export interface SystemSettingAttributes {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt?: Date;
}

export interface SystemSettingCreationAttributes
  extends Optional<
    SystemSettingAttributes,
    "id" | "description" | "createdAt"
  > {}

export class SystemSetting
  extends Model<SystemSettingAttributes, SystemSettingCreationAttributes>
  implements SystemSettingAttributes
{
  public id!: string;
  public key!: string;
  public value!: string;
  public description?: string;
  public createdAt?: Date;
}

SystemSetting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "SystemSetting",
    tableName: "system_settings",
    //schema: "workplacedb",
    timestamps: false,
  }
);
