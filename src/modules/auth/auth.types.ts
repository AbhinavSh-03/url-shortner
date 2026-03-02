export type PlanType = "free" | "pro";

export interface User {
  id: number;
  email: string;
  password_hash?: string;
  plan: PlanType;
  stripe_customer_id?: string | null;
  billing_period_start: Date;
  created_at?: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
  plan: PlanType;
}