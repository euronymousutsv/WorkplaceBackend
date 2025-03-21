import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";
import { Employee } from "./employeeModel";
import { randomUUID } from "crypto";

interface ServerAttributes {
  id: string;
  name: string;
  idVerificationRequired: boolean;
  inviteLink: string;
  ownerId: string;
}

interface ServerCreationAttributtes extends Optional<ServerAttributes, "id"> {}

class Server extends Model<ServerAttributes, ServerCreationAttributtes> {
  public id!: string;
  public name!: string;
  public idVerificationRequired!: boolean;
  public inviteLink!: string;
  public ownerId!: string;
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
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Employee,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "servers",
    timestamps: true, // Enables createdAt and updatedAt automatically
  }
);

export default Server;
