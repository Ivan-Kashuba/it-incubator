import { CreateVideoModel, UpdateVideoModel, Video } from '../types/model/Video';
import { addDaysToDate } from '../../../shared/helpers/addDaysToDate';
import { videosMongoDbRepository as videosRepository } from '../repositories/videos-mongodb-repository';
import { TSortDirection } from '../../../shared/types/Pagination';

export const videosService = {
  async findVideos(pageNumber: number, limit: number, sortBy: string, sortDirection: TSortDirection, title?: string) {
    return videosRepository.findVideos(pageNumber, limit, sortBy, sortDirection, title);
  },

  async findVideoById(videoId: number) {
    return videosRepository.findVideoById(videoId);
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

    await videosRepository.createVideo(newVideo);

    return newVideo;
  },

  async updateVideo(videoId: number, updateInfo: UpdateVideoModel) {
    const { title, author, availableResolutions, minAgeRestriction, canBeDownloaded, publicationDate } = updateInfo;

    const changeVideoData: Partial<Video> & UpdateVideoModel = {
      id: videoId,
      title: title,
      author: author,
      canBeDownloaded: canBeDownloaded ? canBeDownloaded : undefined,
      minAgeRestriction: minAgeRestriction ? minAgeRestriction : undefined,
      publicationDate: publicationDate ? publicationDate : undefined,
      availableResolutions: availableResolutions ? availableResolutions : undefined,
    };

    const filteredChangeVideoData = Object.fromEntries(
      Object.entries(changeVideoData).filter(([key, value]) => value !== undefined)
    );

    const updatedVideo = await videosRepository.updateVideo(filteredChangeVideoData as any);

    return !!updatedVideo;
  },

  async deleteVideo(videoId: number) {
    return videosRepository.deleteVideo(videoId);
  },
};
