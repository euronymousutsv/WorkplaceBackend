import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Server from "./serverModel";

// Define attributes for the OfficeLocation model
interface OfficeLocationAttributes {
  id: string;
  name: string;
  serverId?: string;
  latitude: number;
  longitude: number;
  address: string;
  radius: number;
  createdAt?: Date;
}

// Define optional fields for Sequelize
interface OfficeLocationCreationAttributes
  extends Optional<OfficeLocationAttributes, "id" | "createdAt"> {}

class OfficeLocation
  extends Model<OfficeLocationAttributes, OfficeLocationCreationAttributes>
  implements OfficeLocationAttributes
{
  public id!: string;
  public name!: string;
  public address!: string;
  public serverId!: string;
  public latitude!: number;
  public longitude!: number;
  public radius!: number;
  public createdAt?: Date;
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

    serverId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Server,
        key: "id",
      },
    },
    address: {
      type: DataTypes.STRING(255),
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
export { OfficeLocation, OfficeLocationAttributes };
