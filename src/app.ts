import express from 'express';
import { testRouter } from './routes/tests.router';
import { authRouter } from './routes/auth.router';
import { blogRouter } from './routes/blog.router';
import { postsRouter } from './routes/posts.router';
import { usersRouter } from './routes/users.router';
import { commentsRouter } from './routes/comments.router';
import cookieParser from 'cookie-parser';

export const app = express();
const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello Samurai!');
});

app.use('/blogs', blogRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);
app.use('/auth', authRouter);
app.use('/testing', testRouter);
