import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
<<<<<<< HEAD

=======
  ssl: {
    rejectUnauthorized: false, // Required for AWS RDS
  },
>>>>>>> fix/backend-structure
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL RDS");
});

export default pool;
