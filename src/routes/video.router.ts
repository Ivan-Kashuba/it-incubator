import express, { Response } from 'express';
import {
  createVideoModelValidation,
  updateVideoModelValidation,
} from '../features/videos/validation/videoModelsValidation';
import { CreateVideoModel, UpdateVideoModel, Video } from '../features/videos/types/model/Video';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  STATUS_HTTP,
} from '../shared/types';
import { videosMongoDbRepository as videoRepository } from '../features/videos/repositories/videos-mongodb-repository';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { authCheckMiddleware } from '../middlewares/authCheckMiddleware';

export const videoRouter = express.Router();

videoRouter.get('/', async (req: RequestWithQuery<{ title?: string }>, res: Response<Video[]>) => {
  const titleToFind = req?.query?.title;

  const foundedVideos = await videoRepository.findVideos(titleToFind);

  res.status(STATUS_HTTP.OK_200).send(foundedVideos);
});
videoRouter.post(
  '/',
  authCheckMiddleware,
  createVideoModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<CreateVideoModel>, res: Response<Video>) => {
    const createdVideo = await videoRepository.createVideo(req.body);

    res.status(STATUS_HTTP.CREATED_201).send(createdVideo);
  }
);
videoRouter.get('/:videoId', async (req: RequestWithParams<{ videoId: string }>, res: Response<Video>) => {
  const videoId = +req.params.videoId;

  const foundedVideo = await videoRepository.findVideoById(videoId);

  if (!foundedVideo) {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
    return;
  }

  res.status(STATUS_HTTP.OK_200).send(foundedVideo);
});
videoRouter.delete(
  '/:videoId',
  authCheckMiddleware,
  async (req: RequestWithParams<{ videoId: string }>, res: Response<void>) => {
    const videoId = +req.params.videoId;

    const isVideoDeleted = await videoRepository.deleteVideo(videoId);

    if (!isVideoDeleted) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    } else {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    }
  }
);
videoRouter.put(
  '/:videoId',
  authCheckMiddleware,
  updateVideoModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithParamsAndBody<{ videoId: string }, UpdateVideoModel>, res: Response) => {
    const videoId = +req.params.videoId;

    const updatedVideo = await videoRepository.updateVideo(videoId, req.body);

    if (!updatedVideo) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }
);
