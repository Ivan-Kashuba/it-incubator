import { CreateVideoModel, UpdateVideoModel, Video } from '../types/model/Video';
import { addDaysToDate } from '../../../shared/helpers/addDaysToDate';
import { videosCollection } from '../../../db/mongoDb';
import { getInsensitiveCaseSearchRegexString } from '../../../shared/helpers/getInsensitiveCaseSearchRegexString';

export const videosMongoDbRepository = {
  async findVideos(title?: string) {
    let filter: any = {};

    if (title) {
      filter = { title: getInsensitiveCaseSearchRegexString(title) };
    }

    return videosCollection.find(filter).toArray();
  },

  async findVideoById(videoId: number) {
    return videosCollection.findOne({ id: videoId });
  },

  async createVideo(video: Video) {
    return videosCollection.insertOne(video);
  },

  async updateVideo(videoToUpdate: Partial<Video>) {
    const updatedVideo = await videosCollection.findOneAndUpdate(
      { id: videoToUpdate.id },
      { $set: videoToUpdate },
      { returnDocument: 'after' }
    );

    return updatedVideo;
  },

  async deleteVideo(videoId: number) {
    const videoToDelete = await this.findVideoById(videoId);

    if (videoToDelete) {
      const deletedResponse = await videosCollection.deleteOne({ id: videoId });

      return deletedResponse.acknowledged;
    }

    return false;
  },
};
