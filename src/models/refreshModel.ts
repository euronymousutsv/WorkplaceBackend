import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

// Define the attributes for the RefreshToken model
interface RefreshTokenAttributes {
  employeeId: string; // Make employeeId the primary key
  jti: string;
  expiresAt: Date | null;
}

// Define the creation attributes for the RefreshToken model
interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, "employeeId"> {}

class RefreshToken extends Model<
  RefreshTokenAttributes,
  RefreshTokenCreationAttributes
> {
  public employeeId!: string; // Employee ID as primary key
  public jti!: string;
  public expiresAt!: Date | null;
}

RefreshToken.init(
  {
    employeeId: {
      type: DataTypes.UUID,
      primaryKey: true, // Set employeeId as the primary key
      allowNull: false,
    },
    jti: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "refresh_token",
    timestamps: true,
  }
);

export { RefreshToken };
