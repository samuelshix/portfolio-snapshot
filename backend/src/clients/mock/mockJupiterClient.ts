import { JupiterClient } from '../jupiterClient';
import { jupiterAllTokensResponse } from '@/mockData/mockAPIDData';
import { Token } from '@/types/token';

export class MockJupiterClient extends JupiterClient {
    async getAllTokens(): Promise<Token[]> {
        return (jupiterAllTokensResponse as any[]).map(token => ({
            mint: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            logoURI: token.logoURI,
            prices: []
        }));
    }
}

export const mockJupiterClient = new MockJupiterClient(); 