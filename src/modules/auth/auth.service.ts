import {
  createUser,
  findUserByEmail,
  findUserById,
} from "./auth.repository";
import { hashPassword, comparePassword } from "../../shared/utils/password";
import { signToken } from "../../shared/utils/jwt";
import { JwtPayload, User } from "./auth.types";

export const signup = async (email: string, password: string) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser(email, passwordHash);

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    plan: user.plan,
  };

  const token = signToken(payload);

  return { user, token };
};

export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user || !user.password_hash) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    plan: user.plan,
  };

  const token = signToken(payload);

  return { user, token };
};

export const getUserProfile = async (
  userId: number
): Promise<User | null> => {
  return findUserById(userId);
};