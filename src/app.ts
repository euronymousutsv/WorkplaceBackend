<<<<<<< HEAD
import express,{Request,Response} from 'express';
import pool from './config/db';
import { Client } from "pg";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
=======
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from './routes/userRoutes';
import loginRoute from './routes/loginRoute';
import pool from "./config/db"; // Import database connection


>>>>>>> fix/backend-structure
dotenv.config();

const app = express();

<<<<<<< HEAD
const db = new Client({
    host: process.env.DB_HOST, // RDS endpoint
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
    ssl:{
        rejectUnauthorized:false,
    }
  });

  db.connect()
=======
// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

app.use('/api/auth', loginRoute);

console.log('🛤️ Listing all registered routes:');
app._router.stack.forEach((r: { route: { path: any; }; }) => {
  if (r.route && r.route.path) {
    console.log(`✅ Registered route: ${r.route.path}`);
  }
});


// Test database connection on startup
pool.connect()
>>>>>>> fix/backend-structure
  .then(() => console.log("Successfully connected to PostgreSQL RDS"))
  .catch((err) => console.error("Database connection failed:", err));
  
  const setSchema = async () => {
    try {
        await db.query('SET search_path TO workplacedb, public;');
        console.log('Search path set to WorkplaceDB schema');
    } catch (err) {
        console.error('Error setting search path:', err);
    }
};
setSchema();
app.get('/employees', async (req: Request, res: Response) => {
  try {
    setSchema();
      // Query data from the employees table in the WorkplaceDB schema
      const result = await db.query('SELECT * FROM "employee";');

<<<<<<< HEAD
      // Send the result as a response
      res.json({
          success: true,
          employees: result.rows,  // Map the rows data
      });
  } catch (err) {
      console.error('Error fetching employees:', err);
      res.status(500).json({ success: false, message: 'Error fetching employees', error: err });
  }
});
  app.get("/test-db", async (req, res) => {
    try {
      const result = await db.query("SELECT NOW()");
      res.json({ success: true, message: "Successfully connected to RDS", time: result.rows[0].now });
    } catch (err) {
      console.error("Database query failed:", err);
      res.status(500).json({ success: false, message: "Database query failed", error: err });
    }
  });
=======
// Test API route
app.get("/", (req, res) => {
>>>>>>> fix/backend-structure
  
  res.send("Hello from Express with TypeScript!");
});


// API route to test database connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, message: "Connected to RDS", time: result.rows[0].now });
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({ success: false, message: "Database query failed", error: err });
  }
});

export default app;
