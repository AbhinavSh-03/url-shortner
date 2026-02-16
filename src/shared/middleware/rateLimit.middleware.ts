import { Request, Response, NextFunction } from 'express';
import { redis } from '../../config/redis';
import { logger } from '../logger';

interface RateLimitOptions {
  windowInSeconds: number;
  maxRequests: number;
  keyPrefix: string;
}

export const rateLimit =
  ({ windowInSeconds, maxRequests, keyPrefix }: RateLimitOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip;
    const key = `${keyPrefix}:${identifier}`;

    try {
      // Timeout-protected Redis increment
      const current = await Promise.race<number>([
        redis.incr(key),
        new Promise<number>((_, reject) =>
          setTimeout(() => reject(new Error('Redis timeout')), 100)
        ),
      ]);

      // Set expiration safely on first hit
      if (current === 1) {
        redis.expire(key, windowInSeconds).catch(() => {});
      }

      // Too many requests
      if (current > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
        });
      }

      // Rate limit headers (industry-style)
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, maxRequests - current)
      );
      res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(Date.now() / 1000) + windowInSeconds
      );

      next();
    } catch (err) {
      // 🛡 Fail open — never block users if Redis fails
      logger.warn({ err }, 'Rate limit error');
      next();
    }
  };
