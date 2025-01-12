import { Request, Response, RequestHandler } from 'express';
import { UserService } from '../services/userService';

export class UserController {
    private userService: UserService;

    constructor() {
        const useMockData = process.env.USE_MOCK_DATA === 'true';
        this.userService = new UserService(useMockData);
    }

    getUser: RequestHandler = async (req, res) => {
        try {
            const { address } = req.query;

            if (!address || typeof address !== 'string') {
                res.status(400).json({ message: 'Address is required' });
                return;
            }

            const userWithTokens = await this.userService.getUserWithTokens(address);
            res.json(userWithTokens);
        } catch (error) {
            console.error('Error in getUser:', error);
            res.status(500).json({
                message: error instanceof Error ? error.message : 'Server Error'
            });
        }
    }

    createUserIfNotExists: RequestHandler = async (req, res) => {
        try {
            const { address } = req.body;

            if (!address) {
                res.status(400).json({ message: 'Address is required' });
                return;
            }

            let user = await this.userService.getUser(address);

            if (!user) {
                user = await this.userService.createUser(address);
            }

            res.status(201).json(user);
            return;
        } catch (error) {
            console.error('Error in createUserIfNotExists:', error);
            res.status(500).json({
                message: error instanceof Error ? error.message : 'Server Error'
            });
            return;
        }
    }
}

export const userController = new UserController();