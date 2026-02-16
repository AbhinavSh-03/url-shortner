import { pool } from '../../config/database';
import { redis } from '../../config/redis';
import { encode } from '../../shared/utils/base62';
import {
  CreateUrlInput,
  CreateUrlResult,
  ResolveResult,
  IUrlService,
} from './url.types';
import { UrlRepository } from './url.repository';
import { enqueueClick } from '../../workers/click.worker';

process.stdout.write('URL SERVICE FILE LOADED\n');

export class UrlService implements IUrlService {
  constructor(private readonly repository = new UrlRepository()) {}

  // ---------------- CREATE ----------------
  async createShortUrl(
    input: CreateUrlInput
  ): Promise<CreateUrlResult> {
    const { longUrl, expiresAt = null } = input;

    
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

  // ---------------- RESOLVE (CACHE-FIRST + RESILIENT + ASYNC CLICK) ----------------
  async resolveShortCode(
    shortCode: string
  ): Promise<ResolveResult> {
    const cacheKey = `url:${shortCode}`;

    // 1️⃣ Redis read (timeout protected)
    const cached = await this.safeRedisGet(cacheKey);

    if (cached) {
      let data: any;

      try {
        data = JSON.parse(cached);
      } catch {
        console.error('Invalid cache format');
        return { status: 'not_found' };
      }

      if (!data.isActive) return { status: 'inactive' };
      if (this.isExpired(data.expiresAt))
        return { status: 'expired' };

      enqueueClick(data.id);

      return { status: 'success', longUrl: data.longUrl };
    }

    // 2️⃣ Fallback to DB
    const record = await this.repository.findByShortCode(shortCode);

    if (!record) return { status: 'not_found' };
    if (!record.isActive) return { status: 'inactive' };
    if (this.isExpired(record.expiresAt))
      return { status: 'expired' };

    enqueueClick(record.id);

    // 3️⃣ Cache write (timeout protected)
    const ttl = this.calculateTTL(record.expiresAt);

    if (ttl > 0) {
      await this.safeRedisSet(
        cacheKey,
        JSON.stringify({
          id: record.id,
          longUrl: record.longUrl,
          expiresAt: record.expiresAt,
          isActive: record.isActive,
        }),
        ttl
      );
    }

    return { status: 'success', longUrl: record.longUrl };
  }

  // ---------------- REDIS SAFETY LAYER ----------------

  private async safeRedisGet(
    key: string,
    timeoutMs = 100
  ): Promise<string | null> {
    try {
      const readPromise = redis.get(key);

      return await Promise.race([
        readPromise,
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), timeoutMs)
        ),
      ]);
    } catch (err) {
      console.error('Redis read error:', err);
      return null;
    }
  }

  private async safeRedisSet(
    key: string,
    value: string,
    ttl: number,
    timeoutMs = 100
  ): Promise<void> {
    try {
      const writePromise = redis.set(key, value, { EX: ttl });

      await Promise.race([
        writePromise,
        new Promise((resolve) =>
          setTimeout(resolve, timeoutMs)
        ),
      ]);
    } catch (err) {
      console.error('Redis write error:', err);
    }
  }

  // ---------------- HELPERS ----------------

  private isExpired(expiresAt?: Date | null): boolean {
    if (!expiresAt) return false;
    return expiresAt.getTime() < Date.now();
  }

  private calculateTTL(expiresAt?: Date | null): number {
    const DEFAULT_TTL = 3600; // 1 hour

    if (!expiresAt) return DEFAULT_TTL;

    const remainingSeconds = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000
    );

    if (remainingSeconds <= 0) return 0;

    return Math.min(DEFAULT_TTL, remainingSeconds);
  }
}
