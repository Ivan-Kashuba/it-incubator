import { UserTokenInfo } from '../../domain/auth/types/model/Auth';

declare global {
  namespace Express {
    export interface Request {
      user: UserTokenInfo;
    }
  }
}
