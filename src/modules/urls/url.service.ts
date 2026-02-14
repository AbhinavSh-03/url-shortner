import { pool } from '../../config/database';
import { encode } from '../../shared/utils/base62';
import {
  CreateUrlInput,
  CreateUrlResult,
  ResolveResult,
  IUrlService,
} from './url.types';
import { UrlRepository } from './url.repository';

export class UrlService implements IUrlService {
  constructor(private readonly repository = new UrlRepository()) {}

  // ---------- CREATE ----------
  async createShortUrl(
    input: CreateUrlInput
  ): Promise<CreateUrlResult> {
    const { longUrl, expiresAt = null } = input;

    if (!longUrl) {
      throw new Error('Long URL is required');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const entity = await this.repository.createWithClient(
        client,
        longUrl,
        expiresAt
      );

      const shortCode = encode(entity.id);

      await this.repository.updateShortCodeWithClient(
        client,
        entity.id,
        shortCode
      );

      await client.query('COMMIT');

      return {
        shortCode,
        longUrl,
        expiresAt,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ---------- RESOLVE ----------
  async resolveShortCode(
    shortCode: string
  ): Promise<ResolveResult> {
    const record = await this.repository.findByShortCode(shortCode);

    if (!record) return { status: 'not_found' };
    if (!record.isActive) return { status: 'inactive' };
    if (this.isExpired(record.expiresAt))
      return { status: 'expired' };

    // For MVP: synchronous increment
    await this.repository.incrementAccessCount(record.id);

    return { status: 'success', longUrl: record.longUrl };
  }

  // ---------- PRIVATE HELPERS ----------
  private isExpired(expiresAt?: Date | null): boolean {
    if (!expiresAt) return false;
    return expiresAt.getTime() < Date.now();
  }
}
