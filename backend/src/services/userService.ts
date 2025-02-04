import { PrismaClient, TokenAccount, User } from '@prisma/client';
import { TokenService } from './tokenService';
import { heliusClient } from '../clients/heliusClient';
import { Cache } from '../utils/cache';
import { RateLimiter } from '../utils/rateLimiter';
import { ServiceFactory } from './serviceFactory';

export class UserService {
    private prisma: PrismaClient;
    private tokenService: TokenService;
    private cache: Cache;
    private heliusClient;

    constructor(useMockData: boolean) {
        this.prisma = new PrismaClient();
        this.tokenService = ServiceFactory.getTokenService(useMockData);
        this.heliusClient = ServiceFactory.getHeliusClient(useMockData);
        this.cache = new Cache();
    }

    async syncUserTokens(address: string): Promise<TokenAccount[]> {
        // Check cache first
        // const cachedTokens = await this.cache.get<TokenAccount[]>(`user_tokens_${address}`);
        // TODO: uncomment this when we have caching
        // if (cachedTokens) {
        //     return cachedTokens;
        // }

        try {
            const { tokens: heliusTokens } = await this.heliusClient.getTokenBalances(address);
            const validTokenAccounts = heliusTokens.filter(token =>
                token.amount > 0 && token.decimals !== undefined
            );

            // Get token metadata for all tokens at once
            const tokenWithPrices = await this.tokenService.getTokens(
                validTokenAccounts.map(token => token.mint)
            );

            // Process each token account with retries
            const tokenAccounts = await Promise.all(
                validTokenAccounts
                    .filter(heliusToken => tokenWithPrices.some(token => token.mint === heliusToken.mint))
                    .map(async (heliusToken) => {
                        const balance = heliusToken.amount / Math.pow(10, heliusToken.decimals);
                        return this.prisma.tokenAccount.upsert({
                            where: {
                                userAddress_tokenMint: {
                                    userAddress: address,
                                    tokenMint: heliusToken.mint
                                }
                            },
                            create: {
                                userAddress: address,
                                tokenMint: heliusToken.mint,
                                balance
                            },
                            update: {
                                balance
                            },
                            include: {
                                token: {
                                    include: {
                                        tokenPrice: true
                                    }
                                }
                            }
                        });
                    })
            );

            await this.cache.set(`user_tokens_${address}`, tokenAccounts, 3600);
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
        try {
            let user = await this.getUser(address);

            if (!user) {
                user = await this.createUser(address);
            }

            const tokenAccounts = await this.syncUserTokens(address);

            return {
                ...user,
                tokenAccounts: tokenAccounts || []
            };
        } catch (error) {
            console.error('Error getting user with tokens:', error);
            throw error;
        }
    }
}