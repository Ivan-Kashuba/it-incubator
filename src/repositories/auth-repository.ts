import { DeviceSessionDTO } from '../domain/auth/types/model/Auth';
import { SessionModel } from '../db/schemes/sessions';

export class AuthRepository {
  async addUserSession(userSession: DeviceSessionDTO) {
    const { _id } = await SessionModel.create(userSession);

    return !!_id;
  }

  async getSessionByDeviceId(deviceId: string) {
    return SessionModel.findOne({ deviceId });
  }

  async getUserSessionsList(userId: string) {
    return SessionModel.find({ userId });
  }

  async removeUserSession(sessionId: string) {
    const { deletedCount } = await SessionModel.deleteOne({ _id: sessionId });

    return deletedCount === 1;
  }

  async updateUserDeviceSession(sessionId: string, sessionToUpdate: Partial<DeviceSessionDTO>) {
    return SessionModel.findOneAndUpdate({ _id: sessionId }, { $set: sessionToUpdate });
  }

  async removeAllButCurrentUserSession(userId: string, currentSessionId: string) {
    const deleteResult = await SessionModel.deleteMany({ userId: userId, _id: { $ne: currentSessionId } });
    return deleteResult.acknowledged;
  }
}

export const authRepository = new AuthRepository();
