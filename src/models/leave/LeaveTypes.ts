import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/db";

class LeaveType extends Model {
  public id!: string;
  public name!: string;
  public isPaid!: boolean;
}

LeaveType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "leaveTypes",
    timestamps: true,
    paranoid: true,
  }
);

export default LeaveType;
