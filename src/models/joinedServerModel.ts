import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";
import { Employee } from "./employeeModel";
import Server from "./serverModel";

interface JoinedServerAttributes {
  id: string;
  serverId: string;
}

interface JoinedServerCreationAttributtes
  extends Optional<JoinedServerAttributes, "id"> {}

class JoinedServer extends Model<
  JoinedServerAttributes,
  JoinedServerCreationAttributtes
> {
  public id!: string;
  public serverId!: string;
}
JoinedServer.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Employee,
        key: "id",
      },
      onDelete: "CASCADE", // Ensures deletion if Employee is deleted
      onUpdate: "CASCADE",
    },

    serverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Server,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    paranoid: true,
    sequelize,
    tableName: "joinedServer",
    timestamps: true, // Enables createdAt and updatedAt automatically
  }
);

export default JoinedServer;
