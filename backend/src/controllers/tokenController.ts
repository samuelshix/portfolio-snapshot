import { RequestHandler } from 'express';
import { tokenService } from '../services/tokenService';

export class TokenController {
    getToken: RequestHandler = async (req, res) => {
        try {
            const { mint } = req.query;
            if (!mint || typeof mint !== 'string') {
                res.status(400).json({ message: 'Mint address is required' });
                return;
            }
            const token = await tokenService.getToken(mint);
            res.json(token);
        } catch (error) {
            console.error('Error in getToken:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    setToken: RequestHandler = async (req, res) => {
        try {
            const token = await tokenService.saveToken(req.body);
            res.status(201).json(token);
        } catch (error) {
            console.error('Error in setToken:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
}

export const tokenController = new TokenController();