import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

interface ExpoDeviceTokenAttributes {
  employeeId: string;
  expoPushToken: string;
  lastSeen?: Date | null;
}

class ExpoDeviceToken extends Model<ExpoDeviceTokenAttributes> {
  public employeeId!: string;
  public expoPushToken!: string;
  public lastSeen!: Date | null;
}

ExpoDeviceToken.init(
  {
    employeeId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "employee",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    expoPushToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,

    timestamps: true,
  }
);

export { ExpoDeviceToken };
