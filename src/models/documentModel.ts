//Model for Document Verification and Verified

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { Employee } from "./employeeModel";

interface DocumentAttributes {
  id: string;
  documentType: "License" | "National ID";
  documentid: number;
  employeeId: string;
  expiryDate: Date;
  issueDate: Date;
  Employee?: Employee;
}
interface DocumentCreationAttributes
  extends Optional<
    DocumentAttributes,
    | "id"
    | "documentType"
    | "documentid"
    | "employeeId"
    | "expiryDate"
    | "issueDate"
  > {}

class Document
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  public id!: string;
  public employeeId!: string;
  public documentType!: "License" | "National ID";
  public expiryDate!: Date;
  public documentid!: number;
  public issueDate!: Date;
  public Employee?: Employee;
}

Document.init(
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
    documentType: {
      type: DataTypes.ENUM("License", "National ID"),
      allowNull: false,
      defaultValue: "License",
    },
    documentid: { type: DataTypes.STRING, allowNull: false },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    issueDate: { type: DataTypes.DATE, allowNull: false },
  },

  {
    sequelize,
    modelName: "document",

    tableName: "document",
    paranoid: true,
  }
);
export default Document;
