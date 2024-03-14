import { DeviceSessionDTO, DeviceSessionViewModel } from '../domain/auth/types/model/Auth';
import { SessionModel } from '../domain/auth/scheme/sessions';
import { injectable } from 'inversify';
@injectable()
export class SecurityQueryRepository {
  async getUserSessionsListById(userId: string) {
    const dbUserSessions = await SessionModel.find({ userId });

    return dbUserSessions.map(this._mapDbSessionsToView);
  }

  private _mapDbSessionsToView(dbUserSession: DeviceSessionDTO): DeviceSessionViewModel {
    return {
      ip: dbUserSession.ip,
      deviceId: dbUserSession.deviceId,
      title: dbUserSession.title,
      lastActiveDate: dbUserSession.lastActiveDate,
    };
  }
}
