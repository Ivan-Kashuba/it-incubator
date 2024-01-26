import { BlogViewModel } from '../domain/blogs/types/model/BlogModels';
import { blogsCollection, postsCollection } from '../db/mongoDb';
import { getInsensitiveCaseSearchRegexString } from '../shared/helpers/getInsensitiveCaseSearchRegexString';
import { PostDbModel, PostViewModel } from '../domain/posts/types/model/PostModels';
import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { createPaginationResponse, getSkip, getSortValue } from '../shared/helpers/pagination';

export const blogsRepository = {
  async findBlogs(
    blogName: string | null,
    pagination: PaginationPayload<BlogViewModel>
  ): Promise<WithPagination<BlogViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;
    let filters = {};

    if (blogName) {
      filters = { name: getInsensitiveCaseSearchRegexString(blogName) };
    }

    const totalCount = await blogsCollection.countDocuments(filters);

    const foundedBlogs = await blogsCollection
      .find(filters, { projection: { _id: 0 } })
      .sort({ [sortBy]: getSortValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize)
      .toArray();

    return createPaginationResponse<BlogViewModel>(pagination, foundedBlogs, totalCount);
  },

  async findBlogById(blogId: string) {
    return blogsCollection.findOne({ id: blogId }, { projection: { _id: 0 } });
  },

  async createBlog(blogToCreate: BlogViewModel) {
    const createdBlogResult = await blogsCollection.insertOne(blogToCreate);

    return !!createdBlogResult.insertedId;
  },

  async updateBlog(blogId: string, updateInfo: Omit<BlogViewModel, 'isMembership' | 'createdAt'>) {
    const updatedBlogResponse = await blogsCollection.findOneAndUpdate(
      { id: blogId },
      { $set: updateInfo },
      { returnDocument: 'after' }
    );

    return updatedBlogResponse;
  },

  async deleteBlog(blogId: string) {
    const deleteResult = await blogsCollection.deleteMany({ id: blogId });
    return deleteResult.deletedCount === 1;
  },

  async createPostForBlog(post: PostDbModel) {
    const creatingResponse = await postsCollection.insertOne(post);

    return !!creatingResponse.insertedId;
  },

  async getPostsByBlogId(blog: BlogViewModel, pagination: PaginationPayload<PostViewModel>) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const filter = { blogId: blog.id };

    const totalCount = await postsCollection.countDocuments(filter);

    const postsFromBd = await postsCollection
      .find(filter)
      .sort({ [sortBy]: getSortValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray();

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
  },
};
