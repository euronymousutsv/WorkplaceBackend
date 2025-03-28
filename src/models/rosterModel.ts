import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";
import { Employee } from "./employeeModel";
import { OfficeLocation } from "./officeLocation";

interface RosterAttributes {
  id: string;
  employeeId: string;
  officeId: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  description: String;
}

interface RosterCreationAttributes
  extends Optional<
    RosterAttributes,
    "id" | "endTime" | "officeId" | "startTime" | "employeeId"
  > {}

class Roster
  extends Model<RosterAttributes, RosterCreationAttributes>
  implements RosterAttributes
{
  public id!: string;
  public employeeId!: string;
  public officeId!: string;
  public startTime!: Date;
  public endTime!: Date;
  public date!: Date;
  public description!: String;
}

Roster.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
    },
    officeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: OfficeLocation, key: "id" },
      onDelete: "CASCADE",
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "roster",
    tableName: "roster",
  }
);
//   Roster.belongsTo(Employee,{foreignKey:'employeeId'})
//   Roster.belongsTo(OfficeLocation,{foreignKey:'officeId'})
export { Roster, RosterAttributes };
