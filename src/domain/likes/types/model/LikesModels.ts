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
