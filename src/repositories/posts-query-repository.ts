import { PostDbModel, PostViewModel } from '../domain/posts/types/model/PostModels';
import { getInsensitiveCaseSearchRegexString } from '../shared/helpers/getInsensitiveCaseSearchRegexString';
import { postWithBlogNameAggregate } from '../domain/posts/aggregations/postWithBlogNameAggregate';
import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { createPaginationResponse, getSkip, getSortDirectionMongoValue } from '../shared/helpers/pagination';
import { PostModel } from '../domain/posts/scheme/posts';
import { injectable } from 'inversify';
import { LIKE_STATUS, NewestLikeViewModel } from '../domain/likes/types/model/LikesModels';

export type PostModelAfterAggregation = Omit<PostViewModel, 'extendedLikesInfo'> &
  Pick<PostDbModel, 'extendedLikesInfo'>;

@injectable()
export class PostsQueryRepository {
  async findPosts(
    title: string | null,
    pagination: PaginationPayload<PostViewModel>,
    userId?: string
  ): Promise<WithPagination<PostViewModel>> {
    const { sortDirection, sortBy, pageNumber, pageSize } = pagination;

    let filters = {};

    if (title) {
      filters = { title: getInsensitiveCaseSearchRegexString(title) };
    }
    const totalCount = await PostModel.countDocuments(filters);

    const foundedPosts = (await PostModel.aggregate(postWithBlogNameAggregate(filters))
      .sort({ [sortBy]: getSortDirectionMongoValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pageSize)) as PostModelAfterAggregation[];

    const viewModelFoundedPosts = foundedPosts.map((post) => this._mapDbPostModelToViewModel(post, userId));

    return createPaginationResponse<PostViewModel>(pagination, viewModelFoundedPosts, totalCount);
  }

  async findPostById(postId: string, userId?: string) {
    const postWithDbExtendedLikesInfo = (
      await PostModel.aggregate(postWithBlogNameAggregate({ id: postId }))
    )[0] as unknown as PostModelAfterAggregation;

    return postWithDbExtendedLikesInfo ? this._mapDbPostModelToViewModel(postWithDbExtendedLikesInfo, userId) : null;
  }

  _mapDbPostModelToViewModel(postWithDbExtendedLikesInfo: PostModelAfterAggregation, userId?: string) {
    const postStatusByUser = postWithDbExtendedLikesInfo.extendedLikesInfo.extendedLikes.find(
      (like) => like.userId === userId
    )?.status;

    const newestLikes = postWithDbExtendedLikesInfo.extendedLikesInfo.extendedLikes
      .filter((like) => like.status === LIKE_STATUS.Like)
      .sort((like_a, like_b) => new Date(like_b.firstLikeDate!).getTime() - new Date(like_a.firstLikeDate!).getTime())
      .slice(0, 3)
      .map((like) => {
        const newestLike: NewestLikeViewModel = {
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.userLogin,
        };

        return newestLike;
      });

    const postViewModel: PostViewModel = {
      title: postWithDbExtendedLikesInfo.title,
      createdAt: postWithDbExtendedLikesInfo.createdAt,
      content: postWithDbExtendedLikesInfo.content,
      shortDescription: postWithDbExtendedLikesInfo.shortDescription,
      blogId: postWithDbExtendedLikesInfo.blogId,
      id: postWithDbExtendedLikesInfo.id,
      blogName: postWithDbExtendedLikesInfo.blogName,
      extendedLikesInfo: {
        likesCount: postWithDbExtendedLikesInfo.extendedLikesInfo.likesCount,
        dislikesCount: postWithDbExtendedLikesInfo.extendedLikesInfo.dislikesCount,
        newestLikes,
        myStatus: postStatusByUser || LIKE_STATUS.None,
      },
    };

    return postViewModel;
  }
}
