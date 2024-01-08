import express, { Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  STATUS_HTTP,
} from '../shared/types';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { authCheckMiddleware } from '../middlewares/authCheckMiddleware';
import { blogsLocalRepository } from '../features/blogs/repositories/blogs-local-repository';
import { BlogInputModel, BlogViewModel } from '../features/blogs/types/model/BlogModels';
import { blogInputModelValidation } from '../features/blogs/validation/blogInputModelValidation';

export const blogRouter = express.Router();

blogRouter.get('/', async (req: RequestWithQuery<{ title?: string }>, res: Response<BlogViewModel[]>) => {
  const titleToFind = req?.query?.title;

  const foundedBlogs = await blogsLocalRepository.findBlogs(titleToFind);

  res.status(STATUS_HTTP.OK_200).send(foundedBlogs);
});
blogRouter.post(
  '/',
  authCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel>) => {
    const createdBlog = await blogsLocalRepository.createBlog(req.body);

    res.status(STATUS_HTTP.CREATED_201).send(createdBlog);
  }
);
blogRouter.get('/:blogId', async (req: RequestWithParams<{ blogId: string }>, res: Response<BlogViewModel>) => {
  const blogId = req.params.blogId;

  const foundedBlog = await blogsLocalRepository.findBlogById(blogId);

  if (!foundedBlog) {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
    return;
  }

  res.status(STATUS_HTTP.OK_200).send(foundedBlog);
});
blogRouter.delete(
  '/:blogId',
  authCheckMiddleware,
  async (req: RequestWithParams<{ blogId: string }>, res: Response<void>) => {
    const blogId = req.params.blogId;

    const isVideoDeleted = await blogsLocalRepository.deleteBlog(blogId);

    if (!isVideoDeleted) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    } else {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    }
  }
);
blogRouter.put(
  '/:blogId',
  authCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithParamsAndBody<{ blogId: string }, BlogInputModel>, res: Response<BlogViewModel>) => {
    const blogId = req.params.blogId;

    const updatedBlog = await blogsLocalRepository.updateBlog(blogId, req.body);

    if (!updatedBlog) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }
);
