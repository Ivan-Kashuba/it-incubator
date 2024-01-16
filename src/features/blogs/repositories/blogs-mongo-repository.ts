import { BlogInputModel, BlogPostInputModel, BlogViewModel } from '../types/model/BlogModels';
import { blogsCollection, postsCollection } from '../../../db/mongoDb';
import { getInsensitiveCaseSearchRegexString } from '../../../shared/helpers/getInsensitiveCaseSearchRegexString';
import { PostDbModel, PostViewModel } from '../../posts/types/model/PostModels';

export const blogsMongoRepository = {
  async findBlogs(blogName?: string) {
    let filters = {};

    if (blogName) {
      filters = { name: getInsensitiveCaseSearchRegexString(blogName) };
    }

    return blogsCollection.find(filters, { projection: { _id: 0 } }).toArray();
  },

  async findBlogById(blogId: string) {
    return blogsCollection.findOne({ id: blogId }, { projection: { _id: 0 } });
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

    // @ts-ignore
    newBlog._id = undefined;
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

  async createPostForBlog(blogId: string, postContent: BlogPostInputModel) {
    const { title, shortDescription, content } = postContent;

    const generatedId = Math.floor(Math.random() * 10000000).toString();

    const createdPostInDb: PostDbModel = {
      id: generatedId,
      blogId,
      title,
      createdAt: new Date().toISOString(),
      content,
      shortDescription,
    };

    const postBlog = await this.findBlogById(blogId);

    const viewPost: PostViewModel = {
      blogId: createdPostInDb.blogId,
      createdAt: createdPostInDb.createdAt,
      title: createdPostInDb.title,
      shortDescription: createdPostInDb.shortDescription,
      id: createdPostInDb.id,
      blogName: postBlog!.name,
      content: createdPostInDb.content,
    };

    await postsCollection.insertOne(createdPostInDb);

    return viewPost;
  },

  async getPostsByBlogId(blogId: string) {
    const blog = await this.findBlogById(blogId);

    if (!blog) {
      return null;
    }

    const postsFromBd = await postsCollection.find({ blogId: blog?.id }).toArray();

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

    return viewPosts;
  },
};
