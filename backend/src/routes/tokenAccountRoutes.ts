import { tokenAccountController } from '@/controllers/tokenAccountController';
import express from 'express';

const router = express.Router();

router.post('/createTokenAccount', tokenAccountController.createTokenAccount.bind(tokenAccountController));
router.get('/getBalances', tokenAccountController.getBalances.bind(tokenAccountController));

export default router; 