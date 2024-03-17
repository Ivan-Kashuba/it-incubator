import { PostDbModel } from '../domain/posts/types/model/PostModels';
import { PostModel } from '../domain/posts/scheme/posts';
import { injectable } from 'inversify';

@injectable()
export class PostsRepository {
  async findPostById(postId: string) {
    return PostModel.findOne({ id: postId });
  }

  async createPost(postToCreate: PostDbModel) {
    const insertedResponse = await PostModel.create(postToCreate);

    return !!insertedResponse._id;
  }

  async updatePost(postId: string, updateInfo: Omit<PostDbModel, 'id' | 'createdAt' | 'extendedLikesInfo'>) {
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

  async save(model: any) {
    return model.save();
  }
}
