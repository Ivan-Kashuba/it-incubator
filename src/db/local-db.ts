import { addDaysToDate } from '../shared/helpers/addDaysToDate';
import { VideoResolution } from '../features/videos/types/model/Video';
import { DataBase } from './types/db';

export const localDb: DataBase = {
  videos: [
    {
      id: 1,
      title: 'Video 1',
      author: 'Ivan',
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P240, VideoResolution.P360],
    },
    {
      id: 2,
      title: 'Video 2',
      author: 'Dima',
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P240, VideoResolution.P360],
    },
    {
      id: 3,
      title: 'Video 3',
      author: 'Jenya',
      canBeDownloaded: true,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P480, VideoResolution.P1440],
    },
  ],
};
