import { OfficeLocation } from "../models/officeLocation";
import { GeolocationValidationPayload } from "../types/controllerTypes";
import { Request, Response } from "express";

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const validateGeolocation = async (
  payload: GeolocationValidationPayload
): Promise<boolean> => {
  const location = await OfficeLocation.findByPk(payload.locationId);
  if (!location) return false;

  const lat1 = parseFloat(String(payload.latitude));
  const lon1 = parseFloat(String(payload.longitude));
  const lat2 = parseFloat(String(location.latitude));
  const lon2 = parseFloat(String(location.longitude));
  const radius = Number(location.radius);

  if ([lat1, lon1, lat2, lon2, radius].some(isNaN)) {
    console.warn("Invalid coordinates or radius.");
    return false;
  }

  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radius;
};

// 🔧 Express controller to use in routes
export const validateGeolocationHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const isValid = await validateGeolocation(req.body);
    res.status(200).json({ valid: isValid });
  } catch (error) {
    console.error("validateGeolocationHandler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
