import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";
import Channel from "./channelModel";
import { Employee } from "./employeeModel";
import { bool } from "aws-sdk/clients/signer";

interface ChatAttributes {
  id: string;
  userId: string;
  message: string;
  channelId: string;
  isImage: boolean;
}

class Chat extends Model<
  ChatAttributes,
  Optional<ChatAttributes, "id" | "isImage">
> {
  public id!: string;
  public userId!: string;
  public message!: string;
  public channelId!: string;
  public isImage?: boolean;
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
    isImage: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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
    paranoid: true,
    tableName: "chats",
    timestamps: true,
  }
);

export default Chat;
