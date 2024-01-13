import express, { Request, Response } from 'express';
import { localDb } from '../db/local-db';
import { STATUS_HTTP } from '../shared/types';
import { blogsCollection, dataBase, postsCollection } from '../db/mongoDb';

export const testRouter = express.Router();

testRouter.delete('/all-data', async (req: Request, res: Response) => {
  const isDeleted = await dataBase.dropDatabase();

  if (isDeleted) {
    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  } else {
    res.sendStatus(STATUS_HTTP.INTERNAL_ERROR_500);
  }
});

testRouter.post('/all-data', async (req: Request, res: Response) => {
  const createdBlogs = await blogsCollection.insertMany(JSON.parse(JSON.stringify(localDb.blogs)));
  const createdPosts = await postsCollection.insertMany(JSON.parse(JSON.stringify(localDb.posts)));

  const isCreatedSuccessfully = [createdBlogs, createdPosts].every((response) => {
    return response.insertedCount > 0;
  });

  if (isCreatedSuccessfully) {
    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  } else {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
  }
});
