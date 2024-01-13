import dotenv from 'dotenv';
dotenv.config();
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
export const PORT = process.env.PORT || 8080;
export const DB_NAME = process.env.DB_NAME || '';
