import express, { Request, Response } from 'express';
import { localDb } from '../db/local-db';
import { STATUS_HTTP } from '../shared/types';
import { dataBase } from '../db/mongoDb';
import { BlogModel } from '../domain/blogs/scheme/blogs';
import { PostModel } from '../domain/posts/scheme/posts';
import { UserModel } from '../domain/users/scheme/users';
import { CommentModel } from '../domain/comments/scheme/comments';
import { SessionModel } from '../domain/auth/scheme/sessions';

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
