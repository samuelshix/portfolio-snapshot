import { UserService } from '../userService';
import { PrismaClient } from '@prisma/client';
import { TokenService } from '../tokenService';
import { Cache } from '../../utils/cache';
import { HeliusClient } from '../../clients/heliusClient';
import { HeliusBalancesResponse } from '../../types/heliusBalancesResponse';
import { BirdeyeClient } from '../../clients/birdeyeClient';
import { JupiterClient } from '../../clients/jupiterClient';
import { ServiceFactory } from '../serviceFactory';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        user: {
            findUnique: jest.fn(),
            create: jest.fn()
        },
        tokenAccount: {
            upsert: jest.fn()
        }
    }))
}));

jest.mock('@/utils/cache');
jest.mock('@/clients/heliusClient');

describe('UserService', () => {
    let userService: UserService;
    let mockPrisma: jest.Mocked<PrismaClient>;
    let mockTokenService: jest.Mocked<TokenService>;
    let mockCache: jest.Mocked<Cache>;
    let mockHeliusClient: jest.Mocked<HeliusClient>;
    let mockJupiterClient: JupiterClient;
    let mockBirdeyeClient: BirdeyeClient;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.USE_MOCK_DATA = 'true';

        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        mockTokenService = {
            getTokens: jest.fn()
        } as unknown as jest.Mocked<TokenService>;

        mockCache = {
            get: jest.fn().mockResolvedValue(null as any[] | null),
            set: jest.fn()
        } as unknown as jest.Mocked<Cache>;

        mockHeliusClient = {
            getTokenBalances: jest.fn()
        } as unknown as jest.Mocked<HeliusClient>;

        userService = new UserService();
        // mockJupiterClient = new JupiterClient() as jest.Mocked<JupiterClient>;
        // mockBirdeyeClient = new BirdeyeClient() as jest.Mocked<BirdeyeClient>;
        (userService as any).prisma = mockPrisma;
        (userService as any).tokenService = mockTokenService;
        (userService as any).heliusClient = mockHeliusClient;
        (userService as any).cache = mockCache;
        // (userService as any).heliusClient = mockHeliusClient;
    });

    describe('getUser', () => {
        it('should return user if found', async () => {
            const mockUser = { address: 'test-address' };
            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getUser('test-address');
            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await userService.getUser('test-address');
            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const mockUser = { address: 'test-address' };
            (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.createUser('test-address');
            expect(result).toEqual(mockUser);
        });
    });

    describe('syncUserTokens', () => {
        // it('should return cached tokens if available', async () => {
        //     const cachedTokens = [{ id: 1, balance: 1.0 }];
        //     mockCache.get.mockResolvedValue(cachedTokens);

        //     const result = await userService.syncUserTokens('test-address');
        //     expect(result).toEqual(cachedTokens);
        // });

        it('should sync tokens from Helius when no cache exists', async () => {
            const mockTokenAccount = {
                id: 1,
                userAddress: 'test-address',
                balance: 1.0,
                tokenMint: 'token-1',
                token: {
                    mint: 'token-1',
                    name: 'Token 1',
                    symbol: 'TK1',
                    decimals: 6,
                    logoURI: 'token-1/URI.png'
                }
            };

            mockCache.get.mockResolvedValue(null as any);

            mockHeliusClient.getTokenBalances.mockResolvedValue({
                tokens: [{
                    mint: 'token-1',
                    amount: 1000000,
                    decimals: 6
                }],
                nativeBalance: 0
            });

            mockTokenService.getTokens.mockResolvedValue([{
                mint: 'token-1',
                name: 'Token 1',
                symbol: 'TK1',
                decimals: 6,
                logoURI: 'token-1/URI.png',
            }]);

            (mockPrisma.tokenAccount.upsert as jest.Mock).mockResolvedValue(mockTokenAccount);

            const result = await userService.syncUserTokens('test-address');

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockTokenAccount);
            expect(mockCache.set).toHaveBeenCalledWith(
                'user_tokens_test-address',
                [mockTokenAccount],
                3600
            );
        });
    });

    describe('getUserWithTokens', () => {
        it('should return user with tokens', async () => {
            const mockUser = { address: 'test-address' };
            const mockTokens = [{ id: 1, balance: 1.0, tokenMint: 'token-1', userAddress: 'test-address' }];
            const userServiceSpy = jest.spyOn(userService, 'syncUserTokens');

            userServiceSpy.mockResolvedValue(mockTokens);
            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            mockCache.get.mockResolvedValue(mockTokens);

            const result = await userService.getUserWithTokens('test-address');
            expect(mockPrisma.user.create).not.toHaveBeenCalled();
            expect(result).toEqual({
                ...mockUser,
                tokenAccounts: mockTokens
            });
        });

        it('should create user if not found', async () => {
            const mockUser = { address: 'test-address' };
            const mockTokens = [{ id: 1, balance: 1.0, tokenMint: 'token-1', userAddress: 'test-address' }];
            const userServiceSpy = jest.spyOn(userService, 'syncUserTokens');

            userServiceSpy.mockResolvedValue(mockTokens);
            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getUserWithTokens('test-address');

            expect(mockPrisma.user.create).toHaveBeenCalled();
            expect(result).toEqual({
                ...mockUser,
                tokenAccounts: mockTokens
            });
        });
    });
});
