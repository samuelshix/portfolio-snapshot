import { Token } from "./token";

export interface TokenAccount {
    token: Token;
    balance: number;
    tokenAmount: number;
}
