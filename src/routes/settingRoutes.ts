// routes/systemSettings.routes.ts
import express from "express";
import {
  getAllSystemSettings,
  getSystemSetting,
  createSystemSetting,
  updateSystemSetting,
  getSystemConfig,
  getSystemConfigHandler,
} from "../controllers/settingController";

const router = express.Router();

// GET all settings
router.get("/", getAllSystemSettings);

// GET setting by key
router.get("/:key", getSystemSetting);

// GET parsed config object
router.get("/config/system", getSystemConfigHandler);

// POST create new setting
router.post("/", createSystemSetting);

// PATCH update setting by ID
router.patch("/:id", updateSystemSetting);

export default router;
