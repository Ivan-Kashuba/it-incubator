import { LIKE_STATUS } from '../../domain/likes/types/model/LikesModels';

export const inputLikeValidationSchema = {
  custom: {
    options: async (likeStatus: LIKE_STATUS) => {
      if (!likeStatus || !Object.values(LIKE_STATUS).includes(likeStatus)) {
        throw new Error('Bad like status enum value');
      }
    },
  },
};
