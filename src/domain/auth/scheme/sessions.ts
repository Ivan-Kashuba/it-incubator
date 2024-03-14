import mongoose from 'mongoose';
import { DeviceSessionDTO } from '../types/model/Auth';

export const SessionSchema = new mongoose.Schema<DeviceSessionDTO>({
  userId: { type: String, require: true },
  ip: { type: String, require: true },
  title: { type: String, require: true },
  lastActiveDate: { type: String, required: true },
  deviceId: { type: String, required: true },
});
export const SessionModel = mongoose.model<DeviceSessionDTO>('sessions', SessionSchema);
