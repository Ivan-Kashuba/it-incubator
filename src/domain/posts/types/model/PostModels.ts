import { ExtendedLikesDbModel, ExtendedLikesViewModel, LIKE_STATUS } from '../../../likes/types/model/LikesModels';
import { Model } from 'mongoose';

export interface PostDbModel {
  _id?: string;
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesDbModel;
}

export interface PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesViewModel;
}

export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostModelMethods = {
  like(likeStatus: LIKE_STATUS, userId: string, login: string): Promise<void>;
};

export type PostSchemeModel = Model<PostDbModel, {}, PostModelMethods> & PostModelMethods;
