import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from './routes/userRoutes';
import loginRoute from './routes/loginRoute';
import pool from "./config/db"; // Import database connection


dotenv.config();

const app = express();

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
  .then(() => console.log("Successfully connected to PostgreSQL RDS"))
  .catch((err) => console.error("Database connection failed:", err));

// Test API route
app.get("/", (req, res) => {
  
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
