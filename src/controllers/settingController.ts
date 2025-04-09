// controllers/systemSettings.controller.ts
import { Request, Response, NextFunction } from "express";
import { SystemSetting } from "../models/systemSetting";
import { Op } from "sequelize";
import { SystemConfig } from "../types/controllerTypes";
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
    const id = req.params.key;
    console.log(req.params.key);
    const setting = await SystemSetting.findOne({
      where: { key: id },
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
    console.log({ ...req.body });
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
export const getSystemConfig = async (): Promise<SystemConfig> => {
  const keys = [
    "enableGeolocation",
    "autoAssignShifts",
    "sendEmailNotifications",
    "weekendRateMultiplier",
    "publicHolidayRateMultiplier",
    "nightShiftRateMultiplier",
  ];

  const settings = await SystemSetting.findAll({
    where: {
      key: keys,
    },
  });

  // Convert settings to a key-value map
  const configMap: Record<string, string> = {};
  settings.forEach((setting) => {
    configMap[setting.key] = setting.value;
  });

  return {
    enableGeolocation:
      configMap["enableGeolocation"] !== undefined
        ? configMap["enableGeolocation"] === "true"
        : true,

    autoAssignShifts:
      configMap["autoAssignShifts"] !== undefined
        ? configMap["autoAssignShifts"] === "true"
        : false,

    sendEmailNotifications:
      configMap["sendEmailNotifications"] !== undefined
        ? configMap["sendEmailNotifications"] === "true"
        : true,
    weekendRateMultiplier: parseFloat(
      configMap["weekendRateMultiplier"] || "1.5"
    ),
    publicHolidayRateMultiplier: parseFloat(
      configMap["publicHolidayRateMultiplier"] || "2.5"
    ),
    nightShiftRateMultiplier: parseFloat(
      configMap["nightShiftRateMultiplier"] || "1.25"
    ),
  };
};
export const getSystemConfigHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await getSystemConfig();
    res.json(config);
  } catch (error) {
    next(error);
  }
};
