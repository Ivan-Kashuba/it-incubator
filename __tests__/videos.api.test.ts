import { describe } from 'node:test';
import { STATUS_HTTP } from '../src/shared/types';

import { VideoTestManager } from './util/VideoTestManager';
import { getRequest } from './util/shared';

const validCreateVideoData = {
  title: 'Title name',
  author: 'Author',
};

const validUpdateVideoData = {
  title: 'Typescript lang',
  author: 'Ivan K',
};

describe('Videos', () => {
  beforeAll(async () => {
    await getRequest().delete('/testing/all-data');
  });

  it('Should return 200 and empty video list', async () => {
    await getRequest().get('/videos').expect(STATUS_HTTP.OK_200, []);
  });

  it('Should return 404 for not existing video', async () => {
    await getRequest().get('/videos/-99999999999999').expect(STATUS_HTTP.NOT_FOUND_404);
  });

  it('Should not be created with incorrect input data', async () => {
    await getRequest().post('/videos').send({ name: 'Samurai' }).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getRequest().post('/videos').send({}).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getRequest().get('/videos').expect(STATUS_HTTP.OK_200, []);
  });
  let createdVideo: any = null;
  it('Should create video with correct input data', async () => {
    const { createdVideo: createdVideoFromResponse } = await VideoTestManager.createVideo(validCreateVideoData);

    createdVideo = createdVideoFromResponse;

    await getRequest().get('/videos').expect(STATUS_HTTP.OK_200, [createdVideo]);
  });

  it('Should not update name with incorrect input data', async () => {
    await getRequest().put(`/videos/${createdVideo.id}`).send({ title: '' }).expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Should update name with correct input data', async () => {
    await getRequest().put(`/videos/${createdVideo.id}`).send(validUpdateVideoData).expect(STATUS_HTTP.NO_CONTENT_204);
    await getRequest()
      .get('/videos')
      .expect(STATUS_HTTP.OK_200, [{ ...createdVideo, ...validUpdateVideoData }]);
  });

  it('Delete video with unexisted id', async () => {
    await getRequest().delete(`/videos/-99999999999999`).expect(STATUS_HTTP.NOT_FOUND_404);
    await getRequest()
      .get('/videos')
      .expect(STATUS_HTTP.OK_200, [{ ...createdVideo, ...validUpdateVideoData }]);
  });

  it('Delete video with correct id', async () => {
    await getRequest().delete(`/videos/${createdVideo.id}`).expect(STATUS_HTTP.NO_CONTENT_204);
    await getRequest().get('/videos').expect(STATUS_HTTP.OK_200, []);
  });
});
