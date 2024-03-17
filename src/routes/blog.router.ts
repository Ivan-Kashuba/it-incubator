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

blogRouter.get('/', getUserInfoFromTokenWithoutAuthCheck, blogsController.getBlogs.bind(blogsController));
blogRouter.post(
  '/',
  adminAuthCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  blogsController.createBlog.bind(blogsController)
);
blogRouter.get('/:blogId', getUserInfoFromTokenWithoutAuthCheck, blogsController.getBlog.bind(blogsController));
blogRouter.delete('/:blogId', adminAuthCheckMiddleware, blogsController.deleteBlog.bind(blogsController));
blogRouter.put(
  '/:blogId',
  adminAuthCheckMiddleware,
  blogInputModelValidation,
  validationCheckMiddleware,
  blogsController.updateBlog.bind(blogsController)
);

blogRouter.post(
  '/:blogId/posts',
  adminAuthCheckMiddleware,
  blogPostInputModelValidation,
  validationCheckMiddleware,
  blogsController.createPostForBlog.bind(blogsController)
);

blogRouter.get(
  '/:blogId/posts',
  getUserInfoFromTokenWithoutAuthCheck,
  blogsController.getBlogPosts.bind(blogsController)
);
