import express, { Request, Response } from 'express';
import { db } from '../db/db';
import { createVideoModelValidation, updateVideoModelValidation } from '../helpers/videoModelValidation';
import { CreateVideoModel, UpdateVideoModel, Video } from '../types/model/Video';
import { addDaysToDate } from '../helpers/addDaysToDate';
import { RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery } from '../types';

export const videoRouter = express.Router();

videoRouter.get('/', (req: RequestWithQuery<{ title?: string }>, res: Response<Video[]>) => {
  const titleToFind = req?.query?.title;

  if (!titleToFind) {
    res.status(200).send(db.videos);
    return;
  }

  const foundedVideos = db.videos.filter((video) => {
    return video.title.includes(titleToFind);
  });

  res.status(200).send(foundedVideos);
});
videoRouter.get('/:videoId', (req: RequestWithParams<{ videoId: string }>, res: Response<Video>) => {
  const videoId = req.params.videoId;

  const foundedVideo = db.videos.find((p) => {
    return p.id === +videoId;
  });

  if (!foundedVideo) {
    res.sendStatus(404);
    return;
  }

  res.status(200).send(foundedVideo);
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

  db.videos.push(newVideo);

  res.status(201).send(newVideo);
});
videoRouter.delete('/:videoId', (req: RequestWithParams<{ videoId: string }>, res: Response<void>) => {
  const videoId = req.params.videoId;

  const videoToDelete = db.videos.find((video) => {
    return video.id === +videoId;
  });

  if (!videoToDelete) {
    res.sendStatus(404);
    return;
  }

  db.videos = db.videos.filter((video) => {
    return video.id !== videoToDelete.id;
  });

  res.sendStatus(204);
});
videoRouter.put(
  '/:videoId',
  updateVideoModelValidation,
  (req: RequestWithParamsAndBody<{ videoId: string }, UpdateVideoModel>, res: Response) => {
    const videoId = req.params.videoId;

    const videoToUpdate = db.videos.find((video) => {
      return video.id === +videoId;
    });

    if (!videoToUpdate) {
      res.sendStatus(404);
      return;
    }

    const updatedVideo: Video = {
      id: videoToUpdate.id,
      title: req.body.title as string,
      author: req.body.author as string,
      canBeDownloaded: req.body.canBeDownloaded || false,
      minAgeRestriction: req.body.minAgeRestriction || null,
      createdAt: videoToUpdate.createdAt,
      publicationDate: videoToUpdate.publicationDate,
      availableResolutions: req.body.availableResolutions || [],
    };

    db.videos = db.videos.map((video) => {
      if (video.id === updatedVideo.id) {
        return updatedVideo;
      }
      return video;
    });

    res.sendStatus(204);
  }
);
