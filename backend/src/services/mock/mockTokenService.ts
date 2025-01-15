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
        return matchedTokens;
    }

    async getHistoricalTokenPrices(token: Token, days: number): Promise<any> {
        return [
            {
                date: new Date().toISOString(),
                price: 100.00
            }
        ];
    }

    async getTokens(mints: string[]): Promise<Token[]> {
        const tokens = await this.getJupiterTokenData(mints);
        return tokens
    }
} 