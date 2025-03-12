import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import { UUIDV4 } from "sequelize";

class Server extends Model {
  public serverId!: string;
  public name!: string;
  public idVerificationRequired!: boolean;
  public inviteLink!: string;
}

Server.init(
  {
    serverId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV4(),
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idVerificationRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    inviteLink: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "servers",
    timestamps: true, // Enables createdAt and updatedAt automatically
  }
);

export default Server;
