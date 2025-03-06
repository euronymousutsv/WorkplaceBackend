import syncDatabase from "./config/sync";

require('dotenv').config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import employeeRoutes from "./routes/employeeRoutes";
import sequelize from "./config/db";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/employees", employeeRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
syncDatabase();

// async function test() {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   } 
// }
// test();

sequelize.sync()
.then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
