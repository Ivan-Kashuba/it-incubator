import { PostDbModel, PostInputModel, PostViewModel } from '../types/model/PostModels';
import { getInsensitiveCaseSearchRegexString } from '../../../shared/helpers/getInsensitiveCaseSearchRegexString';
import { postsCollection } from '../../../db/mongoDb';
import { postWithBlogNameAggregate } from '../aggregations/postWithBlogNameAggregate';

export const postsMongoRepository = {
  async findPosts(title?: string) {
    let filters = {};

    if (title) {
      filters = { title: getInsensitiveCaseSearchRegexString(title) };
    }

    return (await postsCollection.aggregate(postWithBlogNameAggregate(filters)).toArray()) as PostViewModel[];
  },

  async findPostById(postId: string) {
    return (await postsCollection.aggregate(postWithBlogNameAggregate({ id: postId })).next()) as PostViewModel;
  },

  async createPost(postInfo: PostInputModel) {
    const { content, shortDescription, title, blogId } = postInfo;

    const generatedId = Math.floor(Math.random() * 10000000).toString();

    const newPost: PostDbModel = {
      id: generatedId,
      content,
      shortDescription,
      title,
      blogId,
      createdAt: new Date().toISOString(),
    };

    const insertedResponse = await postsCollection.insertOne(newPost);

    if (!!insertedResponse.insertedId) {
      return this.findPostById(generatedId);
    }

    return undefined;
  },

  async updatePost(postId: string, postInfo: PostInputModel) {
    const { content, shortDescription, title, blogId } = postInfo;

    const updateInfo: Omit<PostDbModel, 'id' | 'createdAt'> = {
      content,
      shortDescription,
      title,
      blogId,
    };

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
