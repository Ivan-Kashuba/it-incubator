import { MongoClient } from 'mongodb';
import { Video } from '../features/videos/types/model/Video';
import { DB_NAME, MONGO_URI } from '../shared/env-constants';

const client = new MongoClient(MONGO_URI);

export const videosCollection = client.db(DB_NAME).collection<Video>('videos');
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
