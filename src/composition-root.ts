import { JwtService } from './application/jwtService';
import { AuthService } from './domain/auth/services/auth-service';
import { UsersRepository } from './repositories/users-repository';
import { AuthRepository } from './repositories/auth-repository';
import { AuthController } from './controllers/auth-controller';

const jwtService = new JwtService();
const usersRepository = new UsersRepository();
const authService = new AuthService(usersRepository);
const authRepository = new AuthRepository();
export const authController = new AuthController(authService, authRepository, usersRepository, jwtService);
