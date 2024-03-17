import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
  STATUS_HTTP,
} from '../shared/types/index';
import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { PostInputModel, PostViewModel } from '../domain/posts/types/model/PostModels';
import { Response } from 'express';
import { validatePayloadPagination } from '../shared/helpers/pagination';
import { PostsService } from '../domain/posts/services/posts-service';
import { PostsRepository } from '../repositories/posts-repository';
import { CommentInputModel, CommentViewModel } from '../domain/comments/types/model/CommentsModels';
import { CommentsQueryRepository } from '../repositories/comments-query-repository';
import { CommentService } from '../domain/comments/services/comment-service';
import { injectable } from 'inversify';
import { LikeInputModel } from '../domain/likes/types/model/LikesModels';
import { ResultService } from '../shared/helpers/resultObject';
import { PostsQueryRepository } from '../repositories/posts-query-repository';

@injectable()
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentService: CommentService
  ) {}
  async getPosts(
    req: RequestWithQuery<{ title?: string } & Partial<PaginationPayload<PostViewModel>>>,
    res: Response<WithPagination<PostViewModel>>
  ) {
    const pagination: PaginationPayload<PostViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const titleToFind = req?.query?.title || null;

    const foundedPost = await this.postsService.findPosts(titleToFind, pagination);

    res.status(STATUS_HTTP.OK_200).send(foundedPost);
  }

  async createPost(req: RequestWithBody<PostInputModel>, res: Response<PostViewModel>) {
    const createdPostId = await this.postsService.createPost(req.body);

    if (createdPostId) {
      const createdPost = await this.postsQueryRepository.findPostById(createdPostId);
      res.status(STATUS_HTTP.CREATED_201).send(createdPost);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async getPost(req: RequestWithParams<{ postId: string }>, res: Response<PostViewModel>) {
    const postId = req.params.postId;

    const foundedPost = await this.postsService.findPostById(postId);

    if (!foundedPost) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
    } else {
      res.status(STATUS_HTTP.OK_200).send(foundedPost);
    }
  }

  async deletePost(req: RequestWithParams<{ postId: string }>, res: Response<void>) {
    const postId = req.params.postId;

    const isVideoDeleted = await this.postsService.deletePost(postId);

    if (!isVideoDeleted) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    } else {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    }
  }

  async updatePost(req: RequestWithParamsAndBody<{ postId: string }, PostInputModel>, res: Response<PostViewModel>) {
    const postId = req.params.postId;

    const updatedPost = await this.postsService.updatePost(postId, req.body);

    if (!updatedPost) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }

  async getPostComments(
    req: RequestWithParamsAndQuery<{ postId: string }, Partial<PaginationPayload<CommentViewModel>>>,
    res: Response<WithPagination<CommentViewModel>>
  ) {
    const postId = req.params.postId;
    const userId = req?.user?.userId;

    const pagination: PaginationPayload<CommentViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    const comments = await this.commentsQueryRepository.findCommentsByPostId(postId, pagination, userId);

    res.status(STATUS_HTTP.OK_200).send(comments);
  }

  async createPostComment(
    req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>,
    res: Response<CommentViewModel>
  ) {
    const postId = req.params.postId;
    const content = req.body.content;

    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    const createdCommentId = await this.commentService.createCommentForPost(postId, content, req.user);

    if (createdCommentId) {
      const commentViewModel = await this.commentsQueryRepository.findCommentById(createdCommentId);

      if (commentViewModel) {
        res.status(STATUS_HTTP.CREATED_201).send(commentViewModel!);
        return;
      }
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async updatePostLikeStatus(
    req: RequestWithParamsAndBody<{ postId: string }, LikeInputModel>,
    res: Response<CommentViewModel>
  ) {
    const postId = req.params.postId;
    const userId = req?.user?.userId;
    const { likeStatus } = req.body;

    const serviceResult = await this.postsService.likePost(postId, likeStatus, userId);

    const result = ResultService.mapResultToHttpResponse(serviceResult);

    res.status(result.statusCode).send(result.body);
  }
}
