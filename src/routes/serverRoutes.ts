import express from "express";
import { registerServer } from "../controllers/serverController";

const router = express.Router();
router.post("/register", registerServer);

export default router;
