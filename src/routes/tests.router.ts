import express, { Request, Response } from 'express';
import { localDb } from '../db/local-db';
import { STATUS_HTTP } from '../shared/types';

export const testRouter = express.Router();

testRouter.delete('/all-data', (req: Request, res: Response) => {
  localDb.videos = [];
  localDb.blogs = [];
  localDb.posts = [];

  res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
});
