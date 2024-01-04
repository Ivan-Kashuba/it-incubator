import express, { Request, Response } from 'express';
import { db } from '../db/db';

export const testRouter = express.Router();

testRouter.delete('/all-data', (req: Request, res: Response) => {
  db.videos = [];

  res.sendStatus(204);
});
