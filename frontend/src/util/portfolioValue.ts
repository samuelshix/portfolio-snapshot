import { TokenAccount } from "../model/tokenAccount";

export const getPortfolioValueByDay = (assets: TokenAccount[]) => {
    return assets.reduce((acc: { date: string, value: number }[], asset) => {
        asset.token.prices.forEach((price, index) => {
            const date = new Date(price.date).toLocaleDateString();
            const existingEntry = acc.find(entry => entry.date === date);
            if (existingEntry) {
                existingEntry.value += (asset.tokenAmount * price.price) / Math.pow(10, asset.token.decimals);
            } else {
                acc.push({
                    date,
                    value: (asset.tokenAmount * price.price) / Math.pow(10, asset.token.decimals),
                });
            }
        });
        return acc;
    }, []);
}