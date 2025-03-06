    import { DataTypes, Model, Optional } from "sequelize";
    import sequelize from "../config/db";
import { Roster } from "./rosterModel";
import { AttendanceEvent } from "./attendancModel";
import { Payroll } from "./payrollModel";
   
     interface EmployeeAttributes {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
      googleId?: string;
      phoneNumber?: string;
      employmentStatus: "Active"|"Inactive";
      role: "admin"|"employee";
      password?: string;

    }

    // Optional fields when creating a new Employee
    interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, "id"|"firstName"|"lastName"|"employmentStatus"|"email"|"googleId"|"password"|"phoneNumber"|"role"> {}

    class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
      public id!: string;
      public firstName?: string;
      public lastName?: string;
      public email!: string;
      public googleId?: string;
      public phoneNumber?: string;
      public employmentStatus!: "Active"|"Inactive";
      public role!: "admin"|"employee";
      public password?: string;
    
    }

    Employee.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },firstName: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },lastName: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },phoneNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },employmentStatus: {
          type: DataTypes.ENUM("active", "inActive"),
          allowNull: false,
          defaultValue:"inActive",
        },
        role: {
          type: DataTypes.ENUM("admin", "employee"),
          allowNull: false,
          defaultValue: "employee",
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        
      },
      {
        sequelize,
        modelName: "Employee",
        tableName: "employee",
        schema: "workplacedb", // Use the correct schema
        timestamps: false,
      }
    );

    // Employee.hasMany(Roster, { foreignKey: 'employeeId', onDelete:"CASCADE" });
    // Employee.hasMany(AttendanceEvent, { foreignKey: 'employeeId',onDelete:"CASCADE" });
    // Employee.hasMany(Payroll, { foreignKey: 'employeeId',onDelete:"CASCADE" });
    export  {Employee, EmployeeAttributes};
