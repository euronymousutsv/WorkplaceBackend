import { NextFunction, Request, Response } from "express";
import ApiError from "../../utils/ApiError.js";
import ApiResponse, { StatusCode } from "../../utils/ApiResponse.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../utils/jwtGenerater.js";

export const verifyLoginStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token part

  try {
    if (!token) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Access token missing");
    }

    const isAuthorized = await verifyAccessToken(token);

    if (!isAuthorized) {
      throw new ApiError(
        StatusCode.UNAUTHORIZED,
        {},
        "Invalid or Expired token"
      );
    }

    next();
  } catch (error) {
    if (error instanceof ApiError)
      res
        .status(error.statusCode)
        .json(
          new ApiError(
            error.statusCode,
            {},
            error.message || "Something is not right"
          )
        );
    else {
      // Handle unexpected errors
      console.error(error); // Log the error for debugging
      res
        .status(StatusCode.UNAUTHORIZED)
        .json(
          new ApiError(StatusCode.UNAUTHORIZED, error, "Something went wrong")
        );
    }
  }
};
