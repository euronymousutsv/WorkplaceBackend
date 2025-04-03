import express from "express";
import {
  getLocation,
  getAllLocations,
  createLocation,
  updateLocation,
} from "../controllers/locationcontroller";

const router = express.Router();

router.get("/locations", getAllLocations);
router.get("/locations/:id", getLocation);
router.post("/locations", createLocation);
router.put("/locations/:id", updateLocation);

export default router;
