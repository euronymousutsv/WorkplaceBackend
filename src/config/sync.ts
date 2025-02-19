import sequelize from "../config/db";
import Employee from "../models/userModel";

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use `force: true` only in development
    console.log("Database synchronized successfully!");
  } catch (error) {
    console.error("Error syncing database:", error);
  } finally {
    await sequelize.close();
  }
};

syncDatabase();
