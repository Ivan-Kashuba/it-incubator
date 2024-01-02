import express, { Request, Response } from 'express';
import { Video, VideoResolution } from './types/model/Video';
import { addDaysToDate } from './helpers/addDaysToDate';
import { DataBase } from './types/model/db';
import { createVideoModelValidation, updateVideoModelValidation } from './helpers/videoModelValidation';

export const app = express();
const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

const db: DataBase = {
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
      id: 1,
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

app.delete('/testing/all-data', (req: Request, res: Response) => {
  db.videos = [];

  res.sendStatus(204);
});
app.get('/videos', (req: Request, res: Response) => {
  const titleToFind = req.query.title as string;

  if (!titleToFind) {
    res.status(200).send(db.videos);
    return;
  }

  const foundedVideos = db.videos.filter((video) => {
    return video.title.includes(titleToFind);
  });

  res.status(200).send(foundedVideos);
});
app.get('/videos/:videoId', (req: Request, res: Response) => {
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
app.post('/videos', createVideoModelValidation, (req: Request, res: Response) => {
  const { title, author, availableResolutions } = req.body;

  const newVideo: Video = {
    id: +new Date(),
    title: title,
    author: author,
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: new Date().toISOString(),
    publicationDate: addDaysToDate(new Date(), 1).toISOString(),
    availableResolutions: availableResolutions,
  };

  db.videos.push(newVideo);

  res.status(201).send(newVideo);
});
app.delete('/videos/:videoId', (req: Request, res: Response) => {
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
app.put('/videos/:videoId', updateVideoModelValidation, (req: Request, res: Response) => {
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
    title: req.body.title,
    author: req.body.author,
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
});
