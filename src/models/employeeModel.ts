    import { DataTypes, Model, Optional } from "sequelize";
    import sequelize from "../config/db";
import Role from "./roleModel";
  import { OfficeLocation } from "./officeLocation";
  export interface EmployeeAttributes {
      id: number;
      FirstName: string;
      LastName: string;
      Email: string;
      PhoneNumber: string;
      EmploymentStatus: string;
      RoleID: number;
    Password: string;
    assigned_office_id?: string;
    }

    // Optional fields when creating a new Employee
    export interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, "id"> {}

    class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
      public id!: number;
      public FirstName!: string;
      public LastName!: string;
      public Email!: string;
      public PhoneNumber!: string;
      public EmploymentStatus!: string;
      public RoleID!: number;
      public Password!: string;
      public assigned_office_id?: string;

      public readonly Role!:Role;
    }

    Employee.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },FirstName: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },LastName: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },Email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },PhoneNumber: {
          type: DataTypes.STRING(15),
          allowNull: false,
        },EmploymentStatus: {
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
        assigned_office_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: OfficeLocation,
            key:"id",
          }
        }
      },
      {
        sequelize,
        tableName: "employee",
        schema: "workplacedb", // Use the correct schema
        timestamps: false,
      }
    );
  Employee.belongsTo(Role, { foreignKey: 'RoleID', targetKey: 'RoleID' })
  Employee.belongsTo(OfficeLocation, { foreignKey: "assigned_office_id", as: "office" });
    export default Employee;
