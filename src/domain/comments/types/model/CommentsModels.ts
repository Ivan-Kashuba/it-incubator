import { LikeDbModel, LikeViewModel } from '../../../likes/types/model/LikesModels';

export type CommentDbModel = {
  _id?: string;
  postId: string;
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likes: LikeDbModel[];
};

export type CommentInputModel = {
  content: string;
};

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikeViewModel;
};
