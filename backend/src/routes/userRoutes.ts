import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

router.get('/', userController.getUser.bind(userController));
router.post('/newUser', userController.createUserIfNotExists.bind(userController));

export default router; 