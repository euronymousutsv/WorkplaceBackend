// controllers/systemSettings.controller.ts
import { Request, Response, NextFunction } from "express";
import { SystemSetting } from "../models/systemSetting";
import { Op } from "sequelize";
import { SystemConfig } from "../types/controllerTypes";
import ApiError from "../utils/apiError";
import ApiResponse,{StatusCode} from "../utils/apiResponse";

// Get all settings
export const getAllSystemSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await SystemSetting.findAll();
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, settings, "System settings retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve system settings"));
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
    const setting = await SystemSetting.findOne({
      where: { key: id },
    });
    if (!setting) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Setting not found");
    }
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, setting, "System setting retrieved successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve system setting"));
    }
  }
};

// Create a new setting
export const createSystemSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key, value, description } = req.body;

    // Validate required fields
    if (!key) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Setting key is required");
    }
    if (!value) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Setting value is required");
    }

    // Check if setting with same key already exists
    const existingSetting = await SystemSetting.findOne({
      where: { key },
    });

    if (existingSetting) {
      throw new ApiError(StatusCode.CONFLICT, {}, "Setting with this key already exists");
    }

    const setting = await SystemSetting.create({
      key,
      value,
      description,
      createdAt: new Date(),
    });

    res.status(StatusCode.CREATED).json(new ApiResponse(StatusCode.CREATED, setting, "System setting created successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to create system setting"));
    }
  }
};

// Update a setting
export const updateSystemSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key, value, description } = req.body;
    const id = req.params.id;

    // Validate required fields
    if (!key) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Setting key is required");
    }
    if (!value) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Setting value is required");
    }

    // Check if setting exists
    const existingSetting = await SystemSetting.findByPk(id);
    if (!existingSetting) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Setting not found");
    }

    // Check if key is being changed and if new key already exists
    if (key !== existingSetting.key) {
      const keyExists = await SystemSetting.findOne({
        where: { key },
      });
      if (keyExists) {
        throw new ApiError(StatusCode.CONFLICT, {}, "Setting with this key already exists");
      }
    }

    const [affectedCount, affectedRows] = await SystemSetting.update(
      { key, value, description },
      {
        where: { id },
        returning: true,
      }
    );

    if (affectedCount === 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Setting not found");
    }

    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, affectedRows[0], "System setting updated successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to update system setting"));
    }
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
    res.status(StatusCode.OK).json(new ApiResponse(StatusCode.OK, config, "System configuration retrieved successfully"));
  } catch (error) {
    next(new ApiError(StatusCode.INTERNAL_SERVER_ERROR, {}, "Failed to retrieve system configuration"));
  }
};
