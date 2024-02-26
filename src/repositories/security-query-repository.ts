import { DeviceSessionDTO, DeviceSessionViewModel } from '../domain/auth/types/model/Auth';
import { SessionModel } from '../db/schemes/sessions';

export const securityQueryRepository = {
  async getUserSessionsListById(userId: string) {
    const dbUserSessions = await SessionModel.find({ userId });

    return dbUserSessions.map(this._mapDbSessionsToView);
  },

  _mapDbSessionsToView(dbUserSession: DeviceSessionDTO): DeviceSessionViewModel {
    return {
      ip: dbUserSession.ip,
      deviceId: dbUserSession.deviceId,
      title: dbUserSession.title,
      lastActiveDate: dbUserSession.lastActiveDate,
    };
  },
};
