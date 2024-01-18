import express, { Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
  STATUS_HTTP,
} from '../shared/types';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { authCheckMiddleware } from '../middlewares/authCheckMiddleware';
import {
  blogsMongoRepository,
  blogsMongoRepository as blogsRepository,
} from '../features/blogs/repositories/blogs-mongo-repository';
import { BlogInputModel, BlogPostInputModel, BlogViewModel } from '../features/blogs/types/model/BlogModels';
import { blogInputModelValidation } from '../features/blogs/validation/blogInputModelValidation';
import { PostViewModel } from '../features/posts/types/model/PostModels';
import { blogPostInputModelValidation } from '../features/blogs/validation/blogPostInputModelValidation';
import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { DEFAULT_PAGINATION_PAYLOAD } from '../shared/constants/pagination';
import { validatePayloadPagination } from '../shared/helpers/pagination';

export const blogRouter = express.Router();

blogRouter.get(
  '/',
  async (
    req: RequestWithQuery<{ searchNameTerm?: string | null } & Partial<PaginationPayload<BlogViewModel>>>,
    res: Response<WithPagination<BlogViewModel>>
  ) => {
    const nameToFind = req?.query?.searchNameTerm || null;

    const pagination: PaginationPayload<BlogViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const foundedBlogs = await blogsRepository.findBlogs(nameToFind, pagination);

    res.status(STATUS_HTTP.OK_200).send(foundedBlogs);
  }
);
blogRouter.post(
  '/',
  authCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel>) => {
    const createdBlog = await blogsRepository.createBlog(req.body);

    res.status(STATUS_HTTP.CREATED_201).send(createdBlog);
  }
);
blogRouter.get('/:blogId', async (req: RequestWithParams<{ blogId: string }>, res: Response<BlogViewModel>) => {
  const blogId = req.params.blogId;

  const foundedBlog = await blogsRepository.findBlogById(blogId);

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

    const isVideoDeleted = await blogsRepository.deleteBlog(blogId);

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

    const updatedBlog = await blogsRepository.updateBlog(blogId, req.body);

    if (!updatedBlog) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }
);

blogRouter.post(
  '/:blogId/posts',
  authCheckMiddleware,
  blogPostInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithParamsAndBody<{ blogId: string }, BlogPostInputModel>, res: Response<PostViewModel>) => {
    const blogId = req.params.blogId;

    if (!blogId) {
      res.sendStatus(404);
    }

    const blog = await blogsMongoRepository.findBlogById(blogId);
    if (!blog) {
      res.sendStatus(404);
    }

    const createdPost = await blogsRepository.createPostForBlog(blogId, req.body);

    if (createdPost) {
      res.status(201).send(createdPost);
    } else {
      res.sendStatus(404);
    }
  }
);

blogRouter.get(
  '/:blogId/posts',
  async (
    req: RequestWithParamsAndQuery<{ blogId: string }, Partial<PaginationPayload<PostViewModel>>>,
    res: Response<WithPagination<PostViewModel>>
  ) => {
    const blogId = req.params.blogId;

    const pagination: PaginationPayload<PostViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const posts = await blogsRepository.getPostsByBlogId(blogId, pagination);

    if (posts) {
      res.status(200).send(posts);
    } else {
      res.sendStatus(404);
    }
  }
);
