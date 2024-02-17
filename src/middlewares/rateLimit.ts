import { rateLimit } from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 sec
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
