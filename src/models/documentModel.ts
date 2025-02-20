import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Employee from "./employeeModel"; // Import Employee model

export interface DocumentAttributes {
  DocumentID: number;
  DocumentName: string;
  DocumentType: string;
  UploadDate: Date;
  ExpiryDate: Date;
  EmployeeID: number;
}

export interface DocumentCreationAttributes extends Optional<DocumentAttributes, "DocumentID"> {}

class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public DocumentID!: number;
  public DocumentName!: string;
  public DocumentType!: string;
  public UploadDate!: Date;
  public ExpiryDate!: Date;
  public EmployeeID!: number;
}

Document.init(
  {
    DocumentID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    DocumentName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    DocumentType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    UploadDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    EmployeeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Document",
    schema: "workplacedb", // Use the correct schema
    timestamps: false,
  }
);

// Define the relationship (Foreign Key)
Document.belongsTo(Employee, { foreignKey: "EmployeeID", targetKey: "EmployeeID" });

export default Document;
