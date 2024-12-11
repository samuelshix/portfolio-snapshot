import { PrismaClient, User } from '@prisma/client';
import { TokenService } from './tokenService';
import { heliusClient } from '../clients/heliusClient';

export class UserService {
    private prisma: PrismaClient;
    private tokenService: TokenService;

    constructor() {
        this.prisma = new PrismaClient();
        this.tokenService = new TokenService();
    }

    async syncUserTokens(address: string) {
        try {
            // 1. Get token balances from Helius
            const { tokens: heliusTokens } = await heliusClient.getTokenBalances(address);

            // 2. Process each token
            const tokenAccounts = await Promise.all(heliusTokens.map(async (heliusToken) => {
                // Get or create token with Jupiter data
                await this.tokenService.getToken(heliusToken.mint);

                // Create or update token account
                const tokenAccount = await this.prisma.tokenAccount.upsert({
                    where: {
                        userAddress_tokenMint: {
                            userAddress: address,
                            tokenMint: heliusToken.mint
                        }
                    },
                    create: {
                        userAddress: address,
                        tokenMint: heliusToken.mint,
                        balance: heliusToken.amount / Math.pow(10, heliusToken.decimals)
                    },
                    update: {
                        balance: heliusToken.amount / Math.pow(10, heliusToken.decimals)
                    }
                });

                return tokenAccount;
            }));

            return tokenAccounts;
        } catch (error) {
            console.error('Error syncing user tokens:', error);
            throw error;
        }
    }

    async getUser(address: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { address },
            include: { tokenAccounts: true }
        });
    }

    async createUser(address: string): Promise<User> {
        return await this.prisma.user.create({
            data: { address }
        });
    }

    async getUserWithTokens(address: string) {
        let user = await this.getUser(address);

        if (!user) {
            user = await this.createUser(address);
        }

        const tokenAccounts = await this.syncUserTokens(address);

        return {
            ...user,
            tokenAccounts
        };
    }
}

export const userService = new UserService(); 