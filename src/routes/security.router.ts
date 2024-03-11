import express from 'express';
import { container } from '../composition-root';
import { SecurityController } from '../controllers/security-controller';

export const securityRouter = express.Router();

const securityController = container.get(SecurityController);

securityRouter.get('/devices', securityController.getDevices);
securityRouter.delete('/devices', securityController.deleteAllButCurrentSessions);
securityRouter.delete('/devices/:deviceId', securityController.deleteSession);
