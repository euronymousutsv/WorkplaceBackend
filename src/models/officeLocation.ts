import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { Roster } from "./rosterModel";

// Define attributes for the OfficeLocation model
interface OfficeLocationAttributes {
  id: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // Optional field with default value
}

// Define optional fields for Sequelize
interface OfficeLocationCreationAttributes extends Optional<OfficeLocationAttributes, "id"> {}

class OfficeLocation extends Model<OfficeLocationAttributes, OfficeLocationCreationAttributes> 
  implements OfficeLocationAttributes {
  public id!: string;
  public name?: string;
  public latitude?: number;
  public longitude?: number;
  public radius?: number;
}

OfficeLocation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    radius: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 50, // Default geofence radius in meters
    },
  },
  {
    sequelize,
    modelName: "OfficeLocation",
    tableName: "office_locations",
    timestamps: false,
  }
);
// OfficeLocation.hasMany(Roster,{foreignKey:"officeId"})s
export { OfficeLocation };
