export interface Token {
    mint: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    prices: { date: string, price: number }[]
}
