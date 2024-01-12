import express, { Request, Response } from 'express';
import { localDb } from '../db/local-db';
import { STATUS_HTTP } from '../shared/types';
import { videosCollection } from '../db/mongoDb';
import { addDaysToDate } from '../shared/helpers/addDaysToDate';
import { VideoResolution } from '../features/videos/types/model/Video';

export const testRouter = express.Router();

testRouter.delete('/all-data', async (req: Request, res: Response) => {
  localDb.videos = [];
  const deleteResponse = await videosCollection.deleteMany({});
  if (deleteResponse.acknowledged) {
    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  } else {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
  }
});

testRouter.post('/all-data', async (req: Request, res: Response) => {
  const addResponse = await videosCollection.insertMany([
    {
      id: +Date.now(),
      title: 'Video 1',
      author: 'Ivan',
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P240, VideoResolution.P360],
    },
    {
      id: +Date.now(),
      title: 'Video 2',
      author: 'Dima',
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P240, VideoResolution.P360],
    },
    {
      id: +Date.now(),
      title: 'Video 3',
      author: 'Jenya',
      canBeDownloaded: true,
      minAgeRestriction: null,
      createdAt: new Date().toISOString(),
      publicationDate: addDaysToDate(new Date(), 1).toISOString(),
      availableResolutions: [VideoResolution.P480, VideoResolution.P1440],
    },
  ]);

  if (addResponse.acknowledged) {
    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  } else {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
  }
});
