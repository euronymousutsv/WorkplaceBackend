import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Channel from "./channelModel";
import Employee from "./employeeModel";

class Chat extends Model {
  public chatID!: string;
  public userId!: string;
  public message!: string;
  public channelID!: string;
}

Chat.init(
  {
    chatId: {
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
    channelID: {
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
