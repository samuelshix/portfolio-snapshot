export const heliusBalancesResponse: any = {
    "data": {
        "tokens": [
            {
                "tokenAccount": "BNXHfHjAPq4oQENLYgGonHzqQ2XZJ5nUzEiGDUaK4JwU",
                "mint": "So11111111111111111111111111111111111111112",
                "amount": 12000000000,
                "decimals": 9
            },
            {
                "tokenAccount": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "mint": "DTEqTxxGFn3SZ4C8tNP35X8iegCCgCBrX974WFSuYVZh",
                "amount": 300000000,
                "decimals": 6
            }
        ],
        "nativeBalance": 904893718
    }
}

export const jupiterAllTokensResponse: any = [
    {
        address: "So11111111111111111111111111111111111111112",
        chainId: 101,
        decimals: 9,
        name: "Wrapped SOL",
        symbol: "SOL",
        logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        tags: ["old-registry"],
        extensions: { coingeckoId: "wrapped-solana" }
    },
    {
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        chainId: 101,
        decimals: 6,
        name: "USD Coin",
        symbol: "USDC",
        logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        tags: ["old-registry", "solana-fm"],
        extensions: { coingeckoId: "usd-coin" }
    }
];

const wSOLPriceResponse: any = {
    "data": {
        "items": [
            {
                "unixTime": 1726670700,
                "value": 127.97284640184616
            },
            {
                "unixTime": 1726671600,
                "value": 128.04188346328968
            },
            {
                "unixTime": 1726672500,
                "value": 127.40223856228901
            }
        ]
    }
}

const wBTCPriceResponse: any = {
    "data": {
        "items": [
            {
                "unixTime": 1726670700,
                "value": 75893
            },
            {
                "unixTime": 1726671600,
                "value": 71843
            },
            {
                "unixTime": 1726672500,
                "value": 85243
            }
        ]
    }
}


export const birdeyePriceResponseMapped: any = {
    "So11111111111111111111111111111111111111112": wSOLPriceResponse,
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": wBTCPriceResponse
}
