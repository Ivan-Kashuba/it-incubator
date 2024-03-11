import { PostDbModel, PostInputModel, PostViewModel } from '../types/model/PostModels';
import { PaginationPayload, WithPagination } from '../../../shared/types/Pagination';
import { PostsRepository } from '../../../repositories/posts-repository';
import { injectable } from 'inversify';
@injectable()
export class PostsService {
  constructor(protected postsRepository: PostsRepository) {}

  async findPosts(
    title: string | null,
    pagination: PaginationPayload<PostViewModel>
  ): Promise<WithPagination<PostViewModel>> {
    return await this.postsRepository.findPosts(title, pagination);
  }

  async findPostById(postId: string) {
    return await this.postsRepository.findPostById(postId);
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
    };

    const isPostCreated = await this.postsRepository.createPost(newPost);

    return isPostCreated ? newPost?.id : undefined;
  }

  async updatePost(postId: string, postInfo: PostInputModel) {
    const { content, shortDescription, title, blogId } = postInfo;

    const updateInfo: Omit<PostDbModel, 'id' | 'createdAt'> = {
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
}
