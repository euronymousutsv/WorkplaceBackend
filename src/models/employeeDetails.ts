import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { QueryTypes } from "sequelize";
import { Employee } from "./employeeModel";
interface EmployeeDetailsAttributes {
  id: string;
  employeeId: string;
  username: string;
  baseRate: string;
  contractHours?: string;
  employeeType: EmploymentType;
  department: string;
  position: string;
  hireDate: Date;
}

export enum EmploymentType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
  CASUAL = "casual",
}

// Optional fields when creating a new Employee
interface EmployeeDetailsCreationAttributes
  extends Optional<EmployeeDetailsAttributes, "id" | "contractHours"> {}

class EmployeeDetails
  extends Model<EmployeeDetailsAttributes, EmployeeDetailsCreationAttributes>
  implements EmployeeDetailsAttributes
{
  public id!: string;
  public employeeId!: string;
  public username!: string;
  public baseRate!: string;
  public contractHours?: string;
  public employeeType!: EmploymentType;
  public department!: string;
  public position!: string;
  //public managerId?: string;
  public hireDate!: Date;
  public createdAt?: Date;
}

const checkEnumExists = async (enumName: string, schema: string = "public") => {
  const results = await sequelize.query(
    `SELECT 1
     FROM pg_type t
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE t.typname = :enumName AND n.nspname = :schemaName;`,
    {
      replacements: { enumName, schemaName: schema },
      type: QueryTypes.SELECT,
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

EmployeeDetails.init(
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
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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

    hireDate: { type: DataTypes.DATE, allowNull: false },
    //createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "EmployeeDetails",
    tableName: "employeeDetails",
    schema: process.env.DB_SCHEMA, // Use the correct schema
    timestamps: true,
    paranoid: true,
  }
);

// Employee.hasMany(Roster, { foreignKey: 'employeeId', onDelete:"CASCADE" });
// Employee.hasMany(AttendanceEvent, { foreignKey: 'employeeId',onDelete:"CASCADE" });
// Employee.hasMany(Payroll, { foreignKey: 'employeeId',onDelete:"CASCADE" });
export { EmployeeDetails, EmployeeDetailsAttributes };
