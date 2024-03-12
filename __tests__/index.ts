import { container } from '../src/composition-root';
import { UserTestManagerClass } from './util/UserTestManager';
import { AuthTestManagerClass } from './util/AuthTestManager';
import { BlogTestManagerClass } from './util/BlogTestManager';
import { PostTestManagerClass } from './util/PostsTestManager';

export const UserTestManager = container.get(UserTestManagerClass);
export const AuthTestManager = container.get(AuthTestManagerClass);
export const BlogTestManager = container.get(BlogTestManagerClass);
export const PostTestManager = container.get(PostTestManagerClass);
