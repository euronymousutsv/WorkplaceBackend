// models/penaltyRate.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

// Interface for the PenaltyRate attributes
export interface PenaltyRateAttributes {
  id: number;
  name: string;
  multiplier: number;
  description?: string;
  createdAt?: Date;
}

// Optional fields for creation
export interface PenaltyRateCreationAttributes
  extends Optional<PenaltyRateAttributes, "id" | "description" | "createdAt"> {}

// Sequelize model class
export class PenaltyRate
  extends Model<PenaltyRateAttributes, PenaltyRateCreationAttributes>
  implements PenaltyRateAttributes
{
  public id!: number;
  public name!: string;
  public multiplier!: number;
  public description?: string;
  public createdAt?: Date;
}

// Model initialization
PenaltyRate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    multiplier: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "PenaltyRate",
    tableName: "penalty_rates",
    timestamps: false,
  }
);
