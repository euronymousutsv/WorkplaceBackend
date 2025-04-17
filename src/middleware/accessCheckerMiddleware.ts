import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";
import { StatusCode } from "../utils/apiResponse";
import { getAccessToken } from "../utils/helper";
import { verifyAccessToken } from "../utils/jwtGenerater";

export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

export const checkPermission = (requiredRole: Role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // decode access token
      const token = getAccessToken(req);
      if (!token) {
        throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Access token missing");
      }

      const isAuthorized = verifyAccessToken(token);
      console.log(isAuthorized?.role);
      if (!isAuthorized) {
        throw new ApiError(
          StatusCode.UNAUTHORIZED,
          {},
          "Invalid or Expired token"
        );
      }

      const role = isAuthorized.role;
      if (!role || !requiredRole)
        throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Role not found.");

      if (
        role.toLocaleLowerCase() === requiredRole ||
        role.toLocaleLowerCase() === "admin"
      ) {
        next();
      } else {
        throw new ApiError(StatusCode.FORBIDDEN, {}, "Access Denied");
      }
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
};
