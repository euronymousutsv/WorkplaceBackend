import { Model, DataTypes } from 'sequelize';
import  sequelize  from '../config/db'; // Assuming you have a sequelize instance
interface UserAttributes {
  id: string; // UUID for the user
  email: string;
  firstName?: string; // Optional for Google login
  lastName?: string; // Optional for Google login
  googleId?: string; // Optional, only if logged in via Google
  password?: string; // Optional, only for email/password login
  role: 'admin' | 'employee'; // Default to 'employee'
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public firstName?: string;
  public lastName?: string;
  public googleId?: string;
  public password?: string;
  public role!: 'admin' | 'employee';
  public createdAt!: Date;
  public updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for Google login
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for Google login
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Optional for Google login
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for email/password login
    },
    role: {
      type: DataTypes.ENUM('admin', 'employee'),
      allowNull: false,
      defaultValue: 'employee',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export { User };
