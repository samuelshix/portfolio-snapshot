import { UserService } from '../userService';
import { PrismaClient } from '@prisma/client';
import { TokenService } from '../tokenService';
import { Cache } from '@/utils/cache';
import { RateLimiter } from '@/utils/rateLimiter';
import { heliusClient } from '@/clients/heliusClient';

// Mock dependencies
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => ({
        user: {
            findUnique: jest.fn(),
            create: jest.fn()
        },
        token: {
            findMany: jest.fn(),
            create: jest.fn()
        },
        tokenAccount: {
            upsert: jest.fn(() => Promise.resolve({
                id: 1,
                balance: 1.0,
                userAddress: 'test-address',
                tokenMint: 'found-token'
            }))
        }
    }))
}));

jest.mock('../tokenService');
jest.mock('@/utils/cache');
jest.mock('@/utils/rateLimiter');
jest.mock('@/clients/heliusClient');
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => ({
        user: {
            findUnique: jest.fn(),
            create: jest.fn()
        },
        tokenAccount: {
            upsert: jest.fn().mockImplementation(() => Promise.resolve({ id: 1, balance: 1.0 }))
        }
    }))
}));

describe('UserService', () => {
    let userService: UserService;
    let mockPrisma: jest.Mocked<PrismaClient>;
    let mockTokenService: jest.Mocked<TokenService>;
    let mockCache: jest.Mocked<Cache>;
    let mockRateLimiter: jest.Mocked<RateLimiter>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockPrisma = {
            user: {
                findUnique: jest.fn(),
                create: jest.fn()
            },
            tokenAccount: {
                upsert: jest.fn().mockReturnValue(Promise.resolve({
                    id: 1,
                    balance: 1.0,
                    userAddress: 'test-address',
                    tokenMint: 'found-token'
                }))
            }
        } as unknown as jest.Mocked<PrismaClient>;

        mockTokenService = new TokenService() as jest.Mocked<TokenService>;
        mockCache = new Cache() as jest.Mocked<Cache>;
        mockRateLimiter = new RateLimiter() as jest.Mocked<RateLimiter>;

        userService = new UserService(true);
        (userService as any).prisma = mockPrisma;
        (userService as any).tokenService = mockTokenService;
        (userService as any).cache = mockCache;
        (userService as any).rateLimiter = mockRateLimiter;
    });

    describe('syncUserTokens', () => {
        it('should return cached tokens if available', async () => {
            const cachedTokens = [{ id: 1, balance: 100 }];
            mockCache.get.mockResolvedValueOnce(cachedTokens);

            const result = await userService.syncUserTokens('test-address');

            expect(result).toEqual(cachedTokens);
            expect(mockCache.get).toHaveBeenCalledWith('user_tokens_test-address');
        });

        it('should sync tokens from Helius when no cache exists', async () => {
            mockCache.get.mockResolvedValueOnce(null);
            (heliusClient.getTokenBalances as jest.Mock).mockResolvedValueOnce({
                tokens: [{
                    mint: 'token-1',
                    amount: 1000000,
                    decimals: 6
                }]
            });
            mockRateLimiter.consume.mockResolvedValueOnce(true);
            mockTokenService.getTokens.mockResolvedValueOnce([{
                mint: 'token-1',
                name: 'token-1',
                symbol: 'token-1',
                decimals: 6,
                logoURI: 'token-1/URI.png',
                prices: []
            }]);
            (mockPrisma.tokenAccount.upsert as jest.Mock).mockResolvedValueOnce({ id: 1, balance: 1.0 });

            const result = await userService.syncUserTokens('test-address');

            expect(result).toEqual([{ id: 1, balance: 1.0 }]);
            expect(mockCache.set).toHaveBeenCalled();
        });

        it('should handle tokens not found in Jupiter gracefully', async () => {
            mockCache.get.mockResolvedValueOnce(null);
            (heliusClient.getTokenBalances as jest.Mock).mockResolvedValueOnce({
                tokens: [
                    {
                        mint: 'found-token',
                        amount: 1000000,
                        decimals: 6
                    },
                    {
                        mint: 'not-found-token',
                        amount: 2000000,
                        decimals: 6
                    }
                ]
            });

            mockRateLimiter.consume.mockResolvedValue(true);

            // Mock found token
            mockTokenService.getTokens
                .mockResolvedValueOnce([{
                    mint: 'found-token',
                    name: 'Found Token',
                    symbol: 'FT',
                    decimals: 6,
                    logoURI: 'found-token/URI.png',
                    prices: []
                }]);

            // Mock not found token
            mockTokenService.getTokens
                .mockResolvedValueOnce([]);

            (mockPrisma.tokenAccount.upsert as jest.Mock).mockResolvedValueOnce({
                id: 1,
                balance: 1.0,
                userAddress: 'test-address',
                tokenMint: 'found-token'
            });

            const result = await userService.syncUserTokens('test-address') as any[];

            expect(result).toHaveLength(1);
            expect(result[0].tokenMint).toBe('found-token');
            expect(mockCache.set).toHaveBeenCalled();
        });
    });

    describe('getUser', () => {
        it('should return user if found', async () => {
            const mockUser = { address: 'test-address', tokenAccounts: [] };
            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

            const result = await userService.getUser('test-address');

            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

            const result = await userService.getUser('test-address');

            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('should create and return new user', async () => {
            const mockUser = { address: 'test-address' };
            (mockPrisma.user.create as jest.Mock).mockResolvedValueOnce(mockUser);

            const result = await userService.createUser('test-address');

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: { address: 'test-address' }
            });
        });
    });

    describe('getUserWithTokens', () => {
        it('should return existing user with synced tokens', async () => {
            const mockUser = { address: 'test-address', tokenAccounts: [] };
            const mockTokens = [{ id: 1, balance: 100 }];

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
            jest.spyOn(userService, 'syncUserTokens').mockResolvedValueOnce(mockTokens);

            const result = await userService.getUserWithTokens('test-address');

            expect(result).toEqual({
                ...mockUser,
                tokenAccounts: mockTokens
            });
        });

        it('should create new user if not found', async () => {
            const mockUser = { address: 'test-address', tokenAccounts: [] };
            const mockTokens = [{ id: 1, balance: 100 }];

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
            (mockPrisma.user.create as jest.Mock).mockResolvedValueOnce(mockUser);
            jest.spyOn(userService, 'syncUserTokens').mockResolvedValueOnce(mockTokens);

            const result = await userService.getUserWithTokens('test-address');

            expect(result).toEqual({
                ...mockUser,
                tokenAccounts: mockTokens
            });
        });
    });
}); 