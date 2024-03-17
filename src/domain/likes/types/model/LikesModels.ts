export type LikeDbModel = {
  userId: string;
  status: LIKE_STATUS;
};

export enum LIKE_STATUS {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type LikeInputModel = {
  likeStatus: LIKE_STATUS;
};

export type LikeViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LIKE_STATUS;
};

export type ExtendedLikeDbModel = {
  userId: string;
  status: LIKE_STATUS;
  addedAt: string;
  userLogin: string;
  firstLikeDate: string | null;
};

export type ExtendedLikesDbModel = {
  likesCount: number;
  dislikesCount: number;
  extendedLikes: ExtendedLikeDbModel[];
};

export type ExtendedLikesViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LIKE_STATUS;
  newestLikes: NewestLikeViewModel[];
};

export type NewestLikeViewModel = {
  addedAt: string;
  userId: string;
  login: string;
};
