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

  async createVideo(video: CreateVideoModel) {
    const { title, author, availableResolutions } = video;

    const newVideo: Video = {
      id: +new Date(),
      title: title as string,
      author: author as string,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: availableResolutions || [],
    };

    await videosCollection.insertOne(newVideo);

    return newVideo;
  },

  async updateVideo(videoId: number, updateInfo: UpdateVideoModel) {
    const { title, author, availableResolutions, minAgeRestriction, canBeDownloaded, publicationDate } = updateInfo;
    const videoToUpdate = await this.findVideoById(videoId);

    if (videoToUpdate) {
      const updatedVideo: Video = {
        id: videoId,
        title: title,
        author: author,
        canBeDownloaded: canBeDownloaded || videoToUpdate.canBeDownloaded,
        minAgeRestriction: minAgeRestriction || videoToUpdate?.minAgeRestriction,
        createdAt: videoToUpdate.createdAt,
        publicationDate: publicationDate || videoToUpdate?.publicationDate,
        availableResolutions: availableResolutions || videoToUpdate.availableResolutions,
      };

      await videosCollection.updateOne({ id: videoId }, { $set: updatedVideo });

      return updatedVideo;
    }

    return undefined;
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
