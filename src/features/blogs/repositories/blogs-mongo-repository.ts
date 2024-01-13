import { BlogInputModel, BlogViewModel } from '../types/model/BlogModels';
import { blogsCollection } from '../../../db/mongoDb';
import { getInsensitiveCaseSearchRegexString } from '../../../shared/helpers/getInsensitiveCaseSearchRegexString';

export const blogsMongoRepository = {
  async findBlogs(blogName?: string) {
    let filters = {};

    if (blogName) {
      filters = { name: getInsensitiveCaseSearchRegexString(blogName) };
    }

    return blogsCollection.find(filters, { projection: { _id: 0 } }).toArray();
  },

  async findBlogById(blogId: string) {
    return blogsCollection.findOne({ id: blogId });
  },

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

    await blogsCollection.insertOne(newBlog);

    return newBlog;
  },

  async updateBlog(blogId: string, blogInfo: BlogInputModel) {
    const { websiteUrl, description, name } = blogInfo;

    const updateInfo: Omit<BlogViewModel, 'isMembership' | 'createdAt'> = {
      id: blogId,
      description,
      name,
      websiteUrl,
    };

    const updatedBlog = await blogsCollection.findOneAndUpdate(
      { id: blogId },
      { $set: updateInfo },
      { returnDocument: 'after' }
    );

    return updatedBlog;
  },

  async deleteBlog(blogId: string) {
    const deleteResult = await blogsCollection.deleteMany({ id: blogId });
    return deleteResult.deletedCount === 1;
  },
};
