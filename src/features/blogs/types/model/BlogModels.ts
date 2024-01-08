export interface BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
}

export type BlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};
