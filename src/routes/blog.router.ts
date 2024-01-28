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
import { adminAuthCheckMiddleware } from '../middlewares/adminAuthCheckMiddleware';
import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { validatePayloadPagination } from '../shared/helpers/pagination';
import { BlogInputModel, BlogPostInputModel, BlogViewModel } from '../domain/blogs/types/model/BlogModels';
import { blogsService } from '../domain/blogs/services/blogs-service';
import { blogInputModelValidation } from '../domain/blogs/validation/blogInputModelValidation';
import { blogsRepository } from '../repositories/blogs-repository';
import { blogPostInputModelValidation } from '../domain/blogs/validation/blogPostInputModelValidation';
import { PostViewModel } from '../domain/posts/types/model/PostModels';
import { postsRepository } from '../repositories/posts-repository';

export const blogRouter = express.Router();

blogRouter.get(
  '/',
  async (
    req: RequestWithQuery<{ searchNameTerm?: string | null } & Partial<PaginationPayload<BlogViewModel>>>,
    res: Response<WithPagination<BlogViewModel>>
  ) => {
    const nameToFind = req?.query?.searchNameTerm || null;
    const pagination: PaginationPayload<BlogViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const foundedBlogs = await blogsService.findBlogs(nameToFind, pagination);

    res.status(STATUS_HTTP.OK_200).send(foundedBlogs);
  }
);
blogRouter.post(
  '/',
  adminAuthCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel>) => {
    const createdBlogId = await blogsService.createBlog(req.body);

    const createdBlog = await blogsRepository.findBlogById(createdBlogId);

    if (createdBlog) {
      res.status(STATUS_HTTP.CREATED_201).send(createdBlog);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }
);
blogRouter.get('/:blogId', async (req: RequestWithParams<{ blogId: string }>, res: Response<BlogViewModel>) => {
  const blogId = req.params.blogId;

  const foundedBlog = await blogsService.findBlogById(blogId);

  if (!foundedBlog) {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
    return;
  }

  res.status(STATUS_HTTP.OK_200).send(foundedBlog);
});
blogRouter.delete(
  '/:blogId',
  adminAuthCheckMiddleware,
  async (req: RequestWithParams<{ blogId: string }>, res: Response<void>) => {
    const blogId = req.params.blogId;

    const isVideoDeleted = await blogsService.deleteBlog(blogId);

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
  adminAuthCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithParamsAndBody<{ blogId: string }, BlogInputModel>, res: Response<BlogViewModel>) => {
    const blogId = req.params.blogId;

    const isBlogUpdated = await blogsService.updateBlog(blogId, req.body);

    if (!isBlogUpdated) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }
);

blogRouter.post(
  '/:blogId/posts',
  adminAuthCheckMiddleware,
  blogPostInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithParamsAndBody<{ blogId: string }, BlogPostInputModel>, res: Response<PostViewModel>) => {
    const blogId = req.params.blogId;

    const createdPostId = await blogsService.createPostForBlog(blogId, req.body);

    if (createdPostId) {
      const createdPost = await postsRepository.findPostById(createdPostId);
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

    const posts = await blogsService.getPostsByBlogId(blogId, pagination);

    if (posts) {
      res.status(200).send(posts);
    } else {
      res.sendStatus(404);
    }
  }
);
