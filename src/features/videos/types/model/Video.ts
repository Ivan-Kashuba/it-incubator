export enum VideoResolution {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

export interface Video {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: null | number;
  createdAt: string;
  publicationDate: string;
  availableResolutions: VideoResolution[];
}

export type CreateVideoModel = {
  title: string;
  author: string;
  availableResolutions?: VideoResolution[];
};

export type UpdateVideoModel = {
  title: string;
  author: string;
  availableResolutions?: VideoResolution[];
  canBeDownloaded?: boolean;
  minAgeRestriction?: number | null;
  publicationDate?: string;
};
