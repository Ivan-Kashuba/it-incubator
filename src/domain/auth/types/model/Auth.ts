export interface AuthModel {
  loginOrEmail: string;
  password: string;
}

export interface UserTokenInfo {
  email: string;
  login: string;
  userId: string;
  deviceId: string;
}

export interface DeviceSessionDTO {
  _id: string;
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}
export interface DeviceSessionViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

export interface PasswordRecoveryInputModel {
  recoveryCode: string;
  newPassword: string;
}
