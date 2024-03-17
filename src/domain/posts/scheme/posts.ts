import mongoose from 'mongoose';
import { PostDbModel, PostModelMethods, PostSchemeModel } from '../types/model/PostModels';
import { ExtendedLikesSchema } from '../../likes/scheme/ExtendedLikeInfo';
import { LIKE_STATUS } from '../../likes/types/model/LikesModels';
import { usersRepository } from '../../../composition-root';

export const PostSchema = new mongoose.Schema<PostDbModel, PostSchemeModel, PostModelMethods>({
  id: { type: String, require: true },
  title: { type: String, require: true },
  shortDescription: { type: String, require: true },
  blogId: { type: String },
  createdAt: { type: String, required: true },
  content: { type: String },
  extendedLikesInfo: ExtendedLikesSchema,
});

PostSchema.method('like', async function like(likeStatus: LIKE_STATUS, userId: string, login: string) {
  const that = this as unknown as PostDbModel;
  const user = await usersRepository.findUserById(userId);

  if (!Object.values(LIKE_STATUS).includes(likeStatus)) throw new Error('Not valid likeStatus');
  if (!user) throw new Error('User not found');

  const userLikeIndex = that.extendedLikesInfo.extendedLikes.findIndex((like) => like.userId === userId);

  const extendedLikesInfo = that.extendedLikesInfo?.extendedLikes[userLikeIndex];

  const previousLikeStatus = extendedLikesInfo?.status || LIKE_STATUS.None;

  if (userLikeIndex !== -1) {
    extendedLikesInfo.status = likeStatus;

    if (likeStatus === LIKE_STATUS.Like && !extendedLikesInfo?.firstLikeDate) {
      extendedLikesInfo.firstLikeDate = new Date().toISOString();
    }
  } else {
    that.extendedLikesInfo.extendedLikes.push({
      status: likeStatus,
      userId,
      userLogin: login,
      addedAt: new Date().toISOString(),
      firstLikeDate: likeStatus === LIKE_STATUS.Like ? new Date().toISOString() : null,
    });
  }
  reCountLikes(previousLikeStatus);

  function reCountLikes(previousLikeStatus: LIKE_STATUS) {
    if (previousLikeStatus === LIKE_STATUS.Like) {
      that.extendedLikesInfo.likesCount -= 1;
    }

    if (previousLikeStatus === LIKE_STATUS.Dislike) {
      that.extendedLikesInfo.dislikesCount -= 1;
    }

    if (likeStatus === LIKE_STATUS.Like) {
      that.extendedLikesInfo.likesCount += 1;
    }

    if (likeStatus === LIKE_STATUS.Dislike) {
      that.extendedLikesInfo.dislikesCount += 1;
    }
  }
});

export const PostModel = mongoose.model<PostDbModel, PostSchemeModel>('posts', PostSchema);
