import express, { Request, Response } from 'express';
import { localDb } from '../db/local-db';
import { STATUS_HTTP } from '../shared/types';
import { dataBase } from '../db/mongoDb';
import { BlogModel } from '../db/schemes/blogs';
import { PostModel } from '../db/schemes/posts';
import { UserModel } from '../db/schemes/users';
import { CommentModel } from '../db/schemes/comments';
import { SessionModel } from '../db/schemes/sessions';

export const testRouter = express.Router();

testRouter.delete('/all-data', async (req: Request, res: Response) => {
  const isDeleted = await dataBase.dropDatabase();
  await BlogModel.deleteMany();
  await PostModel.deleteMany();
  await UserModel.deleteMany();
  await CommentModel.deleteMany();
  await SessionModel.deleteMany();

  if (isDeleted) {
    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  } else {
    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }
});

testRouter.post('/all-data', async (req: Request, res: Response) => {
  await BlogModel.insertMany(JSON.parse(JSON.stringify(localDb.blogs)));
  await PostModel.insertMany(JSON.parse(JSON.stringify(localDb.posts)));

  res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
});
