import { MongoClient } from 'mongodb';

import { envConfig } from '../shared/helpers/env-config';
import { BlogViewModel } from '../domain/blogs/types/model/BlogModels';
import { PostDbModel } from '../domain/posts/types/model/PostModels';
import { UserDbModel } from '../domain/users/types/model/UsersModels';
import { CommentDbModel } from '../domain/comments/types/model/CommentsModels';

const client = new MongoClient(envConfig.MONGO_URI);
export const dataBase = client.db(envConfig.DB_NAME);

export const blogsCollection = dataBase.collection<BlogViewModel>('blogs');
export const postsCollection = dataBase.collection<PostDbModel>('posts');
export const usersCollection = dataBase.collection<UserDbModel>('users');
export const commentsCollection = dataBase.collection<CommentDbModel>('comments');

export const JWT_BLACK_LIST: string[] = [];

export async function runMongoDb() {
  try {
    await client.connect();

    await client.db(envConfig.DB_NAME).command({ ping: 1 });
    console.log('Connected to server');
  } catch {
    console.log('Can not connect to server');
    await client.close();
  }
}
