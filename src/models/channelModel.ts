import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Server from "./serverModel";

interface ChannelAttributes {
  id: string;
  serverId: string;
}

class Channel extends Model<ChannelAttributes> {
  public id!: string;
  public serverId!: string;
}

Channel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
    tableName: "channels",
    timestamps: true,
  }
);

export default Channel;
