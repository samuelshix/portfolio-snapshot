interface HeliusBalancesResponse {
    nativeBalance: number;
    tokens: HeliusTokenBalance[];
}

interface HeliusTokenBalance {
    mint: string;
    amount: number;
    decimals: number;
    tokenAccount?: string;
}
export type { HeliusBalancesResponse, HeliusTokenBalance };