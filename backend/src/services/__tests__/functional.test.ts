// import { ServiceFactory } from '../serviceFactory';
// import { PrismaClient } from '@prisma/client';
// import { TokenService } from '../tokenService';
// import { UserService } from '../userService';
// import { heliusBalancesResponse } from '@/mockData/mockAPIDData';
// import { jupiterAllTokensResponse } from '@/mockData/mockAPIDData';
// import getPriceMockData from '@/mockData/mockPriceData';

// jest.mock('@prisma/client', () => ({
//     PrismaClient: jest.fn().mockImplementation(() => ({
//         token: {
//             findMany: jest.fn(),
//             create: jest.fn(),
//             upsert: jest.fn(),
//         },
//         tokenPrice: {
//             findMany: jest.fn(),
//             createMany: jest.fn(),
//         },
//         user: {
//             findUnique: jest.fn(),
//             create: jest.fn(),
//         },
//         tokenAccount: {
//             upsert: jest.fn(),
//         },
//     })),
// }));

// describe('Integration Test: UserService and TokenService', () => {
//     let prisma: jest.Mocked<PrismaClient>;
//     let tokenService: TokenService;
//     let userService: UserService;

//     beforeEach(() => {
//         jest.clearAllMocks();
//         prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
//         tokenService = ServiceFactory.getTokenService(true);
//         userService = new UserService(true);

//         (tokenService as any).prisma = prisma;
//         (userService as any).prisma = prisma;
//     });

//     it('should sync user tokens and fetch token prices', async () => {
//         console.log('Test started');

//         const mockUser = { address: 'test-address' };
//         const mockToken = {
//             mint: 'So11111111111111111111111111111111111111112',
//             name: 'Wrapped SOL',
//             symbol: 'SOL',
//             decimals: 9,
//             logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
//             tokenPrice: getPriceMockData(30).data.items.map(item => ({
//                 price: item.value,
//                 timestamp: new Date(item.unixTime * 1000)
//             }))
//         };
//         const mockTokenAccount = {
//             id: 1,
//             userAddress: 'test-address',
//             balance: 12.0,
//             tokenMint: 'So11111111111111111111111111111111111111112',
//             token: mockToken
//         };

//         (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
//         (prisma.tokenAccount.upsert as jest.Mock).mockResolvedValue(mockTokenAccount);
//         (prisma.token.findMany as jest.Mock).mockResolvedValue([mockToken]);

//         // Debugging: Log the mock setup
//         console.log('Mock setup for findMany:', (prisma.token.findMany as jest.Mock).mock.calls);

//         const result = await userService.syncUserTokens('test-address');

//         // Debugging: Log the result
//         console.log('Result:', result);

//         expect(result).toHaveLength(1);
//         expect(result[0]).toEqual(mockTokenAccount);
//         expect(prisma.tokenAccount.upsert).toHaveBeenCalled();
//         expect(prisma.tokenPrice.createMany).toHaveBeenCalledWith({
//             data: getPriceMockData(30).data.items.map(item => ({
//                 tokenMint: 'So11111111111111111111111111111111111111112',
//                 timestamp: new Date(item.unixTime * 1000),
//                 price: item.value
//             })),
//             skipDuplicates: true,
//         });
//     });
// }); 