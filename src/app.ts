import express from 'express';
import pool from './config/db';
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

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
  .then(() => console.log("Successfully connected to PostgreSQL RDS"))
  .catch((err) => console.error("Database connection failed:", err));

  app.get("/test-db", async (req, res) => {
    try {
      const result = await db.query("SELECT NOW()");
      res.json({ success: true, message: "Successfully connected to RDS", time: result.rows[0].now });
    } catch (err) {
      console.error("Database query failed:", err);
      res.status(500).json({ success: false, message: "Database query failed", error: err });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });