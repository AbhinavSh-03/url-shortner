import jwt from "jsonwebtoken";
import { JwtPayload } from "../../modules/auth/auth.types";
import { env } from "../../config/env";

const JWT_EXPIRES_IN = "1h";

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};