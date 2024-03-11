import 'reflect-metadata';
import { JwtService } from './application/jwtService';
import { AuthService } from './domain/auth/services/auth-service';
import { UsersRepository } from './repositories/users-repository';
import { AuthController } from './controllers/auth-controller';
import { Container } from 'inversify';
import { AuthRepository } from './repositories/auth-repository';
import { SecurityController } from './controllers/security-controller';
import { BlogsController } from './controllers/blogs-controller';
import { CommentsController } from './controllers/comments-controller';
import { PostsController } from './controllers/posts-controller';
import { UsersController } from './controllers/users-controller';
import { BlogsRepository } from './repositories/blogs-repository';
import { CommentsRepository } from './repositories/comments-repository';
import { CommentsQueryRepository } from './repositories/comments-query-repository';
import { PostsRepository } from './repositories/posts-repository';
import { SecurityQueryRepository } from './repositories/security-query-repository';
import { BlogsService } from './domain/blogs/services/blogs-service';
import { CommentService } from './domain/comments/services/comment-service';
import { PostsService } from './domain/posts/services/posts-service';
import { UsersService } from './domain/users/services/users-service';
import { AuthTestManagerClass } from '../__tests__/util/AuthTestManager';
import { BlogTestManagerClass } from '../__tests__/util/BlogTestManager';
import { PostTestManagerClass } from '../__tests__/util/PostsTestManager';
import { UserTestManagerClass } from '../__tests__/util/UserTestManager';

export const container = new Container();

container.bind(AuthController).to(AuthController);
container.bind(SecurityController).to(SecurityController);
container.bind(BlogsController).to(BlogsController);
container.bind(CommentsController).to(CommentsController);
container.bind(PostsController).to(PostsController);
container.bind(UsersController).to(UsersController);

container.bind(AuthService).to(AuthService);
container.bind(JwtService).to(JwtService);
container.bind(BlogsService).to(BlogsService);
container.bind(CommentService).to(CommentService);
container.bind(PostsService).to(PostsService);
container.bind(UsersService).to(UsersService);

container.bind(UsersRepository).to(UsersRepository);
container.bind(AuthRepository).to(AuthRepository);
container.bind(BlogsRepository).to(BlogsRepository);
container.bind(CommentsRepository).to(CommentsRepository);
container.bind(CommentsQueryRepository).to(CommentsQueryRepository);
container.bind(PostsRepository).to(PostsRepository);
container.bind(SecurityQueryRepository).to(SecurityQueryRepository);

container.bind(AuthTestManagerClass).to(AuthTestManagerClass);
container.bind(BlogTestManagerClass).to(BlogTestManagerClass);
container.bind(PostTestManagerClass).to(PostTestManagerClass);
container.bind(UserTestManagerClass).to(UserTestManagerClass);

export const AuthTestManager = new AuthTestManagerClass(new UserTestManagerClass());
export const BlogTestManager = new BlogTestManagerClass();
export const PostTestManager = new PostTestManagerClass(new BlogsRepository());
export const UserTestManager = new UserTestManagerClass();

export const jwtService = new JwtService();
export const authRepository = new AuthRepository();
