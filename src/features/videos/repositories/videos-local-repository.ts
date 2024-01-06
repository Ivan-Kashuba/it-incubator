import { localDb } from '../../../db/local-db';
import { CreateVideoModel, UpdateVideoModel, Video } from '../types/model/Video';
import { addDaysToDate } from '../../../shared/helpers/addDaysToDate';

export const videosLocalRepository = {
  async findVideos(title?: string) {
    if (!title) {
      return localDb.videos;
    }

    return localDb.videos.filter((video) => {
      return video.title.includes(title);
    });
  },

  async findVideoById(videoId: number) {
    return localDb.videos.find((p) => {
      return p.id === +videoId;
    });
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

    localDb.videos.push(newVideo);

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

      localDb.videos = localDb.videos.map((video) => {
        if (video.id === videoId) {
          return updatedVideo;
        }
        return video;
      });

      return updatedVideo;
    }

    return undefined;
  },

  async deleteVideo(videoId: number) {
    const videoToDelete = localDb.videos.find((video) => {
      return video.id === videoId;
    });

    if (videoToDelete) {
      localDb.videos = localDb.videos.filter((video) => {
        return video.id !== videoId;
      });

      return true;
    }

    return false;
  },
};
