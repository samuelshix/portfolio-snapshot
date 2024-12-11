import axios from 'axios';
import { HeliusBalancesResponse } from '../types/heliusBalancesResponse';

const HELIUS_URL = 'https://api.helius.xyz/v0';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

export class HeliusClient {
    private static instance: HeliusClient;
    private readonly axiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: HELIUS_URL,
            params: {
                'api-key': HELIUS_API_KEY
            }
        });
    }

    static getInstance(): HeliusClient {
        if (!HeliusClient.instance) {
            HeliusClient.instance = new HeliusClient();
        }
        return HeliusClient.instance;
    }

    async getTokenBalances(walletAddress: string): Promise<HeliusBalancesResponse> {
        try {
            const { data } = await this.axiosInstance.get<HeliusBalancesResponse>(
                `/addresses/${walletAddress}/balances`
            );
            return data;
        } catch (error) {
            console.error('HeliusClient - Error fetching token balances:', error);
            throw new Error('Failed to fetch token balances from Helius');
        }
    }
}

export const heliusClient = HeliusClient.getInstance();