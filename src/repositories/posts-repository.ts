import { PostDbModel, PostViewModel } from '../domain/posts/types/model/PostModels';
import { getInsensitiveCaseSearchRegexString } from '../shared/helpers/getInsensitiveCaseSearchRegexString';
import { postWithBlogNameAggregate } from '../domain/posts/aggregations/postWithBlogNameAggregate';
import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { createPaginationResponse, getSkip, getSortDirectionMongoValue } from '../shared/helpers/pagination';
import { PostModel } from '../domain/posts/scheme/posts';
import { injectable } from 'inversify';
@injectable()
export class PostsRepository {
  async findPosts(
    title: string | null,
    pagination: PaginationPayload<PostViewModel>
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
      .limit(pageSize)) as PostViewModel[];

    return createPaginationResponse<PostViewModel>(pagination, foundedPosts, totalCount);
  }

  async findPostById(postId: string) {
    return (await PostModel.aggregate(postWithBlogNameAggregate({ id: postId })))[0] as unknown as PostViewModel;
  }

  async createPost(postToCreate: PostDbModel) {
    const insertedResponse = await PostModel.create(postToCreate);

    return !!insertedResponse._id;
  }

  async updatePost(postId: string, updateInfo: Omit<PostDbModel, 'id' | 'createdAt'>) {
    const updatedPost = await PostModel.findOneAndUpdate(
      { id: postId },
      { $set: updateInfo },
      { returnDocument: 'after' }
    );

    return !!updatedPost;
  }

  async deletePost(postId: string) {
    const deleteResult = await PostModel.deleteOne({ id: postId });

    return deleteResult.deletedCount === 1;
  }
}
