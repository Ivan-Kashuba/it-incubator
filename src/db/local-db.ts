import { addDaysToDate } from '../shared/helpers/addDaysToDate';
import { VideoResolution } from '../features/videos/types/model/Video';
import { DataBase } from './types/db';

export const localDb: DataBase = {
  videos: [
    {
      id: 1,
      title: 'Blog 1',
      author: 'Ivan',
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P240, VideoResolution.P360],
    },
    {
      id: 2,
      title: 'Blog 2',
      author: 'Dima',
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P240, VideoResolution.P360],
    },
    {
      id: 3,
      title: 'Blog 3',
      author: 'Jenya',
      canBeDownloaded: true,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P480, VideoResolution.P1440],
    },
  ],
  blogs: [
    {
      id: '1',
      websiteUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions',
      name: 'Regex',
      description: 'About regex',
    },
    {
      id: '2',
      websiteUrl: 'https://github.com/express-validator/express-validator/issues/344',
      name: 'Github',
      description: 'Github regex',
    },
    {
      id: '3',
      websiteUrl: 'https://samurai.it-incubator.io/swagger?id=h02',
      name: 'Samurai',
      description: 'Samurai Swagger',
    },
  ],
};
