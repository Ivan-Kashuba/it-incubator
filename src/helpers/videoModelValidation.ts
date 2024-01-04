import { CreateVideoModel, UpdateVideoModel, VideoResolution } from '../types/model/Video';
import { Error, ErrorResponse } from '../types/model/Error';
import { NextFunction, Request, Response } from 'express';
import { isIsoDate } from './isIsoString';
import { RequestWithBody } from '../types';

export const createVideoModelValidation = (
  req: RequestWithBody<CreateVideoModel>,
  res: Response,
  next: NextFunction
) => {
  const productPayload: CreateVideoModel = req?.body;
  const errors: Error[] = [];

  const videoTitle = productPayload?.title?.trim() as string;
  const videoAuthor = productPayload?.author?.trim() as string;
  const videoResolutions = productPayload?.availableResolutions || [];

  if (!videoTitle) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (videoTitle?.length > 40) {
    errors.push({ field: 'title', message: 'Max length is 40' });
  }

  if (!videoAuthor) {
    errors.push({ field: 'author', message: 'Author is required' });
  }

  if (videoAuthor?.length > 20) {
    errors.push({ field: 'author', message: 'Max length is 20' });
  }

  videoResolutions?.forEach((resolution) => {
    if (!Object.values(VideoResolution).includes(resolution)) {
      errors.push({ field: 'availableResolutions', message: 'Unsupported formats' });
    }
  });

  if (errors.length) {
    const errorMessage: ErrorResponse = {
      errorsMessages: errors,
    };
    res.status(400).send(errorMessage);
    return;
  }
  next();
};

export const updateVideoModelValidation = (
  req: RequestWithBody<UpdateVideoModel>,
  res: Response,
  next: NextFunction
) => {
  const productPayload: UpdateVideoModel = req?.body;
  const errors: Error[] = [];

  const videoTitle = productPayload?.title?.trim() as string;
  const videoAuthor = productPayload?.author?.trim() as string;
  const videoResolutions = productPayload?.availableResolutions || [];

  if (!videoTitle) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (videoTitle?.length > 40) {
    errors.push({ field: 'title', message: 'Max length is 40' });
  }

  if (!videoAuthor) {
    errors.push({ field: 'author', message: 'Author is required' });
  }

  if (videoAuthor?.length > 20) {
    errors.push({ field: 'author', message: 'Max length is 20' });
  }

  videoResolutions?.forEach((resolution) => {
    if (!Object.values(VideoResolution).includes(resolution)) {
      errors.push({ field: 'availableResolutions', message: 'Unsupported formats' });
    }
  });

  if (productPayload?.canBeDownloaded && typeof productPayload?.canBeDownloaded !== 'boolean') {
    errors.push({ field: 'canBeDownloaded', message: 'Wrong format. Must be boolean' });
  }

  if (productPayload?.minAgeRestriction !== null && productPayload?.minAgeRestriction !== undefined) {
    if (typeof productPayload?.minAgeRestriction !== 'number') {
      errors.push({ field: 'minAgeRestriction', message: 'Wrong format. Must be a number' });
    } else if (productPayload?.minAgeRestriction < 1 || productPayload?.minAgeRestriction > 18) {
      errors.push({ field: 'minAgeRestriction', message: 'Min is 1, Max is 18' });
    }
  }

  if (productPayload?.publicationDate) {
    if (!isIsoDate(productPayload?.publicationDate)) {
      errors.push({ field: 'publicationDate', message: 'Must be ISO string' });
    }
  }

  if (errors.length) {
    const errorMessage: ErrorResponse = {
      errorsMessages: errors,
    };
    res.status(400).send(errorMessage);
    return;
  }
  next();
};
