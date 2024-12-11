import { RequestHandler } from 'express';
import { tokenAccountService } from '../services/tokenAccountService';

export class TokenAccountController {
    getBalances: RequestHandler = async (req, res) => {
        try {
            const { publicKey } = req.query;

            if (!publicKey || typeof publicKey !== 'string') {
                res.status(400).json({ message: 'Public key is required' });
                return;
            }

            const tokenAccounts = await tokenAccountService.getUserTokenBalances(publicKey);
            res.json({ tokenAccounts });
        } catch (error) {
            console.error('Error in getBalances:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    createTokenAccount: RequestHandler = async (req, res) => {
        try {
            const { userAddress, tokenMint, balance } = req.body;

            if (!userAddress || !tokenMint || balance === undefined) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            const tokenAccount = await tokenAccountService.saveTokenAccount({
                userAddress,
                tokenMint,
                balance
            });

            res.status(201).json(tokenAccount);
        } catch (error) {
            console.error('Error in createTokenAccount:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
}

export const tokenAccountController = new TokenAccountController();