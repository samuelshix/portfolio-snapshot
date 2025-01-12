interface HeliusToken {
    mint: string;
    amount: number;
    decimals: number;
}

export const mockHeliusClient = {
    getTokenBalances: async (address: string) => ({
        tokens: [
            {
                mint: "So11111111111111111111111111111111111111112",
                amount: 1000000000,
                decimals: 9
            },
            {
                mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                amount: 5000000,
                decimals: 6
            },
        ]
    })
}; 