import { MongoClient } from 'mongodb';

import { envConfig } from '../shared/helpers/env-config';
import mongoose from 'mongoose';

const client = new MongoClient(envConfig.MONGO_URI);
export const dataBase = client.db(envConfig.DB_NAME);

export async function runMongoDb() {
  try {
    await client.connect();
    await mongoose.connect(envConfig.MONGO_URI, { dbName: envConfig.DB_NAME });
    await client.db(envConfig.DB_NAME).command({ ping: 1 });
    console.log('Connected to server');
  } catch {
    console.log('Can not connect to server');
    await client.close();
    await mongoose.disconnect();
  }
}
