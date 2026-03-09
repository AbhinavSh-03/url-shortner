import { Router } from 'express';
import { UrlController } from './url.controller';
import { validate } from '../../shared/validation/validate.middleware';
import { createUrlSchema } from './url.schema';
import { rateLimit } from '../../shared/middleware/rateLimit.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new UrlController();


//  Auth → RateLimit → Validate → Controller
router.post(
  '/shorten',
  authenticate,
  rateLimit({
    windowInSeconds: 60,
    maxRequests: 30,
    keyPrefix: 'rl:create',
  }),
  validate(createUrlSchema),
  controller.createShortUrl.bind(controller)
);

//IDOR safe urls access
router.get(
  '/urls',
  authenticate,
  rateLimit({
    windowInSeconds: 60,
    maxRequests: 60,
    keyPrefix: 'rl:list',
  }),
  controller.getUserUrls.bind(controller)
);

// Deleting URLs IDOR safe

router.delete(
  '/urls/:id',
  authenticate,
  rateLimit({
    windowInSeconds: 60,
    maxRequests: 30,
    keyPrefix: 'rl:delete',
  }),
  controller.deleteUrl.bind(controller)
);

// redirect -> No authentication required

router.get(
  '/:shortCode',
  rateLimit({
    windowInSeconds: 60,
    maxRequests: 300,
    keyPrefix: 'rl:redirect',
  }),
  controller.redirect.bind(controller)
);

export default router;