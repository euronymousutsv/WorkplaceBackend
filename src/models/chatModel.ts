import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db.js";
import Channel from "./channelModel.js";
import { Employee } from "./employeeModel.js";

interface ChatAttributes {
  id: string;
  userId: string;
  message: string;
  channelId: string;
}

class Chat extends Model<ChatAttributes, Optional<ChatAttributes, "id">> {
  public id!: string;
  public userId!: string;
  public message!: string;
  public channelId!: string; // Fixed casing
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Employee,
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    channelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Channel,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "chats",
    timestamps: true,
  }
);

export default Chat;
