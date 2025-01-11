import { TokenService } from '../tokenService';
import { PrismaClient } from '@prisma/client';
import { BirdeyeClient } from '@/clients/birdeyeClient';
import axios from 'axios';

// Mock dependencies
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        token: {
            findUnique: jest.fn(),
            create: jest.fn()
        }
    }))
}));

jest.mock('@/clients/birdeyeClient');
jest.mock('axios');

describe('TokenService', () => {
    let tokenService: TokenService;
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        // Inject the mock into the service
        tokenService = new TokenService();
        (tokenService as any).prisma = mockPrisma;
    });

    describe('getToken', () => {
        it('should return existing token from database if found', async () => {
            const mockToken = {
                mint: 'test-mint',
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 9,
                logoURI: 'test-uri',
                tokenPrice: []
            };

            (mockPrisma.token.findUnique as jest.Mock).mockResolvedValueOnce(mockToken);

            const result = await tokenService.getTokens(['test-mint']);

            expect(result).toEqual({
                ...mockToken,
                prices: []
            });
        });

        it('should fetch and save new token if not found in database', async () => {
            const mockJupiterToken = {
                mint: 'new-mint',
                name: 'New Token',
                symbol: 'NEW',
                decimals: 9,
                logoURI: 'new-uri'
            };

            (mockPrisma.token.findUnique as jest.Mock).mockResolvedValueOnce(null);
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: [mockJupiterToken] });
            (mockPrisma.token.create as jest.Mock).mockResolvedValueOnce(mockJupiterToken);

            const result = await tokenService.getTokens(['new-mint']);

            expect(result).toEqual([{
                ...mockJupiterToken,
                prices: []
            }]);
        });
    });
}); 