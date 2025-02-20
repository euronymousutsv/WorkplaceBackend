import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

export interface RoleAttributes {
  RoleID: number;
  RoleName: string;
  Permissions: string;
}

// Optional fields when creating a new Role
export interface RoleCreationAttributes extends Optional<RoleAttributes, "RoleID"> {}

export default class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public RoleID!: number;
  public RoleName!: string;
  public Permissions!: string;
}

Role.init(
  {
    RoleID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    RoleName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Permissions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Role",
    schema: "workplacedb", // Use the correct schema
    timestamps: false,
  }
);


