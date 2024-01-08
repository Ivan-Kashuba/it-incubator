export interface PostDbModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
}

export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
