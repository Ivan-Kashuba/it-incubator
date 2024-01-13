import { MongoClient } from 'mongodb';
import { DB_NAME, MONGO_URI } from '../shared/helpers/env-constants';
import { BlogViewModel } from '../features/blogs/types/model/BlogModels';
import { PostDbModel } from '../features/posts/types/model/PostModels';

const client = new MongoClient(MONGO_URI);
export const dataBase = client.db(DB_NAME);

export const blogsCollection = dataBase.collection<BlogViewModel>('blogs');
export const postsCollection = dataBase.collection<PostDbModel>('posts');

export async function runMongoDb() {
  try {
    await client.connect();

    await client.db(DB_NAME).command({ ping: 1 });
    console.log('Connected to server');
  } catch {
    console.log('Can not connect to server');
    await client.close();
  }
}
