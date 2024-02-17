import { Options, rateLimit } from 'express-rate-limit';

export const setRateLimit = (options?: Partial<Options>) =>
  rateLimit({
    windowMs: 10 * 1000, // 10 sec
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    ...options,
  });
