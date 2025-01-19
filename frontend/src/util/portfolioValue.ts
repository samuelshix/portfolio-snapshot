import { TokenAccount } from "../types/tokenAccount";

export const getPortfolioValueByDay = (assets: TokenAccount[]) => {
    console.log(assets)
    return assets.reduce((acc: { date: string, value: number }[], asset) => {
        const balance = asset.balance;
        asset.token.tokenPrice.forEach((price, index) => {
            const date = price.timestamp;
            const existingEntry = acc.find(entry => entry.date === date);
            if (existingEntry) {
                existingEntry.value += (balance * price.price) / Math.pow(10, asset.token.decimals);
            } else {
                console.log(balance, price.price, asset.token.decimals)
                acc.push({
                    date,
                    value: (balance * price.price)
                });
            }
        });
        return acc;
    }, []);
}