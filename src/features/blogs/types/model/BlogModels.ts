import { WithId } from 'mongodb';

export type BlogDBModel = WithId<BlogViewModel>;

export interface BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export type BlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogPostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
};
