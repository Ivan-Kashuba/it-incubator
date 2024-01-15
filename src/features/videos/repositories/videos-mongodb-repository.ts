import { Video } from '../types/model/Video';
import { videosCollection } from '../../../db/mongoDb';
import { getInsensitiveCaseSearchRegexString } from '../../../shared/helpers/getInsensitiveCaseSearchRegexString';
import { TSortDirection, WithPagination } from '../../../shared/types/Pagination';
import { sortDirectionToMongodb } from '../../../shared/helpers/sortDirectionToMongodb';

export const videosMongoDbRepository = {
  async findVideos(
    pageNumber: number,
    limit: number,
    sortBy: string,
    sortDirection: TSortDirection,
    title?: string
  ): Promise<WithPagination<Video>> {
    let filter: any = {};

    const skip = (pageNumber - 1) * limit;

    if (title) {
      filter = { title: getInsensitiveCaseSearchRegexString(title) };
    }

    const videos = await videosCollection
      .find(filter)
      .sort({ [sortBy]: sortDirectionToMongodb(sortDirection) })
      .limit(limit)
      .skip(skip)
      .toArray();

    const totalCount = await videosCollection.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / limit);
    return { totalCount, items: videos, page: pageNumber, pagesCount, pageSize: limit };
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
