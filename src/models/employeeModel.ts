import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { QueryTypes } from "sequelize";
interface EmployeeAttributes {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  googleId?: string;
  phoneNumber?: string;
  employmentStatus: EmployeeStatus;
  role: "admin" | "employee" | "manager";
  password?: string;
  profileImage?: string;
  baseRate: string;
  contractHours?: string;
  employeeType: "full-time" | "part-time" | "casual";
  department: string;
  position: string;
  managerId?: string;
  hireDate: Date;
  createdAt?: Date;
}

export enum EmployeeStatus {
  ACTIVE = "Active",
  INACTIVE = "InActive",
  LEAVE = "Leave",
  TERMINATED = "Terminated",
}

// Optional fields when creating a new Employee
interface EmployeeCreationAttributes
  extends Optional<
    EmployeeAttributes,
    | "id"
    | "managerId"
    | "contractHours"
    | "createdAt"
    | "googleId"
    | "employmentStatus"
    | "profileImage"
  > {}

class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: string;
  public username!: string;
  public firstName?: string;
  public lastName?: string;
  public email!: string;
  public googleId?: string;
  public phoneNumber?: string;
  public employmentStatus!: EmployeeStatus;
  public role!: "admin" | "employee" | "manager";
  public password?: string;
  public profileImage?: string;
  public baseRate!: string;
  public contractHours?: string;
  public employeeType!: "full-time" | "part-time" | "casual";
  public department!: string;
  public position!: string;
  public managerId?: string;
  public hireDate!: Date;
  public createdAt?: Date;
}
// const checkEnumExists = async () => {
// const [results] = await sequelize.query(
//   `SELECT 1 FROM pg_type WHERE typname = 'enum_employee_role';`
// );
// return results.length > 0;
// };
// async () => {
// const enumExists = await checkEnumExists();
// if (!enumExists) {
//   await sequelize.query(
//     "CREATE TYPE enum_employee_role AS ENUM ('admin','employee','manager');"
//   );
// }
// };

const checkEnumExists = async (enumName: string, schema: string = "public") => {
  const results = await sequelize.query(
    `SELECT 1
     FROM pg_type t
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE t.typname = :enumName AND n.nspname = :schemaName;`,
    {
      replacements: { enumName, schemaName: schema },
      type: QueryTypes.SELECT, //
    }
  );

  return (results as any[]).length > 0;
};

(async () => {
  const schema = "production";

  const enumsToCreate = [
    {
      name: "employee_role",
      values: ["admin", "employee", "manager"],
    },
    {
      name: "employee_type",
      values: ["full-time", "part-time", "casual"],
    },
    {
      name: "employee_employment_status",
      values: ["Active", "Inactive"],
    },
  ];

  for (const enumDef of enumsToCreate) {
    const exists = await checkEnumExists(enumDef.name, schema);
    if (!exists) {
      await sequelize.query(
        `CREATE TYPE ${schema}.${enumDef.name} AS ENUM (${enumDef.values
          .map((v) => `'${v}'`)
          .join(", ")});`
      );
      console.log(`✅ Created enum ${schema}.${enumDef.name}`);
    } else {
      console.log(`ℹ️ Enum ${schema}.${enumDef.name} already exists`);
    }
  }
})();

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employmentStatus: {
      type: DataTypes.ENUM("Active", "InActive", "Leave", "Terminated"),
      allowNull: false,
      defaultValue: "InActive",
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "employee", "manager"),
      allowNull: false,
      defaultValue: "employee",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    baseRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    contractHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    employeeType: {
      type: DataTypes.ENUM("full-time", "part-time", "casual"),
      allowNull: false,
      defaultValue: "casual",
    },
    department: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.STRING(100), allowNull: false },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Employee, key: "id" },
      onDelete: "CASCADE",
    },
    hireDate: { type: DataTypes.DATE, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employee",
    schema: "production", // Use the correct schema
    timestamps: false,
    paranoid: true,
  }
);

// Employee.hasMany(Roster, { foreignKey: 'employeeId', onDelete:"CASCADE" });
// Employee.hasMany(AttendanceEvent, { foreignKey: 'employeeId',onDelete:"CASCADE" });
// Employee.hasMany(Payroll, { foreignKey: 'employeeId',onDelete:"CASCADE" });
export { Employee, EmployeeAttributes };
