import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface EmployeeAttributes {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  EmploymentStatus: string;
  RoleID: number;
  Password: string;
}

// Optional fields when creating a new Employee
interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, "EmployeeID"> {}

class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
  public EmployeeID!: number;
  public FirstName!: string;
  public LastName!: string;
  public Email!: string;
  public PhoneNumber!: string;
  public EmploymentStatus!: string;
  public RoleID!: number;
  public Password!: string;
}

Employee.init(
  {
    EmployeeID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    FirstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    LastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    PhoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    EmploymentStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    RoleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "employee",
    schema: "workplacedb", // Use the correct schema
    timestamps: false,
  }
);

export default Employee;
