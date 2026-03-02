import { Request, Response } from "express";
import * as authService from "./auth.service";
import { logger } from "../../shared/logger";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.signup(email, password);

    return res.status(201).json(result);
  } catch (error: any) {
    logger.error(error);
    return res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(error);
    return res.status(401).json({ message: error.message });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await authService.getUserProfile(userId);

    return res.status(200).json(user);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};