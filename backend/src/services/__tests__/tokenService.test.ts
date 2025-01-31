import { TokenService } from '../tokenService';
import { PrismaClient } from '@prisma/client';
import { JupiterClient } from '@/clients/jupiterClient';
import { BirdeyeClient } from '@/clients/birdeyeClient';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        token: {
            findMany: jest.fn(),
            create: jest.fn(),
            upsert: jest.fn(),
        },
        tokenPrice: {
            findMany: jest.fn(),
            createMany: jest.fn(),
        },
    })),
}));

// Mock clients
jest.mock('@/clients/jupiterClient', () => ({
    JupiterClient: jest.fn().mockImplementation(() => ({
        getAllTokens: jest.fn().mockResolvedValue([]),
    })),
}));

jest.mock('@/clients/birdeyeClient', () => ({
    BirdeyeClient: jest.fn().mockImplementation(() => ({
        getHistoricalPrices: jest.fn().mockResolvedValue([]),
    })),
}));

describe('TokenService', () => {
    let tokenService: TokenService;
    let mockPrisma: jest.Mocked<PrismaClient>;
    let mockJupiterClient: jest.Mocked<JupiterClient>;
    let mockBirdeyeClient: jest.Mocked<BirdeyeClient>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        mockJupiterClient = new JupiterClient() as jest.Mocked<JupiterClient>;
        mockBirdeyeClient = new BirdeyeClient() as jest.Mocked<BirdeyeClient>;

        tokenService = new TokenService(mockJupiterClient, mockBirdeyeClient);
        (tokenService as any).prisma = mockPrisma;
    });

    describe('getTokens', () => {
        it('should return tokens from database when they exist', async () => {
            const fetchTokenDataSpy = jest.spyOn(tokenService, 'getHistoricalTokenPrices');
            fetchTokenDataSpy.mockResolvedValueOnce([]);
            const mockDbTokens = [{
                mint: 'test-mint',
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 9,
                logoURI: 'test-uri',
                tokenPrice: []
            }];

            (mockPrisma.token.findMany as jest.Mock).mockResolvedValue(mockDbTokens);

            const result = await tokenService.getTokens(['test-mint']);

            expect(result).toEqual(mockDbTokens);
            expect(mockPrisma.token.findMany).toHaveBeenCalled();
            expect(mockJupiterClient.getAllTokens).not.toHaveBeenCalled();
        });

        it('should fetch missing tokens from Jupiter', async () => {
            const fetchTokenDataSpy = jest.spyOn(tokenService, 'getHistoricalTokenPrices');
            fetchTokenDataSpy.mockResolvedValueOnce([]);
            const jupiterToken = {
                mint: 'new-mint',
                name: 'New Token',
                symbol: 'NEW',
                decimals: 9,
                logoURI: 'new-uri',
                prices: []
            };
            // first call to findMany should return empty array
            (mockPrisma.token.findMany as jest.Mock).mockResolvedValueOnce([]);
            // second call to findMany should return the new token
            (mockPrisma.token.findMany as jest.Mock).mockResolvedValueOnce([
                {
                    mint: 'new-mint',
                    name: 'New Token',
                    symbol: 'NEW',
                    decimals: 9,
                    logoURI: 'new-uri',
                    prices: []
                }
            ]);
            (mockJupiterClient.getAllTokens as jest.Mock).mockResolvedValueOnce([jupiterToken]);
            const result = await tokenService.getTokens(['new-mint']);

            expect(result).toHaveLength(1);
            expect(mockJupiterClient.getAllTokens).toHaveBeenCalled();
        });

        it('should only save new prices for missing days', async () => {
            const existingPrices = [
                { timestamp: new Date('2025-01-01T00:00:00.000Z'), price: 100, tokenMint: 'test-mint' },
            ];

            const birdeyePrices = [
                { date: '2025-01-01T00:00:00.000Z', price: 100 },
                { date: '2025-01-02T00:00:00.000Z', price: 115 }
            ];

            const newPrices = [
                { timestamp: new Date('2025-01-01T00:00:00.000Z'), price: 100, tokenMint: 'test-mint' },
                { timestamp: new Date('2025-01-02T00:00:00.000Z'), price: 115, tokenMint: 'test-mint' },
            ];

            (mockPrisma.tokenPrice.findMany as jest.Mock).mockResolvedValueOnce(existingPrices);
            (mockBirdeyeClient.getHistoricalPrices as jest.Mock).mockResolvedValueOnce(birdeyePrices);
            (mockPrisma.tokenPrice.findMany as jest.Mock).mockResolvedValueOnce(newPrices);

            await tokenService.getHistoricalTokenPrices({ mint: 'test-mint', symbol: 'TEST', name: 'Test Token', decimals: 9, logoURI: 'test-uri' }, 30);

            expect(mockPrisma.tokenPrice.createMany).toHaveBeenCalledWith({
                data: [
                    { tokenMint: 'test-mint', timestamp: new Date('2025-01-02T00:00:00.000Z'), price: 115 },
                ],
                skipDuplicates: true,
            });
        });
    });
}); 