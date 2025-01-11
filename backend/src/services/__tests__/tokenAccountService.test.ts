import { TokenAccountService } from '../tokenAccountService';
import { PrismaClient } from '@prisma/client';
import { HeliusClient } from '@/clients/heliusClient';

// Mock dependencies
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        tokenAccount: {
            findFirst: jest.fn(),
            create: jest.fn()
        }
    }))
}));

jest.mock('@/clients/heliusClient', () => ({
    HeliusClient: jest.fn().mockImplementation(() => ({
        getTokenBalances: jest.fn()
    })),
    heliusClient: {
        getTokenBalances: jest.fn()
    }
}));

describe('TokenAccountService', () => {
    let tokenAccountService: TokenAccountService;
    let mockPrisma: jest.Mocked<PrismaClient>;
    let mockHeliusClient: jest.Mocked<HeliusClient>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        mockHeliusClient = new HeliusClient() as jest.Mocked<HeliusClient>;

        tokenAccountService = new TokenAccountService();
        (tokenAccountService as any).prisma = mockPrisma;
        (tokenAccountService as any).heliusClient = mockHeliusClient;
    });

    describe('getUserTokenBalances', () => {
        it('should fetch and transform token balances correctly', async () => {
            const mockHeliusResponse = {
                tokens: [{
                    mint: 'token-mint-1',
                    amount: 1000000,
                    decimals: 6
                }]
            };

            (mockHeliusClient.getTokenBalances as jest.Mock).mockResolvedValueOnce(mockHeliusResponse);

            const result = await tokenAccountService.getUserTokenBalances('test-wallet');

            expect(result).toEqual([{
                userAddress: 'test-wallet',
                tokenMint: 'token-mint-1',
                balance: 1.0,
                token: {
                    mint: 'token-mint-1',
                    decimals: 6,
                    prices: []
                }
            }]);
        });

        it('should throw an error if the API call fails', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error');
            const apiError = new Error('API Error');

            (mockHeliusClient.getTokenBalances as jest.Mock).mockRejectedValueOnce(apiError);

            await expect(
                tokenAccountService.getUserTokenBalances('test-wallet')
            ).rejects.toThrow('API Error');

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching user token balances:',
                apiError
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('getTokenAccount', () => {
        it('should return token account if found', async () => {
            const mockTokenAccount = {
                userAddress: 'test-wallet',
                tokenMint: 'test-mint',
                balance: 1.0
            };

            (mockPrisma.tokenAccount.findFirst as jest.Mock).mockResolvedValueOnce(mockTokenAccount);

            const result = await tokenAccountService.getTokenAccount('test-wallet', 'test-mint');

            expect(result).toEqual(mockTokenAccount);
        });
    });
}); 