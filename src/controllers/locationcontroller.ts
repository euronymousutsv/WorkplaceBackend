import { Request, Response } from "express";
import { OfficeLocation } from "src/models/officeLocation";

// GET /locations/:id
export const getLocation = async (req: Request, res: Response) => {
  try {
    const location = await OfficeLocation.findByPk(req.params.id);
    if (!location) res.status(404).json({ error: "Location not found" });
    return;
    res.status(200).json(location);
  } catch (error) {
    console.error("getLocation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /locations
export const getAllLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await OfficeLocation.findAll();
    res.status(200).json(locations);
  } catch (error) {
    console.error("getAllLocations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /locations
export const createLocation = async (req: Request, res: Response) => {
  try {
    const newLocation = await OfficeLocation.create(req.body);
    res.status(201).json(newLocation);
  } catch (error) {
    console.error("createLocation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /locations/:id
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const [updatedCount, updatedRows] = await OfficeLocation.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (updatedCount === 0) {
      res.status(404).json({ error: "Location not found" });
      return;
    }

    res.status(200).json(updatedRows[0]);
  } catch (error) {
    console.error("updateLocation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
