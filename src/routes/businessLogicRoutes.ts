import express from "express";
import { validateGeolocationHandler } from "../controllers/businessLogic";

const router = express.Router();

router.post("/validate-geolocation", validateGeolocationHandler);

export default router;
