import { TokenService } from '../tokenService';
import { PrismaClient } from '@prisma/client';
import { ServiceFactory } from '../serviceFactory';

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

describe('TokenService', () => {
    let tokenService: TokenService;
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.USE_MOCK_DATA = 'false';

        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        tokenService = new TokenService();
        (tokenService as any).prisma = mockPrisma;
    });

    describe('getTokens', () => {
        it('should return mock tokens when mock data is enabled', async () => {
            const service = ServiceFactory.getTokenService(true);

            const result = await service.getTokens(['So11111111111111111111111111111111111111112']);

            console.log(result)

            expect(result[0].mint).toBe('So11111111111111111111111111111111111111112');
            expect(result[0].name).toBe('Wrapped SOL');
            expect(result[0].prices).toBeDefined();
        });

        it('should return tokens from database when USE_MOCK_DATA is false', async () => {
            const mockDbTokens = [{
                mint: 'test-mint',
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 9,
                logoURI: 'test-uri',
                tokenPrice: []
            }];

            (mockPrisma.token.findMany as jest.Mock).mockResolvedValueOnce(mockDbTokens);

            const result = await tokenService.getTokens(['test-mint']);

            expect(result).toEqual(mockDbTokens);
            expect(mockPrisma.token.findMany).toHaveBeenCalled();
        });
    });
}); 