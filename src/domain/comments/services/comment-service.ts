import { ObjectId } from 'mongodb';
import { UserTokenInfo } from '../../auth/types/model/Auth';
import { commentsRepository } from '../../../repositories/comments-repository';

export class CommentService {
  async createCommentForPost(postId: string, content: string, userInfo: UserTokenInfo) {
    const commentToCreate = {
      id: new ObjectId().toString(),
      postId,
      content,
      commentatorInfo: {
        userId: userInfo.userId,
        userLogin: userInfo.login,
      },
      createdAt: new Date().toISOString(),
    };

    const createdCommentId = await commentsRepository.createCommentForPost(commentToCreate);

    return createdCommentId;
  }
}

export const commentService = new CommentService();
