"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
const db = new pg_1.Client({
    host: process.env.DB_HOST, // RDS endpoint
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: {
        rejectUnauthorized: false,
    }
});
db.connect()
    .then(() => console.log("Successfully connected to PostgreSQL RDS"))
    .catch((err) => console.error("Database connection failed:", err));
app.get("/test-db", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db.query("SELECT NOW()");
        res.json({ success: true, message: "Successfully connected to RDS", time: result.rows[0].now });
    }
    catch (err) {
        console.error("Database query failed:", err);
        res.status(500).json({ success: false, message: "Database query failed", error: err });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
