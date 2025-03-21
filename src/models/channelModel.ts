import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db.js";
import Server from "./serverModel.js";

interface ChannelAttributes {
  id: string;
  name: string;
  serverId: string;
}

class Channel extends Model<
  ChannelAttributes,
  Optional<ChannelAttributes, "id">
> {
  public id!: string;
  public serverId!: string;
  name!: string;
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
