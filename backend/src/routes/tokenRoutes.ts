import { Router } from 'express';
import { tokenController } from '../controllers/tokenController';

const router = Router();

router.get('/token', tokenController.getToken.bind(tokenController));
router.post('/setToken', tokenController.setToken.bind(tokenController));

export default router; 