import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import sequelize from "../config/db";
import Server from "./serverModel";

export enum Roles {
  ADMIN = "admin",
  EMPLOYEE = "employee",
  MANAGER = "manager",
}

interface ChannelAttributes {
  id: string;
  name: string;
  serverId: string;
  highestRoleToAccessChannel: Roles;
}

class Channel extends Model<
  ChannelAttributes,
  Optional<ChannelAttributes, "id" | "highestRoleToAccessChannel">
> {
  public id!: string;
  public serverId!: string;
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
    serverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Server,
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
