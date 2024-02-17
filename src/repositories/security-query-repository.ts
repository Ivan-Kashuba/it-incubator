import { DeviceSessionDTO, DeviceSessionViewModel } from '../domain/auth/types/model/Auth';
import { sessionsCollection } from '../db/mongoDb';

export const securityQueryRepository = {
  async getUserSessionsListById(userId: string) {
    const dbUserSessions = await sessionsCollection.find({ userId }).toArray();

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
