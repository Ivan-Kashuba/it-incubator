import express, { Response } from 'express';
import { localDb } from '../db/local-db';
import {
  createVideoModelValidation,
  updateVideoModelValidation,
} from '../features/videos/helpers/videoModelValidation';
import { CreateVideoModel, UpdateVideoModel, Video } from '../features/videos/types/model/Video';
import { addDaysToDate } from '../shared/helpers/addDaysToDate';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  STATUS_HTTP,
} from '../shared/types';

export const videoRouter = express.Router();

videoRouter.get('/', (req: RequestWithQuery<{ title?: string }>, res: Response<Video[]>) => {
  const titleToFind = req?.query?.title;

  if (!titleToFind) {
    res.status(STATUS_HTTP.OK_200).send(localDb.videos);
    return;
  }

  const foundedVideos = localDb.videos.filter((video) => {
    return video.title.includes(titleToFind);
  });

  res.status(STATUS_HTTP.OK_200).send(foundedVideos);
});
videoRouter.get('/:videoId', (req: RequestWithParams<{ videoId: string }>, res: Response<Video>) => {
  const videoId = req.params.videoId;

  const foundedVideo = localDb.videos.find((p) => {
    return p.id === +videoId;
  });

  if (!foundedVideo) {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
    return;
  }

  res.status(STATUS_HTTP.OK_200).send(foundedVideo);
});
videoRouter.post('/', createVideoModelValidation, (req: RequestWithBody<CreateVideoModel>, res: Response<Video>) => {
  const { title, author, availableResolutions } = req.body;

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

  res.status(STATUS_HTTP.CREATED_201).send(newVideo);
});
videoRouter.delete('/:videoId', (req: RequestWithParams<{ videoId: string }>, res: Response<void>) => {
  const videoId = req.params.videoId;

  const videoToDelete = localDb.videos.find((video) => {
    return video.id === +videoId;
  });

  if (!videoToDelete) {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
    return;
  }

  localDb.videos = localDb.videos.filter((video) => {
    return video.id !== videoToDelete.id;
  });

  res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
});
videoRouter.put(
  '/:videoId',
  updateVideoModelValidation,
  (req: RequestWithParamsAndBody<{ videoId: string }, UpdateVideoModel>, res: Response) => {
    const videoId = req.params.videoId;

    const videoToUpdate = localDb.videos.find((video) => {
      return video.id === +videoId;
    });

    if (!videoToUpdate) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    const updatedVideo: Video = {
      id: videoToUpdate.id,
      title: req.body.title as string,
      author: req.body.author as string,
      canBeDownloaded: req.body.canBeDownloaded || false,
      minAgeRestriction: req.body.minAgeRestriction || null,
      createdAt: videoToUpdate.createdAt,
      publicationDate: req.body.publicationDate || videoToUpdate.publicationDate,
      availableResolutions: req.body.availableResolutions || [],
    };

    localDb.videos = localDb.videos.map((video) => {
      if (video.id === updatedVideo.id) {
        return updatedVideo;
      }
      return video;
    });

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }
);
