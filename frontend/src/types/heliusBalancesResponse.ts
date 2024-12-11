type HeliusBalancesResponse = {
    nativeBalance: number;
    tokens: {
        mint: string;
        amount: number;
        decimals: number;
        tokenAccount: string;
    }[];
}

export type { HeliusBalancesResponse };