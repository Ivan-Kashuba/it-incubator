import { BlogInputModel, BlogPostInputModel, BlogViewModel } from '../types/model/BlogModels';
import { PostDbModel, PostViewModel } from '../../posts/types/model/PostModels';
import { PaginationPayload, WithPagination } from '../../../shared/types/Pagination';
import { BlogsRepository } from '../../../repositories/blogs-repository';
import { injectable } from 'inversify';
@injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}

  async findBlogs(
    blogName: string | null,
    pagination: PaginationPayload<BlogViewModel>
  ): Promise<WithPagination<BlogViewModel>> {
    return await this.blogsRepository.findBlogs(blogName, pagination);
  }

  async findBlogById(blogId: string) {
    return await this.blogsRepository.findBlogById(blogId);
  }

  async createBlog(blog: BlogInputModel) {
    const { name, description, websiteUrl } = blog;

    const newBlog: BlogViewModel = {
      id: new Date().toISOString(),
      name,
      websiteUrl,
      description,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    await this.blogsRepository.createBlog(newBlog);

    return newBlog.id;
  }

  async updateBlog(blogId: string, blogInfo: BlogInputModel) {
    const { websiteUrl, description, name } = blogInfo;

    const updateInfo: Omit<BlogViewModel, 'isMembership' | 'createdAt'> = {
      id: blogId,
      description,
      name,
      websiteUrl,
    };

    const updatedBlog = await this.blogsRepository.updateBlog(blogId, updateInfo);

    return !!updatedBlog;
  }

  async deleteBlog(blogId: string) {
    return await this.blogsRepository.deleteBlog(blogId);
  }

  async createPostForBlog(blogId: string, postContent: BlogPostInputModel) {
    const { title, shortDescription, content } = postContent;

    const postBlog = await this.findBlogById(blogId);

    if (!postBlog) {
      return undefined;
    }

    const generatedId = Math.floor(Math.random() * 10000000).toString();

    const postToCreate: PostDbModel = {
      id: generatedId,
      blogId,
      title,
      createdAt: new Date().toISOString(),
      content,
      shortDescription,
      extendedLikesInfo: { extendedLikes: [], likesCount: 0, dislikesCount: 0 },
    };

    const isCreated = await this.blogsRepository.createPostForBlog(postToCreate);

    return isCreated ? postToCreate.id : null;
  }
}
