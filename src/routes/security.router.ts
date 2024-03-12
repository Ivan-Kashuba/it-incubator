import express from 'express';
import { container } from '../composition-root';
import { SecurityController } from '../controllers/security-controller';

export const securityRouter = express.Router();

const securityController = container.get(SecurityController);

securityRouter.get('/devices', securityController.getDevices.bind(securityController));
securityRouter.delete('/devices', securityController.deleteAllButCurrentSessions.bind(securityController));
securityRouter.delete('/devices/:deviceId', securityController.deleteSession.bind(securityController));
