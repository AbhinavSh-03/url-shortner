import { pool } from "../../config/database";
import { User } from "./auth.types";

export const createUser = async (
  email: string,
  passwordHash: string
): Promise<User> => {
  const result = await pool.query(
    `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, plan, billing_period_start, created_at
    `,
    [email, passwordHash]
  );

  return result.rows[0];
};

export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
};

export const findUserById = async (
  id: number
): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT id, email, plan, billing_period_start, created_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};