import { DataBase } from './types/db';
import { ObjectId } from 'mongodb';

export const localDb: DataBase = {
  blogs: [
    {
      _id: new ObjectId(),
      id: '1',
      websiteUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions',
      name: 'Regex',
      description: 'About regex',
      createdAt: '2024-01-13T16:20:58.068Z',
      isMembership: false,
    },
    {
      _id: new ObjectId(),
      id: '2',
      websiteUrl: 'https://github.com/express-validator/express-validator/issues/344',
      name: 'Github',
      description: 'Github regex',
      createdAt: '2024-01-13T16:20:58.068Z',
      isMembership: false,
    },
    {
      _id: new ObjectId(),
      id: '3',
      websiteUrl: 'https://samurai.it-incubator.io/swagger?id=h02',
      name: 'Samurai',
      description: 'Samurai Swagger',
      createdAt: '2024-01-13T16:20:58.068Z',
      isMembership: false,
    },
  ],
  posts: [
    {
      id: '1',
      content: 'Content',
      title: 'Title',
      shortDescription: 'Description',
      blogId: '1',
      createdAt: '2024-01-13T16:20:58.068Z',
      extendedLikesInfo: { extendedLikes: [], likesCount: 0, dislikesCount: 0 },
    },
    {
      id: '2',
      content: 'Content1',
      title: 'Title1',
      shortDescription: 'Description1',
      blogId: '2',
      createdAt: '2024-01-13T16:20:58.068Z',
      extendedLikesInfo: { extendedLikes: [], likesCount: 0, dislikesCount: 0 },
    },
    {
      id: '3',
      content: 'Content2',
      title: 'Title2',
      shortDescription: 'Description2',
      blogId: '3',
      createdAt: '2024-01-13T16:20:58.068Z',
      extendedLikesInfo: { extendedLikes: [], likesCount: 0, dislikesCount: 0 },
    },
  ],
};
