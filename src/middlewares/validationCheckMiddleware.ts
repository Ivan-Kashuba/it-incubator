import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { STATUS_HTTP } from '../shared/types';
import { Error, ErrorResponse } from '../shared/types/Error';

export const validationCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
    .formatWith((error) => {
      if (error.type === 'field') {
        return { message: error.msg, field: error.path };
      }
      return error;
    })
    .array({ onlyFirstError: true });

  if (errors.length) {
    const errorResponse: ErrorResponse = {
      errorsMessages: errors as Error[],
    };

    res.status(STATUS_HTTP.BAD_REQUEST_400).json(errorResponse);
    return;
  }

  next();
};
