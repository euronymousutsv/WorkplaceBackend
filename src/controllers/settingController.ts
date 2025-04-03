// controllers/systemSettings.controller.ts
import { Request, Response, NextFunction } from "express";
import { SystemSetting } from "../models/systemSetting";
import { Op } from "sequelize";

// Get all settings
export const getAllSystemSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await SystemSetting.findAll();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Get a single setting by key
export const getSystemSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const setting = await SystemSetting.findOne({
      where: { key: req.params.key },
    });
    if (!setting) {
      res.status(404).json({ message: "Setting not found" });
      return;
    }
    res.json(setting);
  } catch (error) {
    next(error);
  }
};

// Create a new setting
export const createSystemSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const setting = await SystemSetting.create({
      ...req.body,
      createdAt: new Date(),
    });
    res.status(201).json(setting);
  } catch (error) {
    next(error);
  }
};

// Update a setting
export const updateSystemSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [affectedCount, affectedRows] = await SystemSetting.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (affectedCount === 0) {
      res.status(404).json({ message: "Setting not found" });
      return;
    }
    res.json(affectedRows[0]);
  } catch (error) {
    next(error);
  }
};

// Get parsed config object
export const getSystemConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await SystemSetting.findAll();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    const config = {
      enableGeolocation: map.enableGeolocation === "true",
      autoAssignShifts: map.autoAssignShifts === "true",
      sendEmailNotifications: map.sendEmailNotifications !== "false",
      weekendRateMultiplier: parseFloat(map.weekendRateMultiplier || "1.5"),
      publicHolidayRateMultiplier: parseFloat(
        map.publicHolidayRateMultiplier || "2.5"
      ),
      nightShiftRateMultiplier: parseFloat(
        map.nightShiftRateMultiplier || "1.25"
      ),
    };

    res.json(config);
  } catch (error) {
    next(error);
  }
};
