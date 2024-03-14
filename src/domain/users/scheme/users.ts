import mongoose from 'mongoose';
import { UserDbModel } from '../types/model/UsersModels';

export const UsersSchema = new mongoose.Schema<UserDbModel>({
  id: { type: String, require: true },
  accountData: {
    login: { type: String, require: true },
    email: { type: String, require: true },
    createdAt: { type: String, require: true },
    salt: { type: String, require: true },
    hash: { type: String, require: true },
  },
  accountConfirmation: {
    confirmationCode: String,
    expirationDate: String,
    isConfirmed: Boolean,
  },
  passwordRecovery: {
    confirmationCode: String,
    expirationDate: String,
  },
});
export const UserModel = mongoose.model<UserDbModel>('users', UsersSchema);
