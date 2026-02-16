import { Pool, PoolClient } from 'pg';
import { pool } from '../../config/database';
import {
  IUrlRepository,
  UrlEntity,
  ResolveUrlResult,
} from './url.types';

export class UrlRepository implements IUrlRepository {
  constructor(private readonly db: Pool = pool) {}

  //INTERNAL MAPPER
  private mapRowToEntity(row: any): UrlEntity {
    return {
      id: row.id,
      shortCode: row.short_code ?? '',
      longUrl: row.long_url,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      lastAccessedAt: row.last_accessed_at,
      accessCount: row.access_count,
      isActive: row.is_active,
    };
  }

  //CREATE (NON-TRANSACTIONAL)
  async create(
    longUrl: string,
    expiresAt: Date | null = null
  ): Promise<UrlEntity> {
    const result = await this.db.query(
      `
      INSERT INTO urls (long_url, expires_at)
      VALUES ($1, $2)
      RETURNING *
      `,
      [longUrl, expiresAt]
    );

    return this.mapRowToEntity(result.rows[0]);
  }

  //CREATE (TRANSACTIONAL)
  async createWithClient(
    client: PoolClient,
    longUrl: string,
    expiresAt: Date | null = null
  ): Promise<UrlEntity> {
    const result = await client.query(
      `
      INSERT INTO urls (long_url, expires_at)
      VALUES ($1, $2)
      RETURNING *
      `,
      [longUrl, expiresAt]
    );

    return this.mapRowToEntity(result.rows[0]);
  }

  //UPDATE SHORT CODE
  async updateShortCode(
    id: number,
    shortCode: string
  ): Promise<void> {
    await this.db.query(
      `
      UPDATE urls
      SET short_code = $1
      WHERE id = $2
      `,
      [shortCode, id]
    );
  }

  async updateShortCodeWithClient(
    client: PoolClient,
    id: number,
    shortCode: string
  ): Promise<void> {
    await client.query(
      `
      UPDATE urls
      SET short_code = $1
      WHERE id = $2
      `,
      [shortCode, id]
    );
  }

  //FIND 
  async findByShortCode(
    shortCode: string
  ): Promise<ResolveUrlResult | null> {
    const result = await this.db.query(
      `
      SELECT id, long_url, expires_at, is_active
      FROM urls
      WHERE short_code = $1
      `,
      [shortCode]
    );

    

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return {
      id: row.id,
      longUrl: row.long_url,
      expiresAt: row.expires_at,
      isActive: row.is_active,
    };
  }

  //INCREMENT
  async incrementAccessCount(id: number): Promise<void> {
    await this.db.query(
      `
      UPDATE urls
      SET access_count = access_count + 1,
          last_accessed_at = NOW()
      WHERE id = $1
      `,
      [id]
    );
  }
}
