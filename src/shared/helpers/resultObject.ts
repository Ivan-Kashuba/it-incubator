import { STATUS_HTTP } from '../types/index';
import { Error, ErrorResponse } from '../types/Error';

export enum RESULT_CODES {
  'Success' = 0,
  'Success_no_content' = 1,
  'Forbidden' = 2,
  'Not_found' = 3,
  'Bad_request' = 4,
  'Db_problem' = 5,
}

const RESULT_CODES_TO_HTTP: Record<RESULT_CODES, STATUS_HTTP> = {
  [RESULT_CODES.Success]: STATUS_HTTP.OK_200,
  [RESULT_CODES.Success_no_content]: STATUS_HTTP.NO_CONTENT_204,
  [RESULT_CODES.Forbidden]: STATUS_HTTP.FORBIDDEN_403,
  [RESULT_CODES.Not_found]: STATUS_HTTP.NOT_FOUND_404,
  [RESULT_CODES.Bad_request]: STATUS_HTTP.BAD_REQUEST_400,
  [RESULT_CODES.Db_problem]: STATUS_HTTP.NOT_IMPLEMENTED_501,
};

export type Result<T> = {
  resultCode: RESULT_CODES;
  data?: T;
  errorMessage?: string;
};

type ResultToHttpResponse<T> = {
  body?: T;
  statusCode: STATUS_HTTP;
};

export const ResultService = {
  createResult<T>(resultCode: RESULT_CODES, errorMessage?: string, data?: T): Result<T> {
    return { data, errorMessage, resultCode };
  },

  mapResultToHttpResponse(result: Result<any>): ResultToHttpResponse<any> {
    return {
      statusCode: RESULT_CODES_TO_HTTP[result.resultCode],
      body: result.data ? result.data : result.errorMessage,
    };
  },
};
