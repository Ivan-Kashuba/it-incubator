import express from 'express';
import { testRouter } from './routes/tests.router';
import { authRouter } from './routes/auth.router';
import { blogRouter } from './routes/blog.router';
import { postRouter } from './routes/posts.router';

export const app = express();
const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

app.get('/', (req, res) => {
  res.send('Hello Samurai!');
});

app.use('/blogs', blogRouter);
app.use('/posts', postRouter);
app.use('/auth', authRouter);
app.use('/testing', testRouter);
