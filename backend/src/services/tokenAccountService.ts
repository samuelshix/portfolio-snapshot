import { PrismaClient } from '@prisma/client';
import { TokenAccount } from '../types/tokenAccount';
import { HeliusClient, heliusClient } from '../clients/heliusClient';

export class TokenAccountService {
    private prisma: PrismaClient;
    private heliusClient: HeliusClient;

    constructor() {
        this.prisma = new PrismaClient();
        this.heliusClient = heliusClient;
    }

    async getUserTokenBalances(walletAddress: string): Promise<TokenAccount[]> {
        try {
            const { tokens } = await this.heliusClient.getTokenBalances(walletAddress);

            return tokens.map(balance => ({
                userAddress: walletAddress,
                tokenMint: balance.mint,
                balance: balance.amount / Math.pow(10, balance.decimals),
                token: {
                    mint: balance.mint,
                    decimals: balance.decimals,
                    prices: []
                }
            }));
        } catch (error) {
            console.error('Error fetching user token balances:', error);
            throw error;
        }
    }

    async saveTokenAccount(tokenAccount: TokenAccount): Promise<TokenAccount> {
        return await this.prisma.tokenAccount.create({
            data: {
                userAddress: tokenAccount.userAddress,
                tokenMint: tokenAccount.tokenMint,
                balance: tokenAccount.balance
            }
        });
    }

    async getTokenAccount(userAddress: string, tokenMint: string): Promise<TokenAccount | null> {
        return await this.prisma.tokenAccount.findFirst({
            where: {
                AND: [
                    { userAddress },
                    { tokenMint }
                ]
            }
        });
    }
}

export const tokenAccountService = new TokenAccountService();