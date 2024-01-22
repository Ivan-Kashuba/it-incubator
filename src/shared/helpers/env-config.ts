import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  PORT: process.env.PORT || 8080,
  DB_NAME: process.env.DB_NAME || '',
  JWT_SECRET_KEY: process.env.DB_NAME || '123456789',
};
