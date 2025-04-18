import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";
import { Employee } from "./employeeModel";
import { OfficeLocation } from "./officeLocation";

interface JoinedOfficeAttributes {
  id: string;
  officeId: string;
}

interface JoinedOfficeCreationAttributtes
  extends Optional<JoinedOfficeAttributes, "id"> {}

class JoinedOffice extends Model<
  JoinedOfficeAttributes,
  JoinedOfficeCreationAttributtes
> {
  public id!: string;
  public officeId!: string;
}
JoinedOffice.init(
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

    officeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: OfficeLocation,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    paranoid: true,
    sequelize,
    tableName: "joinedOffice",
    timestamps: true, // Enables createdAt and updatedAt automatically
  }
);

export default JoinedOffice;
