import { localDb } from '../../../db/local-db';
import { BlogInputModel, BlogViewModel } from '../types/model/BlogModels';

export const blogsLocalRepository = {
  async findBlogs(title?: string) {
    if (!title) {
      return localDb.blogs;
    }

    return localDb.blogs.filter((blog) => {
      return blog.name.includes(title);
    });
  },

  async findBlogById(blogId: string) {
    return localDb.blogs.find((blog) => {
      return blog.id === blogId;
    });
  },

  async createBlog(blog: BlogInputModel) {
    const { name, description, websiteUrl } = blog;

    const newBlog: BlogViewModel = {
      id: new Date().toISOString(),
      name,
      websiteUrl,
      description,
      createdAt: new Date().toISOString(),
      isMembership: true,
    };

    localDb.blogs.push(newBlog);

    return newBlog;
  },

  async updateBlog(blogId: string, blogInfo: BlogInputModel) {
    const { websiteUrl, description, name } = blogInfo;
    const blogToUpdate = await this.findBlogById(blogId);

    if (blogToUpdate) {
      const updatedBlog: BlogViewModel = {
        id: blogToUpdate.id,
        description,
        name,
        websiteUrl,
        createdAt: new Date().toISOString(),
        isMembership: true,
      };

      localDb.blogs = localDb.blogs.map((blog) => {
        if (blog.id === blogId) {
          return updatedBlog;
        }
        return blog;
      });

      return updatedBlog;
    }

    return undefined;
  },

  async deleteBlog(blogId: string) {
    const blogToDelete = localDb.blogs.find((blog) => {
      return blog.id === blogId;
    });

    if (blogToDelete) {
      localDb.blogs = localDb.blogs.filter((blog) => {
        return blog.id !== blogId;
      });

      return true;
    }

    return false;
  },
};
