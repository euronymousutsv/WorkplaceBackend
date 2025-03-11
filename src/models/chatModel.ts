import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Channel from "./channelModel";
import { Employee } from "./employeeModel";

interface ChatAttributes {
  id: string;
  userId: string;
  message: string;
  channelId: string;
}

class Chat extends Model<ChatAttributes> {
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
      // Fixed casing
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
