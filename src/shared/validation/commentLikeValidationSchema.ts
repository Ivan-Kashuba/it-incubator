import { blogsRepository } from '../../repositories/blogs-repository';
import { LIKE_STATUS } from '../../domain/likes/types/model/LikesModels';

export const commentLikeValidationSchema = {
  custom: {
    options: async (likeStatus: LIKE_STATUS) => {
      if (!likeStatus || !Object.values(LIKE_STATUS).includes(likeStatus)) {
        throw new Error('Bad like status enum value');
      }
    },
  },
};
