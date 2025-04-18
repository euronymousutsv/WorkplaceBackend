import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import sequelize from "../config/db";
import Server from "./serverModel";
import { OfficeLocation } from "./officeLocation";

export enum Roles {
  ADMIN = "admin",
  EMPLOYEE = "employee",
  MANAGER = "manager",
}

interface ChannelAttributes {
  id: string;
  name: string;
  officeId: string;
  highestRoleToAccessChannel: Roles;
}

class Channel extends Model<
  ChannelAttributes,
  Optional<ChannelAttributes, "id" | "highestRoleToAccessChannel">
> {
  public id!: string;
  public officeId?: string;
  name!: string;
  highestRoleToAccessChannel?: Roles;
}

Channel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    highestRoleToAccessChannel: {
      type: DataTypes.ENUM,
      values: ["admin", "manager", "employee"],
      allowNull: true,
    },
    officeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: OfficeLocation,
        key: "id",
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    tableName: "channels",
    timestamps: true,
  }
);

export default Channel;
