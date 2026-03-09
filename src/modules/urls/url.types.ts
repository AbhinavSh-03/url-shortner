import { PoolClient } from "pg";

// ENTITY (Database Representation)
export interface UrlEntity {
  id: number;
  shortCode: string;
  longUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastAccessedAt: Date | null;
  accessCount: number;
  isActive: boolean;
}

// INPUT / OUTPUT DTOs
export interface CreateUrlInput {
  userId: number;
  longUrl: string;
  expiresAt?: Date | null;
}

export interface CreateUrlResult {
  shortCode: string;
  longUrl: string;
  expiresAt: Date | null;
}

// RESOLVE RESULT (Rich Response)
export type ResolveResult =
  | { status: "not_found" }
  | { status: "inactive" }
  | { status: "expired" }
  | { status: "success"; longUrl: string };

// Repository Return Type
export interface ResolveUrlResult {
  id: number;
  longUrl: string;
  expiresAt: Date | null;
  isActive: boolean;
}

// Repository Contract (DB Layer)
export interface IUrlRepository {
  create(
    userId: number,
    longUrl: string,
    expiresAt?: Date | null
  ): Promise<UrlEntity>;

  createWithClient(
    client: PoolClient,
    userId: number,
    longUrl: string,
    expiresAt?: Date | null
  ): Promise<UrlEntity>;

  updateShortCode(id: number, shortCode: string): Promise<void>;

  updateShortCodeWithClient(
    client: PoolClient,
    id: number,
    shortCode: string
  ): Promise<void>;

  findByShortCode(shortCode: string): Promise<ResolveUrlResult | null>;

  findByUserId(userId: number): Promise<UrlEntity[]>;

  deleteByIdAndUserId(id: number, userId: number): Promise<boolean>;

  incrementAccessCount(id: number): Promise<void>;
}

// Service Contract (Business Layer)
export interface IUrlService {
  createShortUrl(input: CreateUrlInput): Promise<CreateUrlResult>;

  resolveShortCode(shortCode: string): Promise<ResolveResult>;

  getUserUrls(userId: number): Promise<UrlEntity[]>;

  deleteUrl(id: number, userId: number): Promise<boolean>;
}