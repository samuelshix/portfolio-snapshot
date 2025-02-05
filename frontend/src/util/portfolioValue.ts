import { TokenAccount } from "../types/tokenAccount";

export const getPortfolioValueByDay = (assets: TokenAccount[]) => {
    // Create a map to store total value for each date
    const valuesByDate = new Map<string, number>();

    // Process each asset
    assets.forEach(asset => {
        const balance = asset.balance;
        const decimals = asset.token.decimals;;

        // Process each price point for this asset
        asset.token.tokenPrice.forEach(price => {
            const date = new Date(price.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const value = balance * price.price;

            // Add to existing value for this date or set new value
            valuesByDate.set(date, (valuesByDate.get(date) || 0) + value);
        });
    });

    // Convert map to array
    const result = Array.from(valuesByDate.entries())
        .map(([date, value]) => ({
            date,
            value
        }));
    return result;
}