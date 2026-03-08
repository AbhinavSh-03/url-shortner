import { Request, Response } from 'express';
import { UrlService } from './url.service';
import { CreateUrlRequest } from './url.schema';

export class UrlController {
  constructor(private readonly service = new UrlService()) { }

  // POST /api/shorten
  createShortUrl = async (
    req: Request<{}, {}, CreateUrlRequest>,
    res: Response
  ) => {
    try {
      const { longUrl, expiresAt } = req.body;

      const userId = req.user!.userId;

      const result = await this.service.createShortUrl({
        userId,
        longUrl,
        expiresAt: expiresAt ?? null,
      });

      return res.status(201).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Unknown error occurred' });
    }
  };

  // GET /:shortCode
  redirect = async (
    req: Request<{ shortCode: string }>,
    res: Response
  ) => {
    try {
      const { shortCode } = req.params;

      const result = await this.service.resolveShortCode(shortCode);

      switch (result.status) {
        case 'success':
          return res.redirect(302, result.longUrl);

        case 'expired':
          return res.status(410).json({ error: 'Link expired' });

        case 'inactive':
          return res.status(403).json({ error: 'Link inactive' });

        default:
          return res.status(404).json({ error: 'Not found' });
      }
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  // GET /api/urls
  getUserUrls = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;

      const urls = await this.service.getUserUrls(userId);

      return res.status(200).json(urls);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }
  };

}