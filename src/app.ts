import express from 'express';
import { testRouter } from './routes/tests.router';
import { authRouter } from './routes/auth.router';
import { blogRouter } from './routes/blog.router';
import { postsRouter } from './routes/posts.router';
import { usersRouter } from './routes/users.router';
import { commentsRouter } from './routes/comments.router';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import useragent from 'express-useragent';
import { securityRouter } from './routes/security.router';

export const app = express();
const jsonBodyMiddleware = express.json();
app.use(cors());
app.use(jsonBodyMiddleware);
app.use(cookieParser());
app.use(useragent.express());

app.get('/', (req, res) => {
  res.send('Hello Samurai!');
});

app.use('/blogs', blogRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);
app.use('/auth', authRouter);
app.use('/security', securityRouter);
app.use('/testing', testRouter);
