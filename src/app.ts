import express from 'express';
import { videoRouter } from './routes/video.router';
import { testRouter } from './routes/tests.router';

export const app = express();
const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

app.use('/videos', videoRouter);
app.use('/testing', testRouter);
