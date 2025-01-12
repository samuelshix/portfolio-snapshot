import { jupiterAllTokensResponse, birdeyePriceResponseMapped } from '@/mockData/mockAPIDData';
import { Token } from '@/types/token';
import { TokenService } from '../tokenService';

export class MockTokenService extends TokenService {
    async getJupiterTokenData(mints: string[]): Promise<Token[]> {
        const matchedTokens: Token[] = (jupiterAllTokensResponse as any[])
            .filter(token => mints.includes(token.address))
            .map(token => ({
                ...token,
                mint: token.address,
            }));
        console.log(matchedTokens)
        return matchedTokens;
    }

    async getTokens(mints: string[]): Promise<Token[]> {
        const tokens = await this.getJupiterTokenData(mints);
        const tokenWithPrices = await Promise.all(tokens.map(async token => {
            const priceData = await this.getHistoricalTokenPrices(token, 30);
            return {
                ...token,
                prices: priceData || []
            };
        }));
        return tokenWithPrices;
    }

    async getHistoricalTokenPrices(token: Token, days: number): Promise<any> {
        const priceData = birdeyePriceResponseMapped[token.mint];

        return priceData.data.items.map((item: { unixTime: number, value: number }) => ({
            date: new Date(item.unixTime * 1000).toISOString(),
            price: item.value
        }));
    }
} 