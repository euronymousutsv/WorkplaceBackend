import jwt from "jsonwebtoken";
import crypto from "crypto";

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
