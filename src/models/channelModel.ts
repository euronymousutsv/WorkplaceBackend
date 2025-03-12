import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Server from "./serverModel";
import { UUIDV4 } from "sequelize";

class Channel extends Model {
  public channelId!: string;
  public serverId!: string;
}

Channel.init(
  {
    channelId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV4(),
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
