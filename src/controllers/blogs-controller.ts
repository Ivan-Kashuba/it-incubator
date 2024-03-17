import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
  STATUS_HTTP,
} from '../shared/types/index';
import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { BlogInputModel, BlogPostInputModel, BlogViewModel } from '../domain/blogs/types/model/BlogModels';
import { Response } from 'express';
import { validatePayloadPagination } from '../shared/helpers/pagination';
import { BlogsService } from '../domain/blogs/services/blogs-service';
import { PostViewModel } from '../domain/posts/types/model/PostModels';
import { injectable } from 'inversify';
import { BlogsRepository } from '../repositories/blogs-repository';
import { PostsRepository } from '../repositories/posts-repository';
import { PostsQueryRepository } from '../repositories/posts-query-repository';

@injectable()
export class BlogsController {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsService: BlogsService,
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository
  ) {}
  async getBlogs(
    req: RequestWithQuery<{ searchNameTerm?: string | null } & Partial<PaginationPayload<BlogViewModel>>>,
    res: Response<WithPagination<BlogViewModel>>
  ) {
    const nameToFind = req?.query?.searchNameTerm || null;
    const pagination: PaginationPayload<BlogViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const foundedBlogs = await this.blogsService.findBlogs(nameToFind, pagination);

    res.status(STATUS_HTTP.OK_200).send(foundedBlogs);
  }

  async createBlog(req: RequestWithBody<BlogInputModel>, res: Response<BlogViewModel>) {
    const createdBlogId = await this.blogsService.createBlog(req.body);

    const createdBlog = await this.blogsRepository.findBlogById(createdBlogId);

    if (createdBlog) {
      res.status(STATUS_HTTP.CREATED_201).send(createdBlog);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async getBlog(req: RequestWithParams<{ blogId: string }>, res: Response<BlogViewModel>) {
    const blogId = req.params.blogId;

    const foundedBlog = await this.blogsService.findBlogById(blogId);

    if (!foundedBlog) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.status(STATUS_HTTP.OK_200).send(foundedBlog);
  }

  async deleteBlog(req: RequestWithParams<{ blogId: string }>, res: Response<void>) {
    const blogId = req.params.blogId;

    const isVideoDeleted = await this.blogsService.deleteBlog(blogId);

    if (!isVideoDeleted) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    } else {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    }
  }

  async updateBlog(req: RequestWithParamsAndBody<{ blogId: string }, BlogInputModel>, res: Response<BlogViewModel>) {
    const blogId = req.params.blogId;

    const isBlogUpdated = await this.blogsService.updateBlog(blogId, req.body);

    if (!isBlogUpdated) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }

  async createPostForBlog(
    req: RequestWithParamsAndBody<{ blogId: string }, BlogPostInputModel>,
    res: Response<PostViewModel>
  ) {
    const blogId = req.params.blogId;
    const userId = req?.user?.userId;

    const createdPostId = await this.blogsService.createPostForBlog(blogId, req.body);

    if (createdPostId) {
      const createdPost = await this.postsQueryRepository.findPostById(createdPostId, userId);
      res.status(201).send(createdPost);
    } else {
      res.sendStatus(404);
    }
  }

  async getBlogPosts(
    req: RequestWithParamsAndQuery<{ blogId: string }, Partial<PaginationPayload<PostViewModel>>>,
    res: Response<WithPagination<PostViewModel>>
  ) {
    const blogId = req.params.blogId;
    const userId = req?.user?.userId;

    const blog = (await this.blogsRepository.findBlogById(blogId)) as BlogViewModel;

    if (!blog) {
      res.sendStatus(404);
    }

    const pagination: PaginationPayload<PostViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const posts = await this.blogsRepository.getPostsByBlogId(blog, pagination, userId);

    if (posts) {
      res.status(200).send(posts);
    } else {
      res.sendStatus(404);
    }
  }
}
