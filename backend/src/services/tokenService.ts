import { PrismaClient } from '@prisma/client';
import { Token } from '@/types/token';
import { BirdeyeClient, birdeyeClient } from '@/clients/birdeyeClient';
import axios from 'axios';

export class TokenService {
    private prisma: PrismaClient;
    private birdeyeClient: BirdeyeClient;
    private readonly JUPITER_API_URL = 'https://token.jup.ag/all';

    constructor() {
        this.prisma = new PrismaClient();
        this.birdeyeClient = birdeyeClient;
    }

    async getJupiterTokenData(mint: string): Promise<Token | null> {
        try {
            const { data: allTokens } = await axios.get<Token[]>(this.JUPITER_API_URL);
            return allTokens.find(token => token.mint === mint) || null;
        } catch (error) {
            console.error('Error fetching Jupiter token data:', error);
            return null;
        }
    }

    async getToken(mint: string): Promise<Token | null> {
        const existingToken = await this.prisma.token.findUnique({
            where: { mint },
            include: { tokenPrice: true }
        });

        if (existingToken) {
            return {
                ...existingToken,
                prices: existingToken.tokenPrice
                    .filter((p: { timestamp: Date; price: number }) => p.timestamp && p.price != null)
                    .map((p: { timestamp: Date; price: number }) => ({
                        date: p.timestamp.toISOString(),
                        price: Number(p.price)
                    }))
                    .sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime())
            };
        }

        const jupiterToken = await this.getJupiterTokenData(mint);
        if (!jupiterToken) {
            return null;
        }

        return this.saveToken(jupiterToken);
    }

    async saveToken(token: Token): Promise<Token> {
        const savedToken = await this.prisma.token.create({
            data: {
                mint: token.mint,
                name: token.name || '',
                symbol: token.symbol || '',
                decimals: token.decimals || 0,
                logoURI: token.logoURI || ''
            }
        });

        const currentPrice = await this.getCurrentPrice(token.mint);
        if (currentPrice) {
            const tokenWithPrices = await this.getHistoricalTokenPrices(savedToken as Token, 30);
            return tokenWithPrices || { ...savedToken, prices: [] };
        }

        return {
            ...savedToken,
            prices: []
        };
    }

    async getHistoricalTokenPrices(token: Token, days: number): Promise<Token | null> {
        try {
            const todayUnixTime = Math.floor(Date.now() / 1000);
            const fromTime = todayUnixTime - days * 24 * 60 * 60;

            const prices = await this.birdeyeClient.getHistoricalPrices(
                token.mint,
                fromTime,
                todayUnixTime
            );

            await this.savePrices(token.mint, prices);

            return {
                ...token,
                prices
            };
        } catch (error) {
            console.error('Error fetching historical prices:', error);
            return null;
        }
    }

    private async savePrices(mint: string, prices: { date: string, price: number }[]): Promise<void> {
        try {
            const validPrices = prices.filter(p =>
                p.date &&
                !isNaN(new Date(p.date).getTime()) &&
                typeof p.price === 'number' &&
                !isNaN(p.price)
            );

            await this.prisma.tokenPrice.createMany({
                data: validPrices.map(price => ({
                    tokenMint: mint,
                    timestamp: new Date(price.date),
                    price: price.price
                })),
                skipDuplicates: true
            });
        } catch (error) {
            console.error('Error saving prices:', error);
        }
    }

    async getCurrentPrice(mint: string): Promise<number | null> {
        try {
            return await this.birdeyeClient.getCurrentPrice(mint);
        } catch (error) {
            console.error('Error fetching current price:', error);
            return null;
        }
    }
}

export const tokenService = new TokenService();