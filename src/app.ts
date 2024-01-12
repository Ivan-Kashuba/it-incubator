import express from 'express';
import { videoRouter } from './routes/video.router';
import { testRouter } from './routes/tests.router';
import { authRouter } from './routes/auth.router';

export const app = express();
const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

app.get('/', (req, res) => {
  res.send('Hello Samurai!');
});
app.use('/videos', videoRouter);
app.use('/auth', authRouter);
app.use('/testing', testRouter);
