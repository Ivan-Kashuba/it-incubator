import express from 'express';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { adminAuthCheckMiddleware } from '../middlewares/adminAuthCheckMiddleware';
import { blogInputModelValidation } from '../domain/blogs/validation/blogInputModelValidation';
import { blogPostInputModelValidation } from '../domain/blogs/validation/blogPostInputModelValidation';
import { getUserInfoFromTokenWithoutAuthCheck } from '../middlewares/getUserInfoFromTokenWithoutAuthCheck';
import { container } from '../composition-root';
import { BlogsController } from '../controllers/blogs-controller';

export const blogRouter = express.Router();
const blogsController = container.get(BlogsController);

blogRouter.get('/', getUserInfoFromTokenWithoutAuthCheck, blogsController.getBlogs);
blogRouter.post(
  '/',
  adminAuthCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  blogsController.createBlog
);
blogRouter.get('/:blogId', getUserInfoFromTokenWithoutAuthCheck, blogsController.getBlog);
blogRouter.delete('/:blogId', adminAuthCheckMiddleware, blogsController.deleteBlog);
blogRouter.put(
  '/:blogId',
  adminAuthCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  blogsController.updateBlog
);

blogRouter.post(
  '/:blogId/posts',
  adminAuthCheckMiddleware,
  blogPostInputModelValidation,
  validationCheckMiddleware,
  blogsController.createPostForBlog
);

blogRouter.get('/:blogId/posts', blogsController.getBlogPosts);
