import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

interface ServerAttributes {
  id: string;
  name: string;
  idVerificationRequired: boolean;
  inviteLink: string;
}

class Server extends Model<ServerAttributes> {
  public id!: string;
  public name!: string;
  public idVerificationRequired!: boolean;
  public inviteLink!: string;
}

Server.init(
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
