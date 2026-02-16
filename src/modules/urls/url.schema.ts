import { z } from 'zod';

export const createUrlSchema = z.object({
  longUrl: z.string().url('Invalid URL format'),

  expiresAt: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export type CreateUrlRequest = z.infer<typeof createUrlSchema>;
