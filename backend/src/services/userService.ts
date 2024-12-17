import { PrismaClient, User } from '@prisma/client';
import { TokenService } from './tokenService';
import { heliusClient } from '@/clients/heliusClient';
import { Cache } from '@/utils/cache';
import { RateLimiter } from '@/utils/rateLimiter';

export class UserService {
    private prisma: PrismaClient;
    private tokenService: TokenService;
    private cache: Cache;
    private rateLimiter: RateLimiter;

    constructor() {
        this.prisma = new PrismaClient();
        this.tokenService = new TokenService();
        this.cache = new Cache();
        this.rateLimiter = new RateLimiter();
    }

    async syncUserTokens(address: string) {
        try {
            if (!address || typeof address !== 'string') {
                throw new Error('Invalid address');
            }

            const cacheKey = `user_tokens_${address}`;
            const cached = await this.cache.get(cacheKey);
            if (cached) return cached;

            const { tokens: heliusTokens } = await heliusClient.getTokenBalances(address);

            const validTokens = heliusTokens.filter(token =>
                token.amount > 0 &&
                typeof token.decimals === 'number' &&
                token.decimals >= 0 &&
                token.decimals <= 32
            );

            const tokenAccounts = await Promise.all(
                validTokens.map(async (heliusToken) => {
                    let retries = 3;
                    while (retries > 0) {
                        const canProceed = await this.rateLimiter.consume(address);
                        if (canProceed) {
                            try {
                                const token = await this.tokenService.getToken(heliusToken.mint);
                                if (!token) {
                                    throw new Error(`Token ${heliusToken.mint} not found`);
                                }

                                const balance = heliusToken.amount / Math.pow(10, heliusToken.decimals);
                                if (isNaN(balance) || !isFinite(balance)) {
                                    throw new Error(`Invalid balance calculation for token ${heliusToken.mint}`);
                                }

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
                            } catch (error) {
                                console.error(`Error processing token ${heliusToken.mint}:`, error);
                                retries--;
                                if (retries === 0) {
                                    console.error(`Failed to process token ${heliusToken.mint} after all retries`);
                                    return null;
                                }
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                continue;
                            }
                        }

                        const delay = await this.rateLimiter.getDelay(address);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                    return null;
                })
            );

            const validTokenAccounts = tokenAccounts.filter((account): account is NonNullable<typeof account> =>
                account !== null
            );

            await this.cache.set(cacheKey, validTokenAccounts, 60);
            return validTokenAccounts;
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

export const userService = new UserService(); 