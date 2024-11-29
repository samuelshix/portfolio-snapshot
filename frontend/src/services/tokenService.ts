import { getHistoricalPriceData, getPriceData } from "../api/getPriceData";
import { Token } from "../model/token";
import { getToken, getTokenPrices, saveToken, saveTokenPrice } from "./apiService";

class TokenService {

    async initialize(tokens: Token[]): Promise<Token[]> {
        await this.saveTokensIfNeeded(tokens)
        const updatedTokens = await Promise.all(tokens.map(async (token) => {
            try {
                const optionalToken = await this.getHistoricalTokenPrices(token, 30);
                if (!optionalToken) return null;
                token = optionalToken;
            } catch { return null; }
            // await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(token)
            return token;
        }));
        return updatedTokens.filter((token): token is Token => token !== null);
    }

    async saveTokensIfNeeded(tokens: Token[]) {
        for (const token of tokens) {
            try {
                const fetchedToken = await getToken(token.mint);
                if (fetchedToken) continue;
                await saveToken(token);
            } catch (error: any) {
                if (error.response.status === 404) {
                    continue
                } else console.error(error)
            }
        }
    }

    async setExistingTokenPrice(token: Token): Promise<Token> {
        getTokenPrices(token.mint).then((prices) => {
            token.prices = prices.map((price: { date: string, price: number }) => ({
                date: new Date(price.date).toDateString(),
                price: price.price
            }));
        })
        return token;
    }

    async getTodaysTokenPrice(token: Token): Promise<Token> {
        // if there is already a price for today, skip
        // if (token.prices && token.prices.some(price => new Date(price.date).toDateString() === new Date().toDateString())) {
        //     continue;
        // }

        const priceData = await getPriceData(token.mint);

        const price = priceData.value;
        const date = new Date(priceData.updateHumanTime).toDateString();

        token.prices.push({ date, price });
        await saveTokenPrice({ mint: token.mint, date, price });
        return token;
    }

    async getHistoricalTokenPrices(token: Token, days: number): Promise<Token | null> {
        const todayUnixTime = Math.floor(Date.now() / 1000);
        let tokenPrices;
        // tokenPrices = await getPriceData(token.mint) 
        tokenPrices = await getHistoricalPriceData(token.mint, todayUnixTime - days * 24 * 60 * 60, todayUnixTime);
        if (!tokenPrices.items) return null;

        const updateToken = { ...token };
        const x = tokenPrices.items.map((item: { unixTime: number, value: number }) => ({
            date: new Date(item.unixTime * 1000).toISOString(),
            price: item.value
        }));
        updateToken.prices = x;
        await Promise.all(updateToken.prices.map(async (tokenPrice) => {
            await saveTokenPrice({ mint: token.mint, date: tokenPrice.date, price: tokenPrice.price });
            return tokenPrice;
        }));
        console.log(updateToken)
        return updateToken;
    }
}

export default new TokenService();