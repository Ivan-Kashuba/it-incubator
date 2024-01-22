import { UserTokenInfo } from '../../features/auth/types/model/Auth';

declare global {
  namespace Express {
    export interface Request {
      user: UserTokenInfo;
    }
  }
}
