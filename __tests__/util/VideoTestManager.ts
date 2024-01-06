import { STATUS_HTTP } from '../../src/shared/types';

import { CreateVideoModel } from '../../src/features/videos/types/model/Video';
import { getRequest } from './shared';

export class VideoTestManagerClass {
  async createVideo(data: CreateVideoModel) {
    const createResponse = await getRequest().post('/videos').send(data).expect(STATUS_HTTP.CREATED_201);

    const createdVideo = createResponse.body;

    expect(createdVideo).toEqual({
      id: expect.any(Number),
      title: data.title,
      author: data.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: expect.any(String),
      publicationDate: expect.any(String),
      availableResolutions: data.availableResolutions || [],
    });

    return { createResponse, createdVideo };
  }
}

export const VideoTestManager = new VideoTestManagerClass();
