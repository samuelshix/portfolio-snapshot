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

    async getJupiterTokenData(mints: string[]): Promise<Token[]> {
        try {
            const { data: allTokens } = await axios.get<any[]>(this.JUPITER_API_URL);
            const matchedTokens: Token[] = allTokens
                .filter(token => mints.includes(token.address))
                .map(token => ({
                    ...token,
                    mint: token.address,
                    address: undefined // remove field since Jupiter API returns address as mint
                }));

            return matchedTokens;
        } catch (error) {
            console.error('Error fetching Jupiter token data:', error);
            return [];
        }
    }

    async getTokens(mints: string[]): Promise<Token[]> {
        // First get all existing tokens from database
        const existingTokens = await this.prisma.token.findMany({
            where: { mint: { in: mints } },
            include: { tokenPrice: true }
        });

        // // Transform existing tokens to include prices
        // const formattedExistingTokens = existingTokens.map(token => ({
        //     ...token,
        //     prices: token.tokenPrice
        //         .filter((p: { timestamp: Date; price: number }) => p.timestamp && p.price != null)
        //         .map((p: { timestamp: Date; price: number }) => ({
        //             date: p.timestamp.toISOString(),
        //             price: Number(p.price)
        //         }))
        //         .sort((a: { date: string }, b: { date: string }) =>
        //             new Date(b.date).getTime() - new Date(a.date).getTime())
        // }));

        const existingMints = existingTokens.map(t => t.mint);
        const missingMints = mints.filter(mint => !existingMints.includes(mint));

        if (missingMints.length === 0) {
            return existingTokens;
        }

        // Fetch missing tokens from Jupiter
        const jupiterTokens = await this.getJupiterTokenData(missingMints);
        console.log("user's mints", mints)
        console.log("mints to save", jupiterTokens)
        // console.log("existingTokens", existingMints)
        const savedTokensPromises = jupiterTokens.map(token => this.saveToken(token));
        const savedTokens = await Promise.all(savedTokensPromises);

        return [...existingTokens, ...savedTokens];
    }

    async saveToken(token: Token): Promise<Token> {
        console.log("Saving token", token)
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