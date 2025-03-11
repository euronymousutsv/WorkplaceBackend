import express from "express";
import { registerServer } from "../../controllers/server/serverController";

const router = express.Router();
router.post("/register", registerServer);

export default router;
