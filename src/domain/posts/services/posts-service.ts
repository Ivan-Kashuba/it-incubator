import { PostDbModel, PostInputModel, PostViewModel } from '../types/model/PostModels';
import { PaginationPayload, WithPagination } from '../../../shared/types/Pagination';
import { PostsRepository } from '../../../repositories/posts-repository';
import { injectable } from 'inversify';
import { LIKE_STATUS } from '../../likes/types/model/LikesModels';
import { PostsQueryRepository } from '../../../repositories/posts-query-repository';
import { RESULT_CODES, ResultService } from '../../../shared/helpers/resultObject';
import { UsersRepository } from '../../../repositories/users-repository';

@injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected usersRepository: UsersRepository
  ) {}

  async findPosts(
    title: string | null,
    pagination: PaginationPayload<PostViewModel>
  ): Promise<WithPagination<PostViewModel>> {
    return await this.postsQueryRepository.findPosts(title, pagination);
  }

  async findPostById(postId: string) {
    return await this.postsQueryRepository.findPostById(postId);
  }

  async createPost(postInfo: PostInputModel) {
    const { content, shortDescription, title, blogId } = postInfo;

    const generatedId = Math.floor(Math.random() * 10000000).toString();

    const newPost: PostDbModel = {
      id: generatedId,
      content,
      shortDescription,
      title,
      blogId,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: { extendedLikes: [], likesCount: 0, dislikesCount: 0 },
    };

    const isPostCreated = await this.postsRepository.createPost(newPost);

    return isPostCreated ? newPost?.id : undefined;
  }

  async updatePost(postId: string, postInfo: PostInputModel) {
    const { content, shortDescription, title, blogId } = postInfo;

    const updateInfo: Omit<PostDbModel, 'id' | 'createdAt' | 'extendedLikesInfo'> = {
      content,
      shortDescription,
      title,
      blogId,
    };

    const isUpdated = await this.postsRepository.updatePost(postId, updateInfo);

    return isUpdated;
  }

  async deletePost(postId: string) {
    return await this.postsRepository.deletePost(postId);
  }

  async likePost(postId: string, likeStatus: LIKE_STATUS, userId: string) {
    const post = await this.postsRepository.findPostById(postId);
    const user = await this.usersRepository.findUserById(userId);

    if (!user) throw new Error('No user exists');

    if (!post) {
      return ResultService.createResult(
        RESULT_CODES.Not_found,
        ResultService.createError('postId', 'PostId is not exist')
      );
    }

    await post.like(likeStatus, userId, user?.accountData.login);

    const isSaved = await this.postsRepository.save(post);

    if (isSaved) {
      return ResultService.createResult(RESULT_CODES.Success_no_content);
    } else {
      return ResultService.createResult(RESULT_CODES.Db_problem);
    }
  }
}
