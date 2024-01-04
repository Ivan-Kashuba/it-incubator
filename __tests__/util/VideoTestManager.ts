import { STATUS_HTTP } from '../../src/types';
import { getRequest } from '../../src/helpers/getRequest';
import { CreateVideoModel } from '../../src/types/model/Video';

export class VideoTestManagerClass {
  async createVideo(data: CreateVideoModel) {
    const createResponse = await getRequest().post('/videos').send(data).expect(STATUS_HTTP.CREATED_201);

    const createdVideo = createResponse.body;

    expect(createdVideo).toEqual({
      id: expect.any(Number),
      title: 'title',
      author: 'author',
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: expect.any(String),
      publicationDate: expect.any(String),
      availableResolutions: [],
    });

    return { createResponse, createdVideo };
  }
}

export const VideoTestManager = new VideoTestManagerClass();
