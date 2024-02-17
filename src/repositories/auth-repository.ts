import { DeviceSessionDTO } from '../domain/auth/types/model/Auth';
import { sessionsCollection } from '../db/mongoDb';

export const authRepository = {
  async addUserSession(userSession: DeviceSessionDTO) {
    const { insertedId } = await sessionsCollection.insertOne(userSession);

    return !!insertedId;
  },

  async getSessionById(sessionId: string) {
    return await sessionsCollection.findOne({ _id: sessionId });
  },

  async getSessionByDeviceId(deviceId: string) {
    return await sessionsCollection.findOne({ deviceId });
  },

  async getUserSessionsList(userId: string) {
    return await sessionsCollection.find({ userId }).toArray();
  },

  async removeUserSession(sessionId: string) {
    const { deletedCount } = await sessionsCollection.deleteOne({ _id: sessionId });

    return deletedCount === 1;
  },

  async updateUserDeviceSession(sessionId: string, sessionToUpdate: Partial<DeviceSessionDTO>) {
    return await sessionsCollection.findOneAndUpdate({ _id: sessionId }, { $set: sessionToUpdate });
  },

  async removeAllButCurrentUserSession(userId: string, currentSessionId: string) {
    const deleteResult = await sessionsCollection.deleteMany({ userId: userId, _id: { $ne: currentSessionId } });
    return deleteResult.acknowledged;
  },
};
