import express from 'express';
import { videoRouter } from './routes/video.router';
import { testRouter } from './routes/tests.router';
import { authRouter } from './routes/auth.router';
import { authCheckMiddleware } from './middlewares/authCheckMiddleware';
import { blogRouter } from './routes/blog.router';
import { postRouter } from './routes/posts.router';

export const app = express();
const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

app.get('/', (req, res) => {
  res.send('Hello Samurai!');
});
app.use('/videos', videoRouter);
app.use('/blogs', blogRouter);
app.use('/posts', postRouter);
app.use('/auth', authRouter);
app.use('/testing', testRouter);
