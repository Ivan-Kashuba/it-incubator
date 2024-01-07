import { VideoResolution } from '../types/model/Video';
import { checkSchema, Schema } from 'express-validator';

const createVideoModelValidationSchema: Schema = {
  title: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'Title is required',
    },
    isLength: {
      options: { min: 1, max: 40 },
      errorMessage: 'Title length should be from 1 to 40',
    },
  },
  author: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'Author is required',
    },
    isLength: {
      options: { min: 1, max: 20 },
      errorMessage: 'Author length should be from 1 to 20',
    },
  },
  availableResolutions: {
    optional: true,
    isArray: {
      errorMessage: 'availableResolutions must be an array',
    },
    custom: {
      options: (availableResolutions: VideoResolution[]) => {
        return availableResolutions?.every((resolution) => {
          return Object.values(VideoResolution).includes(resolution);
        });
      },
      errorMessage: 'Unsupported formats',
    },
  },
};
export const createVideoModelValidation = checkSchema(createVideoModelValidationSchema);

const updateVideoModelValidationSchema: Schema = {
  title: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'Title is required',
    },
    isLength: {
      options: { min: 1, max: 40 },
      errorMessage: 'Title length should be from 1 to 40',
    },
  },
  author: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'Author is required',
    },
    isLength: {
      options: { min: 1, max: 20 },
      errorMessage: 'Author length should be from 1 to 20',
    },
  },
  availableResolutions: {
    optional: true,
    isArray: {
      errorMessage: 'availableResolutions must be an array',
    },
    custom: {
      options: (availableResolutions: VideoResolution[]) => {
        return availableResolutions?.every((resolution) => {
          return Object.values(VideoResolution).includes(resolution);
        });
      },
      errorMessage: 'Unsupported formats',
    },
  },
  canBeDownloaded: {
    optional: true,
    isBoolean: {
      errorMessage: 'Must be boolean',
    },
  },
  minAgeRestriction: {
    optional: {
      options: {
        values: 'null',
      },
    },
    isInt: {
      errorMessage: 'Must be Integer',
    },
    isLength: {
      options: { min: 1, max: 18 },
      errorMessage: 'Length should be from 1 to 18',
    },
  },
  publicationDate: {
    optional: true,

    isISO8601: {
      errorMessage: 'Must be ISO string',
    },
  },
};

export const updateVideoModelValidation = checkSchema(updateVideoModelValidationSchema);
