import { PostDbModel, PostViewModel } from '../types/model/PostModels';
import { getInsensitiveCaseSearchRegexString } from '../../../shared/helpers/getInsensitiveCaseSearchRegexString';
import { postsCollection } from '../../../db/mongoDb';
import { postWithBlogNameAggregate } from '../aggregations/postWithBlogNameAggregate';
import { PaginationPayload, WithPagination } from '../../../shared/types/Pagination';
import { createPaginationResponse, getSkip, getSortValue } from '../../../shared/helpers/pagination';

export const postsRepository = {
  async findPosts(
    title: string | null,
    pagination: PaginationPayload<PostViewModel>
  ): Promise<WithPagination<PostViewModel>> {
    const { sortDirection, sortBy, pageNumber, pageSize } = pagination;

    let filters = {};

    if (title) {
      filters = { title: getInsensitiveCaseSearchRegexString(title) };
    }
    const totalCount = await postsCollection.countDocuments(filters);
    const foundedPosts = (await postsCollection

      .aggregate(postWithBlogNameAggregate(filters))
      .sort({ [sortBy]: getSortValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray()) as PostViewModel[];

    return createPaginationResponse<PostViewModel>(pagination, foundedPosts, totalCount);
  },

  async findPostById(postId: string) {
    return (await postsCollection.aggregate(postWithBlogNameAggregate({ id: postId })).next()) as PostViewModel;
  },

  async createPost(postToCreate: PostDbModel) {
    const insertedResponse = await postsCollection.insertOne(postToCreate);

    return !!insertedResponse.insertedId;
  },

  async updatePost(postId: string, updateInfo: Omit<PostDbModel, 'id' | 'createdAt'>) {
    const updatedPost = await postsCollection.findOneAndUpdate(
      { id: postId },
      { $set: updateInfo },
      { returnDocument: 'after' }
    );

    return !!updatedPost;
  },

  async deletePost(postId: string) {
    const deleteResult = await postsCollection.deleteOne({ id: postId });

    return deleteResult.deletedCount === 1;
  },
};
