import jwt from "jsonwebtoken";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import ApiResponse, { StatusCode } from "./apiResponse";
import ApiError from "./apiError";
import { RefreshToken } from "../models/refreshModel";
import { Employee } from "../models/employeeModel";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  jti: string;
}

export const generateAccessToken = (userId: string, role: string): string => {
  const payload: AccessTokenPayload = { userId, role };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

// returns refresh token at [0] and jti at [1]
export const generateRefreshToken = (userId: string): string[] => {
  const jti = crypto.randomUUID();
  const payload: RefreshTokenPayload = { userId, jti };
  return [
    jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }),
    jti,
  ]; // Refresh token valid for 7 days
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
  } catch (error) {
    console.error("Access token verification failed:", error);
    return null;
  }
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    return null;
  }
};

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

    const isAuthorized = verifyAccessToken(token);

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

export const refreshToken = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Refresh token missing");
    }

    const user = verifyRefreshToken(refreshToken);

    if (!user) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Invalid refresh token");
    }

    const jti = user.jti;
    const userId = user.userId;
    console.log(userId);
    const searchedToken = (await RefreshToken.findOne({
      where: { jti },
      include: {
        model: Employee,
        attributes: ["id", "role"],
      },
    })) as RefreshToken & { Employee: Employee };

    if (!searchedToken) {
      throw new ApiError(
        StatusCode.UNAUTHORIZED,
        {},
        "Couldn't fint the jti in the Refresh Token table"
      );
    }

    if (searchedToken.employeeId != userId)
      throw new ApiError(
        StatusCode.UNAUTHORIZED,
        {},
        "Credentials doesn't match"
      );

    const employee = searchedToken.Employee;

    const newAccessToken = generateAccessToken(user.userId, employee.role);
    // it returns an array
    // index [0] is token
    // index [1] is jti
    const newRefreshToken = generateRefreshToken(user.userId);
    const newGeneratedRefreshToken = newAccessToken[0];

    //todo :: Add Expires at
    const newEntryToken = await RefreshToken.create({
      employeeId: employee.id,
      jti: newRefreshToken[1],
    });

    if (!newEntryToken)
      throw new ApiError(
        StatusCode.UNAUTHORIZED,
        {},
        "Unable to save new refresh token "
      );

    await searchedToken.destroy();
    res.status(StatusCode.OK).json(
      new ApiResponse(StatusCode.CREATED, {
        newAccessToken,
        newGeneratedRefreshToken,
      })
    );
  } catch (error) {
    console.error(error); // Log the error for debugging
    res
      .status(StatusCode.UNAUTHORIZED)
      .json(
        new ApiError(StatusCode.UNAUTHORIZED, error, "Something went wrong")
      );
  }
};
