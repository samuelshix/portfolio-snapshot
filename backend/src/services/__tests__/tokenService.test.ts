import { TokenService } from '../tokenService';
import { PrismaClient } from '@prisma/client';
import { ServiceFactory } from '../serviceFactory';
import { JupiterClient } from '@/clients/jupiterClient';
import { BirdeyeClient } from '@/clients/birdeyeClient';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => ({
        token: {
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn(),
            findUnique: jest.fn()
        },
        tokenPrice: {
            createMany: jest.fn()
        }
    }))
}));

// Mock clients
jest.mock('@/clients/jupiterClient', () => ({
    JupiterClient: jest.fn().mockImplementation(() => ({
        getAllTokens: jest.fn().mockResolvedValue([])
    }))
}));

jest.mock('@/clients/birdeyeClient', () => ({
    BirdeyeClient: jest.fn().mockImplementation(() => ({
        getHistoricalPrices: jest.fn().mockResolvedValue([])
    }))
}));

describe('TokenService', () => {
    let tokenService: TokenService;
    let mockPrisma: jest.Mocked<PrismaClient>;
    let mockJupiterClient: jest.Mocked<JupiterClient>;
    let mockBirdeyeClient: jest.Mocked<BirdeyeClient>;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.USE_MOCK_DATA = 'false';

        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        mockJupiterClient = new JupiterClient() as jest.Mocked<JupiterClient>;
        mockBirdeyeClient = new BirdeyeClient() as jest.Mocked<BirdeyeClient>;
        tokenService = new TokenService(mockJupiterClient, mockBirdeyeClient);
        (tokenService as any).prisma = mockPrisma;
    });

    describe('getTokens', () => {
        // it('should return mock tokens when mock data is enabled', async () => {
        //     const service = ServiceFactory.getTokenService(true);

        //     const result = await service.getTokens(['So11111111111111111111111111111111111111112']);

        //     console.log(result)

        //     expect(result[0].mint).toBe('So11111111111111111111111111111111111111112');
        //     expect(result[0].name).toBe('Wrapped SOL');
        // });

        it('should return tokens from database', async () => {
            const mockDbTokens = [{
                mint: 'test-mint',
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 9,
                logoURI: 'test-uri'
            }];
            const mockDbWithPrices = [{
                mint: 'test-mint',
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 9,
                logoURI: 'test-uri',
                tokenPrice: [{
                    date: new Date('2025-01-18T17:00:37.165Z'),
                    price: 100,
                    tokenMint: 'test-mint'
                }]
            }];
            (mockPrisma.token.findMany as jest.Mock)
                .mockResolvedValueOnce(mockDbTokens)  // First call
                .mockResolvedValueOnce(mockDbWithPrices); // Second call after price update

            const result = await tokenService.getTokens(['test-mint']);
            expect(result).toEqual(mockDbWithPrices);
        });

        it('should fetch and save new tokens from Jupiter when not in database', async () => {
            const jupiterToken = {
                mint: 'new-mint',
                name: 'New Token',
                symbol: 'NEW',
                decimals: 9,
                logoURI: 'new-uri'
            };

            const savedToken = {
                ...jupiterToken,
                tokenPrice: [{
                    date: new Date(),
                    price: 100,
                    tokenMint: 'new-mint'
                }]
            };

            (mockPrisma.token.findMany as jest.Mock)
                .mockResolvedValueOnce([])  // First call - no existing tokens
                .mockResolvedValueOnce([savedToken]); // After saving

            (mockJupiterClient.getAllTokens as jest.Mock)
                .mockResolvedValueOnce([jupiterToken]);

            const result = await tokenService.getTokens(['new-mint']);
            expect(result).toEqual([savedToken]);
            expect(mockJupiterClient.getAllTokens).toHaveBeenCalled();
        });

        it('should update prices for existing tokens', async () => {
            const existingToken = {
                mint: 'test-mint',
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 9,
                logoURI: 'test-uri',
                tokenPrice: []
            };

            const updatedToken = {
                ...existingToken,
                tokenPrice: [{
                    date: new Date(),
                    price: 100,
                    tokenMint: 'test-mint'
                }]
            };

            (mockPrisma.token.findMany as jest.Mock)
                .mockResolvedValueOnce([existingToken])
                .mockResolvedValueOnce([updatedToken]);

            const result = await tokenService.getTokens(['test-mint']);
            expect(result).toEqual([updatedToken]);
            expect(mockBirdeyeClient.getHistoricalPrices).toHaveBeenCalled();
        });

        it('should handle empty mints array', async () => {
            const result = await tokenService.getTokens([]);
            expect(result).toEqual([]);
            expect(mockJupiterClient.getAllTokens).not.toHaveBeenCalled();
        });
    });
}); 