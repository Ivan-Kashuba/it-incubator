import { BlogViewModel } from '../domain/blogs/types/model/BlogModels';
import { getInsensitiveCaseSearchRegexString } from '../shared/helpers/getInsensitiveCaseSearchRegexString';
import { PostDbModel, PostViewModel } from '../domain/posts/types/model/PostModels';
import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { createPaginationResponse, getSkip, getSortDirectionMongoValue } from '../shared/helpers/pagination';
import { BlogModel } from '../domain/blogs/scheme/blogs';
import { PostModel } from '../domain/posts/scheme/posts';
import { injectable } from 'inversify';

@injectable()
export class BlogsRepository {
  async findBlogs(
    blogName: string | null,
    pagination: PaginationPayload<BlogViewModel>
  ): Promise<WithPagination<BlogViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;
    let filters = {};

    if (blogName) {
      filters = { name: getInsensitiveCaseSearchRegexString(blogName) };
    }

    const totalCount = await BlogModel.countDocuments(filters);

    const foundedBlogs = await BlogModel.find(filters)
      .select('-_id -__v')
      .sort({ [sortBy]: getSortDirectionMongoValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize);

    return createPaginationResponse<BlogViewModel>(pagination, foundedBlogs, totalCount);
  }

  async findBlogById(blogId: string) {
    return BlogModel.findOne({ id: blogId }).select('-_id -__v');
  }

  async createBlog(blogToCreate: BlogViewModel) {
    const createdBlogResult = await BlogModel.create(blogToCreate);

    return !!createdBlogResult._id;
  }

  async updateBlog(blogId: string, updateInfo: Omit<BlogViewModel, 'isMembership' | 'createdAt'>) {
    const updatedBlogResponse = await BlogModel.findOneAndUpdate(
      { id: blogId },
      { $set: updateInfo },
      { returnDocument: 'after' }
    );

    return updatedBlogResponse;
  }

  async deleteBlog(blogId: string) {
    const deleteResult = await BlogModel.deleteMany({ id: blogId });
    return deleteResult.deletedCount === 1;
  }

  async createPostForBlog(post: PostDbModel) {
    const creatingResponse = await PostModel.create(post);

    return !!creatingResponse._id;
  }

  async getPostsByBlogId(blog: BlogViewModel, pagination: PaginationPayload<PostViewModel>) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const filter = { blogId: blog.id };

    const totalCount = await PostModel.countDocuments(filter);

    const postsFromBd = await PostModel.find(filter)
      .sort({ [sortBy]: getSortDirectionMongoValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pageSize);

    const viewPosts: PostViewModel[] = postsFromBd.map((post) => {
      return {
        blogId: blog.id,
        blogName: blog.name,
        content: post.content,
        shortDescription: post.shortDescription,
        title: post.title,
        createdAt: post.createdAt,
        id: post.id,
      };
    });

    return createPaginationResponse<PostViewModel>(pagination, viewPosts, totalCount);
  }
}
