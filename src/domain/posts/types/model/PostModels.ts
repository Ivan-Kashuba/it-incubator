export interface PostDbModel {
  _id?: string;
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
}

export interface PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
