import express from "express";
import {
  getLocation,
  getAllLocations,
  createLocation,
  updateLocation,
} from "../controllers/locationcontroller";

const router = express.Router();

router.get("/", getAllLocations);
router.get("/:id", getLocation);
router.post("/", createLocation);
router.put("/:id", updateLocation);

export default router;
