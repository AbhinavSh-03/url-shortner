import { Router } from 'express';
import { UrlController } from './url.controller';
import { validate } from '../../shared/validation/validate.middleware';
import { createUrlSchema } from './url.schema';
import { rateLimit } from '../../shared/middleware/rateLimit.middleware';

const router = Router();
const controller = new UrlController();

// Rate limit → Validate → Controller
router.post(
  '/shorten',
  rateLimit({
    windowInSeconds: 60,
    maxRequests: 30,
    keyPrefix: 'rl:create',
  }),
  validate(createUrlSchema),
  controller.createShortUrl
);

// Redirect rate limit only
router.get(
  '/:shortCode',
  rateLimit({
    windowInSeconds: 60,
    maxRequests: 300,
    keyPrefix: 'rl:redirect',
  }),
  controller.redirect
);

export default router;
